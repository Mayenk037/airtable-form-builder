// src/index.js

require("dotenv").config(); // Load .env variables at the very top

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Routers
const healthRouter = require("./routes/health.route");
const userRouter = require("./routes/user.route");
const formRouter = require("./routes/form.route");
const logicTestRouter = require("./routes/logic-test.route");
const responseRouter = require("./routes/response.route");
const authRouter = require("./routes/auth.route");
const airtableRouter = require("./routes/airtable.route");
const webhookRouter = require("./routes/webhook.route");


const app = express();

// ====== Basic Middleware ======

// Allows JSON bodies in requests (req.body)
app.use(express.json());

// Allow frontend (React) to talk to backend in dev
app.use(
  cors({
    origin: "http://localhost:5173", // frontend dev URL
    credentials: true,
  })
);

// ====== Connect to MongoDB ======
connectDB();

// ====== Routes ======
app.use("/api", healthRouter);
app.use("/api/users", userRouter);
app.use("/api/forms", formRouter);
app.use("/api", logicTestRouter);
app.use("/api/responses", responseRouter);
app.use("/api/auth", authRouter);
app.use("/api/airtable", airtableRouter);
app.use("/api/webhooks", webhookRouter);

// A fallback route just so we know unhandled paths
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ====== Start Server ======
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
