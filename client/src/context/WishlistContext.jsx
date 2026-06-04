import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { wishlistApi } from "../api/wishlistApi";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [statistics, setStatistics] = useState({
    totalItems: 0,
    itemsInCart: 0,
    outOfStockItems: 0,
    totalValue: 0,
  });

  // Calculate statistics from wishlist
  const calculateStatistics = useCallback((wishlistItems) => {
    const totalItems = wishlistItems.length;
    const itemsInCart = wishlistItems.filter((item) => item.isInCart).length;
    const outOfStockItems = wishlistItems.filter(
      (item) => item.stock <= 0
    ).length;
    const totalValue = wishlistItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    setStatistics({
      totalItems,
      itemsInCart,
      outOfStockItems,
      totalValue,
    });
  }, []);

  // Fetch wishlist data
  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlist([]);
      setStatistics({
        totalItems: 0,
        itemsInCart: 0,
        outOfStockItems: 0,
        totalValue: 0,
      });
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await wishlistApi.getWishlist();
      setWishlist(data.items || []);
      calculateStatistics(data.items || []);
    } catch (err) {
      console.error("Error fetching wishlist:", err);
      setError("Failed to fetch wishlist");
      showToast("Failed to load wishlist", "error");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, calculateStatistics, showToast]);

  // Add item to wishlist
  const addToWishlist = async (bookId, quantity = 1) => {
    if (!isAuthenticated) {
      showToast("Please log in to add items to your wishlist", "warning");
      return false;
    }

    setLoading(true);
    try {
      const response = await wishlistApi.addToWishlist(bookId);
      await fetchWishlist(); // Refresh wishlist
      showToast("Item added to wishlist", "success");
      return response;
    } catch (err) {
      console.error("Error adding to wishlist:", err);
      const message =
        err.response?.data?.message || "Failed to add item to wishlist";
      showToast(message, "error");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Remove item from wishlist
  const removeFromWishlist = async (bookId) => {
    setLoading(true);
    try {
      await wishlistApi.removeFromWishlist(bookId);
      setWishlist((prev) => prev.filter((item) => item.bookId !== bookId));
      setSelectedItems((prev) => prev.filter((id) => id !== bookId));
      calculateStatistics(wishlist.filter((item) => item.bookId !== bookId));
      showToast("Item removed from wishlist", "success");
      return true;
    } catch (err) {
      console.error("Error removing from wishlist:", err);
      const message =
        err.response?.data?.message || "Failed to remove item from wishlist";
      showToast(message, "error");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Clear entire wishlist
  const clearWishlist = async () => {
    setLoading(true);
    try {
      await wishlistApi.clearWishlist();
      setWishlist([]);
      setSelectedItems([]);
      setStatistics({
        totalItems: 0,
        itemsInCart: 0,
        outOfStockItems: 0,
        totalValue: 0,
      });
      showToast("Wishlist cleared", "success");
      return true;
    } catch (err) {
      console.error("Error clearing wishlist:", err);
      const message = err.response?.data?.message || "Failed to clear wishlist";
      showToast(message, "error");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Check if item is in wishlist
  const isInWishlist = async (bookId) => {
    try {
      const response = await wishlistApi.isInWishlist(bookId);
      return response.inWishlist;
    } catch (err) {
      console.error("Error checking wishlist status:", err);
      return false;
    }
  };

  // Add multiple items to wishlist
  const addMultipleToWishlist = async (bookIds) => {
    if (!isAuthenticated) {
      showToast("Please log in to add items to your wishlist", "warning");
      return false;
    }

    setLoading(true);
    try {
      await wishlistApi.addMultipleToWishlist(bookIds);
      await fetchWishlist();
      showToast(`${bookIds.length} items added to wishlist`, "success");
      return true;
    } catch (err) {
      console.error("Error adding multiple items to wishlist:", err);
      const message =
        err.response?.data?.message || "Failed to add items to wishlist";
      showToast(message, "error");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Remove multiple items from wishlist
  const removeMultipleFromWishlist = async (bookIds) => {
    setLoading(true);
    try {
      await wishlistApi.removeMultipleFromWishlist(bookIds);
      setWishlist((prev) =>
        prev.filter((item) => !bookIds.includes(item.bookId))
      );
      setSelectedItems((prev) => prev.filter((id) => !bookIds.includes(id)));
      calculateStatistics(
        wishlist.filter((item) => !bookIds.includes(item.bookId))
      );
      showToast(`${bookIds.length} items removed from wishlist`, "success");
      return true;
    } catch (err) {
      console.error("Error removing multiple items from wishlist:", err);
      const message =
        err.response?.data?.message || "Failed to remove items from wishlist";
      showToast(message, "error");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Toggle item selection
  const toggleItemSelection = (bookId) => {
    setSelectedItems((prev) => {
      if (prev.includes(bookId)) {
        return prev.filter((id) => id !== bookId);
      } else {
        return [...prev, bookId];
      }
    });
  };

  // Select all items
  const selectAllItems = () => {
    const allBookIds = wishlist.map((item) => item.bookId);
    setSelectedItems(allBookIds);
  };

  // Deselect all items
  const deselectAllItems = () => {
    setSelectedItems([]);
  };

  // Get selected items
  const getSelectedItems = () => {
    return wishlist.filter((item) => selectedItems.includes(item.bookId));
  };

  // Check if item is selected
  const isItemSelected = (bookId) => {
    return selectedItems.includes(bookId);
  };

  // Update item quantity
  const updateItemQuantity = async (bookId, quantity) => {
    setLoading(true);
    try {
      const response = await wishlistApi.updateItemQuantity(bookId, quantity);
      setWishlist((prev) =>
        prev.map((item) =>
          item.bookId === bookId ? { ...item, quantity } : item
        )
      );
      calculateStatistics(
        wishlist.map((item) =>
          item.bookId === bookId ? { ...item, quantity } : item
        )
      );
      showToast("Quantity updated", "success");
      return response;
    } catch (err) {
      console.error("Error updating quantity:", err);
      const message =
        err.response?.data?.message || "Failed to update quantity";
      showToast(message, "error");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Initialize context
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // Context value
  const value = {
    // State
    wishlist,
    loading,
    error,
    selectedItems,
    statistics,

    // Actions
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
    addMultipleToWishlist,
    removeMultipleFromWishlist,
    toggleItemSelection,
    selectAllItems,
    deselectAllItems,
    getSelectedItems,
    isItemSelected,
    updateItemQuantity,

    // Computed values
    hasItems: wishlist.length > 0,
    selectedCount: selectedItems.length,
    allItemsSelected:
      selectedItems.length === wishlist.length && wishlist.length > 0,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export default WishlistContext;
