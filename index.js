const express = require("express");
const app = express();
require("dotenv").config();

const routes = require('./routes')

// Middleware (optional)
app.use(express.json());

// Example route
app.get("/", (req, res) => {
  res.send("HNG Tasks with Node.js 🚀");
});

app.use('/', routes)

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
