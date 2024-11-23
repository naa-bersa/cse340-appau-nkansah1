const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}

// get inventory by id
async function getInventoryDetailsById(inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory WHERE inv_id = $1`,
    [inv_id]
    )
    console.log(data.rows)
    return data.rows
  } catch (error) {
    console.error(" getInventoryDetailsById error " + error)
  }
}

 
async function addClassification(classification_name) {
  try {
    const query = `
      INSERT INTO public.classification (classification_name)
      VALUES ($1) RETURNING classification_id`;
    const result = await pool.query(query, [classification_name]);
    return result.rows[0];
  } catch (error) {
    console.error("Error adding classification: " + error);
    throw error;
  }
 }

/* ***************************
 *  Add new inventory item
 * ************************** */
async function addInventoryItem(inventoryData) {
  try {
    const query = `
      INSERT INTO public.inventory (
        classification_id, inv_make, inv_model, inv_year, inv_color, 
        inv_description, inv_price, inv_miles, inv_image, inv_alt
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING inv_id;
    `;
    const values = [
      inventoryData.classification_id,
      inventoryData.make,
      inventoryData.model,
      inventoryData.year,
      inventoryData.color,
      inventoryData.description,
      inventoryData.price,
      inventoryData.miles,
      inventoryData.image,
      inventoryData.altText,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error("Error adding inventory item: " + error);
    throw error;
  }
}



module.exports = {getClassifications, getInventoryByClassificationId, getInventoryDetailsById, addClassification, addInventoryItem};