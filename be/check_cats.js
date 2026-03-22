
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false,
  }
);

async function check() {
  try {
    const [categoryCounts] = await sequelize.query(
      `
      SELECT 
        category_id, 
        COUNT(DISTINCT product_id) as product_count 
      FROM 
        product_categories 
      GROUP BY 
        category_id
    `,
      { type: sequelize.QueryTypes.SELECT }
    );
    
    console.log('Category mapping from product_categories table:');
    console.log(categoryCounts);

    const [allCategories] = await sequelize.query('SELECT id, name FROM categories');
    console.log('\nCategories in categories table:');
    allCategories.forEach(c => console.log(`${c.id}: ${c.name}`));

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

check();
