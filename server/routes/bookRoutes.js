const express = require("express");
const router = express.Router();
const bookController = require("../controllers/bookController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// Specific routes must come before parameterized routes
router.get("/categories", bookController.getCategories);
router.get("/featured", bookController.getFeaturedBooks);
router.get("/free", bookController.getFreeBooks);
router.get("/bestsellers", bookController.getBestsellers);
router.get("/search", bookController.searchBooks);
router.get("/category/:category", bookController.getBooksByCategory);
router.get("/trending", bookController.getTrendingBooks);
router.get("/compare/:ids", bookController.compareBooks);

// External API routes
router.get("/external/search", bookController.searchExternalBooks);
router.post(
  "/external/import",
  authMiddleware,
  adminMiddleware,
  bookController.importBookFromAPI
);
router.get("/recommendations", bookController.getExternalRecommendations);

// Price History routes
router.get("/:id/price-history", bookController.getPriceHistory);
router.post(
  "/:id/price-history",
  authMiddleware,
  adminMiddleware,
  bookController.addPriceHistory
);

// Recommended books route (must come before :id route)
router.get("/recommended/:userId", bookController.getRecommendedBooks);

// Standard CRUD routes (parameterized routes come last)
router.get("/", bookController.getAllBooks);
router.get("/:id", bookController.getBookById);
router.post("/", authMiddleware, adminMiddleware, bookController.createBook); // Admin only
router.put("/:id", authMiddleware, adminMiddleware, bookController.updateBook);
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  bookController.deleteBook
);

module.exports = router;
