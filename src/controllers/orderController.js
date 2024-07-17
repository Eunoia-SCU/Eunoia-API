const axios = require('axios');

const stripe = require('stripe')(process.env.STRIPE_SECRET);
const asyncHandler = require('express-async-handler');
const factory = require('./handelFactory');
const AppError = require('../utils/appError');
const Order = require('../models/orderModel');
const User = require('../models/userModel');
const Package = require('../models/packageModel');
const Request = require('../models/requestModel');
const { pay } = require('../utils/paymob/checkout');

// cash Order
exports.createCashOrder = asyncHandler(async (req, res, next) => {
  const taxPrice = 0;
  // 1) Get request based on requestId
  const request = await Request.findById(req.params.requestId);
  console.log(request.user.toString(), req.user._id.toString());
  if (!request || request.user.toString() !== req.user._id.toString()) {
    return next(
      new AppError(
        `There is no request with the id ${req.params.requestId}`,
        404
      )
    );
  } else if (request.status === 'Paid' || request.status === 'Cash-Payment') {
    return next(new AppError(`Your request has been Paid .`, 403));
  } else if (request.status !== 'Accepted') {
    return next(
      new AppError(`Your request has not been approved yet or Canceled .`, 403)
    );
  }

  // 2) change request status to paid based on requestId
  request.status = 'Cash-Payment';
  request.save();
  // 3) Get order price depending on request price after discount applied
  const requestPrice = request.totalPriceAfterDiscount;
  const totalRequestPrice = requestPrice + taxPrice;

  // 4) Create order with default paymentMethodType cash
  const order = await Order.create({
    user: req.user.id,
    request: request.id,
    requestItems: request.options,
    totalOrderPrice: totalRequestPrice,
  });

  res.status(201).json({ status: 'success', data: order });
});

exports.filterForLoggedUser = asyncHandler(async (req, res, next) => {
  if (req.user.role === 'user') req.filterObj = { user: req.user._id };
  next();
});

// @desc   Get all orders
// @route  GET /api/v1/orders
// @access Protected/User-Admin
exports.findAllOrders = factory.getAll(Order);

// @desc   Get Specific orders by id
// @route  GET /api/v1/orders/:id
// @access Protected/User-Admin-Manager
exports.findSpecificOrder = factory.getOne(Order);

// @desc   Get checkout session from stripe and send it as response
// @route  GET /api/v1/orders/checkout-session/:requestId
// @access Protected/User
exports.checkoutSession = asyncHandler(async (req, res, next) => {
  const taxPrice = 0;

  // 1) Get request based on requestId
  const request = await Request.findById(req.params.requestId);
  console.log(request.user.toString(), req.user._id.toString());
  if (!request || request.user.toString() !== req.user._id.toString()) {
    return next(
      new AppError(
        `There is no request with the id ${req.params.requestId}`,
        404
      )
    );
  } else if (request.status === 'Paid' || request.status === 'Cash-Payment') {
    return next(new AppError(`Your request has been Paid .`, 403));
  } else if (request.status !== 'Accepted') {
    return next(
      new AppError(`Your request has not been approved yet or Canceled .`, 403)
    );
  }
  // 2) Get Package to get Package Photo
  const package = await Package.findById(request.package);

  // 3) Get request price depending on request price after discount applied
  const requestPrice = request.totalPriceAfterDiscount;
  const totalRequestPrice = requestPrice + taxPrice;

  const lineItems = [
    {
      price_data: {
        currency: 'egp',
        unit_amount: totalRequestPrice * 100,
        product_data: {
          name: `Hello-${req.user.name}`,
          description: ` ${package.packageName} - ${package.description}`,
          images: [`${package.packagePhoto}`],
        },
      },
      quantity: 1,
    },
  ];
  // create checkout session
  const session = await stripe.checkout.sessions.create({
    line_items: lineItems,
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/orders`,
    cancel_url: `${req.protocol}://${req.get('host')}/request`,
    customer_email: req.user.email,
    client_reference_id: req.params.requestId,
    metadata: {
      packageName: package.packageName,
      packageDescription: package.description,
    },
  });

  res.status(201).json({ status: 'success', checkout: session.url });
});

const createCardOrder = asyncHandler(async (session) => {
  const requestId = session.client_reference_id;
  const requestPrice = session.amount_total / 100;

  const request = await Request.findById(requestId);

  const user = await User.findOne({ email: session.customer_email });

  // Create order with default paymentMethodType card
  await Order.create({
    user: user._id,
    request: request.id,
    requestItems: request.options,
    totalOrderPrice: requestPrice,
    isPaid: true,
    paidAt: Date.now(),
    paymentMethodType: 'card',
  });
  // make request paid
  request.status = 'Paid';
  request.save();
});

