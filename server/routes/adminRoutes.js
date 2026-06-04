const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// Dashboard statistics
router.get(
  "/stats",
  authMiddleware,
  adminMiddleware,
  adminController.getDashboardStats
);

// User management
router.get("/users", authMiddleware, adminMiddleware, adminController.getUsers);
router.put(
  "/users/:id/role",
  authMiddleware,
  adminMiddleware,
  adminController.updateUserRole
);
router.delete(
  "/users/:id",
  authMiddleware,
  adminMiddleware,
  adminController.deleteUser
);

// Order management
router.get(
  "/orders",
  authMiddleware,
  adminMiddleware,
  adminController.getOrders
);
router.put(
  "/orders/:id/status",
  authMiddleware,
  adminMiddleware,
  adminController.updateOrderStatus
);

// Analytics
router.get(
  "/analytics",
  authMiddleware,
  adminMiddleware,
  adminController.getAnalytics
);

// Email management
router.post(
  "/orders/:id/send-shipped-email",
  authMiddleware,
  adminMiddleware,
  adminController.sendOrderShippedEmail
);
router.get(
  "/email/statistics",
  authMiddleware,
  adminMiddleware,
  adminController.getEmailStatistics
);
router.post(
  "/email/promotional/send-all",
  authMiddleware,
  adminMiddleware,
  adminController.sendPromotionalEmailToAll
);
router.post(
  "/email/promotional/send-users",
  authMiddleware,
  adminMiddleware,
  adminController.sendPromotionalEmailToUsers
);

module.exports = router;
