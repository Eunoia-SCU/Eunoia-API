const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const Package = require('../../models/packageModel');
// Custom validation function to check if option IDs are found
const isValidOptionId = async (value, { req }) => {
  try {
    const packageId = req.params.packageId;
    const package = await Package.findById(packageId);
    if (!package) {
      throw new Error('Package not found');
    }
    const allOptions = package.customizePackage.flatMap(
      (category) => category.options
    );
    return value.every((optionId) =>
      allOptions.some((option) => option._id.toString() === optionId)
    );
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.createRequestValidator = [
  check('Notes').optional(),
  check('bookingDate').optional(),
  // Custom validation for optionsId
  check('optionIds')
    .custom(isValidOptionId)
    .withMessage('Invalid option IDs provided'),
  validatorMiddleware,
];

exports.acceptDeclineRequestValidator = [
  check('id').isMongoId().withMessage('Invalid request format id'),
  validatorMiddleware,
];
