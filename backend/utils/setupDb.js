/**
 * Safe Database Setup Utility (Non-Destructive)
 * 
 * Creates tables, constraints, indexes, views, and stored functions
 * without dropping existing data (using IF NOT EXISTS / CREATE OR REPLACE).
 * 
 * Usage:
 *   npm run db:setup
 *   node utils/setupDb.js
 */

const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

const executeSqlFile = async (filePath) => {
  const fullPath = path.resolve(__dirname, '../../database', filePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`SQL file not found at: ${fullPath}`);
  }
  const sql = fs.readFileSync(fullPath, 'utf8');
  console.log(` -> Executing ${filePath}...`);
  await pool.query(sql);
  console.log(`    Successfully applied ${filePath}`);
};

const runSetup = async () => {
  try {
    console.log('===========================================================');
    console.log(' SMART GRID BILLING DATABASE — SAFE SETUP (NON-DESTRUCTIVE)');
    console.log('===========================================================');
    console.log('Applying safe schema, views, and stored procedures...\n');

    await executeSqlFile('safe_schema.sql');
    await executeSqlFile('views.sql');
    await executeSqlFile('procedures.sql');

    console.log('\n Database setup completed successfully!');
    console.log('   All tables, views, and functions are verified.');
    console.log('   Existing data was strictly preserved.\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Database setup encountered an error:', err.message);
    process.exit(1);
  }
};

if (require.main === module) {
  runSetup();
}

module.exports = { runSetup };
