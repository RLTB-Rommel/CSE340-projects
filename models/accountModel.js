const pool = require("../database");

/* ================================
 * Register New Account
 * ================================ */
async function registerNewAccount(firstname, lastname, email, hashedPassword) {
  try {
    // Determine if this is the first account
    const countResult = await pool.query("SELECT COUNT(*) FROM account");
    const isFirstAccount = parseInt(countResult.rows[0].count) === 0;

    const accountType = isFirstAccount ? "Admin" : "Client";

    const sql = `
      INSERT INTO account (
        account_firstname,
        account_lastname,
        account_email,
        account_password,
        account_type
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const result = await pool.query(sql, [firstname, lastname, email, hashedPassword, accountType]);
    return result.rows[0];
  } catch (error) {
    console.error("registerNewAccount error:", error);
    return null;
  }
}

/* ================================
 * Get Account by Email (for Login)
 * ================================ */
async function getAccountByEmail(email) {
  try {
    const sql = `
      SELECT * FROM account
      WHERE account_email = $1;
    `;
    const result = await pool.query(sql, [email]);
    return result.rows[0];
  } catch (error) {
    console.error("getAccountByEmail error:", error);
    return null;
  }
}

/* ================================
 * Get Account by ID (for Dashboard)
 * ================================ */
async function getAccountById(id) {
  try {
    const sql = `
      SELECT
        account_id,
        account_firstname,
        account_lastname,
        account_email,
        account_type
      FROM account
      WHERE account_id = $1;
    `;
    const result = await pool.query(sql, [id]);
    return result.rows[0];
  } catch (error) {
    console.error("getAccountById error:", error);
    return null;
  }
}

/* ================================
 * Update Account Info (Name + Email)
 * ================================ */
async function updateAccountInfo(firstname, lastname, email, id) {
  try {
    const sql = `
      UPDATE account
      SET
        account_firstname = $1,
        account_lastname = $2,
        account_email = $3
      WHERE account_id = $4
      RETURNING *;
    `;
    const result = await pool.query(sql, [firstname, lastname, email, id]);
    return result.rowCount;
  } catch (error) {
    console.error("updateAccountInfo error:", error);
    return null;
  }
}

/* ================================
 * Update Account Password
 * ================================ */
async function updatePassword(hashedPassword, id) {
  try {
    const sql = `
      UPDATE account
      SET account_password = $1
      WHERE account_id = $2
      RETURNING *;
    `;
    const result = await pool.query(sql, [hashedPassword, id]);
    return result.rowCount;
  } catch (error) {
    console.error("updatePassword error:", error);
    return null;
  }
}

/* ================================
 * Get Account Counts by Type (Admin Dashboard)
 * ================================ */
async function getAccountCountsByType() {
  try {
    const sql = `
      SELECT account_type, COUNT(*) AS count
      FROM account
      GROUP BY account_type;
    `;
    const result = await pool.query(sql);
    return result.rows;
  } catch (error) {
    console.error("getAccountCountsByType error:", error);
    return [];
  }
}

/* ================================
 * Export Model Methods
 * ================================ */
module.exports = {
  registerNewAccount,
  getAccountByEmail,
  getAccountById,
  updateAccountInfo,
  updatePassword,
  getAccountCountsByType,
};