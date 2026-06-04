const axios = require("axios");

class GoogleBooksService {
  constructor() {
    this.baseURL = "https://www.googleapis.com/books/v1/volumes";
    this.apiKey = process.env.GOOGLE_BOOKS_API_KEY || null;
    this.cache = new Map();
    this.cacheDuration = 30 * 60 * 1000; // 30 minutes
  }

  /**
   * Search for books using Google Books API
   * @param {string} query - Search query (title, author, ISBN, etc.)
   * @param {object} options - Search options
   * @returns {Promise<Array>} Array of book objects
   */
  async searchBooks(query, options = {}) {
    try {
      const cacheKey = `search_${query}_${JSON.stringify(options)}`;

      // Check cache first
      if (this.isValidCache(cacheKey)) {
        console.log("📚 Google Books search served from cache");
        return this.cache.get(cacheKey).data;
      }

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

      console.log(`🔍 Searching Google Books for: "${query}"`);
      const response = await axios.get(this.baseURL, { params });
      const books = this.transformGoogleBooksData(response.data.items || []);

      // Cache the results
      this.setCache(cacheKey, books);

      console.log(`✅ Found ${books.length} books for query: "${query}"`);
      return books;
    } catch (error) {
      console.error("❌ Google Books API Error:", error.message);

      // Handle specific error cases
      if (error.response) {
        const { status, data } = error.response;
        switch (status) {
          case 400:
            throw new Error("Invalid search query");
          case 403:
            if (data.error && data.error.message.includes("API key")) {
              throw new Error("Invalid or missing Google Books API key");
            }
            throw new Error("API rate limit exceeded or access forbidden");
          case 429:
            throw new Error("Too many requests. Please try again later");
          default:
            throw new Error(
              `Google Books API error: ${
                data.error?.message || "Unknown error"
              }`
            );
        }
      }

      throw new Error("Failed to connect to Google Books API");
    }
  }

  /**
   * Get book details by ISBN
   * @param {string} isbn - ISBN-10 or ISBN-13
   * @returns {Promise<object|null>} Book object or null if not found
   */
  async getBookByISBN(isbn) {
    try {
      const cacheKey = `isbn_${isbn}`;

      // Check cache first
      if (this.isValidCache(cacheKey)) {
        console.log(`📚 Book ISBN ${isbn} served from cache`);
        return this.cache.get(cacheKey).data;
      }

      const params = {
        q: `isbn:${isbn}`,
        maxResults: 1,
      };

      if (this.apiKey) {
        params.key = this.apiKey;
      }

      console.log(`🔍 Searching Google Books for ISBN: ${isbn}`);
      const response = await axios.get(this.baseURL, { params });
      const items = response.data.items || [];

      if (items.length === 0) {
        console.log(`❌ No book found for ISBN: ${isbn}`);
        return null;
      }

      const book = this.transformGoogleBooksData([items[0]])[0];

      // Cache the result
      this.setCache(cacheKey, book);

      console.log(`✅ Found book for ISBN ${isbn}: "${book.title}"`);
      return book;
    } catch (error) {
      console.error(
        `❌ Google Books ISBN Search Error for ${isbn}:`,
        error.message
      );
      throw error;
    }
  }

  /**
   * Get popular books by category
   * @param {string} category - Book category
   * @param {object} options - Search options
   * @returns {Promise<Array>} Array of popular books
   */
  async getPopularBooksByCategory(category, options = {}) {
    try {
      const query = `subject:${category}`;
      const searchOptions = {
        ...options,
        orderBy: "relevance",
        maxResults: options.maxResults || 20,
      };

      return await this.searchBooks(query, searchOptions);
    } catch (error) {
      console.error(
        `❌ Error fetching popular ${category} books:`,
        error.message
      );
      throw error;
    }
  }

