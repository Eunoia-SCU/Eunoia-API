const {
  uploadToCloudinary,
  deleteFromCloudinary,
  extractPublicIdFromImageLink,
} = require('../utils/cloudinary');
const { uploadMixOfImages } = require('../middlewares/uploadImageMiddleware');
const { v4: uuidv4 } = require('uuid');

const Service = require('../models/serviceModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handelFactory');
const AppError = require('../utils/appError');

// @desc Get Top 10 Services
exports.getMostPopular = (req, res, next) => {
  req.query.limit = '10';
  req.query.sort = '-ratingsAverage';
  req.query.fields = 'businessName,location,avatar,ratingsAverage';
  next();
};
// @desc Get nearby Services
exports.setLocationParam = (req, res, next) => {
  req.query.location = req.user.location;
  next();
};

// Upload Mix Of Images
exports.uploadServicePhotos = uploadMixOfImages([
  {
    name: 'avatar',
    maxCount: 1,
  },
  {
    name: 'newImages',
    maxCount: 20,
  },
  {
    name: 'images',
    maxCount: 20,
  },
  { name: 'imageCover', maxCount: 1 },
]);

// Image Processing
exports.handleServicePhotos = catchAsync(async (req, res, next) => {
  try {
    if (req.files.avatar) {
      const avatarResult = await uploadToCloudinary(
        req.files.avatar[0].buffer,
        `serviceProfile/${uuidv4()}`,
        'Avatars'
      );
      req.body.avatar = avatarResult.url;
    }

    if (req.files.imageCover) {
      const coverResult = await uploadToCloudinary(
        req.files.imageCover[0].buffer,
        `serviceProfile/${uuidv4()}`,
        'CoverImages'
      );
      req.body.imageCover = coverResult.url;
    }

    if (req.files.images) {
      req.body.images = [];
      await Promise.all(
        req.files.images.map(async (file, i) => {
          const imageResult = await uploadToCloudinary(
            file.buffer,
            `serviceProfile/Albums${i}-${uuidv4()}`,
            'Albums'
          );
          req.body.images.push(imageResult.url);
        })
      );
    }

    next();
  } catch (error) {
    return res.status(error.http_code).json({
      status: 'fail',
      message: error.message,
    });
  }
});
// @desc  Create Service Profile
// @route POST /api/v1/services
// @access Private/Protected -[User]
exports.createServiceProfile = catchAsync(async (req, res, next) => {
  // check if user has a Service Profile
  if (req.user.hasService === true) {
    next(new AppError(`You Already have Service Profile!`, 403));
  }
  // create Service if user don't have Service Profile
  const service = new Service({
    ...req.body,
    owner: req.user._id,
  });

  await service.save();

  // Update the user's hasService field to true
  req.user.hasService = true;
  req.user.role = 'serviceProvider';

  await req.user.save();

  res.status(201).json({
    status: 'success',
    message: 'Service Profile created successfully',
    data: service,
  });
});
// @desc  Get  My Service Profile
// @route GET /api/v1/services/serviceProfile
// @access Private/Protected -[service Provider]
exports.getMyServiceProfile = catchAsync(async (req, res, next) => {
  // serach for service profile by owner id
  const serviceProfile = await Service.findOne({
    owner: req.user._id,
  }).populate('packages');
  if (!serviceProfile) {
    return next(new AppError('No service Profile for this user', 404));
  }
  res.status(200).json({ status: 'success', data: serviceProfile });
});
// @desc  Update My Service Profile
// @route PATCH /api/v1/services/serviceProfile
// @access Private/Protected -[service Provider]
exports.updateMyServiceProfile = catchAsync(async (req, res, next) => {
  const ownerId = req.user._id;
  const serviceProfile = await Service.findOne({ owner: ownerId });
  const updates = Object.keys(req.body);
  const allowedUpdates = [
    'businessName',
    'about',
    'images',
    'location',
    'businessCategory',
    'phoneNumber',
    'avatar',
    'imageCover',
    'latitude',
    'longitude',
  ];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return next(new AppError('Invalid updates!', 400));
  }

  try {
    updates.forEach((update) => (serviceProfile[update] = req.body[update]));

    await serviceProfile.save();

    res.send({
      status: 'success',
      message: 'Profile updated successfully',
      data: serviceProfile,
    });
  } catch (e) {
    res.status(400).send(e);
  }
});
// @desc  Add Photos To images Albums
// @route PATCH /api/v1/services/add-Photo
// @access Private/Protected -[service Provider]
exports.addPhotosToImagesAlbums = catchAsync(async (req, res, next) => {
  // Find the service profile by owner ID
  const serviceProfile = await Service.findOne({ owner: req.user._id });

  if (!serviceProfile) {
    return next(new AppError('Service profile not found', 404));
  }

  if (req.files.newImages) {
    // Upload new images to Cloudinary and obtain their URLs
    const newImagesUrls = await Promise.all(
      req.files.newImages.map(async (file, i) => {
        const imageResult = await uploadToCloudinary(
          file.buffer,
          `serviceProfile/Albums${i}-${uuidv4()}`,
          'Albums'
        );
        console.log(imageResult);
        return imageResult.url;
      })
    );

    // Filter out duplicate URLs
    const uniqueNewImagesUrls = newImagesUrls.filter(
      (url) => !serviceProfile.images.includes(url)
    );

    // Concatenate uniqueNewImagesUrls array with the existing images array
    serviceProfile.images = serviceProfile.images.concat(uniqueNewImagesUrls);
  }

  await serviceProfile.save();

  res.status(200).json({
    status: 'success',
    message: 'Photos added successfully',
    data: serviceProfile, // Return updated service profile
  });
});
// @desc    Delete Photos From images Albums
// @route   DELETE /api/v1/services/remove-Photo
// @access  Private/Protected -[ServiceProvider]
exports.removePhotoFromImagesAlbum = catchAsync(async (req, res, next) => {
  // Find the service profile by owner ID
  const serviceProfile = await Service.findOne({ owner: req.user._id });
  if (!serviceProfile) {
    return next(new AppError('Service profile not found', 404));
  }

  // Check if image link is provided in the request body
  const imageLink = req.body.imageLinks;
  if (!imageLink) {
    return next(new AppError('Image link not provided', 400));
  }

  // Check if the provided image link exists in the images array
  const imageIndex = serviceProfile.images.findIndex(
    (image) => image === imageLink
  );
  if (imageIndex === -1) {
    return next(new AppError('Image not found in the album', 404));
  }
  // Get the public id from entered link
  publicId = extractPublicIdFromImageLink(imageLink);

  // Delete the photo from cloudinary
  await deleteFromCloudinary(`Albums/serviceProfile/${publicId}`);

  // Remove the image link from the array
  serviceProfile.images.splice(imageIndex, 1);
  // Save the updated service profile
  await serviceProfile.save();

  res.status(200).json({
    status: 'success',
    message: 'Image deleted successfully',
    data: serviceProfile,
  });
});
// @desc  Delete  My Service Profile
// @route DELETE /api/v1/services/serviceProfile
// @access Private/Protected -[service Provider]
exports.deleteMyServiceProfile = catchAsync(async (req, res, next) => {
  // Get logged user id
  const ownerId = req.user._id;
  // serach for service profile by owner id
  const serviceProfile = await Service.findOne({ owner: ownerId });
  if (!serviceProfile) {
    return next(new AppError('No service Profile for this user', 404));
  }
  await Service.findByIdAndDelete(serviceProfile._id);
  // change user role to normal user and hasService to false
  (req.user.role = 'user'),
    (req.user.hasService = false),
    await req.user.save();

  res.status(204).json({
    status: 'success',
    message: 'Service Profile deleted successfully',
  });
});
// @desc  Get list of Service Profiles
// @route GET /api/v1/services
// @access Public
exports.getAllServices = factory.getAll(Service, 'Services');

// @desc  Get specific Service Profile by :id
// @route GET /api/v1/services/:id
// @access Public
exports.getService = factory.getOne(Service, 'packages reviews');

// @desc  Update specific Service by :id
// @route PATCH /api/v1/services/:id
// @access Private/Protected -[Admin]
exports.updateService = factory.updateOne(Service);

// @desc  Delete specific Service by :id
// @route Delete /api/v1/services/:id
// @access  Private/Protected -[Admin]
exports.deleteService = factory.deleteOne(Service, 'Services');
// @desc  Get specific Service by :userId
// @route GET /api/v1/services/:id
// @access  Private/Protected -[ServiceProvider]
