/**
 * Guarded Destructive Database Reset Utility
 * 
 * ⚠️ WARNING: THIS SCRIPT DROPS ALL TABLES, VIEWS, PROCEDURES, AND DATA.
 * 
 * To prevent accidental invocation by students or evaluators,
 * this utility REQUIRES the explicit argument: --confirm
 * 
 * Usage:
 *   node utils/resetDb.js --confirm
 *   npm run db:reset -- --confirm
 */

const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

const executeSqlFile = async (filePath) => {
  const fullPath = path.resolve(__dirname, '../../database', filePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`File not found: ${fullPath}`);
  }
  const sql = fs.readFileSync(fullPath, 'utf8');
  console.log(` -> Executing ${filePath}...`);
  await pool.query(sql);
  console.log(`    Successfully applied ${filePath}`);
};

const runReset = async () => {
  try {
    console.log('===========================================================');
    console.log(' SMART GRID BILLING DATABASE — DESTRUCTIVE DATABASE RESET');
    console.log('===========================================================');

    const isConfirmed = process.argv.includes('--confirm');

    if (!isConfirmed) {
      console.warn('\n⚠️  SAFETY GUARD TRIGGERED: DESTRUCTIVE ACTION BLOCKED');
      console.warn('   This command will DROP ALL TABLES and ERASE all user records,');
      console.warn('   meter readings, invoices, and payments in the database.');
      console.warn('\n   To proceed with full database destruction and reset, run:');
      console.warn('     npm run db:reset -- --confirm\n');
      process.exit(1);
    }

    console.log('\n Executing full reset and recreation...');
    await executeSqlFile('schema.sql');
    await executeSqlFile('views.sql');
    await executeSqlFile('procedures.sql');
    await executeSqlFile('seed.sql');

    console.log('\n Complete database reset finished successfully!');
    console.log('   All tables recreated and reloaded with pristine demonstration data.\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Database reset failed:', err.message);
    process.exit(1);
  }
};

if (require.main === module) {
  runReset();
}

module.exports = { runReset };
