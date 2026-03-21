const axios = require('axios');
const jwt = require('jsonwebtoken'); // Assuming we can mint a token or we need to login

async function test() {
  try {
    // 1. Login as user to get token
    const res = await axios.post('http://localhost:8888/api/auth/login', {
      email: 'admin@gmail.com', // guess
      password: 'password'      // guess
    });
    const token = res.data.data.token;

    // 2. Fetch orders
    const ordersRes = await axios.get('http://localhost:8888/api/orders', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const orderId = ordersRes.data.data.orders[0].id;

    // 3. Fetch GET order by id
    const detailRes = await axios.get(`http://localhost:8888/api/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("SUCCESS:", detailRes.data);
  } catch (err) {
    console.error("ERROR:", err.response ? err.response.data : err.message);
  }
}
test();
