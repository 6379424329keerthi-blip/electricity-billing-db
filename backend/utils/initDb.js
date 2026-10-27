/**
 * Default Database Initialization Script
 * 
 * Safely aliases to non-destructive setup (db:setup) and guarded seed (db:seed)
 * so that running `npm run db:init` NEVER wipes existing demonstration data.
 * 
 * If you explicitly need a destructive reset, use `npm run db:reset -- --confirm`.
 */

const { runSetup } = require('./setupDb');
const { runSeed } = require('./seedDb');

const init = async () => {
  try {
    console.log('--- Initializing Smart Grid Billing Database (Safe Mode) ---');
    // 1. Run safe schema setup (IF NOT EXISTS)
    await runSetup();
  } catch (err) {
    console.error('Safe initialization encountered an error:', err);
    process.exit(1);
  }
};

init();
