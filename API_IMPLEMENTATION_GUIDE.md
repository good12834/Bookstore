# Book APIs Integration Guide

## Overview

This guide provides a technical implementation plan for integrating book APIs from publicapis.dev/category/books into the existing Online Book Store project.

## API Integration Strategy

### Phase 1: Core API Integrations (Priority: High)

#### 1. Google Books API Integration

**Purpose**: Primary source for book metadata, covers, and reviews
**Implementation**: Server-side service with client-side caching

```javascript
// server/services/googleBooksService.js
const axios = require("axios");
const { Book } = require("../models");

class GoogleBooksService {
  constructor() {
    this.baseURL = "https://www.googleapis.com/books/v1/volumes";
    this.apiKey = process.env.GOOGLE_BOOKS_API_KEY; // Set in .env
  }

  async searchBooks(query, options = {}) {
    try {
      const params = {
        q: query,
        maxResults: options.maxResults || 40,
        startIndex: options.startIndex || 0,
        printType: options.printType || "books",
        orderBy: options.orderBy || "relevance",
      };

      if (this.apiKey) {
        params.key = this.apiKey;
      }

      const response = await axios.get(this.baseURL, { params });
      return this.transformGoogleBooksData(response.data.items || []);
    } catch (error) {
      console.error("Google Books API Error:", error);
      throw error;
    }
  }

  async getBookByISBN(isbn) {
    try {
      const params = {
        q: `isbn:${isbn}`,
        maxResults: 1,
      };

      if (this.apiKey) {
        params.key = this.apiKey;
      }

      const response = await axios.get(this.baseURL, { params });
      const items = response.data.items || [];

      if (items.length > 0) {
        return this.transformGoogleBooksData([items[0]])[0];
      }

      return null;
    } catch (error) {
      console.error("Google Books ISBN Search Error:", error);
      throw error;
    }
  }

  transformGoogleBooksData(items) {
    return items.map((item) => {
      const volumeInfo = item.volumeInfo || {};
      const saleInfo = item.saleInfo || {};
      const accessInfo = item.accessInfo || {};

      return {
        googleBooksId: item.id,
        title: volumeInfo.title || "Unknown Title",
        authors: volumeInfo.authors || [],
        author: volumeInfo.authors
          ? volumeInfo.authors.join(", ")
          : "Unknown Author",
        description: volumeInfo.description || "",
        publishedDate: volumeInfo.publishedDate,
        publisher: volumeInfo.publisher,
        categories: volumeInfo.categories || [],
        category: volumeInfo.categories ? volumeInfo.categories[0] : "General",
        language: volumeInfo.language,
        pageCount: volumeInfo.pageCount,
        averageRating: volumeInfo.averageRating,
        ratingsCount: volumeInfo.ratingsCount,
        isbn10: this.extractISBN(volumeInfo.industryIdentifiers, "ISBN_10"),
        isbn13: this.extractISBN(volumeInfo.industryIdentifiers, "ISBN_13"),
        imageLinks: volumeInfo.imageLinks,
        thumbnail: this.getThumbnailURL(volumeInfo.imageLinks),
        previewLink: volumeInfo.previewLink,
        infoLink: volumeInfo.infoLink,
        saleInfo: {
          country: saleInfo.country,
          saleability: saleInfo.saleability,
          listPrice: saleInfo.listPrice,
          retailPrice: saleInfo.retailPrice,
        },
        accessInfo: {
          country: accessInfo.country,
          viewability: accessInfo.viewability,
          embeddable: accessInfo.embeddable,
          publicDomain: accessInfo.publicDomain,
        },
      };
    });
  }

  extractISBN(identifiers, type) {
    if (!identifiers) return null;
    const isbn = identifiers.find((id) => id.type === type);
    return isbn ? isbn.identifier : null;
  }

  getThumbnailURL(imageLinks) {
    if (!imageLinks) return null;
    return imageLinks.thumbnail || imageLinks.smallThumbnail;
  }

  async syncBookToDatabase(googleBookData) {
    try {
      const bookData = {
        title: googleBookData.title,
        author: googleBookData.author,
        description: googleBookData.description,
        isbn: googleBookData.isbn13 || googleBookData.isbn10,
        category: googleBookData.category,
        language: googleBookData.language,
        imageUrl: googleBookData.thumbnail,
        googleBooksId: googleBookData.googleBooksId,
        pageCount: googleBookData.pageCount,
        publisher: googleBookData.publisher,
        publishedDate: googleBookData.publishedDate,
        averageRating: googleBookData.averageRating,
        ratingsCount: googleBookData.ratingsCount,
      };

      // Check if book already exists
      let book = await Book.findOne({ where: { isbn: bookData.isbn } });

      if (book) {
        // Update existing book
        await book.update(bookData);
      } else {
        // Create new book with default price and stock
        bookData.price = 19.99; // Default price
        bookData.stock = 10; // Default stock
        book = await Book.create(bookData);
      }

      return book;
    } catch (error) {
      console.error("Error syncing book to database:", error);
      throw error;
    }
  }
}

module.exports = new GoogleBooksService();
```

