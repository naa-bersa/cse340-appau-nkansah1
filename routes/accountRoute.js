// Needed Resources
const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController"); // Access to the accounts controller
const regValidate = require('../utilities/account-validation')
const utilities = require('../utilities')



// Higher-order function for handling errors in async route handlers
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};


// Default Route to account management view
router.get("/management", utilities.checkLogin, asyncHandler(accountController.buildAccountManagement))

// Route to login
router.get("/login", accountController.buildLogin);

// Route to register
router.get("/register", accountController.buildRegister);

// Process the registration data
router.post("/register", regValidate.registrationRules(),regValidate.checkRegData,utilities.handleErrors(accountController.registerAccount))

// Route to Process the login attempt
router.post("/login", regValidate.loginRules(),regValidate.checkLoginData, utilities.handleErrors(accountController.loginAccount))

// Error-handling middleware
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

//Route to process logout
router.get("/logout", utilities.handleErrors(accountController.processLogout));

//Route to update account view
router.get(
  "/update/:account_id",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildUpdateAccount)
);

// Process account update
router.post(
  "/update/:account_id",
  utilities.checkLogin,
  regValidate.updateAccountRules(),
  regValidate.checkUpdateAccountData,
  utilities.handleErrors(accountController.processAccountUpdate)
);

// Process password change
router.post(
  "/updatePassword/:account_id",
  utilities.checkLogin,
  regValidate.updatePasswordRules(),
  utilities.handleErrors(accountController.processPasswordChange)
);

 


// Exporting the router to be used elsewhere in the application
module.exports = router;
