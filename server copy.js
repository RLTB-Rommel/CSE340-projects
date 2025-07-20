/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static");
const expressEjsLayouts = require("express-ejs-layouts");

/* ***********************
 * View Engine and Templates
 *************************/
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(expressEjsLayouts)
app.set("layout", "./layouts/layout")


/* ***********************
 * Routes
 *************************/
//app.get("/", (req, res)=>{
//  res.send("Welcome home!")
//})

app.get('/', (req, res) => {
  res.render('index');
});


//app.use(static)

/* ***********************
 * Routes
 *************************/
app.use(static)

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
