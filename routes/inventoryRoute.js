// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities")
const  newInventoryRules  = require("../utilities/inventory-validation"); 



router.get("/", utilities.handleErrors(invController.buildManagementView))

// Route to view the add classification form
router.get("/add-classification", utilities.handleErrors(invController.addClassificationView))
 
// Route to process add classification form submission
router.post("/addClassifications", utilities.handleErrors(invController.processAddClassification))
// validation.checkValidationErrors("./inventory/add-classification"), utilities.handleErrors(invController.processAddClassification));

// Render Add Inventory Form
router.get("/add-inventory",  utilities.handleErrors(invController.addInventoryView))
console.log('POST /inv/add-inventory')

// Process Add Inventory Form Submission
router.post("/add-inventory",  utilities.handleErrors(invController.processAddInventory))


/* *****************************************
* Get inventory for AJAX Route
***************************************** */
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))







// Update Inventory Route
// router.post("/update", newInventoryRules(),validate.checkUpdateData, invController.updateInventory );

//Handle incoming request
// router.post("/update/", (utilities.handleErrorsinvController.updateInventory))


// Route to build inventory by classification view
// router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

//  router.get("/detail/:inventory_id", utilities.handleErrors(invController.buildByInventoryId))


// New route to view add inventory page (to be consistent with the existing structure)
// router.get("/addInventory", utilities.handleErrors(invController.addInventoryView));

// New route to process adding inventory (similar to your other POST routes)
// router.post("/addInventory", utilities.handleErrors(invController.processAddInventory));


module.exports = router;
