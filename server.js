// Load environment variables from .env or Render config
require("dotenv").config();

const express = require("express");
const app = express();
const session = require("express-session");
const flash = require("express-flash");
const expressEjsLayouts = require("express-ejs-layouts");

// Routes
const static = require("./routes/static");
const inventoryRoute = require("./routes/inventoryRoute");

// Models
const invModel = require("./models/inventoryModel"); // Required for loading classification list

/* ***********************
 * View Engine and Layouts
 *************************/
app.set("view engine", "ejs");
app.set("views", "./views");
app.use(expressEjsLayouts);
app.set("layout", "./layouts/layout");

/* ***********************
 * Middleware
 *************************/
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || "supersecret",
  resave: false,
  saveUninitialized: true,
}));
app.use(flash());

/* ***********************
 * Dynamic Navbar Classifications Middleware
 *************************/
app.use(async (req, res, next) => {
  try {
    const data = await invModel.getClassifications();
    res.locals.classificationList = data;
    next();
  } catch (error) {
    console.error("Error loading classification list:", error);
    next(error);
  }
});

/* ***********************
 * TEMP Route: Simulated 500 Error
 *************************/
app.get("/error", (req, res) => {
  throw new Error("This is a simulated 500 server error");
});

/* ***********************
 * DB Test Route (for Render)
 *************************/
app.get("/test-db", async (req, res) => {
  try {
    const { Pool } = require("pg");
    const pool = new Pool({
      host: process.env.PGHOST,
      port: process.env.PGPORT || 5432,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
      ssl: { rejectUnauthorized: false }
    });

    const result = await pool.query("SELECT NOW()");
    res.send(`Connected to DB! Server time: ${result.rows[0].now}`);
  } catch (err) {
    console.error("DB TEST ERROR:", err);
    res.status(500).send("Database connection failed: " + err.message);
  }
});

/* ***********************
 * Routes
 *************************/
app.get("/", (req, res) => {
  res.render("index", { title: "Home" });
});
app.use(static);
app.use("/inventory", inventoryRoute); // Optional route prefix
app.use("/inv", inventoryRoute); // Required for validation assignment

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
  console.log(`App listening on http://${host}:${port}`);
});