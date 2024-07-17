const { uploadToCloudinary } = require('../utils/cloudinary');
const { v4: uuidv4 } = require('uuid');
const { uploadSingleImage } = require('../middlewares/uploadImageMiddleware');
const catchAsync = require('../utils/catchAsync');
const Package = require('../models/packageModel');
const Service = require('../models/serviceModel');
const factory = require('./handelFactory');

const AppError = require('../utils/appError');

exports.checkPackageOwnerForRequest = catchAsync(async (req, res, next) => {
  const packageId = req.params.packageId;
  const package = await Package.findById(packageId);
  if (!package) {
    return next(new AppError('Invaild package id', 404));
  }
  const service = await Service.findById(package.service);
  if (req.user._id.toString() === service.owner.toString()) {
    return next(
      new AppError('You do not have permission to perform this action', 403)
    );
  }
  next();
});
exports.checkPackageOwner = catchAsync(async (req, res, next) => {
  const packageId = req.params.id;
  const package = await Package.findById(packageId);
  if (!package) {
    return next(new AppError('Invaild package id', 404));
  }
  const service = await Service.findById(package.service);
  if (req.user._id.toString() !== service.owner.toString()) {
    return next(
      new AppError('You do not have permission to perform this action', 403)
    );
  }
  next();
});

// Middleware to handle uploading package photos
exports.uploadPackagePhoto = uploadSingleImage('packagePhoto');
// Middleware to handle uploading package photos to Cloudinary
exports.handlePackagePhoto = catchAsync(async (req, res, next) => {
  try {
    if (!req.file.buffer) return next();
    if (req.file.buffer) {
      const packagePhotoResult = await uploadToCloudinary(
        req.file.buffer,
        `packagePhoto-${uuidv4()}`,
        'Packages'
      );

      req.body.packagePhoto = packagePhotoResult.url;
    }
    next();
  } catch (error) {
    return res.status(error.http_code).json({
      status: 'fail',
      message: error.message,
    });
  }
});
exports.addPackagePhoto = catchAsync(async (req, res, next) => {
  const package = await Package.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!package) {
    return next(
      new AppError('You do not have permission to perform this action', 403)
    );
  }
  // Save the new package
  await package.save();

  res.status(200).json({
    status: 'success',
    message: 'Package Photo added successfully',
    data: package,
  });
});

exports.getPackageOffers = catchAsync(async (req, res, next) => {
  const packages = await Package.find({ offer: 1 }).populate('service');
  if (!packages) {
    return next(
      new AppError('No offers found right now , try again later', 404)
    );
  }
  res.json({
    status: 'success',
    data: packages,
  });
});

// @desc  Get list of packages
// @route GET /api/v1/packages
// @access Private ["admin"]
exports.getAllPackages = factory.getAll(Package, 'Packages');

// @desc  Get specific package by :id
// @route GET /api/v1/packages/:id
// @access Public
exports.getPackage = factory.getOne(Package);

// @desc  Update specific package by :id
// @route PATCH /api/v1/packages/:id
// @access Private ["ServiceProvider"]
exports.updatePackage = factory.updateOne(Package);

// @desc  Delete specific package by :id
// @route Delete /api/v1/packages/:id
// @access Private ["ServiceProvider","Admin"]
exports.deletePackage = factory.deleteOne(Package);

// @desc  Create  Package
// @route POST /api/v1/packages
// @access Private ["serviceProvider"]
exports.createPackage = catchAsync(async (req, res, next) => {
  // check if user has a Service Profile
  if (req.user.hasService === false) {
    return next(
      new AppError(`You are not authorized to access this route`, 403)
    );
  }

  const userId = req.user._id.toString();
  // Find services owned by the user
  const userServices = await Service.findOne({ owner: userId });
  console.log(userServices);
  // Create a new package with user's service
  const package = new Package({
    ...req.body,
    service: userServices._id,
  });
  const CheaperPackageprice = await Package.findOne({
    service: userServices._id,
  })
    .sort({ price: 1 })
    .select('price');
  if (CheaperPackageprice) {
    if (req.body.price) {
      if (CheaperPackageprice && CheaperPackageprice.price > req.body.price) {
        userServices.startFrom = req.body.price;
        await userServices.save();
      } else {
        userServices.startFrom = CheaperPackageprice.price;
        await userServices.save();
      }
    }
  }

  // Save the new package
  await package.save();

  res.status(201).json({
    status: 'success',
    message: 'Package created successfully',
    data: package,
  });
});
