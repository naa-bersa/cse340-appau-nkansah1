const revModel = require("../models/review-model")
const invModel = require("../models/inventory-model");
const utilities = require("../utilities");
const revCont = {};

revCont.addReview = async function (req, res, next) {
const { reviewer_name, review_content, inv_id } = req.body;
const vehicle_id = inv_id;
const account_id = res.locals.accountData.account_id;
const reviewData = await revModel.getReviewsByVehicleId(vehicle_id);

const data = await invModel.getInventoryDetailsById(vehicle_id);

const content = await utilities.buildVehicleViewbyId(data[0]);

let nav = await utilities.getNav();
const vehicleName =
    data[0].inv_year + " " + data[0].inv_make + " " + data[0].inv_model;

try {                                                                                               
    const addReviewResult = await revModel.addReview(
    vehicle_id,
    account_id,
    reviewer_name,
    review_content
    );
    if (addReviewResult) {
    req.flash("notice-success", "Review added successfully.");
    res.render("./vehicleDetails/vehicleDetails", {
        title: vehicleName,
        nav,
        content,
        account_id,
        vehicle_id,
        reviewData
    });
    } else {
    req.flash("notice-fail", "Sorry, there was an error adding the review.");
    res.render("./vehicleDetails/vehicleDetails", {
        title: vehicleName,
        nav,
        content,
        account_id,
        vehicle_id,
        reviewData
    });
    }
} catch (error) {
    res.status(500).json({ error: "Failed to retrieve inventory items" });
}
};


revCont.buildEditReviewView = async (req, res) => {
    const nav = await utilities.getNav();
    const reviewId = req.params.review_id;
    const reviewData = await revModel.getReviewbyReviewId(reviewId);
    console.log(reviewData);
    res.render("./review/editReview", {
      title: "Edit Review",
      nav,
      reviewData,
    });
  };
   
  revCont.processEditReview = async (req, res) => {
    const { inv_id, account_id, review_id, reviewer_name, review_content } =
      req.body;
    const nav = await utilities.getNav();
    const reviewData = await revModel.getReviewbyReviewId(review_id);
   
    try {
      const data = await revModel.updateReview(
        inv_id,
        account_id,
        review_id,
        reviewer_name,
        review_content
      );
   
      if (data) {
        req.flash("notice-success", "Review updated successfully.");
        res.redirect("/account/management");
      } else {
        req.flash(
          "notice-fail",
          "Sorry, there was an error updating the review."
        );
        res.render("./review/editReview", {
          title: "Edit Review",
          nav,
          reviewData,
        });
      }
    } catch (error) {
      console.error("ERROR IN PROCESSING EDIT REVIEW", error);
    }
  };

// delete
  revCont.deleteReviewView = async (req, res) => {
    const nav = await utilities.getNav();
    const reviewId = req.params.review_id;
    const reviewData = await revModel.getReviewbyReviewId(reviewId);
    console.log(reviewData);
    res.render("./review/deleteReview", {
      title: "Delete Review",
      nav,
      reviewData,
    });
  };
   
  revCont.processDeleteReview = async (req, res) => {
    const { review_id } = req.body;
   
    try {
      const data = await revModel.deleteReview(review_id);
      if (data) {
        req.flash("notice-success", "Review deleted successfully.");
        res.redirect("/account/management");
      } else {
        req.flash(
          "notice-fail",
          "Sorry, there was an error deleting the review."
        );
        // res.redirect("/account/");
      }
    } catch (error) {
      console.error("ERROR IN PROCESSING DELETE REVIEW", error);
    }
  };


  module.exports = revCont;