const express = require("express");
const {
  createReviewValidator,
  updateReviewValidator,
  getReviewValidator,
  deleteReviewValidator,
} = require("../utils/validators/reviewValidator");
//const validatorMiddleware = require('../middlewares/validatorMiddleware');

const {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  createfilterobject,
  setServiceIdAndUserIdToBody,
} = require("../controllers/reviewController");

const AuthServies = require("../controllers/authController");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(createfilterobject, getReviews)
  .post(
    AuthServies.protect,
    setServiceIdAndUserIdToBody,
    createReviewValidator,
    createReview
  );
router
  .route("/:id")
  .get(getReviewValidator, getReview)
  .patch(AuthServies.protect, updateReviewValidator, updateReview)
  .delete(
    AuthServies.protect,
    AuthServies.restrictTo("admin", "user", "serviceProvider"),
    deleteReviewValidator,
    deleteReview
  );
module.exports = router;
