const utilities = require("../utilities")
const { body, validationResult } = require("express-validator")
const inventoryModel = require("../models/inventory-model")
const validate = {}

/* **********************************
 * Inventory Data Validation Rules
 * ********************************* */
validate.inventoryRules = () => {
  return [
    // Inventory name is required and must be a string, with no space or special characters
    body("inventory_name")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide an inventory name."),

    // Description is required
    body("inventory_description")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a description."),

    // Price is required and must be a positive number
    body("inventory_price")
      .trim()
      .notEmpty()
      .isFloat({ min: 0 })
      .withMessage("Please provide a valid price."),

    // Quantity is required and must be an integer
    body("inventory_mile")
      .trim()
      .notEmpty()
      .isInt({ min: 0 })
      .withMessage("Please provide a valid mile."),

    // Category is required
    body("inventory_category")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please select a category."),
  ]
}

/* ******************************
 * Check Inventory Data and return errors or continue
 * ***************************** */
validate.checkInventoryData = async (req, res, next) => {
  const {
    inventory_name,
    inventory_description,
    inventory_price,
    inventory_quantity,
    inventory_category,
  } = req.body
  let errors = validationResult(req)

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("inventory/manage", {
      errors: errors.array(),
      title: "Manage Inventory",
      nav,
      inventory_name,
      inventory_description,
      inventory_price,
      inventory_quantity,
      inventory_category,
    })
    return
  }
  next()
}


/* ******************************
 * Check Inventory Data and return errors back to the edit view
 * ***************************** */
validate.checkUpdateData = async (req, res, next) => {
  const {
    inv_id,
    inventory_name,
    inventory_description,
    inventory_price,
    inventory_quantity,
    inventory_category,
  } = req.body
  let errors = validationResult(req)

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("inventory/edit", {  // Change render view to "edit"
      errors: errors.array(),
      title: "Edit Inventory Item",  // Updated title to match the edit view title
      nav,
      inv_id,  // Add inv_id to the data object
      inventory_name,
      inventory_description,
      inventory_price,
      inventory_quantity,
      inventory_category,
    })
    return
  }
  next()
}



module.exports = validate
