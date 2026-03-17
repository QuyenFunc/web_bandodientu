const crypto = require('crypto');
const querystring = require('querystring');
const moment = require('moment'); // We don't have moment, I need to check or use native Date

function formatDateTime(date) {
  const vnTime = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
  const pad = (n) => (n < 10 ? '0' + n : n);
  const YYYY = vnTime.getFullYear();
  const MM = pad(vnTime.getMonth() + 1);
  const DD = pad(vnTime.getDate());
  const HH = pad(vnTime.getHours());
  const mm = pad(vnTime.getMinutes());
  const ss = pad(vnTime.getSeconds());
  return `${YYYY}${MM}${DD}${HH}${mm}${ss}`;
}

const sortObject = (obj) => {
  const sorted = {};
  const keys = Object.keys(obj).sort();
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = obj[key];
    if (value !== null && value !== undefined && value !== '') {
      sorted[key] = value;
    }
  }
  return sorted;
};

const createPaymentUrl = ({ orderId, amount, bankCode = '', ipAddr, returnUrl }) => {
  const tmnCode = process.env.VNP_TMN_CODE;
  const secretKey = process.env.VNP_HASH_SECRET;
  let vnpUrl = process.env.VNP_URL;
  const realReturnUrl = returnUrl || process.env.VNP_RETURN_URL;

  const date = new Date();
  const createDate = formatDateTime(date);

  date.setMinutes(date.getMinutes() + 15);
  const expireDate = formatDateTime(date);

  let vnp_Params = {};
  vnp_Params['vnp_Version'] = '2.1.0';
  vnp_Params['vnp_Command'] = 'pay';
  vnp_Params['vnp_TmnCode'] = tmnCode;
  vnp_Params['vnp_Locale'] = 'vn';
  vnp_Params['vnp_CurrCode'] = 'VND';
  vnp_Params['vnp_TxnRef'] = orderId;
  vnp_Params['vnp_OrderInfo'] = 'Thanh toan don hang ' + orderId; // Bo dau tieng Viet
  vnp_Params['vnp_OrderType'] = 'other';
  vnp_Params['vnp_Amount'] = Math.round(amount * 100);
  vnp_Params['vnp_ReturnUrl'] = realReturnUrl;
  
  // Format ipAddr to IPv4 or default '127.0.0.1' if IPv6
  let formattedIpAddr = ipAddr ? ipAddr.toString() : '127.0.0.1';
  if (formattedIpAddr.includes(',')) {
    formattedIpAddr = formattedIpAddr.split(',')[0].trim();
  }
  if (formattedIpAddr === '::1' || formattedIpAddr.includes(':')) {
    formattedIpAddr = '127.0.0.1';
  }
  
  vnp_Params['vnp_IpAddr'] = formattedIpAddr;
  vnp_Params['vnp_CreateDate'] = createDate;
  vnp_Params['vnp_ExpireDate'] = expireDate;

  if (bankCode !== null && bankCode !== '') {
    vnp_Params['vnp_BankCode'] = bankCode;
  }

  const sortedParams = sortObject(vnp_Params);
  const signData = querystring.stringify(sortedParams, { encode: false });
  const hmac = crypto.createHmac('sha512', secretKey);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
  vnp_Params['vnp_SecureHash'] = signed;

  vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: true });
  console.log('VNPay URL Generated:', vnpUrl);

  return vnpUrl;
};

const verifyReturnUrl = (vnp_Params) => {
  const secureHash = vnp_Params['vnp_SecureHash'];

  delete vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHashType'];

  vnp_Params = sortObject(vnp_Params);
  
  const secretKey = process.env.VNP_HASH_SECRET;
  const signData = querystring.stringify(vnp_Params, { encode: false });
  const hmac = crypto.createHmac('sha512', secretKey);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');     

  return {
    isSuccess: secureHash === signed,
    orderId: vnp_Params['vnp_TxnRef'],
    amount: vnp_Params['vnp_Amount'] / 100,
    transactionNo: vnp_Params['vnp_TransactionNo'],
    responseCode: vnp_Params['vnp_ResponseCode']
  };
};

module.exports = {
  createPaymentUrl,
  verifyReturnUrl
};
