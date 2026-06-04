const express = require("express");
const { body } = require("express-validator");
const wishlistController = require("../controllers/wishlistController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// All wishlist routes require authentication
router.use(authMiddleware);

// Get user's wishlist
router.get("/", wishlistController.getWishlist);

// Clear entire wishlist (must come before parameterized routes)
router.delete("/clear", wishlistController.clearWishlist);

// Add book to wishlist
router.post(
  "/",
  [
    body("bookId")
      .isInt({ min: 1 })
      .withMessage("Book ID must be a valid integer"),
  ],
  wishlistController.addToWishlist
);

// Remove book from wishlist (must come after specific routes)
router.delete("/:bookId", wishlistController.removeFromWishlist);

// Check if book is in wishlist
router.get("/check/:bookId", wishlistController.checkWishlistStatus);

// Add multiple books to wishlist
router.post(
  "/bulk",
  [
    body("bookIds")
      .isArray({ min: 1 })
      .withMessage("Book IDs must be a non-empty array"),
    body("bookIds.*")
      .isInt({ min: 1 })
      .withMessage("Each Book ID must be a valid integer"),
  ],
  wishlistController.addMultipleToWishlist
);

// Remove multiple books from wishlist
router.delete("/bulk", wishlistController.removeMultipleFromWishlist);

// Update item quantity
router.put(
  "/quantity/:bookId",
  [
    body("quantity")
      .isInt({ min: 1 })
      .withMessage("Quantity must be a positive integer"),
  ],
  wishlistController.updateItemQuantity
);

module.exports = router;
