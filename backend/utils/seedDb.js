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

const runSeed = async () => {
  try {
    console.log('===========================================================');
    console.log(' SMART GRID BILLING DATABASE — SAFE SEED UTILITY');
    console.log('===========================================================');

    // 1. Check if database already contains users or consumers
    const userCheck = await pool.query('SELECT COUNT(*) FROM users');
    const userCount = parseInt(userCheck.rows[0].count, 10);

    const isForce = process.argv.includes('--force');

    if (userCount > 0 && !isForce) {
      console.log(`\n Database already contains ${userCount} user accounts and demonstration records.`);
      console.log('   Skipping seed to preserve existing records.');
      console.log('   Tip: If you explicitly wish to overwrite all data with default seed records,');
      console.log('   run: npm run db:seed -- --force\n');
      process.exit(0);
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
    console.log('   - 7 User accounts (Admin, Staff, 5 Consumers)');
    console.log('   - 12 Consumers & Smart Meters');
    console.log('   - 9 Configurable Tariff Slabs');
    console.log('   - 24 Historical Meter Readings');
    console.log('   - 12 Billed Statements & 9 Payment Receipts\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Database seed encountered an error:', err.message);
    process.exit(1);
  }
};

if (require.main === module) {
  runSeed();
}

module.exports = { runSeed };
