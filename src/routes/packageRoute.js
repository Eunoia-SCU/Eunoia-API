const express = require('express');
const {
  getAllPackages,
  deletePackage,
  updatePackage,
  uploadPackagePhoto,
  handlePackagePhoto,
  createPackage,
  getPackage,
  addPackagePhoto,
  checkPackageOwner,
  getPackageOffers,
} = require('../controllers/packageController');
const {
  createPackageValidator,
  getPackageValidator,
  deletePackageValidator,
} = require('../utils/validators/packageValidator');

const router = express.Router({ mergeParams: true });
const { protect, restrictTo } = require('../controllers/authController');

router.route('/offers').get(getPackageOffers);
router
  .route('/updatePackage/:id')
  .patch(protect, checkPackageOwner, updatePackage);

router
  .route('/')
  .post(protect, createPackageValidator, createPackage)
  .get(protect, restrictTo('admin'), getAllPackages);
router
  .route('/uploadImage')
  .post(protect, uploadPackagePhoto, handlePackagePhoto);
router
  .route('/:id')
  .get(protect, getPackageValidator, getPackage)
  .delete(protect, deletePackageValidator, checkPackageOwner, deletePackage)
  .patch(
    protect,
    uploadPackagePhoto,
    handlePackagePhoto,
    checkPackageOwner,
    addPackagePhoto
  );

module.exports = router;
