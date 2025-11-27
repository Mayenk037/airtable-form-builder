// src/routes/webhook.route.js

const express = require("express");
const ResponseModel = require("../models/Response");

const router = express.Router();

/**
 * Airtable webhook endpoint
 * POST /api/webhooks/airtable
 *
 * Payload shape will depend on Airtable's webhook config.
 * For assignment, we assume it includes:
 *  - type: "record.updated" | "record.deleted"
 *  - baseId
 *  - tableId
 *  - recordId
 *  - fields (for updates)
 */
router.post("/airtable", async (req, res) => {
  try {
    const event = req.body;

    // This is intentionally simplified for assignment.
    const { type, recordId, fields } = event;

    if (!recordId) {
      return res.status(400).json({ message: "Missing recordId in webhook" });
    }

    if (type === "record.deleted") {
      await ResponseModel.updateMany(
        { airtableRecordId: recordId },
        { $set: { deletedInAirtable: true } }
      );
    } else if (type === "record.updated") {
      // Just store latest raw fields under answers for simplicity
      await ResponseModel.updateMany(
        { airtableRecordId: recordId },
        {
          $set: {
            answers: fields || {},
          },
        }
      );
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("Error handling Airtable webhook:", err.message);
    res.status(500).json({ message: "Error handling Airtable webhook" });
  }
});

module.exports = router;
