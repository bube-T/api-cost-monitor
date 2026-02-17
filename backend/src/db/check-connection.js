import pool from '../config/database.js';
import redisClient from '../config/redis.js';

async function checkConnections() {
  console.log('🔍 Checking database and cache connections...\n');

  let postgresOk = false;
  let redisOk = false;

  // Check PostgreSQL
  try {
    const result = await pool.query('SELECT NOW() as now, version() as version');
    console.log('✅ PostgreSQL connection successful!');
    console.log(`   Time: ${result.rows[0].now}`);
    console.log(`   Version: ${result.rows[0].version.split(',')[0]}\n`);
    postgresOk = true;
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:');
    console.error(`   ${error.message}\n`);
  }

  // Check Redis
  try {
    await redisClient.set('connection_test', 'ok');
    const value = await redisClient.get('connection_test');
    await redisClient.del('connection_test');

    console.log('✅ Redis connection successful!');
    console.log(`   Test value: ${value}\n`);
    redisOk = true;
  } catch (error) {
    console.error('❌ Redis connection failed:');
    console.error(`   ${error.message}\n`);
  }

  // Summary
  if (postgresOk && redisOk) {
    console.log('🎉 All connections are working!\n');
    console.log('Next steps:');
    console.log('  1. Run migrations: npm run db:migrate --workspace=backend');
    console.log('  2. Seed test data: npm run db:seed --workspace=backend');
    console.log('  3. Start the server: npm run dev\n');
    process.exit(0);
  } else {
    console.error('⚠️  Some connections failed. Please check:');
    if (!postgresOk) {
      console.error('  - Is Docker running?');
      console.error('  - Run: docker compose up -d');
      console.error('  - Wait 10-15 seconds for PostgreSQL to start');
    }
    if (!redisOk) {
      console.error('  - Is Redis container running?');
      console.error('  - Check: docker compose ps');
    }
    console.error('');
    process.exit(1);
  }
}

checkConnections();
