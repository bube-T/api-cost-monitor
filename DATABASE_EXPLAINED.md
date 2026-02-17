# Database Schema Explained

## 📚 Learning: How the Database Supports Our SaaS

Our API Cost Monitor tracks every API call and calculates costs in real-time. Here's how the database makes this possible:

---

## The Data Flow

```
User signs up → Creates API Keys → Makes API calls → We track & calculate costs → Show on dashboard
```

### Example User Journey:

1. **Sarah signs up** → Record created in `users` table
2. **Sarah adds her OpenAI API key** → Encrypted and stored in `api_keys` table
3. **Sarah's app makes a request to GPT-4** → Her app calls our proxy
4. **Our proxy forwards the request** → We call OpenAI on her behalf
5. **We log everything** → Create record in `api_calls` with tokens + cost
6. **Check for alerts** → If spending > threshold, create `alert_notification`
7. **Update dashboard** → WebSocket sends real-time update to Sarah's browser

---

## Table Relationships (Visual)

```
users
  └─ has many → api_keys (stores OpenAI, AWS keys)
      └─ has many → api_calls (every request logged)

  └─ has many → alerts (spending thresholds)
      └─ has many → alert_notifications (when alerts fire)

  └─ has many → rate_limits (request throttling)
  └─ has many → usage_stats (pre-calculated daily totals)
```

---

## Key Tables Explained

### 1. `api_calls` - The Heart of Cost Tracking

**Why it exists**: Every API request is logged here with detailed cost information.

```sql
api_calls
├── id: 12345
├── user_id: 42
├── provider: 'openai'
├── endpoint: '/v1/chat/completions'
├── request_tokens: 150      ← How many tokens in the prompt
├── response_tokens: 500     ← How many tokens in the response
├── total_tokens: 650        ← Total = request + response
├── cost_usd: 0.013          ← Calculated cost ($0.02 per 1K tokens)
├── latency_ms: 1450         ← Response time (1.45 seconds)
├── metadata: {              ← Additional context
│     "model": "gpt-4",
│     "temperature": 0.7
│   }
└── created_at: '2024-02-16 10:30:00'
```

**How we calculate cost**:
- GPT-4: $0.03 per 1K input tokens, $0.06 per 1K output tokens
- Formula: `(request_tokens / 1000 * input_price) + (response_tokens / 1000 * output_price)`

**Why we track tokens**: Different models charge per token, not per request.

---

### 2. `alerts` - Automated Budget Monitoring

**Why it exists**: Users set spending limits, and we notify them when exceeded.

```sql
alerts
├── id: 1
├── user_id: 42
├── name: "Daily Budget Alert"
├── alert_type: 'daily_limit'     ← Types: daily_limit, monthly_limit, cost_spike
├── threshold_usd: 50.00          ← Trigger when spending > $50
├── provider: 'openai'            ← Optional: only for OpenAI
├── notification_channels: ['email', 'webhook']
└── is_active: true
```

**How it works**:
1. After each API call, we sum today's costs: `SELECT SUM(cost_usd) FROM api_calls WHERE user_id = 42 AND created_at >= TODAY`
2. If total > threshold_usd → Create `alert_notification` and send email
3. Update `last_triggered_at` to avoid spam

---

### 3. `usage_stats` - Fast Dashboard Queries

**Why it exists**: Calculating totals from millions of `api_calls` rows is slow.

Instead, we pre-aggregate data **nightly** (or hourly):

```sql
usage_stats
├── user_id: 42
├── provider: 'openai'
├── date: '2024-02-16'
├── total_calls: 1,234           ← Sum of all calls
├── total_tokens: 456,789        ← Sum of all tokens
├── total_cost_usd: 91.36        ← Sum of all costs
└── avg_latency_ms: 1,200        ← Average response time
```

**Performance benefit**:
- Without: `SELECT SUM(cost_usd) FROM api_calls WHERE ...` → 5 seconds (millions of rows)
- With: `SELECT total_cost_usd FROM usage_stats WHERE date = TODAY` → 0.01 seconds

