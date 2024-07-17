const express = require('express');

const authController = require('../controllers/authController');

const {
  addServiceToWishlist,
  removeServiceFromWishlist,
  getLoggedUserWishList,
} = require('../controllers/wishlistController');

const router = express.Router();

router.use(
  authController.protect,
  authController.restrictTo('user', 'serviceProvider')
);

router.route('/').post(addServiceToWishlist).get(getLoggedUserWishList);
router.delete('/:serviceId', removeServiceFromWishlist);

module.exports = router;
