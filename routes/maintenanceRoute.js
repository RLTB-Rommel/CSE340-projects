const express = require("express");
const router = express.Router();
const maintenanceController = require("../controllers/maintenanceController");
const utilities = require("../utilities");

const guard = [utilities.checkLogin, utilities.checkAdminOrEmployee];

router.get("/", guard, maintenanceController.buildList);

router.get("/create", guard, maintenanceController.showCreate);
router.post("/create", guard, maintenanceController.create);

router.get("/:ms_id/edit", guard, maintenanceController.showEdit);
router.post("/:ms_id/edit", guard, maintenanceController.update);

router.post("/:ms_id/delete", guard, maintenanceController.remove);

module.exports = router;