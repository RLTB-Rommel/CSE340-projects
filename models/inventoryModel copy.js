const pool = require("../database");

/**
 * Get all vehicles under a specific classification.
 * @param {string} classification - The classification name (e.g., "Custom", "Sedan").
 * @returns {Promise<Array>} List of vehicles under that classification.
 */
async function getVehiclesByClassification(classification) {
  const sql = `
    SELECT * FROM inventory
    JOIN classification 
    ON inventory.classification_id = classification.classification_id
    WHERE classification_name ILIKE $1
  `;
  const data = await pool.query(sql, [classification]);
  return data.rows;
}

/**
 * Get details of a single vehicle by its inventory ID.
 * @param {number} inv_id - The inventory ID of the vehicle.
 * @returns {Promise<Object>} The vehicle record.
 */
async function getVehicleById(inv_id) {
  const sql = `
    SELECT * FROM inventory
    JOIN classification 
    ON inventory.classification_id = classification.classification_id
    WHERE inv_id = $1
  `;
  const data = await pool.query(sql, [inv_id]);
  return data.rows[0];
}

module.exports = {
  getVehiclesByClassification,
  getVehicleById,
};