const invModel = require("../models/inventory-model");
const utilities = require("../utilities");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  // console.log("CLASSIFICATION ID", classification_id);
  const data = await invModel.getInventoryByClassificationId(classification_id);
  // console.log("INVCONTROLLER", data);
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();
  const className = data[0].classification_name;
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
  const inv_id = req.params.inventory_id;
  // console.log("VID : " + req.params.inventory_id);

  const data = await invModel.getInventoryDetailsById(inv_id);
  const content = await utilities.buildVehicleDetails(data[0]);
  let nav = await utilities.getNav();
  // console.log(data);
  const vehicleName = data[0].inv_make;
  const vehicleModel = data[0].inv_model;
  res.render("./vehicleDetails/vehicleDetails", {
    title: vehicleName + " " + vehicleModel,
    nav,
    content,
  });
};

/* ***************************
 *  Build Inventory Management view
 * ************************** */
invCont.buildManagementView = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    const classificationSelect = await utilities.buildClassificationList()
    
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
  } 
    



/* ***************************
 *  Process Add Inventory
 * ************************** */
invCont.processAddInventory = async function (req, res) {
  const { 
    classification_id, 
    make, 
    model, 
    year, 
    color, 
    description, 
    price, 
    miles, 
    image, 
    altText 
  } = req.body;

  try {
    console.log(req.body);
    
    await invModel.addInventoryItem({
      classification_id,
      make,
      model,
      year,
      color,
      description,
      price,
      miles,
      image,
      altText,
    });

    req.flash("notice", "New vehicle added successfully.");
    res.redirect("/inventory/management");
  } catch (error) {
    console.error("Error adding inventory item:", error);
    req.flash("notice", "Failed to add vehicle. Please try again.");
    res.status(500).redirect("/inv/inventory/add-inventory");
  }
};

/* **************************************
* Return Inventory by Classification As JSON
************************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId
  (classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryDetailsById(inv_id)
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}




module.exports = invCont;
