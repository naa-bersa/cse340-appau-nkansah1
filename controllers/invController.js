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


module.exports = invCont;
