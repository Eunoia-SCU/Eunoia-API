const express = require('express');
const {
  getAllServices,
  setLocationParam,
  getMostPopular,
  getService,
  updateService,
  deleteService,
  uploadServicePhotos,
  handleServicePhotos,
  createServiceProfile,
  deleteMyServiceProfile,
  getMyServiceProfile,
  updateMyServiceProfile,
  addPhotosToImagesAlbums,
  removePhotoFromImagesAlbum,
} = require('../controllers/serviceController');

const reviewsRoute = require('./reviewRoute');

const { protect, restrictTo } = require('../controllers/authController');

// Acces params in other Routers
const router = express.Router({ mergeParams: true });

// post service/aknvsfjdv555/reviews
// Get  service/aknvsfjdv555/reviews
// Get  service/aknvsfjdv555/reviews/:id
router.use('/:serviceId/reviews', reviewsRoute);

router
  .route('/')
  .get(getAllServices)
  .post(
    protect,
    restrictTo('user'),
    uploadServicePhotos,
    handleServicePhotos,
    createServiceProfile
  );

// Home Page Routes
router.route('/nearBy').get(protect, setLocationParam, getAllServices);
router.route('/popular').get(protect, getMostPopular, getAllServices);

router
  .route('/serviceProfile')
  .get(protect, restrictTo('serviceProvider'), getMyServiceProfile)
  .patch(
    protect,
    uploadServicePhotos,
    handleServicePhotos,
    updateMyServiceProfile
  )
  .delete(protect, restrictTo('serviceProvider'), deleteMyServiceProfile);

// Add photos to Ablums Photo.
router
  .route('/add-Photos')
  .patch(
    protect,
    restrictTo('serviceProvider'),
    uploadServicePhotos,
    addPhotosToImagesAlbums
  );
// remove photos from Ablums Photo.
router
  .route('/remove-Photos')
  .patch(protect, restrictTo('serviceProvider'), removePhotoFromImagesAlbum);

router
  .route('/:id')
  .get(getService)
  .patch(protect, restrictTo('admin', 'manager'), updateService)
  .delete(protect, restrictTo('admin', 'manager'), deleteService);

module.exports = router;
