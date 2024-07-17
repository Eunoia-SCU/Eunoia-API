const express = require('express');
const {
  createRequest,
  acceptRequest,
  requestDecline,
  checkPackageOwner,
  getUserSendRequests,
  getServiceProviderRecivedRequests,
} = require('../controllers/requestController');
const {
  createRequestValidator,
  acceptDeclineRequestValidator,
} = require('../utils/validators/requestValidator');
const {
  checkPackageOwnerForRequest,
} = require('../controllers/packageController');

const router = express.Router();
const { protect, restrictTo } = require('../controllers/authController');

// Protect all routes below this middleware
router.use(protect);
router
  .route('/:packageId')
  .post(createRequestValidator, checkPackageOwnerForRequest, createRequest);
// Get All Request Recived to service Provider
router
  .route('/serviceProvider')
  .get(restrictTo('serviceProvider'), getServiceProviderRecivedRequests);
// Get All Request sent by user
router.route('/user').get(getUserSendRequests);
// Accept request
router
  .route('/:id/accept-request')
  .patch(acceptDeclineRequestValidator, checkPackageOwner, acceptRequest);
// Decline request
router
  .route('/:id/decline-request')
  .patch(acceptDeclineRequestValidator, checkPackageOwner, requestDecline);

module.exports = router;
