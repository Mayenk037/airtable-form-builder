// src/routes/form.route.js

const express = require("express");
const Form = require("../models/Form");
const Response = require("../models/Response");

const router = express.Router();

/**
 * POST /api/forms
 * Create a new form definition
 */
router.post("/", async (req, res) => {
  try {
    const {
      userId,
      title,
      description,
      airtableBaseId,
      airtableTableId,
      questions,
    } = req.body;

    const form = new Form({
      user: userId,
      title,
      description,
      airtableBaseId,
      airtableTableId,
      questions: questions || [],
    });

    await form.save();
    return res.status(201).json(form);
  } catch (err) {
    console.error("Error creating form:", err.message);
    return res.status(500).json({ message: "Failed to create form" });
  }
});

/**
 * GET /api/forms/:id
 * Get a single form
 */
router.get("/:id", async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }
    return res.json(form);
  } catch (err) {
    console.error("Error fetching form:", err.message);
    return res.status(500).json({ message: "Failed to fetch form" });
  }
});

/**
 * GET /api/forms/:formId/responses
 * List responses for a given form
 */
router.get("/:formId/responses", async (req, res) => {
  try {
    const { formId } = req.params;

    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    const responses = await Response.find({ form: formId }).sort({
      createdAt: -1,
    });

    return res.json({ responses });
  } catch (err) {
    console.error("Error fetching responses:", err.message);
    return res.status(500).json({ message: "Failed to fetch responses" });
  }
});

module.exports = router;
