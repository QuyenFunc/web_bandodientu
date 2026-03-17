require('dotenv').config();
const sequelize = require('../src/config/sequelize');
require('../src/models'); // Load all models

async function run() {
  try {
    console.log('🔧 Syncing database with alter: true...');
    await sequelize.sync({ alter: true });
    console.log('✅ Database synced successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error syncing database:', err);
    process.exit(1);
  }
}

run();
