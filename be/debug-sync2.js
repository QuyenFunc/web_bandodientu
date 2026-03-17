const sequelize = require('./src/config/sequelize');
const fs = require('fs');

async function debug() {
  try {
    await sequelize.sync({ force: true });
    console.log('Success.');
  } catch (err) {
    fs.writeFileSync('error_dump.json', JSON.stringify({ message: err.message, sql: err.sql }, null, 2));
  } finally {
    process.exit(0);
  }
}
debug();
