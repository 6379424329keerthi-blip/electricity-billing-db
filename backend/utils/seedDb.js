/**
 * Safe Database Seed Utility
 * 
 * Populates demonstration consumers, smart meters, tariff slabs,
 * meter readings, bills, and payment records.
 * 
 * Safety feature:
 * - Checks if tables already contain data before inserting.
 * - Prevents accidental overwriting of demonstration data.
 * - Requires --force flag if the user explicitly wishes to re-seed an existing database.
 * 
 * Usage:
 *   npm run db:seed
 *   node utils/seedDb.js
 *   node utils/seedDb.js --force
 */

const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

const runSeed = async (shouldExit = true, force = false) => {
  try {
    console.log('===========================================================');
    console.log(' SMART GRID BILLING DATABASE — SAFE SEED UTILITY');
    console.log('===========================================================');

    // 1. Check if database already contains users or consumers
    let userCount = 0;
    try {
      const userCheck = await pool.query('SELECT COUNT(*) FROM users');
      userCount = parseInt(userCheck.rows[0].count, 10);
    } catch {
      userCount = 0;
    }

    const isForce = force || process.argv.includes('--force');

    if (userCount > 0 && !isForce) {
      console.log(`\n Database already contains ${userCount} user accounts and demonstration records.`);
      console.log('   Skipping seed to preserve existing records.');
      if (shouldExit) process.exit(0);
      return;
    }

    if (isForce && userCount > 0) {
      console.log(`\n⚠️  --force detected: Overwriting existing ${userCount} records with default seed data...`);
    } else {
      console.log('\n Populating initial demonstration data...');
    }

    const seedPath = path.resolve(__dirname, '../../database/seed.sql');
    if (!fs.existsSync(seedPath)) {
      throw new Error(`Seed file not found at: ${seedPath}`);
    }

    const seedSql = fs.readFileSync(seedPath, 'utf8');
    await pool.query(seedSql);

    console.log('\n Demonstration data seeded successfully!');
    console.log('   - 30 Consumers & 30 Smart Meters');
    console.log('   - 9 Configurable Tariff Slabs');
    console.log('   - 48 Historical Meter Readings');
    console.log('   - 35 Billed Statements & 29 Payment Receipts\n');
    if (shouldExit) process.exit(0);
  } catch (err) {
    console.error('\n❌ Database seed encountered an error:', err.message);
    if (shouldExit) process.exit(1);
    throw err;
  }
};

if (require.main === module) {
  runSeed(true, process.argv.includes('--force'));
}

module.exports = { runSeed };
