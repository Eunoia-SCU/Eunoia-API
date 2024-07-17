const factory = require('./handelFactory');
const Review = require('../models/reviewModel');

//Nested routes
// Get /api/v1/products/productsId/reviews
exports.createfilterobject = (req, res, next) => {
  let filterObject = {};
  if (req.params.serviceId) filterObject = { service: req.params.serviceId };
  req.filterObject = filterObject;
  next();
};
//desc   Get list of reviews
// Route Get/api/v1/reviews
// Access public
exports.getReviews = factory.getAll(Review);
// desc Get speciefic review by id
// Route Get/api/v1/reviews/:id
// Access public
exports.getReview = factory.getOne(Review);

// Nested routes
exports.setServiceIdAndUserIdToBody = (req, res, next) => {
  if (!req.body.service) req.body.service = req.params.serviceId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};
// desc    Create reviews
// Route POST/ api/v1/reviews
// Access Private/Protect/User
exports.createReview = factory.createOne(Review);

// desc update specific review
// Route Put/api/v1/review:id
// @access Private/protect/User
exports.updateReview = factory.updateOne(Review);

// desc Delete specific review
// Route Put/api/v1/reviews:id
// @access Private/protect/User-Admin-Manger
exports.deleteReview = factory.deleteOne(Review);
