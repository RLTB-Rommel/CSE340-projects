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

module.exports = {
  buildDetailView,
};