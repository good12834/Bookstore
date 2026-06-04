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
