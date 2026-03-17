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
  vnp_SecureHash: '62eabb4132ab75dd06cfcdd4df4d6a5c1a82f3efbdc6c6fa71cd4fcccf085117f300067ce24df23351ecae9dbca81b854fa16900ee1b94cddbcab34c7c8ecdf6'
};

process.env.VNP_TMN_CODE = 'GAKLNQMF';
process.env.VNP_HASH_SECRET = 'NK8PRS0FXLB8M7T1FNS2I1ZLCJ9M86JA';

console.log('Verify Result:', verifyReturnUrl(expressQuery));
