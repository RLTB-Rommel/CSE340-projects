const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities");

// ==============================
// Registration
// ==============================
router.get("/register", accountController.buildRegister);
router.post("/register", accountController.registerAccount);

// ==============================
// Login
// ==============================
router.get("/login", accountController.buildLogin);
router.post("/login", accountController.loginAccount);

// ==============================
// Account Dashboard (Protected)
// ==============================
router.get("/", utilities.checkLogin, accountController.buildAccountManagement);

// ==============================
// Edit Account Info (Session-based)
// ==============================
router.get("/edit", utilities.checkLogin, accountController.showEditAccount);
router.post("/edit", utilities.checkLogin, accountController.updateAccount);

// ==============================
// Update Info using /update (Optional, for form action compatibility)
// ==============================
router.post("/update", utilities.checkLogin, accountController.updateAccount);

// ==============================
// Change Password
// ==============================
router.get("/change-password", utilities.checkLogin, accountController.showChangePassword);
router.post("/change-password", utilities.checkLogin, accountController.updatePassword);

// ==============================
// Logout
// ==============================
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.redirect("/account");
    }
    res.clearCookie("connect.sid");
    res.redirect("/");
  });
});

module.exports = router;