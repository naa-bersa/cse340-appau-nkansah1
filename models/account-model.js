// Require the database connection and assign it to a local variable 'pool'
const pool = require("../database/"); // Adjust the path if this file is in a different folder


/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password){
    try {
      const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
      return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
    } catch (error) {
      return error.message
    }
  }


  /* **********************
 *   Check for existing email
 * ********************* */
  async function checkExistingEmail(account_email, account_id = null) {
    try {
      let sql = "SELECT * FROM account WHERE account_email = $1";
      const values = [account_email];
   
      if (account_id) {
        sql += " AND account_id != $2";
        values.push(account_id);
      }
      const email = await pool.query(sql, values);
      return email.rowCount;
    } catch (error) {
      return error.message;
    }
  }

/* *****************************
* Return account data using email address
* ***************************** */
async function findByEmail(account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}

/* *****************************
 * Return account data using account ID
 * ***************************** */
async function getAccountById(account_id) {
  try {
    const result = await pool.query(
      "SELECT account_id, account_firstname, account_lastname, account_email, account_type FROM account WHERE account_id = $1",
      [account_id]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error fetching account by ID:", error.message);
    throw new Error("No matching account found");
  }
}

/* *****************************
 * Update Account Details
 * ***************************** */
async function updateAccountDetails(account_id, account_firstname, account_lastname, account_email) {
  try {
    const result = await pool.query(
      `
      UPDATE account
      SET 
        account_firstname = $1,
        account_lastname = $2,
        account_email = $3
      WHERE 
        account_id = $4
      RETURNING account_id, account_firstname, account_lastname, account_email;
      `,
      [account_firstname, account_lastname, account_email, account_id]
    );

    // Check if an account was updated
    if (result.rowCount === 0) {
      throw new Error("No account found with the provided ID");
    }

    return result.rows[0]; // Return the updated account data
  } catch (error) {
    console.error("Error updating account details:", error.message); // Log the error message
    throw new Error("Database operation failed");
  }
}

async function updateAccountPassword(account_id, account_password) {
  try {
    const result = await pool.query(
      "UPDATE account SET account_password = $1 WHERE account_id = $2 RETURNING *",
      [account_password, account_id]
    );
    return result.rows[0];
  } catch (error) {
    return new Error("Update Account model fail", error);
  }
}

  module.exports = { registerAccount, checkExistingEmail, findByEmail, getAccountById, updateAccountDetails,updateAccountPassword };