const { Book, Review, Sequelize } = require("../models");
const { Op } = Sequelize;

// API Services
const googleBooksService = require("../services/googleBooksService");
const gutendexService = require("../services/gutendexService");

exports.getAllBooks = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, rating, language } =
      req.query;
    let where = {};

    if (search) {
      const searchLower = search.toLowerCase();
      where[Op.or] = [
        Sequelize.where(Sequelize.fn("LOWER", Sequelize.col("title")), {
          [Op.like]: `%${searchLower}%`,
        }),
        Sequelize.where(Sequelize.fn("LOWER", Sequelize.col("author")), {
          [Op.like]: `%${searchLower}%`,
        }),
        { isbn: { [Op.like]: `%${search}%` } },
      ];
    }

    if (category) where.category = category;
    if (language) where.language = language;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = minPrice;
      if (maxPrice) where.price[Op.lte] = maxPrice;
    }

    const books = await Book.findAll({
      where,
      include: [
        {
          model: Review,
          required: false, // This allows books without reviews
        },
      ],
    });

    // Filter by rating if specified
    let filteredBooks = books;
    if (rating) {
      const minRating = parseInt(rating);
      filteredBooks = books.filter((book) => {
        if (!book.Reviews || book.Reviews.length === 0) {
          return minRating === 0; // Include books without reviews only if rating filter is 0
        }
        const averageRating =
          book.Reviews.reduce((sum, review) => sum + review.rating, 0) /
          book.Reviews.length;
        return averageRating >= minRating;
      });
    }

    res.json(filteredBooks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id, {
      include: [Review],
    });
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json(book);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createBook = async (req, res) => {
  try {
    const book = await Book.create(req.body);
    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    await book.update(req.body);
    res.json(book);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    await book.destroy();
    res.json({ message: "Book deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Price History methods
exports.getPriceHistory = async (req, res) => {
  try {
    const { PriceHistory } = require("../models");
    const bookId = req.params.id;
    const limit = parseInt(req.query.limit) || 50;

    const priceHistory = await PriceHistory.getPriceHistoryForBook(
      bookId,
      limit
    );
    res.json(priceHistory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addPriceHistory = async (req, res) => {
  try {
    const { PriceHistory } = require("../models");
    const bookId = req.params.id;
    const { price, source = "manual_change", changedBy } = req.body;

    const priceHistory = await PriceHistory.create({
      bookId,
      price,
      source,
      changedBy: changedBy || req.user?.id,
    });

    res.status(201).json(priceHistory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Additional Features Methods
exports.getFeaturedBooks = async (req, res) => {
  try {
    const books = await Book.findAll({
      where: { featured: true },
      include: [{ model: Review }],
      limit: 10,
    });
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getFreeBooks = async (req, res) => {
  try {
    const books = await Book.findAll({
      where: { isFree: true },
      include: [{ model: Review }],
      limit: 18,
    });
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBestsellers = async (req, res) => {
  try {
    // This would typically be based on sales data
    // For now, returning high-rated books
    const books = await Book.findAll({
      include: [{ model: Review }],
      limit: 20,
    });

    // Sort by average rating and review count
    const bestsellers = books
      .map((book) => {
        const reviews = book.Reviews || [];
        const avgRating =
          reviews.length > 0
            ? reviews.reduce((sum, review) => sum + review.rating, 0) /
              reviews.length
            : 0;
        return { ...book.toJSON(), avgRating, reviewCount: reviews.length };
      })
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, 10);

    res.json(bestsellers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.searchBooks = async (req, res) => {
  try {
    const { q, category, minPrice, maxPrice, rating } = req.query;
    let where = {};

    if (q) {
      const searchLower = q.toLowerCase();
      where[Op.or] = [
        Sequelize.where(Sequelize.fn("LOWER", Sequelize.col("title")), {
          [Op.like]: `%${searchLower}%`,
        }),
        Sequelize.where(Sequelize.fn("LOWER", Sequelize.col("author")), {
          [Op.like]: `%${searchLower}%`,
        }),
        Sequelize.where(Sequelize.fn("LOWER", Sequelize.col("description")), {
          [Op.like]: `%${searchLower}%`,
        }),
        { isbn: { [Op.like]: `%${q}%` } },
      ];
    }

    if (category) where.category = category;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = minPrice;
      if (maxPrice) where.price[Op.lte] = maxPrice;
    }

    const books = await Book.findAll({ where, include: [{ model: Review }] });

    // Filter by rating if specified
    let filteredBooks = books;
    if (rating) {
      const minRating = parseInt(rating);
      filteredBooks = books.filter((book) => {
        const reviews = book.Reviews || [];
        if (reviews.length === 0) return minRating === 0;
        const avgRating =
          reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length;
        return avgRating >= minRating;
      });
    }

    res.json(filteredBooks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Book.findAll({
      attributes: ["category"],
      group: ["category"],
      where: {
        category: {
          [Op.not]: null,
        },
      },
    });

    const categoryList = categories
      .map((book) => book.category)
      .filter(Boolean);
    res.json([...new Set(categoryList)]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBooksByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const books = await Book.findAll({
      where: { category },
      include: [{ model: Review }],
    });
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTrendingBooks = async (req, res) => {
  try {
    // For now, return recently added books
    const books = await Book.findAll({
      include: [{ model: Review }],
      order: [["createdAt", "DESC"]],
      limit: 20,
    });
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRecommendedBooks = async (req, res) => {
  try {
    const { userId } = req.params;
    // Simple recommendation based on high-rated books
    // In a real app, this would use more sophisticated algorithms
    const books = await Book.findAll({
      include: [{ model: Review }],
      limit: 10,
    });

    // Sort by average rating
    const recommended = books
      .map((book) => {
        const reviews = book.Reviews || [];
        const avgRating =
          reviews.length > 0
            ? reviews.reduce((sum, review) => sum + review.rating, 0) /
              reviews.length
            : 0;
        return { ...book.toJSON(), avgRating };
      })
      .sort((a, b) => b.avgRating - a.avgRating);

    res.json(recommended);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.compareBooks = async (req, res) => {
  try {
    const { ids } = req.params;
    const bookIds = ids.split(",").map((id) => parseInt(id.trim()));

    const books = await Book.findAll({
      where: {
        id: {
          [Op.in]: bookIds,
        },
      },
      include: [{ model: Review }],
    });

    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// External API Integration Methods

exports.searchExternalBooks = async (req, res) => {
  try {
    const { source, query, page, pageSize } = req.query;

    let results = [];

    switch (source) {
      case "google":
        results = await googleBooksService.searchBooks(query, {
          maxResults: pageSize,
          startIndex: (page - 1) * pageSize,
        });
        break;

      case "gutendex":
        results = await gutendexService.searchBooks(query, {
          pageSize,
          page,
        });
        break;

      case "openlibrary":
        // Open Library doesn't have direct search, would need different approach
        break;

      default:
        // Search all sources
        const [googleResults, gutendexResults] = await Promise.all([
          googleBooksService.searchBooks(query, { maxResults: 20 }),
          gutendexService.searchBooks(query, { pageSize: 20 }),
        ]);
        results = [...googleResults, ...gutendexResults];
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.importBookFromAPI = async (req, res) => {
  try {
    const { source, bookId, isbn } = req.body;
    let bookData;

    switch (source) {
      case "google":
        if (isbn) {
          bookData = await googleBooksService.getBookByISBN(isbn);
        }
        break;

      case "gutendex":
        // Would need to implement getBookById in gutendexService
        break;

      case "openlibrary":
        if (isbn) {
          // Would need openLibraryService
        }
        break;
    }

    if (!bookData) {
      return res.status(404).json({ message: "Book not found in API" });
    }

    // Sync to database
    let book;
    if (source === "google") {
      book = await googleBooksService.syncBookToDatabase(bookData);
    } else if (source === "gutendex") {
      book = await gutendexService.syncBookToDatabase(bookData);
    }

    res.json(book);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getExternalRecommendations = async (req, res) => {
  try {
    const { bookIds, limit } = req.query;
    const bookIdArray = bookIds
      ? bookIds.split(",").map((id) => parseInt(id))
      : [];

    // Get local recommendations
    const localBooks = await Book.findAll({
      where: {
        id: { [Op.in]: bookIdArray },
      },
      include: [{ model: Review }],
    });

    let recommendations = [];

    // Try Big Book API if available (placeholder for now)
    if (process.env.BIG_BOOK_API_KEY) {
      try {
        // Placeholder for Big Book API
        console.log("Big Book API not implemented yet");
      } catch (error) {
        console.log("Big Book API failed, using local recommendations");
      }
    }

    // Fallback to local recommendations
    if (recommendations.length === 0) {
      recommendations = await getLocalRecommendations(bookIdArray, limit || 10);
    }

    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

async function getLocalRecommendations(bookIds, limit) {
  // Simple content-based recommendations
  const books = await Book.findAll({
    include: [{ model: Review }],
    limit: limit * 2,
  });

  // Score books based on categories and ratings
  return books
    .map((book) => {
      const reviews = book.Reviews || [];
      const avgRating =
        reviews.length > 0
          ? reviews.reduce((sum, review) => sum + review.rating, 0) /
            reviews.length
          : 0;

      return {
        ...book.toJSON(),
        recommendationScore: avgRating + (book.stock > 0 ? 0.5 : 0),
      };
    })
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, limit);
}
