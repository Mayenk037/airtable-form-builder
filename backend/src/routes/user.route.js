// src/routes/user.route.js

const express = require("express");
const User = require("../models/User");

const router = express.Router();

/**
 * @route   POST /api/users
 * @desc    Create a new user (dev-only, later replaced by Airtable OAuth)
 * @body    { email: string, name?: string }
 */
router.post("/", async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      // If user already exists, just return it (idempotent behavior)
      return res.status(200).json({
        message: "User already exists, returning existing user",
        user,
      });
    }

    // Create a new user
    user = new User({
      email,
      name,
    });

    await user.save();

    return res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * @route   GET /api/users
 * @desc    Get all users (dev-only helper)
 */
router.get("/", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    console.error("Error listing users:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * @route   GET /api/users/:id
 * @desc    Get single user by Mongo _id
 */
router.get("/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
