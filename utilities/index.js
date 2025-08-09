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
  if (req.session.loggedin) return next();
  req.flash("notice", "Please log in to continue.");
  return res.redirect("/account/login");
}

/**
 * Role guard: only Admin/Employee may proceed
 * (Your session stores role at req.session.accountType)
 */
function checkAdminOrEmployee(req, res, next) {
  const role =
    req.session?.accountType ??
    req.session?.account_type ?? // fallback if you later rename
    null;

  if (role === "Admin" || role === "Administrator" || role === "Employee") {
    return next();
  }

  req.flash("notice", "You do not have permission to access this page.");
  return res.status(403).render("errors/403", {
    title: "403 – Forbidden",
    message: "Only Admin and Employee accounts can access Maintenance.",
  });
}

/**
 * Building dynamic navigation bar from classifications
 */
async function getNav() {
  try {
    const data = await invModel.getClassifications();

    let nav = "<ul>";
    nav += `<li><a href="/">Home</a></li>`;
    data.forEach((row) => {
      nav += `<li><a href="/inventory/type/${row.classification_name}">${row.classification_name}</a></li>`;
    });
    nav += "</ul>";
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
  checkAdminOrEmployee, // <-- export the new guard
};