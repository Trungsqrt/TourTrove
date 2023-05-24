const express = require("express");
const reviewController = require("../controllers/reviewController");
const authController = require("../controllers/authController");

// Allow child routes access url parameters from parent route
// /:tourId/reviews => allow to access tourId

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route("/")
  .get(reviewController.getAllReviews)
  .post(
    // only user can make review
    authController.restrictTo("user"),
    reviewController.setTourUserIds,
    reviewController.createReview
  );

router
  .route("/:id")
  .get(reviewController.getReview)
  .patch(authController.restrictTo("user"), reviewController.updateReview)
  .delete(
    authController.restrictTo("user", "admin"),
    reviewController.deleteReview
  );

module.exports = router;
