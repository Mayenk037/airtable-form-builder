// src/routes/health.route.js

const express = require("express");
const router = express.Router();

// Simple health check route
router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Backend is running 🚀"
  });
});

module.exports = router;
