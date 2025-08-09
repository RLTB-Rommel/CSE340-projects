require("dotenv").config();

const express = require("express");
const app = express();
const session = require("express-session");
const flash = require("connect-flash");
const expressEjsLayouts = require("express-ejs-layouts");

// Routes
const static = require("./routes/static");
const inventoryRoute = require("./routes/inventoryRoute");
const accountRoute = require("./routes/accountRoute");
const maintenanceRoute = require("./routes/maintenanceRoute"); // <- NEW

// Models
const invModel = require("./models/inventoryModel");

/* ***********************
 * View Engine and Layouts
 *************************/
app.set("view engine", "ejs");
app.set("views", "./views");
app.use(expressEjsLayouts);
app.set("layout", "./layouts/layout"); // default layout file

/* ***********************
 * Middleware
 *************************/
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Trust proxy for platforms like Render so secure cookies work when proxied over HTTPS
app.set("trust proxy", 1);

const isProd = process.env.NODE_ENV === "production";

app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProd,            // only set secure cookies in production
      httpOnly: true,            // mitigate XSS
      sameSite: isProd ? "none" : "lax", // allow cross-site cookies when proxied (Render)
      maxAge: 1000 * 60 * 60,    // 1 hour
    },
  })
);

app.use(flash());

// Expose common session data to all views
app.use((req, res, next) => {
  res.locals.loggedin = req.session.loggedin;
  res.locals.firstname = req.session.accountFirstname;
  res.locals.accountType = req.session.accountType;
  res.locals.notice = req.flash("notice");
  next();
});

/* ***********************
 * Load Classifications for Navbar
 *************************/
app.use(async (req, res, next) => {
  try {
    const data = await invModel.getClassifications();
    res.locals.classificationList = data || [];
    next();
  } catch (error) {
    console.error("Error loading classification list:", error);
    res.locals.classificationList = []; // fail gracefully so layout still renders
    next();
  }
});

/* ***********************
 * Test Routes
 *************************/
app.get("/error", (req, res) => {
  throw new Error("This is a simulated 500 server error");
});

app.get("/test-db", async (req, res) => {
  try {
    const { Pool } = require("pg");
    const pool = new Pool({
      host: process.env.PGHOST,
      port: process.env.PGPORT || 5432,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
      ssl: { rejectUnauthorized: false },
    });

    const result = await pool.query("SELECT NOW()");
    res.send(`Connected to DB! Server time: ${result.rows[0].now}`);
  } catch (err) {
    console.error("DB TEST ERROR:", err);
    res.status(500).send("Database connection failed: " + err.message);
  }
});

/* ***********************
 * Main Routes
 *************************/
app.get("/", (req, res) => {
  res.render("index", { title: "Home" });
});

app.use(static);
app.use("/inventory", inventoryRoute);
app.use("/inv", inventoryRoute); // legacy alias if you still use /inv links
app.use("/account", accountRoute);
app.use("/maintenance", maintenanceRoute); // <- NEW

/* ***********************
 * Error Handlers
 *************************/
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("errors/500", { title: "Server Error" });
});

app.use((req, res) => {
  res.status(404).render("errors/404", { title: "Page Not Found" });
});

/* ***********************
 * Start Server
 *************************/
const port = process.env.PORT || 3000;
const host = process.env.HOST || "localhost";

app.listen(port, () => {
  console.log(`CSE Motors listening on http://${host}:${port}`);
});