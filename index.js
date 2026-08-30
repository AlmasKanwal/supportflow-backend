const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const autoSeed = require("./config/autoSeed");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");

dotenv.config();

// Sanity check: confirms .env was actually found and parsed before we
// try to connect. If this prints "MONGO_URI present: false", dotenv is
// not finding your .env file (wrong working directory, wrong filename,
// or the file isn't in backend/ next to index.js).
console.log(`MONGO_URI present: ${Boolean(process.env.MONGO_URI)}`);

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "SupportFlow API is running" });
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/tickets", require("./routes/ticketRoutes"));
app.use("/api/worker", require("./routes/workerRoutes"));
app.use("/api/workers", require("./routes/workerPublicRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 8000;

// Only start accepting HTTP traffic once MongoDB is actually connected.
// This is what prevents "Cannot call users.findOne() before initial
// connection is complete" - previously the server started listening
// immediately while connectDB() was still resolving DNS/SRV + TLS in
// the background, so an early request could arrive before Mongoose was
// ready. connectDB() itself calls process.exit(1) on failure, so if we
// reach the .then() below, the connection is confirmed good.
connectDB().then(async () => {
  // Ensures admin + demo workers (Rohama, Hiraya, Tayyaba, etc.) always
  // exist, even on a brand-new/empty database - so category -> worker
  // suggestions never come back empty.
  await autoSeed();

  app.listen(PORT, () => {
    console.log(`SupportFlow backend running on port ${PORT}`);
  });
});

module.exports = app;