#### 2. Gutendex API Integration

**Purpose**: Free classic books from Project Gutenberg

```javascript
// server/services/gutendexService.js
const axios = require("axios");
const { Book } = require("../models");

class GutendexService {
  constructor() {
    this.baseURL = "https://gutendex.com/books";
  }

  async searchBooks(query, options = {}) {
    try {
      const params = {
        search: query,
        page: options.page || 1,
        page_size: options.pageSize || 32,
      };

      const response = await axios.get(this.baseURL, { params });
      return this.transformGutendexData(response.data);
    } catch (error) {
      console.error("Gutendex API Error:", error);
      throw error;
    }
  }

  async getPopularBooks(options = {}) {
    try {
      const params = {
        page: options.page || 1,
        page_size: options.pageSize || 32,
      };

      if (options.sort) {
        params.sort = options.sort; // popularity, downloads
      }

      const response = await axios.get(this.baseURL, { params });
      return this.transformGutendexData(response.data);
    } catch (error) {
      console.error("Gutendex Popular Books Error:", error);
      throw error;
    }
  }

  transformGutendexData(data) {
    const books = data.results || [];

    return books.map((book) => ({
      gutendexId: book.id,
      title: book.title,
      authors: book.authors || [],
      author: book.authors
        ? book.authors.map((a) => a.name).join(", ")
        : "Unknown",
      subjects: book.subjects || [],
      category: book.subjects ? book.subjects[0] : "Literature",
      languages: book.languages || [],
      language:
        book.languages && book.languages.length > 0 ? book.languages[0] : "en",
      downloadCount: book.download_count,
      coverImage: this.getCoverImageURL(book.id),
      formats: book.formats,
      isPublicDomain: true, // Gutendex books are public domain
      isFree: true,
      copyright: "Public Domain",
    }));
  }

  getCoverImageURL(bookId) {
    return `https://www.gutenberg.org/cache/epub/${bookId}/pg${bookId}.cover.medium.jpg`;
  }

  async syncBookToDatabase(gutendexBookData) {
    try {
      const bookData = {
        title: gutendexBookData.title,
        author: gutendexBookData.author,
        description: `Classic literature from Project Gutenberg. Subjects: ${gutendexBookData.subjects.join(
          ", "
        )}`,
        isbn: null, // Gutenberg books often don't have modern ISBNs
        category: gutendexBookData.category,
        language: gutendexBookData.language,
        imageUrl: gutendexBookData.coverImage,
        gutendexId: gutendexBookData.gutendexId,
        isPublicDomain: true,
        isFree: true,
        downloadCount: gutendexBookData.downloadCount,
      };

      // Check if book already exists
      let book = await Book.findOne({
        where: {
          title: bookData.title,
          author: bookData.author,
        },
      });

      if (book) {
        await book.update(bookData);
      } else {
        // Create new book with free price
        bookData.price = 0.0;
        bookData.stock = 999; // Unlimited for free books
        book = await Book.create(bookData);
      }

      return book;
    } catch (error) {
      console.error("Error syncing Gutendex book to database:", error);
      throw error;
    }
  }
}

module.exports = new GutendexService();
```

### Phase 2: Enhanced Features (Priority: Medium)

#### 3. Big Book API Integration

**Purpose**: Semantic search and recommendations

```javascript
// server/services/bigBookService.js
const axios = require("axios");
const { Book } = require("../models");

