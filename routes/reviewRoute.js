// route to add a review
const express = require("express")
const router = new express.Router() 
const reviewController = require("../controllers/reviewController")
const utilities = require("../utilities")
//Route to add inventory review
router.post(
    "/addReview",
    utilities.checkLogin,
    utilities.handleErrors(reviewController.addReview)
  );

//route to editReview view
router.get(
    "/editReview/:review_id",
    utilities.handleErrors(reviewController.buildEditReviewView)
  );

//route to editReview process
router.post(
    "/editReview",
    utilities.handleErrors(reviewController.processEditReview)
  );

//route to deleteReview view
router.get(
    "/deleteReview/:review_id",
    utilities.handleErrors(reviewController.deleteReviewView)
  );

//route to deleteReview process
router.post(
    "/deleteReview",
    utilities.handleErrors(reviewController.processDeleteReview)
  );
  module.exports = router;