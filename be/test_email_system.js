const axios = require('axios');
require('dotenv').config();

const API_URL = process.env.VITE_API_URL || 'http://localhost:8888/api';

async function testEmailSystem() {
  try {
    console.log('--- Testing Automated Email System ---');
    
    // 1. Test Newsletter Subscription (triggers welcome email)
    console.log('1. Testing Newsletter Subscription...');
    const subEmail = `test_${Date.now()}@example.com`;
    const subResponse = await axios.post(`${API_URL}/contact/subscribe`, {
      email: subEmail
    });
    console.log(`- Subscription Status: ${subResponse.status}`);
    console.log(`- Message: ${subResponse.data.message}`);
    console.log('- Check backend logs for "Attempting to send newsletter welcome email"');

    // 2. Test Campaign Management (Admin only)
    console.log('\n--- Admin Email Campaigns ---');
    console.log('1. Use POST /api/email-campaigns to create a campaign.');
    console.log('2. Use POST /api/email-campaigns/:id/send to trigger bulk delivery.');
    
  } catch (error) {
    console.error('Error during testing:', error.response?.data || error.message);
  }
}

testEmailSystem();
