const invModel = require("../models/inventoryModel");
const utilities = require("../utilities");

// Controller for /inventory/type/:classification
async function buildByClassification(req, res, next) {
  try {
    const classification = req.params.classification;
    const classificationFormatted = classification.charAt(0).toUpperCase() + classification.slice(1);
    const nav = await utilities.getNav();
    
    const inventory = await invModel.getVehiclesByClassification(classification);
    console.log("Vehicles returned for classification:", classificationFormatted, inventory);

    if (!inventory || inventory.length === 0) {
      return res.status(404).render("inventory/inventory", {
        title: classificationFormatted + " Vehicles",
        nav,
        classification_name: classificationFormatted,
        inventory: [],
        message: "No vehicles found for this classification.",
      });
    }

    res.render("inventory/inventory", {
      title: classificationFormatted + " Vehicles",
      nav,
      classification_name: classificationFormatted,
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
    const nav = await utilities.getNav();

    if (!vehicle) {
      return res.status(404).send("Vehicle not found");
    }

    const vehicleName = `${vehicle.inv_make} ${vehicle.inv_model}`;
    const detailHtml = utilities.buildDetailView(vehicle);

    res.render("inventory/detail", {
      title: vehicleName,
      nav,
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