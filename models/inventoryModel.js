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

/**
 * Get all vehicle classifications for dropdowns and navigation.
 * @returns {Promise<Array>} List of classifications.
 */
async function getClassifications() {
  const sql = `
    SELECT classification_id, classification_name
    FROM classification
    ORDER BY classification_name
  `;
  const data = await pool.query(sql);
  return data.rows;
}

/**
 * Insert a new vehicle into the inventory table.
 * @param {Object} vehicle - Vehicle data from the form.
 * @returns {Promise<Object>} Result of insertion.
 */
async function insertVehicle(vehicle) {
  const sql = `
    INSERT INTO inventory
      (classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail,
       inv_price, inv_year, inv_miles, inv_color)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
  `;
  const params = [
    vehicle.classification_id,
    vehicle.inv_make,
    vehicle.inv_model,
    vehicle.inv_description,
    vehicle.inv_image,
    vehicle.inv_thumbnail,
    vehicle.inv_price,
    vehicle.inv_year,
    vehicle.inv_miles,
    vehicle.inv_color
  ];
  return pool.query(sql, params);
}

/**
 * Add a new classification to the database.
 * @param {string} classification_name - New classification name.
 * @returns {Promise<Object>} Result of insertion.
 */
async function addClassification(classification_name) {
  const sql = `
    INSERT INTO classification (classification_name)
    VALUES ($1)
  `;
  return pool.query(sql, [classification_name]);
}

/**
 * Get a classification by name (case-insensitive).
 * Used to check for duplicates before insertion.
 * @param {string} name - Classification name to check.
 * @returns {Promise<Object|null>} Matching classification or null.
 */
async function getClassificationByName(name) {
  const sql = `
    SELECT * FROM classification
    WHERE LOWER(classification_name) = LOWER($1)
  `;
  const data = await pool.query(sql, [name]);
  return data.rows[0] || null;
}

/**
 * Get inventory stats for Admin Dashboard:
 * - Total number of vehicles
 * - Total number of classifications
 * @returns {Promise<Object>} Inventory counts
 */
async function getInventoryStats() {
  try {
    const sql1 = `SELECT COUNT(*) AS total FROM inventory;`;
    const sql2 = `SELECT COUNT(*) AS total FROM classification;`;

    const [invResult, classResult] = await Promise.all([
      pool.query(sql1),
      pool.query(sql2)
    ]);

    return {
      totalInventory: parseInt(invResult.rows[0].total),
      totalClassifications: parseInt(classResult.rows[0].total)
    };
  } catch (error) {
    console.error("getInventoryStats error:", error);
    return { totalInventory: 0, totalClassifications: 0 };
  }
}

module.exports = {
  getVehiclesByClassification,
  getVehicleById,
  getClassifications,
  insertVehicle,
  addClassification,
  getClassificationByName,
  getInventoryStats
};