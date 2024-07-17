const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

// Set your Paymob API token
const API_TOKEN = process.env.PAY_API;
const PAYMOB_URL = 'https://accept.paymob.com/api';
const PASSWORD = process.env.BAYMOB_PASSWORD;
const USERNAME = process.env.BAYMOB_USERNAME;

// Authenticate with Paymob to get an access token
exports.authenticate = async () => {
  try {
    const url = `${PAYMOB_URL}/auth/tokens`;
    const headers = {
      'Content-Type': 'application/json',
    };
    const data = {
      api_key: API_TOKEN,
      username: USERNAME,
      password: PASSWORD,
    };
    const response = await axios.post(url, data, { headers });
    const accessToken = response.data.token;
    return accessToken;
  } catch (error) {
    console.error('Error authenticating:', error.response.data);
  }
};
