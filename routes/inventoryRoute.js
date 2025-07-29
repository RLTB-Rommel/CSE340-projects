const express = require("express");
const router = express.Router();
const invController = require("../controllers/invController");

// Vehicle Management View (Main inventory page at /inv)
router.get("/", invController.buildManagement);

// Add Classification Form
router.get("/add-classification", invController.buildAddClassification);

// Handle Classification Form Submission
router.post("/add-classification", invController.addClassification);

// Add Inventory (Vehicle) Form
router.get("/add-inventory", invController.buildAddInventory);

// Handle Inventory Form Submission
router.post("/add-inventory", invController.addInventory);

// View vehicles by classification (e.g., /inv/type/sedan)
router.get("/type/:classification", invController.buildByClassification);

// View vehicle detail by inventory ID (e.g., /inv/detail/1)
router.get("/detail/:inv_id", invController.buildById);

module.exports = router;