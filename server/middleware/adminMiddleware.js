const jwt = require("jsonwebtoken");

/**
 * Admin middleware to verify admin privileges
 * Checks if the authenticated user has admin rights
 */
const adminMiddleware = (req, res, next) => {
  console.log(
    "Admin Middleware: Checking admin privileges for user:",
    req.user?.id
  );

  // First check if user is authenticated
  if (!req.user) {
    console.log("Admin Middleware: No user found in request");
    return res.status(401).json({ message: "Authentication required" });
  }

  // Check if user has admin privileges
  if (!req.user.isAdmin) {
    console.log(
      "Admin Middleware: Access denied for non-admin user:",
      req.user.id
    );
    return res.status(403).json({
      message: "Access denied. Admin privileges required.",
      required: "isAdmin",
      current: req.user.isAdmin,
    });
  }

  console.log("Admin Middleware: Admin access granted for user:", req.user.id);
  next();
};

module.exports = adminMiddleware;