  /**
   * Get book recommendations based on a book ID
   * @param {string} googleBookId - Google Books volume ID
   * @returns {Promise<Array>} Array of recommended books
   */
  async getRecommendations(googleBookId) {
    try {
      // Get the original book to find similar subjects
      const book = await this.getBookByGoogleId(googleBookId);
      if (!book || !book.categories || book.categories.length === 0) {
        return [];
      }

      // Search for books in the same categories
      const category = book.categories[0];
      const recommendations = await this.searchBooks(`subject:${category}`, {
        maxResults: 10,
        orderBy: "relevance",
      });

      // Filter out the original book
      return recommendations.filter(
        (book) => book.googleBooksId !== googleBookId
      );
    } catch (error) {
      console.error("❌ Error getting book recommendations:", error.message);
      throw error;
    }
  }

  /**
   * Get book details by Google Books ID
   * @param {string} googleBookId - Google Books volume ID
   * @returns {Promise<object|null>} Book object or null
   */
  async getBookByGoogleId(googleBookId) {
    try {
      const cacheKey = `google_${googleBookId}`;

      if (this.isValidCache(cacheKey)) {
        return this.cache.get(cacheKey).data;
      }

      const url = `${this.baseURL}/${googleBookId}`;
      const params = {};

      if (this.apiKey) {
        params.key = this.apiKey;
      }

      console.log(`🔍 Fetching Google Books details for ID: ${googleBookId}`);
      const response = await axios.get(url, { params });
      const book = this.transformGoogleBooksData([response.data])[0];

      this.setCache(cacheKey, book);
      return book;
    } catch (error) {
      console.error(
        `❌ Error fetching Google Books details for ${googleBookId}:`,
        error.message
      );
      throw error;
    }
  }

  /**
   * Transform Google Books API data to our format
   * @param {Array} items - Google Books API items
   * @returns {Array} Transformed book objects
   */
  transformGoogleBooksData(items) {
    return items.map((item) => {
      const volumeInfo = item.volumeInfo || {};
      const saleInfo = item.saleInfo || {};
      const accessInfo = item.accessInfo || {};

      return {
        googleBooksId: item.id,
        title: volumeInfo.title || "Unknown Title",
        subtitle: volumeInfo.subtitle || "",
        authors: volumeInfo.authors || [],
        author: volumeInfo.authors
          ? volumeInfo.authors.join(", ")
          : "Unknown Author",
        description: this.cleanDescription(volumeInfo.description || ""),
        publishedDate: volumeInfo.publishedDate,
        publisher: volumeInfo.publisher,
        categories: volumeInfo.categories || [],
        category: volumeInfo.categories ? volumeInfo.categories[0] : "General",
        language: this.normalizeLanguage(volumeInfo.language),
        pageCount: volumeInfo.pageCount,
        averageRating: parseFloat(volumeInfo.averageRating) || null,
        ratingsCount: volumeInfo.ratingsCount || 0,
        isbn10: this.extractISBN(volumeInfo.industryIdentifiers, "ISBN_10"),
        isbn13: this.extractISBN(volumeInfo.industryIdentifiers, "ISBN_13"),
        imageLinks: volumeInfo.imageLinks,
        thumbnail: this.getThumbnailURL(volumeInfo.imageLinks),
        previewLink: volumeInfo.previewLink,
        infoLink: volumeInfo.infoLink,
        canonicalVolumeLink: volumeInfo.canonicalVolumeLink,
        maturityRating: volumeInfo.maturityRating,
        contentVersion: volumeInfo.contentVersion,
        saleInfo: {
          country: saleInfo.country,
          saleability: saleInfo.saleability,
          isEbook: saleInfo.isEbook || false,
          listPrice: saleInfo.listPrice
            ? {
                amount: saleInfo.listPrice.amount,
                currencyCode: saleInfo.listPrice.currencyCode,
              }
            : null,
          retailPrice: saleInfo.retailPrice
            ? {
                amount: saleInfo.retailPrice.amount,
                currencyCode: saleInfo.retailPrice.currencyCode,
              }
            : null,
        },
        accessInfo: {
          country: accessInfo.country,
          viewability: accessInfo.viewability,
          embeddable: accessInfo.embeddable,
          publicDomain: accessInfo.publicDomain,
          textToSpeechPermission: accessInfo.textToSpeechPermission,
          epub: {
            isAvailable: accessInfo.epub?.isAvailable || false,
            downloadLink: accessInfo.epub?.downloadLink,
          },
          pdf: {
            isAvailable: accessInfo.pdf?.isAvailable || false,
            downloadLink: accessInfo.pdf?.downloadLink,
          },
          webReaderLink: accessInfo.webReaderLink,
          accessViewStatus: accessInfo.accessViewStatus,
        },
        searchInfo: {
          textSnippet: volumeInfo.searchInfo?.textSnippet || "",
        },
      };
    });
  }

