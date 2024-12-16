const pool = require("../database/");
 
//   Add Review
async function addReview(inv_id, account_id, reviewer_name, review_content) {
  try {
    const data = await pool.query(
      `INSERT INTO public.review ( reviewer_name, review_content, account_id, inv_id ) VALUES ($1, $2, $3, $4) RETURNING *`,
      [reviewer_name, review_content, account_id, inv_id]
    );
    return data;
  } catch (error) {
    console.error("ERROR IN ADDING REVIEW", error);
  }
};

// Update Review

async function updateReview(
  inv_id,
  account_id,
  review_id,
  reviewer_name,
  review_content
) {
  try {
    const data = await pool.query(
      `UPDATE public.review SET reviewer_name = $1, review_content = $2 WHERE review_id = $3 AND account_id = $4 AND inv_id = $5 RETURNING *`,
      [reviewer_name, review_content, review_id, account_id, inv_id]
    );
    return data;
  } catch (error) {
    console.error("ERROR IN UPDATING REVIEW", error);
  }
}

async function getReviewsByVehicleId(inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.review WHERE inv_id = $1 ORDER BY review_timestamp DESC`,
      [inv_id]
    );
    return data.rows;
  } catch (error) {
    console.error("ERROR IN FETCHING REVIEWS BY VEHICLE ID", error);
  }
}


async function getReviewsbyAccountId(account_id) {
  try {
    const data = await pool.query(
      `SELECT r.review_id, r.reviewer_name, r.review_content, r.review_timestamp, r.account_id, r.inv_id, i.inv_make, i.inv_model
      FROM review r
      JOIN inventory i ON r.inv_id = i.inv_id
      WHERE r.account_id = $1
      ORDER BY r.review_timestamp DESC;
 
 `,
      [account_id]
    );
    return data.rows;
  } catch (error) {
    console.error("ERROR IN FETCHING REVIEWS BY ACCOUNT ID", error);
  }
}
 
async function getReviewbyReviewId(review_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.review WHERE review_id = $1`,
      [review_id]
    );
    return data.rows[0];
  } catch (error) {
    console.error("ERROR IN FETCHING REVIEW BY REVIEW ID", error);
  }
}

async function deleteReview(review_id) {
  try {
    const data = await pool.query(
      `DELETE FROM public.review WHERE review_id = $1 RETURNING *`,
      [review_id]
    );
    return data;
  } catch (error) {
    console.error("ERROR IN DELETING REVIEW", error);
  }
}
 

module.exports = {
    addReview,
    getReviewsByVehicleId,
    getReviewsbyAccountId,
    updateReview,
    getReviewbyReviewId,
    deleteReview
}

