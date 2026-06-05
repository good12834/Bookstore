import axios from "axios";

// Use relative path in production (same domain), fallback to localhost for development
const API_BASE_URL = import.meta.env.DEV
  ? "http://localhost:5000/api"
  : "/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Simple in-memory cache
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCacheKey = (url, params = {}) => {
  return `${url}?${JSON.stringify(params)}`;
};

const isValidCache = (timestamp) => {
  return Date.now() - timestamp < CACHE_DURATION;
};

// Books API functions
export const booksApi = {
  // Get all books with optional filters
  getAllBooks: async (filters = {}) => {
    const cacheKey = getCacheKey("/books", filters);

    // Check cache first
    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      if (isValidCache(cached.timestamp)) {
        console.log("📚 Books data served from cache");
        return cached.data;
      }
    }

    try {
      const params = new URLSearchParams();

      // Add filters
      if (filters.search) params.append("search", filters.search);
      if (filters.category) params.append("category", filters.category);
      if (filters.minPrice) params.append("minPrice", filters.minPrice);
      if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
      if (filters.rating) params.append("rating", filters.rating);
      if (filters.language) params.append("language", filters.language);

      const response = await api.get(`/books?${params.toString()}`);
      const data = response.data;

      // Cache the result
      cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      console.log("📚 Books data fetched from API and cached");
      return data;
    } catch (error) {
      console.error("Error fetching books:", error);
      throw error;
    }
  },

  // Get books with basic filtering (no cache)
  getBooks: async (filters = {}) => {
    return booksApi.getAllBooks(filters);
  },

  // Get categories
  getCategories: async () => {
    const cacheKey = "/books/categories";

    // Check cache
    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      if (isValidCache(cached.timestamp)) {
        return cached.data;
      }
    }

    try {
      const response = await api.get("/books/categories");
      const data = response.data;

      // Cache the result
      cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      return data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  },

  // Get book by ID
  getBookById: async (id) => {
    const cacheKey = `/books/${id}`;

    // Check cache
    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      if (isValidCache(cached.timestamp)) {
        return cached.data;
      }
    }

    try {
      const response = await api.get(`/books/${id}`);
      const data = response.data;

      // Cache the result
      cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      return data;
    } catch (error) {
      console.error("Error fetching book by ID:", error);
      throw error;
    }
  },

  // Get featured books
  getFeaturedBooks: async () => {
    const cacheKey = "/books/featured";

    // Check cache
    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      if (isValidCache(cached.timestamp)) {
        return cached.data;
      }
    }

    try {
      const response = await api.get("/books/featured");
      const data = response.data;

      // Cache the result
      cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      return data;
    } catch (error) {
      console.error("Error fetching featured books:", error);
      throw error;
    }
  },

  // Get bestsellers
  getBestsellers: async () => {
    const cacheKey = "/books/bestsellers";

    // Check cache
    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      if (isValidCache(cached.timestamp)) {
        return cached.data;
      }
    }

    try {
      const response = await api.get("/books/bestsellers");
      const data = response.data;

      // Cache the result
      cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      return data;
    } catch (error) {
      console.error("Error fetching bestsellers:", error);
      throw error;
    }
  },

  // Get trending/new arrivals
  getTrendingBooks: async () => {
    const cacheKey = "/books/trending";

    // Check cache
    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      if (isValidCache(cached.timestamp)) {
        return cached.data;
      }
    }

    try {
      const response = await api.get("/books/trending");
      const data = response.data;

      // Cache the result
      cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      return data;
    } catch (error) {
      console.error("Error fetching trending books:", error);
      throw error;
    }
  },

  // Get free books
  getFreeBooks: async () => {
    const cacheKey = "/books/free";

    // Check cache
    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      if (isValidCache(cached.timestamp)) {
        return cached.data;
      }
    }

    try {
      const response = await api.get("/books/free");
      const data = response.data;

      // Cache the result
      cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      return data;
    } catch (error) {
      console.error("Error fetching free books:", error);
      throw error;
    }
  },

  // Clear cache
  clearCache: () => {
    cache.clear();
    console.log("📚 Books API cache cleared");
  },

  // Get cache status
  getCacheInfo: () => {
    const entries = Array.from(cache.entries());
    return {
      size: entries.length,
      entries: entries.map(([key, value]) => ({
        key,
        timestamp: value.timestamp,
        isValid: isValidCache(value.timestamp),
      })),
    };
  },
};

export default api;