// @desc   This webhook will run when stripe payment success paid
// @route  POST /webhook-checkout
// @access Protected/User
exports.webhookCheckout = asyncHandler(async (req, res, next) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log('webhook');
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === 'checkout.session.completed') {
    // Create order
    console.log('create order here....');
    createCardOrder(event.data.object);
  }
  res.status(200).json({
    message: 'success',
  });
});

exports.paymobMobileWalletCheckout = asyncHandler(async (req, res, next) => {
  const taxPrice = 0;
  const billing_data = {
    apartment: '803',
    email: `${req.user.email}`,
    floor: 'NA',
    first_name: `${req.user.name}`,
    street: "'Ethan Land'",
    building: "'8028'",
    phone_number: "'+86(8)9135210487'",
    shipping_method: 'PKG',
    postal_code: "'01898'",
    city: 'ismaila',
    country: "'EG'",
    last_name: 'aaa',
    state: 'ismailai',
  };
  // 1) Get request based on requestId
  const request = await Request.findById(req.params.requestId);
  if (!request || request.user.toString() !== req.user._id.toString()) {
    return next(
      new AppError(
        `There is no request with the id ${req.params.requestId}`,
        404
      )
    );
  } else if (request.status === 'Paid' || request.status === 'Cash-Payment') {
    return next(new AppError(`Your request has been Paid .`, 403));
  } else if (request.status !== 'Accepted') {
    return next(
      new AppError(`Your request has not been approved yet or Canceled .`, 403)
    );
  }

  // 3) Get request price depending on request price after discount applied
  const requestPrice = request.totalPriceAfterDiscount;
  const totalRequestPrice = requestPrice + taxPrice;
  // get the payment token for this order
  const token = await pay(
    [],
    billing_data,
    totalRequestPrice * 100,
    request._id,
    4570147
  );
  console.log(token.token);
  request.reference_id = token.id;
  request.save();
  const paymentKey = await axios.post(
    `https://accept.paymob.com/api/acceptance/payments/pay`,
    {
      source: {
        identifier: '01010101010',
        subtype: 'WALLET',
      },
      payment_token: token.token,
    }
  );
  // create the payment link
  const link = `https://accept.paymob.com/api/acceptance/iframes/834347?payment_token=${token.token}`;
  // respond with the payment link
  console.log(paymentKey);
  return res
    .status(200)
    .json({ paymentLink: paymentKey.data.iframe_redirection_url });
});
exports.paymobCreditCardCheckout = asyncHandler(async (req, res, next) => {
  const taxPrice = 0;
  const billing_data = {
    apartment: '803',
    email: `${req.user.email}`,
    floor: 'NA',
    first_name: `${req.user.name}`,
    street: 'NA',
    building: 'NA',
    phone_number: 'NA',
    shipping_method: 'NA',
    postal_code: 'NA',
    city: 'NA',
    country: "'EG'",
    last_name: 'NA',
    state: 'NA',
  };
  // 1) Get request based on requestId
  const request = await Request.findById(req.params.requestId);
  if (!request || request.user.toString() !== req.user._id.toString()) {
    return next(
      new AppError(
        `There is no request with the id ${req.params.requestId}`,
        404
      )
    );
  } else if (request.status === 'Paid' || request.status === 'Cash-Payment') {
    return next(new AppError(`Your request has been Paid .`, 403));
  } else if (request.status !== 'Accepted') {
    return next(
      new AppError(`Your request has not been approved yet or Canceled .`, 403)
    );
  }

  // 3) Get request price depending on request price after discount applied
  const requestPrice = request.totalPriceAfterDiscount;
  const totalRequestPrice = requestPrice + taxPrice;
  // get the payment token for this order
  const token = await pay(
    [],
    billing_data,
    totalRequestPrice * 100,
    request._id,
    4544652
  );
  console.log(token.token);
  request.reference_id = token.id;
  request.save();
  const paymentKey = await axios.post(
    `https://accept.paymob.com/api/acceptance/payments/pay`,
    {
      source: {
        identifier: 'wallet mobile number',
        subtype: 'WALLET',
      },
      payment_token: token.token, // token obtained in step 3
    },
    {
      'Content-Type': 'application/json',
    }
  );
  // create the payment link
  const link = `https://accept.paymob.com/api/acceptance/iframes/834347?payment_token=${token.token}`;
  // respond with the payment link
  return res.status(200).send(link);
});

exports.webhookProcessed = asyncHandler(async (req, res) => {
  // 1) Get request based on orderId
  const request = await Request.findOne({ reference_id: req.body.obj.order.id });
  console.log(request);

  // // Create order with default paymentMethodType card
  const order = await Order.create({
    user: request.user,
    request: request._id,
    requestItems: request.options,
    totalOrderPrice: request.price,
    isPaid: true,
    paidAt: Date.now(),
    paymentMethodType: 'card',
    paymentMethodGateway: 'paymob',
  });
  request.status = 'Paid';
  console.log(order);
  request.save();
  // console.log(order);
  // // make request paid
  res.send();
});
