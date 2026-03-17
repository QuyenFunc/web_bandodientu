const { createPaymentUrl, verifyReturnUrl } = require('./src/services/payment/vnpayService');
const qs = require('qs');

process.env.VNP_TMN_CODE = 'GAKLNQMF';
process.env.VNP_HASH_SECRET = 'NK8PRS0FXLB8M7T1FNS2I1ZLCJ9M86JA';
process.env.VNP_URL = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
process.env.VNP_RETURN_URL = 'http://localhost:8888/api/payment/vnpay/return';

const url = createPaymentUrl({ orderId: 'ORD123', amount: 1000, ipAddr: '127.0.0.1' });
console.log('Generated URL:', url);

const queryString = url.split('?')[1];
const parsedQuery = qs.parse(queryString);

console.log('Verify Result:', verifyReturnUrl(parsedQuery));
