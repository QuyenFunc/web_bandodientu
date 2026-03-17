require('dotenv').config();
const sequelize = require('../src/config/sequelize');

async function run() {
  try {
    const [results] = await sequelize.query('DESCRIBE users');
    console.log(JSON.stringify(results, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('❌ Error describing table:', err);
    process.exit(1);
  }
}

run();
