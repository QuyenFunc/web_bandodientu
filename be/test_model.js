const { Order, User, Product, ProductVariant, sequelize } = require('./src/models');

async function test() {
  try {
    const order = await Order.findOne({
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
        },
        {
          association: 'items',
          include: [
            {
              model: Product,
              attributes: ['id', 'name', 'images', 'thumbnail', 'slug'],
            },
            {
              model: ProductVariant,
              attributes: ['id', 'name', 'sku'],
            },
          ],
        },
      ],
    });
    console.log("SUCCESS!!!");
  } catch (err) {
    console.error("DB ERROR!!!:", err.message);
  }
  process.exit();
}
test();
