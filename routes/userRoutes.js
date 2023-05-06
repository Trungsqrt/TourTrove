const express = require("express");
const userController = require("./../controllers/userController");
const authController = require("./../controllers/authController");

const router = express.Router();

router.route("/signup").post(authController.signup);
router.route("/login").post(authController.login);
router.route("/forgotpassword").post(authController.forgotPassword);
router.route("/resetpassword").post(authController.resetPassword);
router.route("/resetpassword/:token").patch(authController.resetPassword);
router
  .route("/updatepassword")
  .patch(authController.protect, authController.updatePassword);

router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(
    // first at all is logged in
    authController.protect,
    // next is staff role
    authController.restrictTo("admin"),
    userController.deleteUser
  );

module.exports = router;
