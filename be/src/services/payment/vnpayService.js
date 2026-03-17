const crypto = require('crypto');
const querystring = require('querystring');
const moment = require('moment-timezone');

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

const createPaymentUrl = ({ orderId, amount, bankCode = '', ipAddr, returnUrl }) => {
  // Loại bỏ hoàn toàn khoảng trắng, tab, hoặc ký tự \r \n trong secretKey/TMPCODE
  const tmnCode = String(process.env.VNP_TMN_CODE).trim().replace(/[\r\n\s]/g, '');
  const secretKey = String(process.env.VNP_HASH_SECRET).trim().replace(/[\r\n\s]/g, '');
  let vnpUrl = String(process.env.VNP_URL).trim();
  const realReturnUrl = returnUrl || String(process.env.VNP_RETURN_URL).trim();

  const sanitizedOrderId = String(orderId).replace(/[^a-zA-Z0-9]/g, '');
  const vnpAmount = Math.round(parseFloat(amount) * 100);

  // Định dạng chuẩn GMT+7 bằng moment-timezone
  const createDate = moment().tz('Asia/Ho_Chi_Minh').format('YYYYMMDDHHmmss');
  const expireDateStr = moment().tz('Asia/Ho_Chi_Minh').add(15, 'minutes').format('YYYYMMDDHHmmss');

  let formattedIpAddr = ipAddr ? String(ipAddr) : '127.0.0.1';
  if (formattedIpAddr.includes(',')) {
    formattedIpAddr = formattedIpAddr.split(',')[0].trim();
  }
  if (formattedIpAddr === '::1' || formattedIpAddr.startsWith('::ffff:')) {
    formattedIpAddr = formattedIpAddr.replace('::ffff:', '');
    if (!formattedIpAddr) formattedIpAddr = '127.0.0.1';
  }
  if (formattedIpAddr.length > 15) {
    formattedIpAddr = '127.0.0.1'; // VNP_IpAddr chỉ cho max 15 ký tự
  }

  let vnp_Params = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: tmnCode,
    vnp_Locale: 'vn',
    vnp_CurrCode: 'VND',
    vnp_TxnRef: sanitizedOrderId,
    vnp_OrderInfo: 'Thanh toan don hang ' + sanitizedOrderId,
    vnp_OrderType: 'other',
    vnp_Amount: vnpAmount,
    vnp_ReturnUrl: realReturnUrl,
    vnp_IpAddr: formattedIpAddr,
    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDateStr,
  };

  if (bankCode && bankCode !== '') {
    vnp_Params['vnp_BankCode'] = bankCode;
  }

  vnp_Params = sortObject(vnp_Params);

  // Nối string tự thủ công không dùng thư viện ngoài để tranh encode sai khác
  let manualSignData = Object.keys(vnp_Params).map(key => key + '=' + vnp_Params[key]).join('&');

  let hmac = crypto.createHmac('sha512', secretKey);
  let signed = hmac.update(Buffer.from(manualSignData, 'utf-8')).digest('hex');
  vnp_Params['vnp_SecureHash'] = signed;

  let manualQueryUrl = Object.keys(vnp_Params).map(key => key + '=' + vnp_Params[key]).join('&');
  vnpUrl += '?' + manualQueryUrl;

  return vnpUrl;
};

const verifyReturnUrl = (vnp_Params) => {
  let secureHash = vnp_Params['vnp_SecureHash'];

  let params = {};
  for (let key in vnp_Params) {
    if (key !== 'vnp_SecureHash' && key !== 'vnp_SecureHashType') {
      params[key] = vnp_Params[key];
    }
  }

  params = sortObject(params);
  const secretKey = String(process.env.VNP_HASH_SECRET).trim().replace(/[\r\n\s]/g, '');

  let manualSignData = Object.keys(params).map(key => key + '=' + params[key]).join('&');
  
  let hmac = crypto.createHmac('sha512', secretKey);
  let signed = hmac.update(Buffer.from(manualSignData, 'utf-8')).digest('hex');

  const vnp_Amount = params['vnp_Amount'] ? params['vnp_Amount'] : 0;

  return {
    isSuccess: secureHash === signed,
    orderId: params['vnp_TxnRef'] || vnp_Params['vnp_TxnRef'],
    amount: parseInt(vnp_Amount) / 100,
    transactionNo: params['vnp_TransactionNo'] || vnp_Params['vnp_TransactionNo'],
    responseCode: params['vnp_ResponseCode'] || vnp_Params['vnp_ResponseCode'],
  };
};

module.exports = {
  createPaymentUrl,
  verifyReturnUrl,
};
