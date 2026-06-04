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
