// backend/src/routes/airtable.route.js

const express = require("express");
const User = require("../models/User");
const { createAirtableClient } = require("../config/airtable");

const router = express.Router();

// helper: get Airtable client for a given userId
async function getClientForUser(userId) {
  const user = await User.findById(userId);

  if (!user || !user.airtable || !user.airtable.accessToken) {
    throw new Error("User not connected to Airtable");
  }

  const client = createAirtableClient(user.airtable.accessToken);
  return { user, client };
}

/**
 * GET /api/airtable/bases?userId=...
 * Returns Airtable bases for this user.
 */
router.get("/bases", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const { client } = await getClientForUser(userId);

    const resp = await client.get("/meta/bases");
    // Airtable normally returns { bases: [...] }
    return res.json(resp.data);
  } catch (err) {
    console.error("Error fetching bases:", err.response?.data || err.message);
    return res
      .status(500)
      .json({ message: "Failed to fetch Airtable bases" });
  }
});

/**
 * GET /api/airtable/bases/:baseId/tables?userId=...
 * Returns tables (and their fields) for a base.
 */
router.get("/bases/:baseId/tables", async (req, res) => {
  try {
    const { userId } = req.query;
    const { baseId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const { client } = await getClientForUser(userId);

    const resp = await client.get(`/meta/bases/${baseId}/tables`);
    // Airtable normally returns { tables: [...] }
    return res.json(resp.data);
  } catch (err) {
    console.error("Error fetching tables:", err.response?.data || err.message);
    return res
      .status(500)
      .json({ message: "Failed to fetch Airtable tables" });
  }
});

module.exports = router;