class BigBookService {
  constructor() {
    this.baseURL = "https://api.bigbookapi.com";
    this.apiKey = process.env.BIG_BOOK_API_KEY;
  }

  async getRecommendations(bookIds, options = {}) {
    try {
      const params = {
        book_ids: bookIds.join(","),
        limit: options.limit || 10,
        similarity_threshold: options.similarityThreshold || 0.7,
      };

      const response = await axios.get(`${this.baseURL}/recommendations`, {
        params,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      return response.data.recommendations || [];
    } catch (error) {
      console.error("Big Book API Error:", error);
      throw error;
    }
  }

  async semanticSearch(query, options = {}) {
    try {
      const params = {
        query,
        limit: options.limit || 20,
        filters: JSON.stringify(options.filters || {}),
      };

      const response = await axios.get(`${this.baseURL}/search`, {
        params,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      return response.data.books || [];
    } catch (error) {
      console.error("Big Book Semantic Search Error:", error);
      throw error;
    }
  }
}

module.exports = new BigBookService();
```

#### 4. Open Library Integration

**Purpose**: Additional metadata and historical data

```javascript
// server/services/openLibraryService.js
const axios = require("axios");

class OpenLibraryService {
  constructor() {
    this.baseURL = "https://openlibrary.org";
  }

  async getBookByISBN(isbn) {
    try {
      const response = await axios.get(`${this.baseURL}/isbn/${isbn}.json`);
      return this.transformOpenLibraryData(response.data);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return null;
      }
      console.error("Open Library API Error:", error);
      throw error;
    }
  }

  async getBookDetails(bookId) {
    try {
      const response = await axios.get(`${this.baseURL}/works/${bookId}.json`);
      return this.transformOpenLibraryWorkData(response.data);
    } catch (error) {
      console.error("Open Library Work Details Error:", error);
      throw error;
    }
  }

  transformOpenLibraryData(data) {
    return {
      openLibraryId: data.key,
      title: data.title,
      authors: data.authors ? data.authors.map((a) => a.name) : [],
      publishDate: data.publish_date,
      publishers: data.publishers || [],
      subjects: data.subjects || [],
      numberOfPages: data.number_of_pages,
      isbn10: this.extractISBN(data.identifiers, "isbn_10"),
      isbn13: this.extractISBN(data.identifiers, "isbn_13"),
      coverImage: this.getCoverImage(data.covers),
      description:
        typeof data.description === "string"
          ? data.description
          : data.description?.value,
    };
  }

  extractISBN(identifiers, type) {
    if (!identifiers || !identifiers[type]) return null;
    return identifiers[type][0];
  }

  getCoverImage(covers) {
    if (!covers || covers.length === 0) return null;
    return `https://covers.openlibrary.org/b/id/${covers[0]}-L.jpg`;
  }
}

module.exports = new OpenLibraryService();
```

### Phase 3: Specialized APIs (Priority: Low)

#### 5. Harry Potter API

**Purpose**: Themed content for fantasy section

#### 6. Religious Texts APIs

**Purpose**: Religious studies section

#### 7. PoetryDB

**Purpose**: Poetry collection

## Enhanced Book Controller Integration

```javascript
// server/controllers/bookController.js (additions)

// Add to existing imports
const googleBooksService = require("../services/googleBooksService");
const gutendexService = require("../services/gutendexService");
const bigBookService = require("../services/bigBookService");
const openLibraryService = require("../services/openLibraryService");

// New methods for API integration

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
          bookData = await openLibraryService.getBookByISBN(isbn);
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

exports.getRecommendations = async (req, res) => {
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

    // Try Big Book API if available
    if (process.env.BIG_BOOK_API_KEY) {
      try {
        const apiRecommendations = await bigBookService.getRecommendations(
          bookIdArray,
          {
            limit: limit || 10,
          }
        );
        recommendations = apiRecommendations;
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
```

## Database Schema Enhancements

```javascript
// server/models/Book.js (additions)

const Book = sequelize.define("Book", {
  // ... existing fields ...

  // API Integration fields
  googleBooksId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true,
  },
  gutendexId: {
    type: DataTypes.INTEGER,
    unique: true,
    allowNull: true,
  },
  openLibraryId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true,
  },

  // Enhanced metadata
  pageCount: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  publisher: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  publishedDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  averageRating: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    validate: { min: 0, max: 5 },
  },
  ratingsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },

  // Special book types
  isPublicDomain: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isFree: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  downloadCount: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },

  // API sync tracking
  lastApiSync: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  apiData: {
    type: DataTypes.JSON,
    allowNull: true,
  },
});

// Add indexes for better query performance
Book.addIndex("idx_google_books_id", {
  fields: ["googleBooksId"],
});

Book.addIndex("idx_gutendex_id", {
  fields: ["gutendexId"],
});

Book.addIndex("idx_isbn", {
  fields: ["isbn"],
});

Book.addIndex("idx_category", {
  fields: ["category"],
});

Book.addIndex("idx_average_rating", {
  fields: ["averageRating"],
});
```

## Client-Side API Integration

```javascript
// client/src/api/externalBooksApi.js
import api from "./booksApi";

export const externalBooksApi = {
  // Search external APIs
  searchExternalBooks: async (source, query, options = {}) => {
    try {
      const params = new URLSearchParams({
        source,
        query,
        page: options.page || 1,
        pageSize: options.pageSize || 20,
      });

      const response = await api.get(
        `/books/external/search?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error("External books search error:", error);
      throw error;
    }
  },

  // Import book from external API
  importBookFromAPI: async (source, identifier) => {
    try {
      const response = await api.post("/books/external/import", {
        source,
        isbn: identifier.isbn || null,
        bookId: identifier.bookId || null,
      });
      return response.data;
    } catch (error) {
      console.error("Import book error:", error);
      throw error;
    }
  },

  // Get recommendations
  getRecommendations: async (bookIds, limit = 10) => {
    try {
      const params = new URLSearchParams({
        bookIds: bookIds.join(","),
        limit: limit.toString(),
      });

      const response = await api.get(
        `/books/recommendations?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error("Get recommendations error:", error);
      throw error;
    }
  },
};

export default externalBooksApi;
```

## Environment Variables

```env
# Add to server/.env

# API Keys
GOOGLE_BOOKS_API_KEY=your_google_books_api_key
BIG_BOOK_API_KEY=your_big_book_api_key

# API Rate Limiting
API_RATE_LIMIT_REQUESTS=100
API_RATE_LIMIT_WINDOW=900000

# Caching
CACHE_DURATION_BOOKS=300000
CACHE_DURATION_SEARCH=60000
```

## Implementation Checklist

### Phase 1: Core APIs ✅

- [ ] Set up Google Books API service
- [ ] Set up Gutendex API service
- [ ] Update Book model schema
- [ ] Create external books controller methods
- [ ] Test API integrations
- [ ] Add error handling and rate limiting

### Phase 2: Enhanced Features

- [ ] Implement Big Book API recommendations
- [ ] Add Open Library integration
- [ ] Create advanced search functionality
- [ ] Implement caching strategies
- [ ] Add API sync jobs

### Phase 3: Specialized APIs

- [ ] Add Harry Potter API
- [ ] Implement religious texts APIs
- [ ] Add PoetryDB integration
- [ ] Create themed book sections

### Phase 4: Optimization

- [ ] Implement background sync jobs
- [ ] Add API monitoring and logging
- [ ] Optimize database queries
- [ ] Add caching layers
- [ ] Implement rate limiting

## API Rate Limits and Best Practices

### Google Books API

- **Free tier**: 1,000 requests per day
- **Paid tier**: 10,000 requests per day
- **Implementation**: Implement caching, batch requests

### Gutendex API

- **Rate limit**: No official limit mentioned
- **Best practice**: Implement caching for popular books

### Big Book API

- **Rate limit**: Depends on subscription
- **Implementation**: Use for premium recommendations only

## Monitoring and Logging

```javascript
// server/middleware/apiLogger.js
const winston = require("winston");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: "logs/api-requests.log" }),
    new winston.transports.File({
      filename: "logs/api-errors.log",
      level: "error",
    }),
  ],
});

const apiLogger = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: duration,
      userAgent: req.get("User-Agent"),
      timestamp: new Date().toISOString(),
    });
  });

  next();
};

module.exports = apiLogger;
```

This comprehensive integration guide provides a structured approach to enhancing your book store with external API data while maintaining performance and user experience.
