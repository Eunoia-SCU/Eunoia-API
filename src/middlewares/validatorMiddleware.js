const { validationResult } = require('express-validator');

const vaidatorMiddleware = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    return res.status(400).json({
      status: 'fail',
      message: `Invalid Input data. ${errorMessages.join(' && ')}`,
    });
  }
  next();
};

module.exports = vaidatorMiddleware;
