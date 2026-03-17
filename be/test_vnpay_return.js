const { verifyReturnUrl } = require('./src/services/payment/vnpayService');

const expressQuery = {
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
  vnp_SecureHash: '9d090bac492169cf8f8ddf27401c66da04154e54ec6cbe4f7e72ccfa923c8ea7fec3dd5ec3a24c3ae88d806532d89d3fae3335b8432c262bdeb7c44a5bcecf8b'
};

process.env.VNP_TMN_CODE = 'GAKLNQMF';
process.env.VNP_HASH_SECRET = 'NK8PRS0FXLB8M7T1FNS2I1ZLCJ9M86JA';

console.log('Verify Result:', verifyReturnUrl(expressQuery));
