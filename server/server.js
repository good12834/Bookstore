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

// Teat DB Connection
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully.");
    // Sync models
    await sequelize.sync({ alter: true });
    console.log("Models synced.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

connectDB();

// Serve index.html for any non-API routes (client-side routing)
app.use((req, res) => {
  if (!req.path.startsWith("/api/")) {
    res.sendFile(path.join(clientBuildPath, "index.html"));
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});