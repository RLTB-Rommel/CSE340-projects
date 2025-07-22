const express = require("express");
const env = require("dotenv").config();
const app = express();
const static = require("./routes/static");
const inventoryRoute = require("./routes/inventoryRoute");
const expressEjsLayouts = require("express-ejs-layouts");

/* ***********************
 * Engine and Templates
 *************************/
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(expressEjsLayouts);
app.set("layout", "./layouts/layout");

/* ***********************
 * Middleware
 *************************/
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/* ***********************
 * TEMP Route: Simulated 500 error
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
    });

    const result = await pool.query("SELECT NOW()");
    res.send(`✅ Connected to DB! Server time: ${result.rows[0].now}`);
  } catch (err) {
    console.error("❌ DB TEST ERROR:", err);
    res.status(500).send("Database connection failed: " + err.message);
  }
});

/* ***********************
 * Routes
 *************************/
app.get("/", (req, res) => {
  res.render("index");
});
app.use(static);
app.use("/inventory", inventoryRoute);

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