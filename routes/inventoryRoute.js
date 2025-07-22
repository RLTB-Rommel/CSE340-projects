const express = require("express");
const router = express.Router();
const invController = require("../controllers/invController");

// Route to deliver vehicles by classification
router.get("/type/:classification", invController.buildByClassification);

// Route to deliver vehicle detail by ID
router.get("/detail/:inv_id", invController.buildById);

module.exports = router;