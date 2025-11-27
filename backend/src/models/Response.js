// backend/src/models/Response.js

const mongoose = require("mongoose");
const { Schema } = mongoose;

const responseSchema = new Schema(
  {
    form: {
      type: Schema.Types.ObjectId,
      ref: "Form",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Airtable linkage
    airtableRecordId: {
      type: String,
    },

    // Answers keyed by questionKey
    answers: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
    },

    // Where this response came from
    source: {
      type: String,
      enum: ["webform", "airtable", "api"],
      default: "webform",
    },

    // Soft delete flag if record removed in Airtable
    deletedInAirtable: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Response = mongoose.model("Response", responseSchema);

module.exports = Response;
