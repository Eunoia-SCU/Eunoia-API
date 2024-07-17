const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../middlewares/emailMiddleware');
const createSendTokenCookies = require('../utils/createToken');
const crypto = require('crypto');

// @desc   Signup
// @route  POST /api/v1/auth/signup
// @access Public
exports.signup = catchAsync(async (req, res, next) => {
  if (req.body.password !== req.body.passwordConfirm) {
    return next(new AppError('Those passwords didn’t match. Try again.', 400));
  }
  const user = await User.create(req.body);
  //   const token = await user.generateAuthToken();
  await new sendEmail(user).sendWelcome();
  createSendTokenCookies(user, 201, res);
});
// @desc   Login
// @route  POST /api/v1/auth/login
// @access Public
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }
  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  // 3) If everything ok, send token to client
  createSendTokenCookies(user, 200, res);
});
// @desc   Logout
// @route  POST /api/v1/auth/logout
// @access Public
exports.logout = catchAsync(async (req, res, next) => {
  res
    .clearCookie('jwt')
    .status(200)
    .json({ status: 'success', message: 'Logout Successful' });
});
// @desc   Forgot password
// @route  POST /api/v1/auth/forgorPassword
// @access Public
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new AppError(`there is no user from this ${req.body.email}`, 404)
    );
  }
  // 2) If user exist, Generate hash reset random 4 digits and save it in db
  const resetCode = Math.floor(1000 + Math.random() * 9000).toString();
  const hashedResetCode = crypto
    .createHash('sha256')
    .update(resetCode)
    .digest('hex');

  // Save hashed password reset code into db
  user.passwordResetCode = hashedResetCode;
  // Add expiration time for password reset code (15 min)
  user.passwordResetExpires = Date.now() + 15 * 60 * 1000;
  user.passwordResetVerified = false;

  await user.save();

  try {
    // 3) Send the reset code via email
    await new sendEmail(user, resetCode).sendPasswordReset();
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;

    await user.save();
    return next(
      new AppError(
        `There is an error in sending email , Please Try Again Later`,
        400
      )
    );
  }
  res.status(200).json({
    status: 'Success',
    message: 'Reset code sent to email',
  });
});
// @desc   Verify password reset Code
// @route  POST /api/v1/auth/verfiyCode
// @access Public
exports.verfiyCode = catchAsync(async (req, res, next) => {
  // 1) Get user based on the Code
  const hashedCode = crypto
    .createHash('sha256')
    .update(req.body.otp)
    .digest('hex');

  const user = await User.findOne({
    passwordResetCode: hashedCode,
    passwordResetExpires: { $gt: Date.now() },
  });
  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Entered Code is invalid or has expired', 400));
  }
  user.passwordResetVerified = true;
  await user.save();
  res.status(200).json({
    status: 'Success',
    messgae:
      'Your Code has been successfully verified. You can now proceed to reset your password.',
  });
});
// @desc   Reset password
// @route  POST /api/v1/auth/resetPassword
// @access Public
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new AppError(`There is no user with email ${req.body.email}`, 404)
    );
  }
  // 2) Check if reset code verified
  if (!user.passwordResetVerified) {
    res.status(400).send(`Reset code not verified.`);
  }

  user.password = req.body.newPassword;
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerified = undefined;
  await user.save();
  createSendTokenCookies(user, 200, res);
});
// @desc  Protect => make user logged in
exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token || !req.cookies) {
    res.status(403).send({
      status: 'fail',
      message: 'You are not logged in! Please login to get access.',
    });
  }

  // 2) verify token (no change happen or expired token)
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log(decoded);
  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

// @desc   Authorization (User Permissions)
// ["admin","Manager", "user","ServiceProvider"]
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // 1) access roles
    // 2) access registered user (req.user.role)
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

exports.checkAuth = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token || !req.cookies) {
    res.status(200).send({
      status: 'success',
      isAuthenticated: false,
    });
  } else {
    res.status(200).send({
      status: 'success',
      isAuthenticated: true,
    });
  }
});
