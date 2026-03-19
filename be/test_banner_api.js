const axios = require('axios');
require('dotenv').config();

const API_URL = process.env.VITE_API_URL || 'http://localhost:8888/api';
const ADMIN_TOKEN = 'YOUR_ADMIN_TOKEN_HERE'; // Manually fill if needed, or bypass for logic check

async function testBanners() {
  try {
    console.log('--- Testing Banners API ---');
    
    // 1. Get all banners (Public)
    console.log('1. Getting all banners...');
    const getAll = await axios.get(`${API_URL}/banners`);
    console.log(`- Status: ${getAll.status}`);
    console.log(`- Count: ${getAll.data.data.length}`);

    // Note: Creating/Updating/Deleting requires Admin Token.
    // This script serves as a template for manual verification with a token.
    console.log('\n--- Manual Verification Steps Required for Admin Operations ---');
    console.log('1. Login as admin to get token.');
    console.log('2. Use POST /api/banners with Bearer token to create.');
    console.log('3. Use PATCH /api/banners/:id to update.');
    console.log('4. Use DELETE /api/banners/:id to delete.');
    
  } catch (error) {
    console.error('Error during testing:', error.response?.data || error.message);
  }
}

testBanners();