  /**
   * Clean HTML description text
   * @param {string} description - Raw description from API
   * @returns {string} Cleaned description
   */
  cleanDescription(description) {
    if (!description) return "";

    // Remove HTML tags and decode HTML entities
    return description
      .replace(/<[^>]*>/g, "") // Remove HTML tags
      .replace(/"/g, '"') // Decode quotes
      .replace(/&/g, "&") // Decode ampersands
      .replace(/</g, "<") // Decode less than
      .replace(/>/g, ">") // Decode greater than
      .replace(/'/g, "'") // Decode apostrophes
      .replace(/&nbsp;/g, " ") // Decode non-breaking spaces
      .trim();
  }

  /**
   * Extract specific ISBN type from identifiers
   * @param {Array} identifiers - Industry identifiers array
   * @param {string} type - ISBN type (ISBN_10 or ISBN_13)
   * @returns {string|null} ISBN value or null
   */
  extractISBN(identifiers, type) {
    if (!identifiers || !Array.isArray(identifiers)) return null;

    const isbn = identifiers.find((id) => id.type === type);
    return isbn ? isbn.identifier : null;
  }

  /**
   * Get thumbnail URL from image links
   * @param {object} imageLinks - Image links object
   * @returns {string|null} Thumbnail URL or null
   */
  getThumbnailURL(imageLinks) {
    if (!imageLinks) return null;

    // Try different thumbnail sizes
    return (
      imageLinks.thumbnail ||
      imageLinks.smallThumbnail ||
      imageLinks.small ||
      imageLinks.medium ||
      imageLinks.large ||
      imageLinks.extraLarge ||
      null
    );
  }

  /**
   * Normalize language code
   * @param {string} language - Language code from API
   * @returns {string} Normalized language
   */
  normalizeLanguage(language) {
    if (!language) return "English";

    // Common language mappings
    const languageMap = {
      en: "English",
      es: "Spanish",
      fr: "French",
      de: "German",
      it: "Italian",
      pt: "Portuguese",
      ru: "Russian",
      ja: "Japanese",
      zh: "Chinese",
      ar: "Arabic",
      hi: "Hindi",
      ko: "Korean",
    };

    return languageMap[language.toLowerCase()] || language;
  }

  /**
   * Cache management methods
   */
  isValidCache(key) {
    if (!this.cache.has(key)) return false;

    const cached = this.cache.get(key);
    return Date.now() - cached.timestamp < this.cacheDuration;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  clearCache() {
    this.cache.clear();
    console.log("🧹 Google Books API cache cleared");
  }

  getCacheStats() {
    const entries = Array.from(this.cache.entries());
    const now = Date.now();

    return {
      totalEntries: entries.length,
      validEntries: entries.filter(
        ([_, value]) => now - value.timestamp < this.cacheDuration
      ).length,
      expiredEntries: entries.filter(
        ([_, value]) => now - value.timestamp >= this.cacheDuration
      ).length,
      cacheHitRate: this.calculateHitRate(),
    };
  }

  calculateHitRate() {
    // This would need to be implemented with actual hit tracking
    return "N/A - Implement hit tracking for accurate rate";
  }
}

module.exports = new GoogleBooksService();
