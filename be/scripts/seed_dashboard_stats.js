const { User, Order, sequelize } = require('../src/models');
const { v4: uuidv4 } = require('uuid');

async function seedStatsData() {
  try {
    console.log('🌱 Starting statistics data seeder...');

    // 1. Find or create a user to attach orders (Optional, if guest orders aren't supported)
    // We'll create several users first to fill the userStats count
    const usersCount = 20; // Number of dummy users to create
    const ordersCount = 50; // Number of dummy orders to create

    console.log(`Creating ${usersCount} users and ${ordersCount} orders...`);

    // Array to hold sample pricing
    const randomPrices = [150000, 250000, 500000, 1200000, 350000, 180000, 99000, 4500000];
    const statuses = ['delivered', 'delivered', 'delivered', 'pending', 'shipped']; // Majority delivered for revenue charts

    const userIds = [];

    for (let i = 0; i < usersCount; i++) {
      const dayOffset = Math.floor(Math.random() * 30); // Random within last 30 days
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - dayOffset);

      const u = await User.create({
        id: uuidv4(),
        firstName: `User${i}`,
        lastName: `Test`,
        email: `usertest${i}-${Date.now()}@example.com`,
        password: 'password123',
        role: 'customer',
        createdAt: createdAt,
        updatedAt: createdAt
      });
      userIds.push(u.id);
    }

    // Get all items to link orders (If order model strictly requires associations, just ensure IDs match or are populated, or use random UUID)
    for (let i = 0; i < ordersCount; i++) {
        const dayOffset = Math.floor(Math.random() * 30);
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - dayOffset);

        const price = randomPrices[Math.floor(Math.random() * randomPrices.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const userId = userIds[Math.floor(Math.random() * userIds.length)];

        await Order.create({
            id: uuidv4(),
            number: `ORD-${Date.now()}-${i}`,
            userId: userId,
            total: price,
            subtotal: price - 30000,
            tax: 0,
            shippingCost: 30000,
            shippingFee: 30000,
            status: status,
            paymentMethod: 'cod',
            paymentStatus: status === 'delivered' ? 'paid' : 'pending',
            
            shippingFirstName: 'John',
            shippingLastName: 'Doe',
            shippingAddress1: '123 ABC Street',
            shippingCity: 'Hanoi',
            shippingState: 'HN',
            shippingPhone: '0987654321',

            billingFirstName: 'John',
            billingLastName: 'Doe',
            billingAddress1: '123 ABC Street',
            billingCity: 'Hanoi',
            billingState: 'HN',
            
            createdAt: createdAt,
            updatedAt: createdAt
        });
    }

    console.log('✅ Statistics data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder failed:', error);
    process.exit(1);
  }
}

seedStatsData();
