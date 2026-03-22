
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
    define: {
      underscored: true
    }
  }
);

async function check() {
  try {
    await sequelize.authenticate();
    console.log('--- DATABASE CONNECTION SUCCESS ---');

    // 1. Total products in products table
    const [totalProducts] = await sequelize.query('SELECT COUNT(*) as count FROM products');
    console.log('TOTAL PRODUCTS IN DB:', totalProducts[0].count);

    // 2. Sample products with their stock_quantity
    const [stocks] = await sequelize.query('SELECT id, name, stock_quantity FROM products LIMIT 15');
    console.log('\n--- SAMPLE PRODUCT STOCKS ---');
    stocks.forEach(p => {
      console.log(`${p.id.substring(0,8)}... | Stock: ${p.stock_quantity.toString().padEnd(5)} | Name: ${p.name.substring(0, 40)}`);
    });

    // 3. Count products per category
    const [catCounts] = await sequelize.query(`
      SELECT c.name, COUNT(pc.product_id) as count 
      FROM categories c 
      LEFT JOIN product_categories pc ON c.id = pc.category_id 
      GROUP BY c.id, c.name
    `);
    console.log('\n--- PRODUCTS PER CATEGORY ---');
    catCounts.forEach(c => {
      console.log(`${c.name.padEnd(25)}: ${c.count} sản phẩm`);
    });

    // 4. Check for products with exactly 100 stock (if that's what the user meant)
    const [stock100] = await sequelize.query('SELECT COUNT(*) as count FROM products WHERE stock_quantity = 100');
    console.log(`\nProducts with exactly 100 stock: ${stock100[0].count}`);

    process.exit(0);
  } catch (error) {
    console.error('--- DATABASE ERROR ---');
    console.error(error);
    process.exit(1);
  }
}

check();
