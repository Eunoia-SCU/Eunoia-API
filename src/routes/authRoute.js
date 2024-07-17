const express = require("express");
const authController = require("../controllers/authController");
const router = new express.Router();

router.post("/register", authController.signup);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/forgotPassword", authController.forgotPassword);
router.post("/verfiyCode", authController.verfiyCode);
router.patch("/resetPassword", authController.resetPassword);
router.get("/checkAuth", authController.checkAuth);

module.exports = router;
