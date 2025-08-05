const accountModel = require("../models/accountModel");
const inventoryModel = require("../models/inventoryModel");
const bcrypt = require("bcryptjs");

/* =============================
 * Render the Registration Page
 ============================= */
async function buildRegister(req, res) {
  res.render("account/register", { title: "Register" });
}

/* =============================
 * Handle New Account Registration
 ============================= */
async function registerAccount(req, res) {
  const { account_firstname, account_lastname, account_email, account_password } = req.body;
  const existingAccount = await accountModel.getAccountByEmail(account_email);

  if (existingAccount) {
    req.flash("notice", "That email already exists. Please log in instead.");
    return res.status(400).render("account/register", {
      title: "Register",
      account_firstname,
      account_lastname,
      account_email,
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10);
    const newAccount = await accountModel.registerNewAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    );

    if (newAccount) {
      req.flash("notice", "Registration successful. Please log in.");
      return res.redirect("/account/login");
    } else {
      req.flash("notice", "Registration failed. Please try again.");
      return res.status(500).render("account/register", {
        title: "Register",
        account_firstname,
        account_lastname,
        account_email,
      });
    }
  } catch (error) {
    console.error("Registration Error:", error);
    req.flash("notice", "An error occurred. Please try again.");
    res.redirect("/account/register");
  }
}

/* =============================
 * Render the Login Page
 ============================= */
async function buildLogin(req, res) {
  res.render("account/login", { title: "Login" });
}

/* =============================
 * Handle Login Process
 ============================= */
async function loginAccount(req, res) {
  try {
    const { account_email, account_password } = req.body;
    const account = await accountModel.getAccountByEmail(account_email);

    if (!account) {
      req.flash("notice", "Account not found.");
      return res.status(400).render("account/login", { title: "Login", account_email });
    }

    const match = await bcrypt.compare(account_password, account.account_password);
    if (!match) {
      req.flash("notice", "Incorrect password.");
      return res.status(400).render("account/login", { title: "Login", account_email });
    }

    req.session.loggedin = true;
    req.session.accountId = account.account_id;
    req.session.accountFirstname = account.account_firstname;
    req.session.accountType = account.account_type;

    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        req.flash("notice", "Session error. Please try again.");
        return res.redirect("/account/login");
      }

      req.flash("welcome", `Welcome , ${account.account_firstname}!`);
      res.redirect("/account");
    });

  } catch (error) {
    console.error("Login error:", error);
    req.flash("notice", "An unexpected error occurred.");
    res.status(500).render("account/login", { title: "Login", account_email: "" });
  }
}

/* =============================
 * Handle Logout Process
 ============================= */
function logoutAccount(req, res) {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      req.flash("notice", "Logout failed. Please try again.");
      res.redirect("/account");
    } else {
      res.clearCookie("connect.sid");
      res.redirect("/");
    }
  });
}

/* =============================
 * Render Account Management Page
 ============================= */
async function buildAccountManagement(req, res) {
  if (!req.session.loggedin || !req.session.accountId) {
    req.flash("notice", "Please log in to access your account.");
    return res.redirect("/account/login");
  }

  try {
    const account = await accountModel.getAccountById(req.session.accountId);
    let accountStats = null;
    let inventoryStats = null;

    if (account.account_type === "Admin") {
      accountStats = await accountModel.getAccountCountsByType();
      inventoryStats = await inventoryModel.getInventoryStats();
    }

    res.render("account/management", {
      title: "Account Management",
      account,
      accountFirstname: req.session.accountFirstname,
      accountType: account.account_type,
      accountStats,
      inventoryStats,
    });
  } catch (error) {
    console.error("Error loading management page:", error);
    res.status(500).render("errors/500", { title: "Server Error" });
  }
}

/* =============================
 * Render Edit Account Info Form
 ============================= */
async function showEditAccount(req, res) {
  const accountId = req.params.id || req.session.accountId;
  const account = await accountModel.getAccountById(accountId);

  res.render("account/edit", {
    title: "Edit Account",
    account,
  });
}

/* =============================
 * Handle Account Info Update
 ============================= */
async function updateAccount(req, res) {
  const { account_firstname, account_lastname, account_email } = req.body;
  const accountId = req.params.id || req.session.accountId;

  const result = await accountModel.updateAccountInfo(
    account_firstname,
    account_lastname,
    account_email,
    accountId
  );

  if (result) {
    req.session.accountFirstname = account_firstname;
    req.flash("notice", "Account information updated.");
    res.redirect("/account");
  } else {
    req.flash("notice", "Account update failed.");
    res.redirect("/account/edit");
  }
}

/* =============================
 * Render Change Password Page
 ============================= */
async function showChangePassword(req, res) {
  res.render("account/change-password", { title: "Change Password" });
}

/* =============================
 * Handle Password Update
 ============================= */
async function updatePassword(req, res) {
  const { account_password } = req.body;
  const accountId = req.session.accountId;

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10);
    const result = await accountModel.updatePassword(hashedPassword, accountId);

    if (result) {
      req.flash("notice", "Password updated.");
      res.redirect("/account");
    } else {
      req.flash("notice", "Password update failed.");
      res.redirect("/account/change-password");
    }
  } catch (error) {
    console.error("Password update error:", error);
    req.flash("notice", "An error occurred.");
    res.redirect("/account/change-password");
  }
}

module.exports = {
  buildRegister,
  registerAccount,
  buildLogin,
  loginAccount,
  logoutAccount,
  buildAccountManagement,
  showEditAccount,
  updateAccount,
  showChangePassword,
  updatePassword,
};