const invModel = require("../models/inventory-model");
const utilities = require("../utilities");
const revModel = require("../models/review-model");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  

  // Fetch the inventory data for the given classification ID from the model
  const data = await invModel.getInventoryByClassificationId(classification_id);

  

  // Fetch the navigation data
  const nav = await utilities.getNav();

  // Initialize a default message for when no vehicles are found
  let grid = '<h3>No vehicles found in this classification.</h3>';

  // If no vehicles are found, render the classification view with the default message
  if (data.length === 0) {
    res.render("./inventory/classification", {
      title: "Missing Vehicles",
      nav,
      grid,
    });
    return; // Exit the function early
  }

  grid = await utilities.buildClassificationGrid(data);
  // let nav = await utilities.getNav();

  // Extract the classification name from the first item in the data array
  const className = data[0].classification_name;

  // Render the classification view with the grid and navigation data
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  });
};

/* ***************************
 *  Build inventory Details by Inventory Id view
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
  const vehicle_id = req.params.inventory_id;
  const account_id = res.locals.account_id;
  // console.log("VID : " + req.params.inventory_id);

  const data = await invModel.getInventoryDetailsById(vehicle_id);
  const reviewData = await revModel.getReviewsByVehicleId(vehicle_id);
  const content = await utilities.buildVehicleDetails(data[0]);
  let nav = await utilities.getNav();
  // console.log(data);
  const vehicleName = data[0].inv_make;
  const vehicleModel = data[0].inv_model;
  res.render("./vehicleDetails/vehicleDetails", {
    title: vehicleName + " " + vehicleModel,
    nav,
    content,
    vehicle_id,
    account_id,
    reviewData
  });
};

/* ***************************
 *  Build Inventory Management view
 * ************************** */
invCont.buildManagementView = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    const classificationSelect = await utilities.buildClassificationList();

    const flashMessage = req.flash("notice");

    res.render("./inventory/management", {
      title: "Inventory Management",
      nav,
      classificationSelect,
      flashMessage: flashMessage.length ? flashMessage[0] : null,
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Render Add Classification View
 * ************************** */
invCont.addClassificationView = async function (req, res) {
  let nav = await utilities.getNav();
  res.render("./inventory/add-classification", {
    title: "Add New Classification",
    nav,
    flashMessage: null,
  });
};

/* ***************************
 *  Process Add Classification
 * ************************** */
invCont.processAddClassification = async function (req, res) {
  const { classification_name } = req.body;
  try {
    await invModel.addClassification(classification_name);
    req.flash("notice", "New classification added successfully.");
    res.redirect("/inv/");
  } catch (error) {
    req.flash("notice", "Failed to add classification.");
    res.status(500).redirect("/inventory/addClassification");
  }
};

/* ***************************
 *  Render Add New Inventory View
 * ************************** */
invCont.addInventoryView = async function (req, res) {
  let nav = await utilities.getNav();
  let classificationList = await utilities.buildClassificationList();
  res.render("./inventory/add-inventory", {
    title: "Add New Vehicle",
    nav,
    classificationList,
    flashMessage: null,
  });
};

/* ***************************
 *  Process Add Inventory
 * ************************** */
invCont.processAddInventory = async function (req, res, next) {
  try {
    const {
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
    } = req.body;
 
    // Call model function to insert data
    await invModel.addInventoryItem({
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
    });
 
    req.flash("notice", "New vehicle added successfully.");
    res.redirect("/inv/");
  } catch (error) {
    // Handle validation or other errors
    req.flash("notice", "Failed to add vehicle. Please try again.");
    res.render("./inventory/addVehicle", {
      title: "Add New Vehicle",
      classificationList: await utilities.buildClassificationList(req.body.classification_id),
      flashMessage: "Failed to add vehicle. Please check your input.",
      ...req.body,
    });
  }
};

/* **************************************
 * Return Inventory by Classification As JSON
 ************************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id);
  const invData = await invModel.getInventoryByClassificationId(
    classification_id
  );
  if (invData[0].inv_id) {
    return res.json(invData);
  } else {
    next(new Error("No data returned"));
  }
};

/* ***************************
 *  Build edit inventory view ( Querried the data from the database)
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = req.params.inv_id;
  let nav = await utilities.getNav();
  const itemData = await invModel.getInventoryDetailsById(inv_id);
  const classificationList = await utilities.buildClassificationList(
    itemData[0].classification_id
  );
  const itemName = `${itemData[0].inv_make} ${itemData[0].inv_model}`;
  res.render("./inventory/edit-inventory", {
    title: "Edit" + itemName,
    nav,
    classificationList,
    errors: null,
    flashMessage: null,
    inv_id: itemData[0].inv_id,
    inv_make: itemData[0].inv_make,
    inv_model: itemData[0].inv_model,
    inv_year: itemData[0].inv_year,
    inv_description: itemData[0].inv_description,
    inv_image: itemData[0].inv_image,
    inv_thumbnail: itemData[0].inv_thumbnail,
    inv_price: itemData[0].inv_price,
    inv_miles: itemData[0].inv_miles,
    inv_color: itemData[0].inv_color,
    classification_id: itemData[0].classification_id,

    
  });
};


/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
      inv_id
  } = req.body
  
  const updateResult = await invModel.updateInventory(
    inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
      inv_id
  )
  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("success", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    
    const itemName = `${itemData[0].inv_make} ${itemData[0].inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
    title: "Edit" + itemName ,
    nav,
    classificationList,
    errors: null,
    flashMessage: null,
    inv_id: itemData[0].inv_id,
    inv_make: itemData[0].inv_make,
    inv_model: itemData[0].inv_model,
    inv_year: itemData[0].inv_year,
    inv_description: itemData[0].inv_description,
    inv_image: itemData[0].inv_image,
    inv_thumbnail: itemData[0].inv_thumbnail,
    inv_price: itemData[0].inv_price,
    inv_miles: itemData[0].inv_miles,
    inv_color: itemData[0].inv_color,
    classification_id: itemData[0].classification_id,
  });
};}



/* ***************************
 *  Deliver Delete Confirmation View
 * ************************** */
invCont.deleteView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id);
    let nav = await utilities.getNav();
    const itemData = await invModel.getInventoryDetailsById(inv_id); // Get inventory item data
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
 
    // Render the delete confirmation page with the item data
    res.render("./inventory/delete-confirm", {
      title: "Delete " + itemName,
      nav,
      errors: null,
      inv_id: itemData[0].inv_id,
      inv_make: itemData[0].inv_make,
      inv_model: itemData[0].inv_model,
      inv_year: itemData[0].inv_year,
      inv_price: itemData[0].inv_price,
    });
    console.log("what is happening")
  } catch (error) {
    next(error);
  }
};
 
/* ***************************
 *  Process Delete Inventory
 * ************************** */
invCont.processDeleteInventory = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.body.inv_id);
 
    // Call model function to delete the item
    const deleteResult = await invModel.deleteInventoryItem(inv_id);
 
    if (deleteResult.rowCount > 0) {
      req.flash("notice", "Vehicle deleted successfully.");
      res.redirect("/inv/");
    } else {
      req.flash("notice", "Vehicle deletion failed.");
      res.redirect(`/inv/delete/${inv_id}`);
    }
  } catch (error) {
    next(error);
  }
};

module.exports = invCont;
