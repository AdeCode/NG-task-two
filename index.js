const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const jsonServer = require("json-server");
const path = require("path");
const routes = require('./routes')

const router = jsonServer.router(path.join(__dirname, "db", "db.json"));
const middlewares = jsonServer.defaults();

// Middleware (optional)
app.use(express.json());
app.use(cors());
app.use("/db", middlewares, router)

// Example route
app.get("/", (req, res) => {
  res.send("HNG Tasks with Node.js 🚀");
});

app.use('/', routes)

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));