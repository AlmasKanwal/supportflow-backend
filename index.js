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

const normalize = (url) => (url ? url.trim().replace(/\/+$/, "") : url);

const allowedOrigins = [
  "http://localhost:5173",
  normalize(process.env.FRONTEND_URL),
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      const normalizedOrigin = normalize(origin);
      if (!origin || allowedOrigins.includes(normalizedOrigin)) {
        callback(null, true);
      } else {
        console.error(
          `CORS rejected origin "${origin}". Allowed: ${JSON.stringify(allowedOrigins)}`
        );
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json());

// On Vercel, app.listen() below is never what starts accepting traffic -
// Vercel invokes the exported `app` directly per-request, without waiting
// for connectDB().then() to resolve. On a cold start, a request can reach
// a route handler before Mongoose has finished connecting, and since
// bufferCommands is false, that query fails immediately instead of
// queuing. This middleware makes every request wait for the *same*
// in-flight connectDB() promise (only created once) before continuing,
// so it's safe on both cold starts and warm invocations, and has no
// effect locally since the connection is already established by the
// time app.listen() lets requests in.
const dbReady = connectDB();
app.use((req, res, next) => {
  dbReady.then(() => next()).catch(next);
});

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

// Reuses the same dbReady connection started above (line ~36) - calling
// connectDB() a second time here would open a duplicate connection.
dbReady.then(async () => {
  // Ensures admin + demo workers (Rohama, Hiraya, Tayyaba, etc.) always
  // exist, even on a brand-new/empty database - so category -> worker
  // suggestions never come back empty.
  await autoSeed();

  app.listen(PORT, () => {
    console.log(`SupportFlow backend running on port ${PORT}`);
  });
});

module.exports = app;
