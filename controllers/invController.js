const invModel = require("../models/inventoryModel");
const utilities = require("../utilities");

// GET
function buildManagement(req, res) {
  const message = req.flash("message");
  res.render("inventory/management", {
    title: "Vehicle Management",
    message
  });
}

// GET
function buildAddClassification(req, res) {
  res.render("inventory/add-classification", {
    title: "Add Classification",
    errors: [],
    classification_name: ""
  });
}

// POST
async function addClassification(req, res) {
  const { classification_name } = req.body;
  const errors = [];

  const name = classification_name?.trim();
  const isValid = /^[A-Za-z ]{3,}$/.test(name || "");

  if (!name || !isValid) {
    errors.push("Provide a correct classification name.");
  } else {
    try {
      const existing = await invModel.getClassificationByName(name);
      if (existing) {
        errors.push("Classification already exists.");
      }
    } catch (err) {
      console.error("Error checking classification existence:", err);
      errors.push("Server error while checking for duplicates.");
    }
  }

  if (errors.length > 0) {
    return res.render("inventory/add-classification", {
      title: "Add Classification",
      errors,
      classification_name: name || ""
    });
  }

  try {
    await invModel.addClassification(name);
    req.flash("message", "Classification added successfully.");
    res.redirect("/inv");
  } catch (error) {
    console.error("Error adding classification:", error);
    res.render("inventory/add-classification", {
      title: "Add Classification",
      errors: ["Database error, please try again."],
      classification_name: name
    });
  }
}

// GET
async function buildAddInventory(req, res, next) {
  try {
    const nav = await utilities.getNav();
    const classifications = await invModel.getClassifications();

    res.render("inventory/add-inventory", {
      title: "Add Vehicle",
      nav,
      classifications,
      errors: [],
      classification_id: "",
      inv_make: "",
      inv_model: "",
      inv_description: "",
      inv_image: "",
      inv_thumbnail: "",
      inv_price: "",
      inv_year: "",
      inv_miles: "",
      inv_color: ""
    });
  } catch (error) {
    next(error);
  }
}

// POST
async function addInventory(req, res, next) {
  const {
    classification_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color
  } = req.body;

  const nav = await utilities.getNav();
  const classifications = await invModel.getClassifications();
  const errors = [];

  if (!classification_id) errors.push("Please select a classification.");
  if (!inv_make) errors.push("Make is required.");
  if (!inv_model) errors.push("Model is required.");
  if (!inv_description) errors.push("Description is required.");
  if (!inv_image) errors.push("Image URL is required.");
  if (!inv_thumbnail) errors.push("Thumbnail URL is required.");
  if (!inv_price || isNaN(inv_price)) errors.push("Valid price is required.");
  if (!inv_year || !/^\d{4}$/.test(inv_year)) errors.push("Year must be a 4-digit number.");
  if (!inv_miles || isNaN(inv_miles)) errors.push("Miles must be a number.");
  if (!inv_color) errors.push("Color is required.");

  if (errors.length > 0) {
    return res.render("inventory/add-inventory", {
      title: "Add Vehicle",
      nav,
      classifications,
      errors,
      classification_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color
    });
  }

  try {
    await invModel.insertVehicle({
      classification_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color
    });

    req.flash("message", "Vehicle added successfully.");
    res.redirect("/inv");
  } catch (error) {
    next(error);
  }
}

// GET
async function buildByClassification(req, res, next) {
  try {
    const classification = req.params.classification;
    const classificationFormatted =
      classification.charAt(0).toUpperCase() + classification.slice(1);
    const nav = await utilities.getNav();
    const inventory = await invModel.getVehiclesByClassification(classification);

    if (!inventory || inventory.length === 0) {
      return res.status(404).render("errors/404", {
        title: "Classification Not Found",
        nav
      });
    }

    res.render("inventory/inventory", {
      title: `${classificationFormatted} Vehicles`,
      nav,
      classification_name: classificationFormatted,
      inventory
    });
  } catch (error) {
    next(error);
  }
}

// GET
async function buildById(req, res, next) {
  try {
    const inv_id = req.params.inv_id;
    const vehicle = await invModel.getVehicleById(inv_id);
    const nav = await utilities.getNav();

    if (!vehicle) {
      return res.status(404).render("errors/404", {
        title: "Vehicle Not Found",
        nav
      });
    }

    const vehicleName = `${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}`;
    const detailHtml = utilities.buildDetailView(vehicle);

    res.render("inventory/detail", {
      title: vehicleName,
      nav,
      vehicleName,
      detailHtml,
      vehicle
    });
  } catch (error) {
    next(error);
  }
}

// Export all controller functions
module.exports = {
  buildManagement,
  buildAddClassification,
  addClassification,
  buildAddInventory,
  addInventory,
  buildByClassification,
  buildById
};