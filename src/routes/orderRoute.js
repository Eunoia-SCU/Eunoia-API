const express = require('express');
const Request = require('../models/requestModel');
const {
  paymobCreditCardCheckout,
  createCashOrder,
  webhookProcessed,
  findAllOrders,
  findSpecificOrder,
  checkoutSession,
  paymobMobileWalletCheckout,
} = require('../controllers/orderController');
const { protect, restrictTo } = require('../controllers/authController');
const { verifyPaymobRequest } = require('../middlewares/verifyPaymobRequest');

const router = express.Router({ mergeParams: true });

router.post('/webhook/processed', verifyPaymobRequest, webhookProcessed);

router.get(
  '/checkout-session/paymob/:requestId',
  protect,
  restrictTo('user', 'serviceProvider'),
  paymobCreditCardCheckout
);
router.get(
  '/checkout-session/paymob/MobileWallet/:requestId',
  protect,
  restrictTo('user', 'serviceProvider'),
  paymobMobileWalletCheckout
);
router.get(
  '/checkout-session/:requestId',
  protect,
  restrictTo('user', 'serviceProvider'),
  checkoutSession
);

router
  .route('/:requestId')
  .post(protect, restrictTo('user', 'serviceProvider'), createCashOrder);
router.get('/', protect, findAllOrders, restrictTo('admin'));
router.get('/:id', findSpecificOrder);

module.exports = router;
