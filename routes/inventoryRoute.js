const express = require("express");
const router = express.Router();
const invController = require("../controllers/invController");
const checkAccountType = require("../middleware/checkAccountType"); // keep this
const utilities = require("../utilities"); 

// Vehicle management view (main inventory page at /inv)
router.get("/", utilities.checkLogin, checkAccountType, invController.buildManagement);

// Adding classification Form
router.get("/add-classification", utilities.checkLogin, checkAccountType, invController.buildAddClassification);

// Handling classification form submission
router.post("/add-classification", utilities.checkLogin, checkAccountType, invController.addClassification);

// Adding inventory (vehicle) form
router.get("/add-inventory", utilities.checkLogin, checkAccountType, invController.buildAddInventory);

// Handling inventory form submission
router.post("/add-inventory", utilities.checkLogin, checkAccountType, invController.addInventory);

// Viewing vehicles by classification (public)
router.get("/type/:classification", invController.buildByClassification);

// Viewing vehicle detail by inventory ID (public)
router.get("/detail/:inv_id", invController.buildById);

module.exports = router;