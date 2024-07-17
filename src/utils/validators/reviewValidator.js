const { check,body } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const Review = require('../../models/reviewModel');

exports.createReviewValidator = [
  check('title').optional(),
  check('ratings')
    .notEmpty()
    .withMessage('ratings value required')
    .isFloat({ min: 1, max: 5 }),
  check('user').isMongoId().withMessage('Invalid Review format id'),
  check('service')
    .isMongoId()
    .withMessage('Invalid Review format id')
    .custom((val, { req }) =>
      // Check if logged user create review before
      Review.findOne({ user: req.user._id, service: req.body.service }).then(
        (review) => {
          if (review) {
            return Promise.reject(
              new Error('You already created a review before')
            );
          }
        }
      )
    ),
  validatorMiddleware,
];

exports.getReviewValidator = [
  check('id').isMongoId().withMessage('Invalid Review format id'),
  validatorMiddleware,
];

exports.updateReviewValidator = [
  check('id')
    .isMongoId()
    .withMessage('Invalid Review format id')
    .custom((val, { req }) =>
      // Check review ownership before update
      Review.findById(val).then((review) => {
        if (!review) {
          return Promise.reject(
            new Error(`there is no review with this id ${val} `)
          );
        }
        if (review.user._id.toString() !== req.user._id.toString()) {
          return Promise.reject(
            new Error(`you are not allowed to perform this action `)
          );
        }
      })
    ),
  validatorMiddleware,
];

exports.deleteReviewValidator = [
  check('id')
    .isMongoId()
    .withMessage('Invalid Review format id')
    .custom((val, { req }) => {
      // Check review ownership before update
      if (req.user.role === 'user') {
        return Review.findById(val).then((review) => {
          if (!review) {
            return Promise.reject(
              new Error(`there is no review with this id ${val} `)
            );
          }
          if (review.user._id.toString() !== req.user._id.toString()) {
            return Promise.reject(
              new Error(`you are not allowed to perform this action `)
            );
          }
        });
      }
      return true;
    }),
  validatorMiddleware,
];
