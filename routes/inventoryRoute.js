const express = require("express");
const router = express.Router();
const invController = require("../controllers/invController");
const checkAccountType = require("../middleware/checkAccountType");

// Vehicle management view (main inventory page at /inv)
router.get("/", invController.buildManagement);

// Adding classification Form
router.get("/add-classification", invController.buildAddClassification);

// Handling classification form submission
router.post("/add-classification", invController.addClassification);

// Adding inventory (vehicle) form
router.get("/add-inventory", invController.buildAddInventory);

// Handling inventory form submission
router.post("/add-inventory", invController.addInventory);

// Viewing vehicles by classification (e.g., /inv/type/sedan)
router.get("/type/:classification", invController.buildByClassification);

// Viewing vehicle detail by inventory ID (e.g., /inv/detail/1)
router.get("/detail/:inv_id", invController.buildById);

module.exports = router;