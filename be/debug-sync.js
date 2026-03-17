const sequelize = require('./src/config/sequelize');
const models = require('./src/models');

async function debug() {
  try {
    await sequelize.sync({ force: true });
    console.log('Success.');
  } catch (err) {
    console.error('Error in DB Sync:');
    console.error(err.message);
    console.error('SQL query that failed:');
    console.error(err.sql);
  } finally {
    process.exit(0);
  }
}
debug();
