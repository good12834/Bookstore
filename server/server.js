const express = require("express");
const cors = require("cors");
const { sequelize } = require("./models");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use((req, res, next) => {
  const contentType = req.headers["content-type"] || "none (GET request)";
  console.log(
    `Request: ${req.method} ${req.url} | Content-Type: ${contentType}`
  );
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Serve static files from the client build directory
const clientBuildPath = path.join(__dirname, "..", "client", "dist");
app.use(express.static(clientBuildPath));

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/books", require("./routes/bookRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes"));
app.use("/api/email", require("./routes/emailRoutes"));
app.use("/api/wishlist", require("./routes/wishlistRoutes"));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Retry logic for database connection
const connectDB = async (retries = 5, delay = 3000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(
        `Database connection attempt ${attempt}/${retries}...`
      );
      await sequelize.authenticate();
      console.log("✅ Database connected successfully.");

      // Sync models - use alter:false on subsequent runs to avoid index conflicts
      // Use force:false to never drop tables
      await sequelize.sync({ alter: false });
      console.log("✅ Models synced.");
      return true;
    } catch (error) {
      console.error(
        `❌ Database connection attempt ${attempt} failed:`,
        error.message
      );

      if (attempt === retries) {
        console.error(
          "⚠️  Could not connect to database after all retries."
        );
        console.error(
          "Please check your DB_HOST, DB_USER, DB_PASS, and DB_NAME environment variables."
        );
        // Don't crash the process - let the server start and health check work
        // Routes that need DB will fail, but health check will respond
        return false;
      }

      console.log(`Retrying in ${delay / 1000} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  return false;
};

connectDB();

// Serve index.html for any non-API routes (client-side routing)
app.use((req, res) => {
  if (!req.path.startsWith("/api/")) {
    res.sendFile(path.join(clientBuildPath, "index.html"));
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
