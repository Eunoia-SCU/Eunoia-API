const express = require('express');
const authController = require('../controllers/authController');
const {
  getUser,
  updateUser,
  deleteUser,
  createUser,
  getAllUsers,
  getMyProfile,
  updateMyProfile,
  deleteMyProfile,
  updateMyPassword,
  uploadProfileImage,
  handleProfileImage,
} = require('../controllers/userController');

const router = new express.Router();
// Profile Routes
router
  .route('/me')
  .get(authController.protect, getMyProfile)
  .patch(
    authController.protect,
    uploadProfileImage,
    handleProfileImage,
    updateMyProfile
  )
  .delete(authController.protect, deleteMyProfile);
router.patch('/updatePassword', authController.protect, updateMyPassword);
// Admin Routes
router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'manager'),
    getAllUsers
  )
  .post(
    authController.protect,
    uploadProfileImage,
    handleProfileImage,
    authController.restrictTo('admin', 'manager'),
    createUser
  );
router
  .route('/:id')
  .get(
    handleProfileImage,
    authController.protect,
    authController.restrictTo('admin', 'manager'),
    getUser
  )
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'manager'),
    uploadProfileImage,
    handleProfileImage,
    updateUser
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    deleteUser
  );

module.exports = router;
