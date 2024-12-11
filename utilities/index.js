const invModel = require("../models/inventory-model");
const Util = {};
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications();
  let list = "<ul>";
  list += '<li><a href="/" title="Home page">Home</a></li>';
  data.rows.forEach((row) => {
    list += "<li>";
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>";
    list += "</li>";
  });
  list += "</ul>";
  return list;
};


/* **************************************
 * Build the classification view HTML
 * ************************************ */
Util.buildClassificationGrid = async function (data) {
  let grid;
  if (data.length > 0) {
    grid = '<ul id="inv-display">';
    data.forEach((vehicle) => {
      grid += "<li>";
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        'details"><img src="' +
        vehicle.inv_thumbnail +
        '" alt="Image of ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' on CSE Motors" /></a>';
      grid += '<div class="namePrice">';
      grid += "<hr />";
      grid += "<h2>";
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details">' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        "</a>";
      grid += "</h2>";
      grid +=
        "<span>$" +
        new Intl.NumberFormat("en-US").format(vehicle.inv_price) +
        "</span>";
      grid += "</div>";
      grid += "</li>";
    });
    grid += "</ul>";
  } else {
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
};

 
/* **************************************
    * Build the Inventory by Id view HTML
    * ************************************ */
Util.buildVehicleDetails = async function(vehicle) {
  // Format the price as currency
  let vehiclePrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD', // I can change this to my desired currency code
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
  }).format(vehicle.inv_price);
 
  // If mileage needs to be formatted, I can do that here
  let mileage = new Intl.NumberFormat('en-US').format(vehicle.inv_miles);
 
  let content;
  content = `<div class="vehicle_details">
      <img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make}">
      
      <div class="vehicleNumbers">
        <h2>Price: ${vehiclePrice}</h2>
        <h2>Mileage: ${mileage} miles</h2>

      <p id="vehicle_para"><span class="vehicle_specs">Color: </span>${vehicle.inv_color}</p>
      <p id="vehicle_description">${vehicle.inv_description}</p>
      </div>
  </div>`;
 
  return content;
}
 

/*****************************************
 * Middleware For Handling Errors
 * Wrap other functions in this for
 * General Error Handling
 ****************************************/
Util.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);


/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
 }


 /* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
   jwt.verify(
    req.cookies.jwt,
    process.env.ACCESS_TOKEN_SECRET,
    function (err, accountData) {
     if (err) {
      req.flash("Please log in")
      res.clearCookie("jwt")
      return res.redirect("/account/login")
     }
     res.locals.accountData = accountData
     res.locals.loggedin = 1
     next()
    })
  } else {
   next()
  }
 }

//  Add Inventory
 Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications() // Fetch classifications from the database
  let classificationList =
    '<select name="classification_id" id="classificationList" required>'
  classificationList += "<option value=''>Choose a Classification</option>"
  data.rows.forEach((row) => {
    classificationList += `<option value="${row.classification_id}"`
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected"
    }
    classificationList += `>${row.classification_name}</option>`
  })
  classificationList += "</select>"
  return classificationList
}
 
// Middleware to check account type
Util.checkAdminOrEmployee = (req, res, next) => {
  const accountType = res.locals.accountData.account_type; 
  if (accountType === "Admin" || accountType === "Employee") {
    next();
} else {
  req.flash(
    "noyice-fail",
    "You have to be an admin or employee to access this page"
  );
  res.redirect("/account/login");
  }
}; 

  
module.exports = Util;
