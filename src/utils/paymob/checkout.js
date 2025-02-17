const axios = require('axios');
const dotenv = require('dotenv');
const { authenticate } = require('./authenticate.js');

dotenv.config();

const PAYMOB_URL = 'https://accept.paymob.com/api';

// the docs for this API are here: https://docs.paymob.com/docs/accept-standard-redirect
exports.pay = async (
  order_cart,
  billing_data,
  amount_cents,
  ref_id,
  integration_Id
) => {
  try {
    // Authentication Request -- step 1 in the docs
    const accessToken = await authenticate();

    // Order Registration API -- step 2 in the docs
    const orderUrl = `${PAYMOB_URL}/ecommerce/orders`;
    const headers = {
      'Content-Type': 'application/json',
    };
    const orderData = {
      auth_token: accessToken,
      delivery_needed: 'false',
      amount_cents,
      billing_data,
      currency: 'EGP',
      items: order_cart,
    };
    const order = await axios.post(orderUrl, orderData, { headers });
    const orderId = order.data.id;

    // Payment Key Request  -- step 3 in the docs
    const paymentKeyUrl = `${PAYMOB_URL}/acceptance/payment_keys`;

    const paymentKeyData = {
      auth_token: accessToken,
      amount_cents,
      reference_id: ref_id,
      expiration: 3600,
      order_id: orderId,
      billing_data,
      currency: 'EGP',
      integration_id: integration_Id,
    };
    const paymentKey = await axios.post(paymentKeyUrl, paymentKeyData, headers);
    return { token: paymentKey.data.token, id: orderId };
  } catch (error) {
    console.error('Error authenticating:', error.response.data);
  }
};
