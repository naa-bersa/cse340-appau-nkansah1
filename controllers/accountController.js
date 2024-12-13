const utilities = require("../utilities/");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const accountController = {};

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();
  let flashMessage = req.flash("notice") || []; // Ensure it's an array
  res.render("account/login", {
    title: "Login",
    nav,
    flashMessage,
  });
}

/* ****************************************
 *  Deliver Register view
 * *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  });
}

/* ****************************************
 *  Process Registration
 * *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav();
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password,
  } = req.body;

  // Hash the password before storing
  let hashedPassword;
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10);
  } catch (error) {
    req.flash(
      "notice",
      "Sorry, there was an error processing the registration."
    );
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  );

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    );
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    });
  } else {
    req.flash("notice", "Sorry, the registration failed.");
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    });
  }
}

/* ****************************************
 *  Process Login
 * *************************************** */
async function loginAccount(req, res) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
    // Retrieve the user account by email
    const accountData = await accountModel.findByEmail(account_email);
    console.log('Email found')
    // If user doesn't exist, return an error
    if (!accountData) {
      console.log("Invalid email or password AccountData is ", accountData)
      req.flash("notice", "Invalid email or password.");
      res.status(401).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
      return;
    }
    console.log('AccountData', accountData)
    try {
      console.log("Account password", account_password)
      console.log('Account pwrd from database', accountData.account_password)
      if (await bcrypt.compare(account_password, accountData.account_password)) {
        
        delete accountData.account_password;
        const accessToken = jwt.sign(
          accountData,
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: 3600 }
        );
        if (process.env.NODE_ENV === "development") {
          res.cookie("jwt", accessToken, {
            httpOnly: true,
            maxAge: 3600 * 1000,
          });
        } else {
          console.log('D')
          res.cookie("jwt", accessToken, {
            httpOnly: true,
            secure: true,
            maxAge: 3600 * 1000,
          });
        }
        console.log("Redirecting to /account/");
        return res.redirect("/account/management");
      }
      // else {
      //   req.flash("notice", "Check your credentials")
      //   res.status(400).render("account/login", {
      //     title:"login",
      //     nav,
      //     errors: null,
      //     account_email
      //   }
      // )
      // }
    } catch (error) {
      return new Error("Access Forbidden")
    }
  
}

/* ****************************************
 *  Process Logout
 * *************************************** */

async function processLogout(req, res, next) {
  if (req.cookies.jwt) {
    res.clearCookie("jwt");
  }
 
  return res.redirect("/");
}

/* ****************************************
 *  Deliver Account Management view
 * *************************************** */
async function buildAccountManagement(req, res, next) {
  try {
    // Fetch navigation items 
    let nav = await utilities.getNav();
    
    // Get any flash messages
    let flashMessage = req.flash("notice") || [];
    
    // Render the view, passing the data 
    res.render("account/management", {
      title: "Account Management",
      nav,
      messages: flashMessage,
    });
  } catch (err) {
    // Handle any potential errors
    next(err);
  }
}

/* ****************************************
 *  Deliver update account view
 * *************************************** */
async function buildUpdateAccount (req, res, next) {
  let nav = await utilities.getNav();
  const account_id = parseInt(req.params.account_id);
  const account = await accountModel.getAccountById(account_id);
 console.log(account)
  res.render("account/update", {
    title: "Update Account Information",
    nav,
    account,
    errors: null,
    flashMessage: req.flash("notice") || null,
  });
};


/* ****************************************
 *  Process account update
 * *************************************** */
async function processAccountUpdate (req, res, next) {
  const { account_id, account_firstname, account_lastname, account_email } = req.body;

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
      return res.redirect("/account/management");
    } else {
      req.flash("notice", "Account update failed. Please try again.");
      return res.redirect(`/account/update/${account_id}`);
    }
  } catch (error) {
    next(error);
  }
};

// Update Password
async function updatePassword(req, res, next) {
  const nav = await utilities.getNav();
  const account_id = req.params.account_id;
  const { account_password } = req.body;
 
  // Hash the password before storing
  let hashedPassword;
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10);
  } catch (error) {
    req.flash(
      "notice-fail",
      "Sorry, there was an error processing the registration."
    );
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
  }
 
  const updateResult = await accountModel.updatePassword(
    account_id,
    hashedPassword
  );
  if (updateResult) {
    req.flash("notice-success", "Password updated successfully.");
    res.redirect("/account/");
  } else {
    req.flash(
      "notice-fail",
      "Sorry, there was an error updating the password."
    );
  }
}

/* ****************************************
 *  Process password change
 * *************************************** */
async function processPasswordChange  (req, res, next) {
  const { account_id, account_password } = req.body; 
  const hashedPassword = await bcrypt.hash(account_password, 10);
  const result = await accountModel.updateAccountPassword(account_id, hashedPassword);
 
  if (result) {
    req.flash("notice", "Password changed successfully.");
    return res.redirect("/account/management");
  } else {
    req.flash("notice", "Password change failed.");
    res.redirect(`/account/update/${account_id}`);
  }
};
 

module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  loginAccount,
  buildAccountManagement,
  processLogout,
  buildUpdateAccount,
  processAccountUpdate,
  updatePassword,
  processPasswordChange
};
