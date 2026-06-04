const express = require("express");
const router = express.Router();
const {
  sendOrderConfirmationEmail,
  sendOrderShippedEmail,
  sendPromotionalEmailToAll,
  sendPromotionalEmailToUsers,
  updateEmailPreferences,
  getEmailPreferences,
  unsubscribe,
  getEmailStatistics,
} = require("../controllers/emailController");
const authMiddleware = require("../middleware/authMiddleware");

// Order confirmation email (admin only)
router.post(
  "/order-confirmation/:orderId",
  authMiddleware,
  sendOrderConfirmationEmail
);

// Order shipped email (admin only)
router.post("/order-shipped/:orderId", authMiddleware, sendOrderShippedEmail);

// Send promotional email to all users (admin only)
router.post("/promotional/send-all", authMiddleware, sendPromotionalEmailToAll);

// Send promotional email to specific users (admin only)
router.post(
  "/promotional/send-users",
  authMiddleware,
  sendPromotionalEmailToUsers
);

// Update email preferences (authenticated user)
router.put("/preferences", authMiddleware, updateEmailPreferences);

// Get email preferences (authenticated user)
router.get("/preferences", authMiddleware, getEmailPreferences);

// Unsubscribe from promotional emails (public)
router.get("/unsubscribe", unsubscribe);

// Get email statistics (admin only)
router.get("/statistics", authMiddleware, getEmailStatistics);

module.exports = router;
