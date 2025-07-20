const express = require("express");
const router = express.Router();
const invController = require("../controllers/invController");

// Route to deliver vehicles by classification
router.get("/type/:classification", invController.buildByClassification);

// Export the route
module.exports = router;