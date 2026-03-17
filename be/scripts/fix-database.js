#!/usr/bin/env node

/**
 * Script to recreate the entire database structure
 * Run: node scripts/fix-database.js
 */

require('dotenv').config();
const sequelize = require('../src/config/sequelize');

async function fixDatabase() {
  try {
    console.log('🔧 Fixing database...\n');
    
    // 1. Connect to database
    await sequelize.authenticate();
    console.log('✓ Connected to database');
    
    // 2. Load models
    require('../src/models');
    console.log('✓ Models loaded');
    
    // 3. Drop all tables (this will handle FKs automatically)
    console.log('⚠️ Dropping all tables...');
    await sequelize.drop({ logging: false });
    console.log('✓ All tables dropped');
    
    // 4. Sync to create all tables
    console.log('📝 Creating tables from models...');
    await sequelize.sync({ force: false, logging: false });
    console.log('✓ Database schema created');
    
    console.log('\n✅ Database recreated successfully!');
    console.log('🚀 You can now start the server: npm run dev\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing database:', error.message);
    if (process.env.DEBUG) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

fixDatabase();
