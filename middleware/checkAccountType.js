function checkAccountType(req, res, next) {
  const role = req.session?.accountType;
  if (role === "Admin" || role === "Employee") return next();

  res.status(403);
  try {
    return res.render("errors/403", {
      title: "Forbidden",
      message: "You do not have permission to access the page.",
    });
  } catch (e) {
    console.error("403 render failed:", e);
    return res.status(403).send("You do not have permission to access the page.");
  }
}
module.exports = checkAccountType;