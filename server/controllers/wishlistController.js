const { Wishlist, Book } = require("../models");
const { validationResult } = require("express-validator");

// Get user's wishlist
const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    const wishlistItems = await Wishlist.findAll({
      where: { userId },
      include: [
        {
          model: Book,
          attributes: [
            "id",
            "title",
            "author",
            "price",
            "imageUrl",
            "stock",
            "category",
            "description",
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Transform data to match client expectations
    const transformedItems = wishlistItems.map((item) => {
      const avgRating = item.Book.averageRating ? parseFloat(item.Book.averageRating) : 0;
      return {
        bookId: item.bookId,
        title: item.Book.title,
        author: item.Book.author,
        price: parseFloat(item.Book.price),
        coverImage: item.Book.imageUrl,
        stock: item.Book.stock,
        category: item.Book.category,
        genre: item.Book.category, // alias for frontend compatibility
        description: item.Book.description,
        quantity: 1,
        dateAdded: item.createdAt,
        isInCart: false,
        averageRating: avgRating,
        reviewCount: item.Book.ratingsCount || 0,
      };
    });

    res.json({
      success: true,
      items: transformedItems,
    });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching wishlist",
    });
  }
};

// Add book to wishlist
const addToWishlist = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const userId = req.user.id;
    const { bookId } = req.body;

    // Check if book exists
    const book = await Book.findByPk(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    // Check if book is already in wishlist
    const existingWishlistItem = await Wishlist.findOne({
      where: { userId, bookId },
    });

    if (existingWishlistItem) {
      return res.status(400).json({
        success: false,
        message: "Book is already in your wishlist",
      });
    }

    // Add book to wishlist
    const wishlistItem = await Wishlist.create({
      userId,
      bookId,
    });

    // Return the wishlist item with book details
    const wishlistItemWithDetails = await Wishlist.findOne({
      where: { id: wishlistItem.id },
      include: [
        {
          model: Book,
          attributes: ["id", "title", "author", "price", "imageUrl", "stock"],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: "Book added to wishlist",
      data: wishlistItemWithDetails,
    });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Error adding book to wishlist",
    });
  }
};

// Remove book from wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId } = req.params;

    const wishlistItem = await Wishlist.findOne({
      where: { userId, bookId },
    });

    if (!wishlistItem) {
      return res.status(404).json({
        success: false,
        message: "Book not found in wishlist",
      });
    }

    await wishlistItem.destroy();

    res.json({
      success: true,
      message: "Book removed from wishlist",
    });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Error removing book from wishlist",
    });
  }
};

// Clear entire wishlist
const clearWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    await Wishlist.destroy({
      where: { userId },
    });

    res.json({
      success: true,
      message: "Wishlist cleared successfully",
    });
  } catch (error) {
    console.error("Error clearing wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Error clearing wishlist",
    });
  }
};

// Check if book is in wishlist
const checkWishlistStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId } = req.params;

    const wishlistItem = await Wishlist.findOne({
      where: { userId, bookId },
    });

    res.json({
      success: true,
      inWishlist: !!wishlistItem,
    });
  } catch (error) {
    console.error("Error checking wishlist status:", error);
    res.status(500).json({
      success: false,
      message: "Error checking wishlist status",
    });
  }
};

// Add multiple books to wishlist
const addMultipleToWishlist = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const userId = req.user.id;
    const { bookIds } = req.body;

    const results = {
      added: [],
      skipped: [],
      errors: [],
    };

    for (const bookId of bookIds) {
      try {
        // Check if book exists
        const book = await Book.findByPk(bookId);
        if (!book) {
          results.errors.push({ bookId, message: "Book not found" });
          continue;
        }

        // Check if book is already in wishlist
        const existingWishlistItem = await Wishlist.findOne({
          where: { userId, bookId },
        });

        if (existingWishlistItem) {
          results.skipped.push({ bookId, message: "Already in wishlist" });
          continue;
        }

        // Add book to wishlist
        await Wishlist.create({
          userId,
          bookId,
        });

        results.added.push(bookId);
      } catch (error) {
        results.errors.push({ bookId, message: error.message });
      }
    }

    res.json({
      success: true,
      message: `Added ${results.added.length} books to wishlist`,
      data: results,
    });
  } catch (error) {
    console.error("Error adding multiple books to wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Error adding books to wishlist",
    });
  }
};

// Remove multiple books from wishlist
const removeMultipleFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookIds } = req.body;

    if (!Array.isArray(bookIds) || bookIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Book IDs must be a non-empty array",
      });
    }

    const deletedCount = await Wishlist.destroy({
      where: {
        userId,
        bookId: bookIds,
      },
    });

    res.json({
      success: true,
      message: `Removed ${deletedCount} books from wishlist`,
      data: { deletedCount },
    });
  } catch (error) {
    console.error("Error removing multiple books from wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Error removing books from wishlist",
    });
  }
};

// Update item quantity
const updateItemQuantity = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const userId = req.user.id;
    const { bookId } = req.params;
    const { quantity } = req.body;

    // Note: Wishlist doesn't have quantity field, this is just for compatibility
    // In a real implementation, you might want to add quantity to Wishlist model
    const wishlistItem = await Wishlist.findOne({
      where: { userId, bookId },
    });

    if (!wishlistItem) {
      return res.status(404).json({
        success: false,
        message: "Book not found in wishlist",
      });
    }

    res.json({
      success: true,
      message: "Quantity updated (note: wishlist items do not have quantities)",
      data: { bookId, quantity },
    });
  } catch (error) {
    console.error("Error updating item quantity:", error);
    res.status(500).json({
      success: false,
      message: "Error updating item quantity",
    });
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  checkWishlistStatus,
  addMultipleToWishlist,
  removeMultipleFromWishlist,
  updateItemQuantity,
};
