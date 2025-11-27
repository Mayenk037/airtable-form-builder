// backend/src/models/Form.js

const mongoose = require("mongoose");
const { Schema } = mongoose;

// Condition: used in conditionalRules.conditions[]
const conditionSchema = new Schema(
  {
    questionKey: {
      type: String,
      required: true,
    },
    operator: {
      type: String,
      enum: ["equals", "notEquals", "contains"],
      required: true,
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  { _id: false }
);

// ConditionalRules: holds logic + conditions[]
const conditionalRulesSchema = new Schema(
  {
    logic: {
      type: String,
      enum: ["AND", "OR"],
      default: "AND",
    },
    conditions: [conditionSchema],
  },
  { _id: false }
);

// Each question in the form
const questionSchema = new Schema(
  {
    questionKey: {
      type: String, // internal key, used in answers
      required: true,
    },
    airtableFieldId: {
      type: String, // Airtable field id to map to
      required: true,
    },
    label: {
      type: String, // question label shown to user
      required: true,
    },
    type: {
      type: String,
      // e.g. "shortText" | "longText" | "singleSelect" | "multiSelect" | "attachment"
      required: true,
    },
    required: {
      type: Boolean,
      default: false,
    },
    options: [String], // for select-type questions
    conditionalRules: {
      type: conditionalRulesSchema,
      default: null,
    },
  },
  { _id: false }
);

// Whole form
const formSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: String,

    airtableBaseId: {
      type: String,
      required: true,
    },
    airtableTableId: {
      type: String,
      required: true,
    },

    questions: [questionSchema],
  },
  { timestamps: true }
);

const Form = mongoose.model("Form", formSchema);

module.exports = Form;
