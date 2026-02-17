# Database Documentation

## Overview

The API Cost Monitor uses PostgreSQL to store users, API keys, usage data, and alerts.

## Database Schema

### Tables

#### `users`
Stores user account information.
- `id`: Primary key
- `email`: Unique user email (used for login)
- `name`: User's full name
- `password_hash`: Bcrypt hashed password
- `created_at`, `updated_at`: Timestamps

#### `api_keys`
Stores encrypted API keys from external providers (OpenAI, AWS, etc.).
- `id`: Primary key
- `user_id`: Foreign key to users
- `provider`: API provider name ('openai', 'aws', 'anthropic')
- `key_name`: User-friendly name for the key
- `encrypted_key`: Encrypted API key (never stored in plain text!)
- `is_active`: Whether this key is currently in use

#### `api_calls`
Logs every API request that goes through our proxy.
- `id`: Primary key
- `user_id`, `api_key_id`: Foreign keys
- `provider`: Which API service was called
- `endpoint`: API endpoint path
- `method`: HTTP method (GET, POST, etc.)
- `status_code`: Response status
- `request_tokens`, `response_tokens`, `total_tokens`: Token usage
- `cost_usd`: Calculated cost in USD
- `latency_ms`: Response time
- `metadata`: Additional data (model, parameters, etc.) in JSONB format
- `created_at`: When the call was made

**Why this is important**: This table is the heart of our cost tracking. Every proxied request is logged here with its cost.

#### `alerts`
User-defined spending thresholds and alerts.
- `id`: Primary key
- `user_id`: Foreign key to users
- `name`: Alert name (e.g., "Daily Budget Alert")
- `alert_type`: Type of alert ('daily_limit', 'monthly_limit', 'cost_spike')
- `threshold_usd`: Dollar amount that triggers the alert
- `provider`: Optional - alert for specific provider only
- `notification_channels`: Array of channels (email, webhook, slack)
- `last_triggered_at`: When alert was last fired

#### `alert_notifications`
History of triggered alerts.
- `id`: Primary key
- `alert_id`: Which alert was triggered
- `triggered_at`: When it fired
- `current_spend_usd`: Spending at time of alert
- `notification_sent`: Whether notification was successfully sent

#### `usage_stats`
Pre-aggregated daily statistics for fast dashboard queries.
- `user_id`, `provider`, `date`: Composite key
- `total_calls`: Number of API calls
- `total_tokens`: Total tokens used
- `total_cost_usd`: Total spending
- `avg_latency_ms`: Average response time

**Why this exists**: Instead of calculating daily totals from millions of rows in `api_calls`, we aggregate data nightly. This makes dashboards load instantly.

#### `rate_limits`
User-defined rate limiting rules.
- `user_id`, `api_key_id`: Foreign keys
- `max_requests_per_minute`: Request limit per minute
- `max_requests_per_hour`: Request limit per hour
- `max_spend_per_hour_usd`: Dollar spending limit per hour

## Running Migrations

### First Time Setup
```bash
# Start PostgreSQL and Redis
docker compose up -d

# Wait for database to be ready (about 10 seconds)

# Run migrations to create tables
npm run db:migrate --workspace=backend

# Seed with test data
npm run db:seed --workspace=backend
```

### Test Credentials (After Seeding)
```
Email: demo@apicostmonitor.com
Password: password123
```

## Database Connection

The connection is configured in `backend/src/config/database.js` using a connection pool:
- **Max connections**: 20 (adjust based on traffic)
- **Connection timeout**: 2 seconds
- **Idle timeout**: 30 seconds

## Indexes

Indexes are created on:
- `users.email` (for fast login queries)
- `api_calls.user_id`, `api_calls.created_at`, `api_calls.provider` (for dashboard queries)
- `api_calls.cost_usd` (for alert calculations)

## Security Notes

1. **API keys are encrypted**: Never store API keys in plain text
2. **Passwords are hashed**: Using bcrypt with salt rounds of 10
3. **Prepared statements**: All queries use parameterized queries to prevent SQL injection
4. **Connection pooling**: Reuses connections for better performance

## Maintenance

### Backing Up Data
```bash
docker exec api-monitor-db pg_dump -U apimonitor api_cost_monitor > backup.sql
```

### Restoring Data
```bash
cat backup.sql | docker exec -i api-monitor-db psql -U apimonitor api_cost_monitor
```

### Monitoring Database Size
```sql
SELECT pg_size_pretty(pg_database_size('api_cost_monitor'));
```
