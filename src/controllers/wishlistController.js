const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/userModel');

// @desc  add service to wishlist
// @route POST /api/v1/wishlist
// @access Protected/User
exports.addServiceToWishlist = catchAsync(async (req, res, next) => {
  // $addToSet => add serviceId to wishlist array of serviceId not exist
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { wishlist: req.body.serviceId },
    },
    {
      new: true,
    }
  );
  res.status(200).json({
    status: 'success',
    message: 'Service added successfully to your wishlist',
  });
});

// @desc  remove service from wishlist
// @route DELETE/api/v1/wishlist/serviceId
// @access Protected/User
exports.removeServiceFromWishlist = catchAsync(async (req, res, next) => {
  // $pull => remove serviceId from wishlist array of serviceId not exist
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { wishlist: req.params.serviceId },
    },
    {
      new: true,
    }
  );
  res.status(200).json({
    status: 'success',
    message: 'Service removed successfully from your wishlist',
    data: user.wishlist,
  });
});

// @desc  Get logged user wishlist
// @route GET/api/v1/wishlist
// @access Protected/User
exports.getLoggedUserWishList = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate('wishlist');
  res
    .status(200)
    .json({
      status: ' success',
      result: user.wishlist.length,
      data: user.wishlist,
    });
});
