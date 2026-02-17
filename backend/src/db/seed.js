import bcrypt from 'bcryptjs';
import pool from '../config/database.js';

async function seedDatabase() {
  console.log('🌱 Seeding database with test data...\n');

  try {
    // Create test user
    const hashedPassword = await bcrypt.hash('password123', 10);

    const userResult = await pool.query(`
      INSERT INTO users (email, name, password_hash)
      VALUES ($1, $2, $3)
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
      RETURNING id, email, name;
    `, ['demo@apicostmonitor.com', 'Demo User', hashedPassword]);

    const userId = userResult.rows[0].id;
    console.log('✅ Created test user:');
    console.log(`   Email: demo@apicostmonitor.com`);
    console.log(`   Password: password123`);
    console.log(`   User ID: ${userId}\n`);

    // Create test API key
    const apiKeyResult = await pool.query(`
      INSERT INTO api_keys (user_id, provider, key_name, encrypted_key, is_active)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT DO NOTHING
      RETURNING id;
    `, [userId, 'openai', 'Production OpenAI Key', 'encrypted_sk-test123', true]);

    const apiKeyId = apiKeyResult.rows[0]?.id;

    if (apiKeyId) {
      console.log('✅ Created test API key\n');

      // Create sample API calls (last 7 days)
      console.log('📊 Creating sample API call history...');

      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const date = new Date();
        date.setDate(date.getDate() - dayOffset);

        // Random number of calls per day (20-50)
        const callsPerDay = Math.floor(Math.random() * 30) + 20;

        for (let i = 0; i < callsPerDay; i++) {
          const randomDate = new Date(date);
          randomDate.setHours(Math.floor(Math.random() * 24));
          randomDate.setMinutes(Math.floor(Math.random() * 60));

          // Random token usage
          const requestTokens = Math.floor(Math.random() * 1000) + 100;
          const responseTokens = Math.floor(Math.random() * 2000) + 200;
          const totalTokens = requestTokens + responseTokens;

          // Calculate cost (rough estimate: £0.01 per 1000 tokens for GPT-3.5)
          const cost = (totalTokens / 1000) * 0.01;
          const latency = Math.floor(Math.random() * 2000) + 500; // 500-2500ms

          await pool.query(`
            INSERT INTO api_calls (
              user_id, api_key_id, provider, endpoint, method,
              status_code, request_tokens, response_tokens, total_tokens,
              cost_gbp, latency_ms, metadata, created_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          `, [
            userId,
            apiKeyId,
            'openai',
            '/v1/chat/completions',
            'POST',
            200,
            requestTokens,
            responseTokens,
            totalTokens,
            cost,
            latency,
            JSON.stringify({ model: 'gpt-3.5-turbo', temperature: 0.7 }),
            randomDate
          ]);
        }
      }

      console.log(`   ✓ Created ${7 * 30} sample API calls\n`);

      // Create sample alert
      await pool.query(`
        INSERT INTO alerts (user_id, name, alert_type, threshold_gbp, provider, is_active, notification_channels)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT DO NOTHING
      `, [
        userId,
        'Daily Spending Limit',
        'daily_limit',
        50.00,
        'openai',
        true,
        JSON.stringify(['email'])
      ]);

      console.log('✅ Created sample alert\n');

      // Create rate limit
      await pool.query(`
        INSERT INTO rate_limits (user_id, api_key_id, max_requests_per_minute, max_requests_per_hour, max_spend_per_hour_gbp, is_active)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT DO NOTHING
      `, [userId, apiKeyId, 60, 1000, 10.00, true]);

      console.log('✅ Created rate limit configuration\n');
    }

    // Show summary statistics
    const stats = await pool.query(`
      SELECT
        COUNT(*) as total_calls,
        SUM(cost_gbp) as total_cost,
        AVG(latency_ms)::integer as avg_latency,
        SUM(total_tokens) as total_tokens
      FROM api_calls
      WHERE user_id = $1
    `, [userId]);

    console.log('📈 Summary Statistics:');
    console.log(`   Total API Calls: ${stats.rows[0].total_calls}`);
    console.log(`   Total Cost: £${parseFloat(stats.rows[0].total_cost).toFixed(2)}`);
    console.log(`   Average Latency: ${stats.rows[0].avg_latency}ms`);
    console.log(`   Total Tokens: ${stats.rows[0].total_tokens.toLocaleString()}\n`);

    console.log('✨ Database seeding completed successfully!');
    console.log('\n🎉 You can now login with:');
    console.log('   Email: demo@apicostmonitor.com');
    console.log('   Password: password123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

// Run seeding
seedDatabase();
