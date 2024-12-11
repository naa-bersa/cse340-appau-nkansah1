// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities")
const validate = require("../utilities/inventory-validation")


// Route to display the inventory management view
router.get("/", utilities.handleErrors(invController.buildManagementView))

// Route to view the add classification form
router.get("/add-classification", utilities.handleErrors(invController.addClassificationView))
 
// Route to process add classification form submission
router.post("/addClassifications", utilities.handleErrors(invController.processAddClassification))
// validation.checkValidationErrors("./inventory/add-classification"), utilities.handleErrors(invController.processAddClassification));

// Render Add Inventory Form
router.get("/add-inventory",  utilities.handleErrors(invController.addInventoryView))
// console.log('POST /inv/add-inventory')

// Route to process Add Inventory
router.post("/add-inventory",
    // inventoryRules(), // Apply validation rules
    // checkValidationErrors("inventory/add-inventory"), // Handle validation errors
    utilities.handleErrors(invController.processAddInventory)
  );


/* *****************************************
* Get inventory for AJAX Route
***************************************** */
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))


// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));


/* *****************************************
* Route to edit inventory item view
***************************************** */
router.get("/edit/:inv_id", utilities.handleErrors(invController.editInventoryView));

// Update Inventory Route
router.post("/edit-inventory", 
  validate.inventoryRules(), 
  validate.checkUpdateData,
   utilities.handleErrors(invController.updateInventory) );

//  router.get("/detail/:inventory_id", utilities.handleErrors(invController.buildByInventoryId))

module.exports = router;
