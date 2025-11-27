// backend/src/config/airtable.js

const axios = require("axios");

const AIRTABLE_AUTH_URL = "https://airtable.com/oauth2/v1/authorize";
const AIRTABLE_TOKEN_URL = "https://airtable.com/oauth2/v1/token";
const AIRTABLE_API_BASE = "https://api.airtable.com/v0";

function getAirtableAuthUrl(state) {
  const params = new URLSearchParams({
    client_id: process.env.AIRTABLE_CLIENT_ID,
    redirect_uri: process.env.AIRTABLE_REDIRECT_URI,
    response_type: "code",
    scope: "data.records:read data.records:write schema.bases:read",
    state,
  });

  return `${AIRTABLE_AUTH_URL}?${params.toString()}`;
}

async function exchangeCodeForTokens(code) {
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: process.env.AIRTABLE_CLIENT_ID,
    client_secret: process.env.AIRTABLE_CLIENT_SECRET,
    redirect_uri: process.env.AIRTABLE_REDIRECT_URI,
  });

  const res = await axios.post(AIRTABLE_TOKEN_URL, params.toString(), {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  return res.data; // { access_token, refresh_token, expires_in, scope, ... }
}

function createAirtableClient(accessToken) {
  return axios.create({
    baseURL: AIRTABLE_API_BASE,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
}

module.exports = {
  getAirtableAuthUrl,
  exchangeCodeForTokens,
  createAirtableClient,
};
