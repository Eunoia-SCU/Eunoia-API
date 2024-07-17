const { uploadToCloudinary } = require('../utils/cloudinary');
const { uploadSingleImage } = require('../middlewares/uploadImageMiddleware');
const { v4: uuidv4 } = require('uuid');

const User = require('../models/userModel');
const sendEmail = require('../middlewares/emailMiddleware');
const createSendTokenCookies = require('../utils/createToken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handelFactory');

// @desc  Upload Profile image
exports.uploadProfileImage = uploadSingleImage('avatar');
exports.handleProfileImage = catchAsync(async (req, res, next) => {
  try {
    if (req.file && req.file.buffer) {
      const avatarResult = await uploadToCloudinary(
        req.file.buffer,
        `avatar/${uuidv4()}`,
        'ProfilePicture'
      );
      req.user.avatar = avatarResult.url;
    }
    next();
  } catch (error) {
    return res.status(error.http_code).json({
      status: 'fail',
      message: error.message,
    });
  }
});
// @desc   Get User profile
// @route  GET /api/v1/users/me
// @access [Private require Login]
exports.getMyProfile = catchAsync(async (req, res) => {
  res.json({ status: 'success', user: req.user });
});
// @desc   Update User profile
// @route  PATCH /api/v1/users/me
// @access Private require Login
exports.updateMyProfile = catchAsync(async (req, res, next) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'email', 'avatar', 'location'];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return next(new AppError('Invalid updates!', 400));
  }

  updates.forEach((update) => (req.user[update] = req.body[update]));
  await req.user.save();

  res.send({
    status: 'success',
    message: 'Profile updated successfully',
    data: req.user,
  });
});
// @desc   Delete User profile
// @route  DELETE /api/v1/users/me
// @access Private require Login
exports.deleteMyProfile = catchAsync(async (req, res, next) => {
  await req.user.deleteOne();
  // sendCancelationEmail(req.user.email, req.user.name);
  const data = {
    deletedUser: {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
    },
    status: 'success',
    message: 'Your Account deleted successfully',
  };
  res.send(data);
});
// @desc   Update User Password
// @route  PATCH /api/v1/users/updatePassword
// @access Private require Login
exports.updateMyPassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  // 3) If so, update password
  user.password = req.body.password;
  await user.save();

  await new sendEmail(user).sendPasswordchanged();
  // 3) If everything ok, send token to client
  createSendTokenCookies(user, 200, res);
});

// [ADMIN Routes]

// @desc   Create User
// @route  POST /api/v1/users
// @access Private [Admin , Manager]
exports.createUser = factory.createOne(User);

// @desc  Get list of Service Profiles
// @route GET /api/v1/users
// @access Private [Admin , Manager]
exports.getAllUsers = factory.getAll(User);

// @desc  Get specific User by :id
// @route GET /api/v1/users/:id
// @access Private [Admin , Manager]
exports.getUser = factory.getOne(User);

// @desc  Update specific User by :id
// @route PATCH /api/v1/users/:id
// @access Private [Admin , Manager]
exports.updateUser = factory.updateOne(User);

// @desc  Delete specific User by :id
// @route Delete /api/v1/users/:id
// @access Private [Admin]
exports.deleteUser = factory.deleteOne(User);
