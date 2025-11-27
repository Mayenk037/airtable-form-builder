// backend/src/routes/auth.route.js

const express = require("express");
const crypto = require("crypto");
const User = require("../models/User");
const {
  getAirtableAuthUrl,
  exchangeCodeForTokens,
} = require("../config/airtable");

const router = express.Router();

// simple in-memory state store
const stateStore = new Set();

/**
 * GET /api/auth/airtable/login
 * Returns Airtable OAuth URL for frontend to redirect to.
 */
router.get("/airtable/login", (req, res) => {
  try {
    const state = crypto.randomBytes(16).toString("hex");
    stateStore.add(state);

    const url = getAirtableAuthUrl(state);
    return res.json({ url });
  } catch (err) {
    console.error("Error building Airtable auth URL:", err.message);
    return res
      .status(500)
      .json({ message: "Failed to build Airtable auth URL" });
  }
});

/**
 * GET /api/auth/airtable/callback
 * Airtable redirects here after user approves.
 */
router.get("/airtable/callback", async (req, res) => {
  const { code, state } = req.query;

  if (!code || !state || !stateStore.has(state)) {
    return res.status(400).send("Invalid OAuth state or code");
  }

  stateStore.delete(state);

  try {
    const tokenData = await exchangeCodeForTokens(code);

    const expiresAt = new Date(
      Date.now() + (tokenData.expires_in || 0) * 1000
    );

    // For assignment we can use a fake email identity
    const email = `airtable-user-${Date.now()}@example.com`;

    const user = await User.findOneAndUpdate(
      { email },
      {
        email,
        airtable: {
          airtableUserId: tokenData.token_type || "airtable-user",
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          tokenExpiresAt: expiresAt,
          scopes: (tokenData.scope || "").split(" "),
          lastLoginAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    const frontendUrl =
      process.env.FRONTEND_URL || "http://localhost:5173";

    // redirect front-end with a userId
    return res.redirect(`${frontendUrl}?userId=${user._id}`);
  } catch (err) {
    console.error(
      "Error exchanging Airtable OAuth code:",
      err.response?.data || err.message
    );
    return res.status(500).send("Failed to complete Airtable OAuth");
  }
});

module.exports = router;
