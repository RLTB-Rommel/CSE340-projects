const invModel = require("../models/inventoryModel");

/**
 * Building HTML for a vehicle detail view
 */
function buildDetailView(vehicle) {
  return `
    <div class="vehicle-detail">
      <img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}" class="vehicle-image">
      <div class="vehicle-info">
        <h2>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h2>
        <p><strong>Price:</strong> $${Number(vehicle.inv_price).toLocaleString()}</p>
        <p><strong>Mileage:</strong> ${Number(vehicle.inv_miles).toLocaleString()} miles</p>
        <p><strong>Description:</strong> ${vehicle.inv_description}</p>
        <p><strong>Color:</strong> ${vehicle.inv_color}</p>
      </div>
    </div>
  `;
}

/**
 * Middleware to protect routes behind login
 */
function checkLogin(req, res, next) {
  if (req.session.loggedin) {
    return next();
  } else {
    req.flash("notice", "Please log in.");
    return res.redirect("/account/login");
  }
}

/**
 * Building dynamic navigation bar from classifications
 */
async function getNav() {
  try {
    const data = await invModel.getClassifications();

    let nav = '<ul>';
    nav += `<li><a href="/">Home</a></li>`;

    data.forEach((row) => {
      nav += `<li><a href="/inventory/type/${row.classification_name}">${row.classification_name}</a></li>`;
    });

    nav += '</ul>';
    return nav;
  } catch (error) {
    console.error("Error building navigation:", error);
    return '<ul><li><a href="/">Home</a></li></ul>'; // fallback
  }
}

module.exports = {
  buildDetailView,
  getNav,
  checkLogin,
};