const pool = require("../database/");

async function getVehiclesByClassification(classification) {
  const sql = `
    SELECT * FROM inventory
    JOIN classification ON inventory.classification_id = classification.classification_id
    WHERE classification_name ILIKE $1
  `;
  const data = await pool.query(sql, [classification]);
  return data.rows;
}

module.exports = {
  getVehiclesByClassification,
  // other exports...
};