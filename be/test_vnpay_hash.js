const crypto = require('crypto');

function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
  }
  return sorted;
}

let vnp_Params = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: 'GAKLNQMF',
    vnp_Locale: 'vn',
    vnp_CurrCode: 'VND',
    vnp_TxnRef: 'ORD123',
    vnp_OrderInfo: 'Thanh toan don hang ORD123',
    vnp_OrderType: 'other',
    vnp_Amount: 100000,
    vnp_ReturnUrl: 'http://localhost:8888/api/payment/vnpay/return',
    vnp_IpAddr: '127.0.0.1',
    vnp_CreateDate: '20260317141401',
    vnp_ExpireDate: '20260317142901',
};

vnp_Params = sortObject(vnp_Params);
let secretKey = 'NK8PRS0FXLB8M7T1FNS2I1ZLCJ9M86JA'.trim();

// 1. querystring node built-in
const qsNode = require('querystring');
let signDataNode = qsNode.stringify(vnp_Params, { encode: false });
let hmacNode = crypto.createHmac('sha512', secretKey);
let signedNode = hmacNode.update(Buffer.from(signDataNode, 'utf-8')).digest('hex');

// 2. qs npm packge (qs.stringify)
const qsNpm = require('qs');
let signDataNpm = qsNpm.stringify(vnp_Params, { encode: false });
let hmacNpm = crypto.createHmac('sha512', secretKey);
let signedNpm = hmacNpm.update(Buffer.from(signDataNpm, 'utf-8')).digest('hex');

// 3. manual
let manualSignData = Object.keys(vnp_Params).map(key => key + '=' + vnp_Params[key]).join('&');
let hmacManual = crypto.createHmac('sha512', secretKey);
let signedManual = hmacManual.update(Buffer.from(manualSignData, 'utf-8')).digest('hex');

console.log('signDataNode:', signDataNode);
console.log('signDataNpm:', signDataNpm);
console.log('manualSignData:', manualSignData);
console.log('');
console.log('signedNode:', signedNode);
console.log('signedNpm:', signedNpm);
console.log('signedManual:', signedManual);
