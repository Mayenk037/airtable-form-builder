// src/routes/response.route.js

const express = require("express");
const Response = require("../models/Response");
const Form = require("../models/Form");
const User = require("../models/User");
const { createAirtableClient } = require("../config/airtable");
const shouldShowQuestion = require("../utils/shouldShowQuestion");

const router = express.Router();

/**
 * POST /api/responses
 * Body: { formId, answers }
 */
router.post("/", async (req, res) => {
  try {
    const { formId, answers } = req.body;

    if (!formId || !answers) {
      return res
        .status(400)
        .json({ message: "formId and answers are required" });
    }

    // 1. Load form (no populate here)
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    // Owner id is whatever is stored on the form
    const ownerId = form.user;

    // Try to load user document (may be null if it doesn't exist)
    const owner = ownerId ? await User.findById(ownerId) : null;
    const airtableAuth = owner?.airtable;

    // ---------- 2. Validate answers (if form has questions) ----------
    const errors = [];
    const answersRecord = {};

    if (Array.isArray(form.questions) && form.questions.length > 0) {
      for (const q of form.questions) {
        const visible = shouldShowQuestion(q.conditionalRules, answers);
        if (!visible) continue;

        const value = answers[q.questionKey];

        if (
          q.required &&
          (value === undefined || value === null || value === "")
        ) {
          errors.push(`Question "${q.label}" is required.`);
          continue;
        }

        if (q.type === "singleSelect" && value !== undefined) {
          if (!q.options.includes(value)) {
            errors.push(
              `Invalid value for "${q.label}". Must be one of: ${q.options.join(
                ", "
              )}`
            );
          }
        }

        if (q.type === "multiSelect" && Array.isArray(value)) {
          const invalid = value.filter((v) => !q.options.includes(v));
          if (invalid.length > 0) {
            errors.push(
              `Invalid multi-select values for "${q.label}": ${invalid.join(
                ", "
              )}`
            );
          }
        }

        // Map to Airtable field (using airtableFieldId)
        answersRecord[q.airtableFieldId] = value;
      }
    } else {
      // No questions defined on the form (simple demo case)
      console.log(
        "Form has no questions array; skipping validation and Airtable field mapping."
      );
    }

    if (errors.length > 0) {
      return res.status(400).json({
        message: "Validation failed",
        errors,
      });
    }

    // ---------- 3. Optionally save record to Airtable ----------
    let airtableRecordId = null;
    let messagePrefix = "";

    // Airtable only if:
    //  - owner exists
    //  - owner has airtable tokens
    //  - form has base & table ids
    if (
      airtableAuth &&
      airtableAuth.accessToken &&
      form.airtableBaseId &&
      form.airtableTableId
    ) {
      try {
        const client = createAirtableClient(airtableAuth.accessToken);

        const airtableResponse = await client.post(
          `/${form.airtableBaseId}/${form.airtableTableId}`,
          {
            fields: answersRecord,
          }
        );

        airtableRecordId = airtableResponse.data.id;
        messagePrefix = "Response saved to Airtable and MongoDB";
      } catch (err) {
        console.error(
          "Error saving to Airtable (will still save to Mongo):",
          err.response?.data || err.message
        );
        messagePrefix =
          "Response saved in MongoDB, but failed to save to Airtable";
      }
    } else {
      messagePrefix = "Response saved in MongoDB (no Airtable connection)";
    }

    // ---------- 4. Save response in MongoDB ----------
    const dbResponse = new Response({
      form: form._id,
      user: ownerId, // just store the id, user doc may or may not exist
      airtableRecordId,
      answers,
      source: "webform",
    });

    await dbResponse.save();

    return res.status(201).json({
      message: messagePrefix,
      response: dbResponse,
    });
  } catch (err) {
    console.error("Error saving response:", err.response?.data || err.message);
    return res.status(500).json({
      message: "Internal server error while saving response",
    });
  }
});

module.exports = router;
