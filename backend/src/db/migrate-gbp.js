import pool from '../config/database.js';

// Migration: rename all _usd columns to _gbp
async function migrateToGbp() {
  console.log('💷 Migrating currency columns from USD to GBP...\n');

  const renames = [
    'ALTER TABLE api_calls        RENAME COLUMN cost_usd              TO cost_gbp',
    'ALTER TABLE alerts           RENAME COLUMN threshold_usd         TO threshold_gbp',
    'ALTER TABLE alert_notifications RENAME COLUMN current_spend_usd  TO current_spend_gbp',
    'ALTER TABLE alert_notifications RENAME COLUMN threshold_usd      TO threshold_gbp',
    'ALTER TABLE usage_stats      RENAME COLUMN total_cost_usd        TO total_cost_gbp',
    'ALTER TABLE rate_limits      RENAME COLUMN max_spend_per_hour_usd TO max_spend_per_hour_gbp',
  ];

  for (const sql of renames) {
    try {
      await pool.query(sql);
      const col = sql.match(/RENAME COLUMN (\S+)/)[1];
      console.log(`   ✓ Renamed ${col}`);
    } catch (err) {
      // Column may already have been renamed — safe to skip
      if (err.message.includes('does not exist')) {
        console.log(`   - Already renamed, skipping`);
      } else {
        throw err;
      }
    }
  }

  console.log('\n✅ Currency migration complete — all columns now use GBP (£)');
  process.exit(0);
}

migrateToGbp().catch((err) => {
  console.error('❌ Migration failed:', err.message);
  process.exit(1);
});