**Trade-off**: Stats are slightly delayed (updated every hour), but dashboards load instantly.

---

### 4. `rate_limits` - Prevent Runaway Costs

**Why it exists**: If a bug causes an infinite loop of API calls, this prevents bankruptcy.

```sql
rate_limits
├── user_id: 42
├── api_key_id: 5
├── max_requests_per_minute: 60   ← Max 60 calls/minute
├── max_requests_per_hour: 1000   ← Max 1000 calls/hour
├── max_spend_per_hour_usd: 10.00 ← Max $10/hour spending
└── is_active: true
```

**How it works**:
1. Before forwarding API request, check Redis counter: `api_calls:user42:minute`
2. If counter > 60 → Return 429 error (Too Many Requests)
3. If spending this hour > $10 → Return 429 error
4. Otherwise, increment counter and forward request

**Why Redis?**: Checking rate limits needs to be FAST (<1ms). PostgreSQL is too slow.

---

## Security: Encrypted API Keys

**Problem**: Users give us their OpenAI API keys. If we get hacked, all keys are stolen.

**Solution**: Encrypt keys before storing:

```javascript
// Storing a key
const encrypted = encrypt(userApiKey, encryptionKey);
await db.query('INSERT INTO api_keys (encrypted_key) VALUES ($1)', [encrypted]);

// Using a key
const encryptedKey = await db.query('SELECT encrypted_key FROM api_keys WHERE id = $1', [5]);
const decrypted = decrypt(encryptedKey, encryptionKey);
// Now call OpenAI with the decrypted key
```

**Important**: The `encryptionKey` is stored in environment variables (`.env`), not in the database.

---

## Indexes: Why Queries Are Fast

**Without index**:
```sql
SELECT * FROM api_calls WHERE user_id = 42;
-- PostgreSQL scans ALL rows (slow if 10M rows)
```

**With index**:
```sql
CREATE INDEX idx_api_calls_user_id ON api_calls(user_id);
-- PostgreSQL jumps directly to user 42's rows (fast!)
```

**Indexes we created**:
- `users.email` → Fast login lookups
- `api_calls.user_id` → Fast "show my usage" queries
- `api_calls.created_at` → Fast date range queries (last 7 days)
- `api_calls.cost_usd` → Fast "highest cost calls" queries

**Trade-off**: Indexes make queries faster but inserts slightly slower. Worth it for read-heavy apps.

---

## JSONB: Flexible Metadata Storage

**Why JSONB**: Different APIs return different data. We can't predict all fields.

```sql
metadata JSONB
```

Stores arbitrary JSON:
```json
{
  "model": "gpt-4-turbo",
  "temperature": 0.7,
  "max_tokens": 1000,
  "user_agent": "MyApp/1.0",
  "ip_address": "192.168.1.1"
}
```

**Benefit**: We can query inside JSON:
```sql
SELECT * FROM api_calls WHERE metadata->>'model' = 'gpt-4-turbo';
```

---

## Database Best Practices We're Using

1. **Foreign Keys**: Ensure data integrity (can't have an api_call without a user)
2. **Timestamps**: Track when records were created/updated
3. **Indexes**: Make queries fast
4. **Connection Pooling**: Reuse database connections (faster than creating new ones)
5. **Prepared Statements**: Prevent SQL injection attacks
6. **Transactions**: For operations that must succeed or fail together

---

## What You'll Learn By Building This

- How to design a database schema for a real SaaS product
- Why normalization matters (separate tables for users, keys, calls)
- When to denormalize (usage_stats for performance)
- How to secure sensitive data (encryption)
- How to optimize queries (indexes, connection pools)
- How to handle time-series data (api_calls with timestamps)

---

## Next Steps

Once Docker is installed and running:
1. Run migrations to create these tables
2. Seed test data to see how it all works
3. Build API endpoints to interact with this data
4. Connect the frontend dashboard to show real-time costs
