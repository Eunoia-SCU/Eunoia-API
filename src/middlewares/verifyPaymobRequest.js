const ApiError = require('../utils/appError');
const crypto = require('crypto');

exports.verifyPaymobRequest = (req, res, next) => {
  try {
    console.log('hello');
    if (req.body.type == 'TRANSACTION') {
      const { obj } = req.body;
      const hmac =
        obj.amount_cents +
        obj.created_at +
        obj.currency +
        obj.error_occured +
        obj.has_parent_transaction +
        obj.id +
        obj.integration_id +
        obj.is_3d_secure +
        obj.is_auth +
        obj.is_capture +
        obj.is_refunded +
        obj.is_standalone_payment +
        obj.is_voided +
        obj.order.id +
        obj.owner +
        obj.pending +
        obj.source_data.pan +
        obj.source_data.sub_type +
        obj.source_data.type +
        obj.success;
      const hashedHmac = crypto
        .createHmac('SHA512', process.env.HMAC_KEY)
        .update(hmac)
        .digest('hex');

      if (!req.query.hmac || req.query.hmac !== hashedHmac) {
        throw new ApiError('Nice try but we have security 🫡🫡', 403);
      }
    }
    console.log('hello2');
    next();
  } catch (error) {
    next(error);
  }
};
