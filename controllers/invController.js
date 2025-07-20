const invModel = require("../models/inventoryModel");
const utilities = require("../utilities");

// Controller for /inventory/type/:classification
async function buildByClassification(req, res, next) {
  try {
    const classification = req.params.classification;
    const inventory = await invModel.getVehiclesByClassification(classification);
    const classification_name = classification.charAt(0).toUpperCase() + classification.slice(1);
    res.render("inventory/inventory", {
      title: classification_name + " Vehicles",
      classification_name,
      inventory,
    });
  } catch (error) {
    next(error);
  }
}

// Controller for /inventory/detail/:inv_id
async function buildById(req, res, next) {
  try {
    const inv_id = req.params.inv_id;
    const vehicle = await invModel.getVehicleById(inv_id);

    if (!vehicle) {
      return res.status(404).send("Vehicle not found");
    }

    const vehicleName = `${vehicle.inv_make} ${vehicle.inv_model}`;
    const detailHtml = utilities.buildDetailView(vehicle);

    res.render("inventory/detail", {
      title: vehicleName,
      vehicleName,
      detailHtml,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  buildByClassification,
  buildById,
};