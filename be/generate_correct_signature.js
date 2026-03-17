const crypto = require('crypto');
const querystring = require('querystring');

// Parameters that will be returned by VNPAY
let vnp_Params = {
    vnp_Amount: '100000',
    vnp_BankCode: 'VNPAY',
    vnp_BankTranNo: 'VNP13955635',
    vnp_CardType: 'QRCODE',
    vnp_OrderInfo: 'Thanh toan don hang ORD123',
    vnp_PayDate: '20260317113838',
    vnp_ResponseCode: '00',
    vnp_TmnCode: 'GAKLNQMF',
    vnp_TransactionNo: '13955635',
    vnp_TransactionStatus: '00',
    vnp_TxnRef: 'ORD123',
};

// Sort keys alphabetically
const keys = Object.keys(vnp_Params).sort();
let sorted = {};
for (const key of keys) {
  sorted[key] = vnp_Params[key];
}

const secretKey = 'NK8PRS0FXLB8M7T1FNS2I1ZLCJ9M86JA';

// Create query string like VNPAY expects
const signData = querystring.stringify(sorted);
console.log('\n=== VNPAY Return Signature Generation ===');
console.log('Parameters (sorted):');
Object.entries(sorted).forEach(([key, val]) => {
  console.log(`  ${key} = ${val}`);
});

console.log('\nSign Data (querystring):', signData);

// Calculate HMAC-SHA512
let hmac = crypto.createHmac('sha512', secretKey);
let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

console.log('\nSecret Key:', secretKey);
console.log('Generated Signature:', signed);

console.log('\n=== Full Query String for Return URL ===');
const withSignature = { ...sorted, vnp_SecureHash: signed };
const fullQueryUrl = querystring.stringify(withSignature);
console.log('Full URL:', 'http://localhost:8888/api/payment/vnpay/return?' + fullQueryUrl);
