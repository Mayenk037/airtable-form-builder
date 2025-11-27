// src/routes/logic-test.route.js

const express = require("express");
const shouldShowQuestion = require("../utils/shouldShowQuestion");

const router = express.Router();

router.post("/test-logic", (req, res) => {
  const { conditions, answers } = req.body;

  const visible = shouldShowQuestion(conditions, answers);

  res.json({
    visible,
    conditions,
    answers,
  });
});

module.exports = router;
