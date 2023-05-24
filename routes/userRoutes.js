const express = require("express");
const userController = require("./../controllers/userController");
const authController = require("./../controllers/authController");

const router = express.Router();

// AUTH
router.route("/signup").post(authController.signup);
router.route("/login").post(authController.login);
router.route("/forgotpassword").post(authController.forgotPassword);
router.route("/resetpassword").post(authController.resetPassword);
router.route("/resetpassword/:token").patch(authController.resetPassword);

router.use(authController.protect);
router.route("/updatepassword").patch(authController.updatePassword);
router.patch("/updateme", userController.updateMe);
router.patch("/deleteme", userController.deleteMe);
router.get("/me", userController.getMe, userController.getUser);

// ADMIN
router.use(authController.restrictTo("admin"));
router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
