const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const Package = require('../models/packageModel');
const Service = require('../models/serviceModel');
const Request = require('../models/requestModel');
const factory = require('./handelFactory');

const AppError = require('../utils/appError');
const sendEmail = require('../middlewares/emailMiddleware');

const calcTotalPrice = (package, optionsId) => {
  let totalPrice = package.price;
  const allOptions = package.customizePackage.flatMap(
    (category) => category.options
  );
  optionsId.forEach((optionId) => {
    // Find the option by its ID
    const selectedOption = allOptions.find(
      (option) => option._id.toString() === optionId
    );
    if (selectedOption) {
      totalPrice += selectedOption.price;
    }
  });
  return totalPrice;
};
const getSelectedOptions = (package, optionsId) => {
  const selectedOptions = [];
  const allOptions = package.customizePackage.flatMap(
    (category) => category.options
  );
  optionsId.forEach((optionId) => {
    // Find the option by its ID
    const selectedOption = allOptions.find(
      (option) => option._id.toString() === optionId
    );
    if (selectedOption) {
      // Create a new object without the _id field
      const optionWithoutId = {
        title: selectedOption.title,
        price: selectedOption.price,
      };
      selectedOptions.push(optionWithoutId);
    }
  });
  return selectedOptions;
};

exports.checkPackageOwner = catchAsync(async (req, res, next) => {
  const requestId = req.params.id;
  const request = await Request.findById(requestId);
  if (!request) {
    return next(new AppError('Invaild request id', 404));
  }
  const package = await Package.findById(request.package);
  const service = await Service.findById(package.service);
  if (req.user._id.toString() !== service.owner.toString()) {
    return next(
      new AppError('You do not have permission to perform this action', 403)
    );
  }
  next();
});
// @desc   Create Request Order
// @route  /api/v1/requests/:packageId
// @access Protected
exports.createRequest = catchAsync(async (req, res, next) => {
  const { packageId } = req.params;
  const { optionIds } = req.body;

  // 1) Retrieve the package from the database
  const package = await Package.findById(packageId);
  if (!package) {
    return next(new AppError('Package not found', 404));
  }
  // 2) get offer percentage 10% , 20% ,40&
  const offer = package.offer || 0;

  // 3) Calculate total price
  const totalPrice = calcTotalPrice(package, optionIds);
  const options = getSelectedOptions(package, optionIds);
  console.log(options);
  // 4) Calculate price after Discounnt
  const totalPriceAfterDiscount = (
    totalPrice -
    (totalPrice * offer) / 100
  ).toFixed(2);
  // 5) Create the request
  const request = await Request.create({
    user: req.user._id,
    package: package._id,
    options: options,
    totalPriceAfterDiscount: totalPriceAfterDiscount,
    ...req.body,
  });
  res.status(201).json({
    status: 'success',
    message: 'Request created  successfully',
    data: request,
  });
});

// desc   Get list of requests of Service Provider
// Route  Get/api/v1/requests/serviceProvider
// Access protected
exports.getServiceProviderRecivedRequests = catchAsync(
  async (req, res, next) => {
    if (req.user.role == 'user') {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    const service = await Service.findOne({ owner: req.user._id });
    if (!service) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    const package = await Package.findOne({ service: service._id });
    if (!package) {
      return next(
        new AppError(
          "You don't have any packages yet. Please create packages to be able to receive orders",
          404
        )
      );
    }
    const requests = await Request.find({ package: package._id });
    if (requests.length === 0) {
      return next(new AppError('You have no requests received yet', 404));
    }
    res.status(200).json({
      message: 'Your received requests',
      status: 'success',
      data: requests,
    });
  }
);

// desc   Get list of requests that user send
// Route  Get/api/v1/requests/user
// Access protected
exports.getUserSendRequests = catchAsync(async (req, res, next) => {
  const requests = await Request.find({ user: req.user._id });
  if (!requests) {
    return next(new AppError("You haven't sent any requests yet...", 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Your send requests',
    data: requests,
  });
});

exports.acceptRequest = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const request = await Request.findById(id);
  const user = await User.findById(request.user);
  if (!request) {
    return next(new AppError('request not found !!', 404));
  }
  request.status = 'Accepted';
  await request.save();
  await new sendEmail(user).sendRequestAccepted();
  res.status(200).json({
    status: 'success',
    data: request,
  });
});

exports.requestDecline = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const request = await Request.findById(id);
  const user = await User.findById(request.user);

  if (!request) {
    return next(new AppError('request not found !!', 404));
  }
  request.status = 'Declined';
  await request.save();
  await new sendEmail(user).sendRequestDecline();
  res.status(200).json({
    status: 'success',
    data: request,
  });
});

exports.getRequests = factory.getAll(Request);
