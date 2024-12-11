const utilities = require("../utilities")
const { body, validationResult } = require("express-validator")
const accountModel = require("../models/account-model")
const validate = {}

const accountController = {}

/*  **********************************
*  Registration Data Validation Rules
* ********************************* */
validate.registrationRules = () => {
    return [
      // firstname is required and must be string
      body("account_firstname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("Please provide a first name."), // on error this message is sent.
  
      // lastname is required and must be string
      body("account_lastname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 2 })
        .withMessage("Please provide a last name."), // on error this message is sent.
  
      // valid email is required and cannot already exist in the database
      body("account_email")
        .trim()
        .isEmail()
        .normalizeEmail() // refer to validator.js docs
        .withMessage("A valid email is required.")
        .custom(async (account_email) => {
           const emailExists = await accountModel.checkExistingEmail(account_email)
           if (emailExists){
            throw new Error("Email exists. Please log in or use different email")
          }
        }),

  
      // password is required and must be strong password
      body("account_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
        .withMessage("Password does not meet requirements."),
    ]
  }

  /* **********************************
 * Login Data Validation Rules
 * ********************************* */
validate.loginRules = () => {
  return [
    // Email is required and must be valid
    body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email address."),
    
    // Password is required
    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password is required."),
  ]
}


  /* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email } = req.body
    let errors = []
    errors = validationResult(req)
    
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      res.render("account/register", {
        errors,
        title: "Registration",
        nav,
        account_firstname,
        account_lastname,
        account_email,
      })
      return
    }
    next()
  }


  /* ******************************
 * Check Login Data and return errors or continue
 * ***************************** */
validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body
  let errors = validationResult(req)

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/login", {
      errors: errors.array(),
      title: "Login",
      nav,
      account_email,
    })
    return
  }
  next()
}


validate.updateAccountRules = () => {
  return [
    body("account_firstname").trim().escape().notEmpty().withMessage("First name is required."),
    body("account_lastname").trim().escape().notEmpty().withMessage("Last name is required."),
    body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email, { req }) => {
        const accountId = req.body.account_id;

        // Use the new function to check email uniqueness during updates
        const emailExists = await accountModel.checkEmailForUpdate(account_email, accountId);

        if (emailExists) {
          throw new Error("Email already in use by another account.");
        }
      }),
  ];
};


/* ****************************************
 *  Process account update
 * *************************************** */
accountController.processAccountUpdate = async function (req, res, next) {
  const { account_id, account_firstname, account_lastname, account_email } = req.body;
 
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    const account = await accountModel.getAccountById(account_id);
    return res.status(400).render("account/update-account", {
      title: "Update Account Information",
      nav,
      account,
      errors,
    });
  }
 
  try {
    const updatedAccount = await accountModel.updateAccountDetails(
      account_id,
      account_firstname,
      account_lastname,
      account_email
    );
 
    if (updatedAccount) {
      res.locals.accountData = updatedAccount;
      req.flash("notice", `Account ${updatedAccount.account_firstname} updated successfully.`);
      return res.redirect("/account/");
    } else {
      req.flash("notice", "Account update failed. Please try again.");
      return res.redirect(`/account/update/${account_id}`);
    }
  } catch (error) {
    next(error);
  }
};
 

validate.updatePasswordDataRules = (req, res, next) => {
  return[
    body("account_password")
    .trim()
    .notEmpty()
    .isStrongPassword({
      minLength:12,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols:1,
    })
    .withMessage(
      'Password must be at least 12 characters, contan at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character'
    ),
  ];
};

validate.checkUpdatePasswordData = async (req, res, next) => {
  const { account_id} = req.body;
  const accountData = await  accountModel.getAccountById(account_id);
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/update", {
      errors,
      title: "Update",
      nav, // Include navigation in the response
      account: accountData
    })
    return;
  }
}
  
  module.exports = validate
  
  