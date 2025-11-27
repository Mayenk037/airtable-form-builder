// src/models/User.js

const mongoose = require("mongoose");

const airtableAuthSchema = new mongoose.Schema(
  {
    airtableUserId: String,        // Airtable's user id
    emailFromAirtable: String,     // if you fetch profile later
    accessToken: String,
    refreshToken: String,
    tokenExpiresAt: Date,
    scopes: [String],
    lastLoginAt: Date,
    workspaceId: String,           // if you ever need it
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    // Basic app identity
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },

    // Airtable OAuth info
    airtable: airtableAuthSchema,

    // Any bases they’ve worked with (optional)
    connectedBases: [
      {
        baseId: String,
        baseName: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
