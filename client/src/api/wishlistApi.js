import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

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

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Wishlist API functions
export const wishlistApi = {
  // Get user's wishlist
  getWishlist: async () => {
    try {
      const response = await api.get("/wishlist");
      return response.data;
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      throw error;
    }
  },

  // Add book to wishlist
  addToWishlist: async (bookData) => {
    try {
      // Handle both object {bookId, quantity} and just bookId
      const payload =
        typeof bookData === "object" ? bookData : { bookId: bookData };
      const response = await api.post("/wishlist", payload);
      return response.data;
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      throw error;
    }
  },

  // Remove book from wishlist
  removeFromWishlist: async (bookId) => {
    try {
      const response = await api.delete(`/wishlist/${bookId}`);
      return response.data;
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      throw error;
    }
  },

  // Clear entire wishlist
  clearWishlist: async () => {
    try {
      const response = await api.delete("/wishlist/clear");
      return response.data;
    } catch (error) {
      console.error("Error clearing wishlist:", error);
      throw error;
    }
  },

  // Check if book is in wishlist
  isInWishlist: async (bookId) => {
    try {
      const response = await api.get(`/wishlist/check/${bookId}`);
      return response.data;
    } catch (error) {
      console.error("Error checking wishlist status:", error);
      throw error;
    }
  },

  // Add multiple books to wishlist
  addMultipleToWishlist: async (bookIds) => {
    try {
      const response = await api.post("/wishlist/bulk", { bookIds });
      return response.data;
    } catch (error) {
      console.error("Error adding multiple books to wishlist:", error);
      throw error;
    }
  },

  // Remove multiple books from wishlist
  removeMultipleFromWishlist: async (bookIds) => {
    try {
      const response = await api.delete("/wishlist/bulk", {
        data: { bookIds },
      });
      return response.data;
    } catch (error) {
      console.error("Error removing multiple books from wishlist:", error);
      throw error;
    }
  },
};

export default api;
