const utilities = require("../utilities");
const { body, validationResult } = require("express-validator");
const inventoryModel = require("../models/inventory-model");
const validate = {};

/* **********************************
 * Inventory Data Validation Rules
 * ********************************* */
validate.inventoryRules = () => {
  return [
    // make
    body("inv_make")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Make is required."),

    // model
    body("inv_model")
      .trim()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Model is required."),

    // Year
    body("inv_description")
      .trim()
      .escape()
      .notEmpty()
      .isNumeric()
      .withMessage("Please provide a year.")
      .isLength({ min: 4, max: 4 })
      .withMessage("Year must e exactly 4 digits"),

    // Description is required
    body("inv_description")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Description is required."),

    // Price is required and must be a positive number
    body("inv_price")
      .trim()
      .notEmpty()
      .isFloat({ min: 0 })
      .withMessage("Please provide a valid price."),

    //  Image
    body("inv_image").trim().notEmpty().withMessage("Image is required"),

    //  Thumbnail
    body("inv_thumbnail")
      .trim()
      .notEmpty()
      .withMessage("Thumbnail is required"),

    // Color
    body("inv_color")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Color is required."),

    // Miles
    body("inv_miles")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Miles is required.")
      .isInt({ min: 0 })
      .withMessage("Miles must be a positive integer."),

    // Price
    body("inv_price")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Price is required")
      .isInt({ min: 0 })
      .withMessage("Price must be a positive integer"),

    

  
  ];
};

/* ******************************
 * Check Inventory Data and return errors or continue
 * ***************************** */
validate.checkInventoryData = async (req, res, next) => {
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("inventory/add-classification", { 
      errors: errors.array(),
      title: "Manage Inventory",
      nav,
    });
    return;
  }
  next();
};

/* ******************************
 * Check Update Data and return errors to the edit view
 * ***************************** */
validate.checkUpdateData = async (req, res, next) => {
  let errors = [];
  const inv_id = req.body.inv_id;
  // const vehicleName = req.body.inv_year + "" + req.body.inv_make + "" + req.body.inv_make;
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("inventory/edit-inventory", {
      errors: errors.array(),
      title: "Edit",
      nav,
      inv_id,
    });
    return;
  }
  next();
};
/* **********************************
 * Classification Data Validation Rules
 * ********************************* */
validate.classificationRules = () => {
  return [
    // Classification name is required and must be a string
    body("classification")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a valid classification name."),
  ];
};

/* ******************************
 * Check Classification Data and return errors or continue
 * ***************************** */
validate.checkClassificationData = async (req, res, next) => {
  const errors = validationResult(req); // Use destructuring to simplify
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav(); // Fetch navigation dynamically
    res.render("inventory/add-classification", {
      title: "Manage Classification",
      nav,
      errors: errors.array(), // Pass error array to template
    });
    return;
  }
  next();
};

module.exports = validate;
