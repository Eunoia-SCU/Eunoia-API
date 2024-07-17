const { check, body } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');

exports.createPackageValidator = [
  check('packageName')
    .isLength({ min: 3 })
    .withMessage('Too short Package name')
    .isLength({ max: 225 })
    .withMessage('Too long Package name')
    .notEmpty()
    .withMessage('Please enter your Package name!'),
  check('description')
    .optional()
    .isLength({ max: 5000 })
    .withMessage('Too long description'),
  check('price')
    .notEmpty()
    .withMessage('Product price is required')
    .isNumeric()
    .withMessage('Product price must be a number')
    .isLength({ max: 32 })
    .withMessage('Too expensive price'),
  check('offer').optional().isNumeric().withMessage('offer must be a number'),
  validatorMiddleware,
];
exports.getPackageValidator = [
  check('id').isMongoId().withMessage('Invalid ID format'),
  validatorMiddleware,
];

exports.deletePackageValidator = [
  check('id').isMongoId().withMessage('Invalid ID format'),
  validatorMiddleware,
];
