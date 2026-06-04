import React, { useState } from 'react';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { Link } from 'react-router-dom';
import {
  Heart,
  Trash2,
  ShoppingCart,
  Search,
  Grid,
  List,
  SortAsc,
  SortDesc,
  BookOpen,
  Star,
  DollarSign,
  AlertTriangle,
  Check,
  X,
  Eye,
  RefreshCw,
  ChevronDown,
} from 'lucide-react';
import './Wishlist/Wishlist.css';

const Wishlist = () => {
  const {
    wishlist,
    loading,
    error,
    selectedItems,
    statistics,
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
    hasItems,
    selectedCount,
    allItemsSelected,
  } = useWishlist();

  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('dateAdded');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterBy, setFilterBy] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedBook, setSelectedBook] = useState(null);
  const [showQuickView, setShowQuickView] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter and sort options
  const sortOptions = [
    { value: 'dateAdded', label: 'Date Added' },
    { value: 'title', label: 'Title' },
    { value: 'author', label: 'Author' },
    { value: 'price', label: 'Price' },
    { value: 'rating', label: 'Rating' },
  ];

  const filterOptions = [
    { value: 'all', label: 'All Books' },
    { value: 'notInCart', label: 'Not in Cart' },
    { value: 'inCart', label: 'In Cart' },
    { value: 'outOfStock', label: 'Out of Stock' },
  ];

  // Filter and sort wishlist
  const filteredWishlist = wishlist
    .filter(item => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.genre && item.genre.toLowerCase().includes(searchTerm.toLowerCase()));

      switch (filterBy) {
        case 'notInCart':
          return matchesSearch && !item.isInCart;
        case 'inCart':
          return matchesSearch && item.isInCart;
        case 'outOfStock':
          return matchesSearch && item.stock <= 0;
        default:
          return matchesSearch;
      }
    })
    .sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'author':
          aValue = a.author.toLowerCase();
          bValue = b.author.toLowerCase();
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'rating':
          aValue = a.averageRating || 0;
          bValue = b.averageRating || 0;
          break;
        default:
          aValue = new Date(a.dateAdded);
          bValue = new Date(b.dateAdded);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Quick view handlers
  const openQuickView = (book) => {
    setSelectedBook(book);
    setShowQuickView(true);
  };

  const closeQuickView = () => {
    setSelectedBook(null);
    setShowQuickView(false);
  };

  // Helper to convert wishlist item to cart-compatible book object
  const toCartBook = (item) => ({
    id: item.bookId,
    bookId: item.bookId,
    title: item.title,
    author: item.author,
    price: item.price,
    imageUrl: item.coverImage,
    stock: item.stock,
  });

  // Bulk action handlers
  const handleBulkAddToCart = async () => {
    const selectedBooks = getSelectedItems().filter(item => item.stock > 0);
    if (selectedBooks.length === 0) {
      showToast('No available items selected', 'warning');
      return;
    }

    let successCount = 0;
    for (const item of selectedBooks) {
      const bookObj = toCartBook(item);
      addToCart(bookObj, item.quantity || 1);
      successCount++;
    }

    if (successCount > 0) {
      showToast(`${successCount} items added to cart`, 'success');
      deselectAllItems();
    }
  };

  const handleBulkRemove = async () => {
    const success = await removeMultipleFromWishlist(selectedItems);
    if (success) {
      deselectAllItems();
    }
  };

  const handleMoveAllToCart = async () => {
    const availableBooks = wishlist.filter(item => item.stock > 0);
    if (availableBooks.length === 0) {
      showToast('No available items to move', 'warning');
      return;
    }

    let successCount = 0;
    for (const item of availableBooks) {
      const bookObj = toCartBook(item);
      addToCart(bookObj, item.quantity || 1);
      successCount++;
    }

    if (successCount > 0) {
      showToast(`${successCount} items moved to cart`, 'success');
    }
  };

  const handleClearWishlist = async () => {
    const success = await clearWishlist();
    if (success) {
      setShowClearConfirm(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchWishlist();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Single item handlers
  const handleAddToCart = (item, quantity = 1) => {
    if (item.stock <= 0) {
      showToast('This item is out of stock', 'warning');
      return;
    }
    const bookObj = toCartBook(item);
    addToCart(bookObj, quantity);
    showToast('Added to cart', 'success');
  };

  const handleRemoveItem = async (bookId) => {
    const success = await removeFromWishlist(bookId);
    if (success) {
      showToast('Removed from wishlist', 'success');
    }
  };

  // Render a single book item (used in both grid and list view)
  const renderBookItem = (item) => {
    const isList = viewMode === 'list';
    return (
      <div
        key={item.bookId}
        className={isList ? 'book-list-item' : 'book-grid-item'}
      >
        {/* Selection checkbox */}
        <input
          type="checkbox"
          checked={isItemSelected(item.bookId)}
          onChange={() => toggleItemSelection(item.bookId)}
          className="item-checkbox"
        />

        {/* Book image */}
        <div className={`item-image-wrap ${isList ? 'list' : 'grid'}`}>
          <img
            src={item.coverImage || 'https://placehold.co/400x600/f5f0e8/c8893a?text=Book'}
            alt={item.title}
            className="item-image"
          />
        </div>

        {/* Book details */}
        <div className={`item-content ${isList ? 'list' : ''}`}>
          <div className="item-title-row">
            <h3 className="item-title">{item.title}</h3>
          </div>

          <p className="item-author">{item.author}</p>

          {item.genre && <p className="item-genre">{item.genre}</p>}

          {/* Rating */}
          {item.averageRating > 0 && (
            <div className="item-rating">
              <Star className="star-icon" />
              <span className="rating-text">
                {item.averageRating.toFixed(1)} ({item.reviewCount || 0})
              </span>
            </div>
          )}

          {/* Price and stock */}
          <div className="price-stock-row">
            <div className="price-wrap">
              <span className="current-price">${parseFloat(item.price).toFixed(2)}</span>
              {item.originalPrice && item.originalPrice > item.price && (
                <span className="original-price">${parseFloat(item.originalPrice).toFixed(2)}</span>
              )}
            </div>

            {item.stock > 0 ? (
              <span className="stock-badge in-stock">
                <Check className="badge-icon" />
                In Stock ({item.stock})
              </span>
            ) : (
              <span className="stock-badge out-of-stock">
                <X className="badge-icon" />
                Out of Stock
              </span>
            )}
          </div>

          {/* Status indicators */}
          <div className="status-row">
            {item.isInCart && (
              <span className="in-cart-badge">
                <ShoppingCart className="badge-icon" />
                In Cart
              </span>
            )}
            <span className="date-added">
              Added {new Date(item.dateAdded).toLocaleDateString()}
            </span>
          </div>

          {/* Actions */}
          <div className="item-actions">
            <button
              onClick={() => openQuickView(item)}
              className="action-btn"
            >
              <Eye className="badge-icon" />
              Quick View
            </button>

            {item.stock > 0 ? (
              <button
                onClick={() => handleAddToCart(item, item.quantity || 1)}
                className="action-btn-primary"
              >
                <ShoppingCart className="badge-icon" />
                Add to Cart
              </button>
            ) : (
              <button
                disabled
                className="action-btn-primary"
                style={{ opacity: 0.5, cursor: 'not-allowed', background: '#9ca3af' }}
              >
                Out of Stock
              </button>
            )}

            <button
              onClick={() => handleRemoveItem(item.bookId)}
              className="action-btn-danger"
              title="Remove from wishlist"
            >
              <Trash2 className="badge-icon" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (loading && !hasItems) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated state
  if (!isAuthenticated) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-container">
          <div className="empty-state">
            <Heart className="empty-icon" />
            <h2 className="empty-title">Please Sign In</h2>
            <p className="empty-text">
              Sign in to view and manage your wishlist
            </p>
            <Link to="/login" className="empty-link">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!loading && !hasItems) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-container">
          <div className="empty-state">
            <Heart className="empty-icon" />
            <h2 className="empty-title">Your Wishlist is Empty</h2>
            <p className="empty-text">
              Start adding books you love to your wishlist
            </p>
            <Link to="/shop" className="empty-link">
              Browse Books
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="wishlist-container">
        {/* Header */}
        <div className="wishlist-header">
          <div className="wishlist-title-wrap">
            <Heart className="wishlist-icon" />
            <h1 className="wishlist-title">My Wishlist</h1>
          </div>

          <div className="wishlist-actions">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="btn-wishlist-secondary"
            >
              <RefreshCw
                className="badge-icon"
                style={isRefreshing ? { animation: 'spin 0.6s linear infinite' } : {}}
              />
              Refresh
            </button>

            <button
              onClick={() => setShowClearConfirm(true)}
              className="btn-wishlist-danger"
            >
              <Trash2 className="badge-icon" />
              Clear All
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="wishlist-stats">
          <div className="stat-card">
            <div className="stat-card-inner">
              <BookOpen className="stat-icon blue" />
              <div className="stat-info">
                <p className="stat-label">Total Items</p>
                <p className="stat-value">{statistics.totalItems}</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-inner">
              <ShoppingCart className="stat-icon green" />
              <div className="stat-info">
                <p className="stat-label">In Cart</p>
                <p className="stat-value">{statistics.itemsInCart}</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-inner">
              <AlertTriangle className="stat-icon yellow" />
              <div className="stat-info">
                <p className="stat-label">Out of Stock</p>
                <p className="stat-value">{statistics.outOfStockItems}</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-inner">
              <DollarSign className="stat-icon purple" />
              <div className="stat-info">
                <p className="stat-label">Total Value</p>
                <p className="stat-value">${statistics.totalValue.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="controls-bar">
          <div className="controls-inner">
            <div className="controls-row">
              {/* Search */}
              <div className="search-wrap">
                <Search className="search-icon" />
                <input
                  type="text"
                  placeholder="Search books..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>

              {/* Filter and Sort */}
              <div className="control-group">
                <div className="select-wrap">
                  <select
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value)}
                  >
                    {filterOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="select-chevron" />
                </div>

                <div className="select-wrap">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="select-chevron" />
                </div>

                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="btn-icon"
                  title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                >
                  {sortOrder === 'asc' ? <SortAsc className="badge-icon" /> : <SortDesc className="badge-icon" />}
                </button>

                <div className="view-toggle">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={viewMode === 'grid' ? 'active' : ''}
                    title="Grid view"
                  >
                    <Grid className="badge-icon" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={viewMode === 'list' ? 'active' : ''}
                    title="List view"
                  >
                    <List className="badge-icon" />
                  </button>
                </div>
              </div>
            </div>

            {/* Bulk Actions */}
            {hasItems && (
              <div className="bulk-actions">
                <div className="bulk-inner">
                  <div className="bulk-left">
                    <label className="bulk-checkbox-label">
                      <input
                        type="checkbox"
                        checked={allItemsSelected}
                        onChange={allItemsSelected ? deselectAllItems : selectAllItems}
                      />
                      <span className="bulk-checkbox-text">
                        {allItemsSelected ? 'Deselect All' : 'Select All'} ({filteredWishlist.length} items)
                      </span>
                    </label>

                    {selectedCount > 0 && (
                      <span className="bulk-selected-count">
                        {selectedCount} selected
                      </span>
                    )}
                  </div>

                  {selectedCount > 0 && (
                    <div className="bulk-right">
                      <button
                        onClick={handleBulkAddToCart}
                        className="btn-wishlist-success"
                      >
                        <ShoppingCart className="badge-icon" />
                        Add to Cart ({selectedCount})
                      </button>

                      <button
                        onClick={handleBulkRemove}
                        className="btn-wishlist-danger"
                      >
                        <Trash2 className="badge-icon" />
                        Remove ({selectedCount})
                      </button>
                    </div>
                  )}
                </div>

                {/* Move All to Cart */}
                <div className="move-all-wrap">
                  <button
                    onClick={handleMoveAllToCart}
                    className="btn-wishlist-primary"
                  >
                    <ShoppingCart className="badge-icon" />
                    Move All Available to Cart
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Book Grid/List */}
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        ) : filteredWishlist.length === 0 ? (
          <div className="empty-state">
            <BookOpen className="empty-icon" />
            <h3 className="empty-title">No books found</h3>
            <p className="empty-text">
              {searchTerm ? 'Try adjusting your search or filters' : 'Start adding books to your wishlist'}
            </p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'book-grid' : ''}>
            {filteredWishlist.map(renderBookItem)}
          </div>
        )}

        {/* Clear Confirmation Modal */}
        {showClearConfirm && (
          <div className="modal-overlay" onClick={() => setShowClearConfirm(false)}>
            <div className="modal-content sm" onClick={e => e.stopPropagation()}>
              <div style={{ textAlign: 'center' }}>
                <AlertTriangle className="confirm-icon" />
                <h3 className="confirm-title">Clear Wishlist</h3>
                <p className="confirm-text">
                  Are you sure you want to remove all items from your wishlist? This action cannot be undone.
                </p>
                <div className="confirm-actions">
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="btn-cancel"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleClearWishlist}
                    className="btn-confirm-danger"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick View Modal */}
        {showQuickView && selectedBook && (
          <div className="modal-overlay" onClick={closeQuickView}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">Book Details</h3>
                <button onClick={closeQuickView} className="modal-close">
                  <X size={24} />
                </button>
              </div>

              <div className="modal-grid">
                <div>
                  <img
                    src={selectedBook.coverImage || 'https://placehold.co/400x600/f5f0e8/c8893a?text=Book'}
                    alt={selectedBook.title}
                    className="qv-image"
                  />
                </div>

                <div>
                  <h2 className="qv-title">{selectedBook.title}</h2>
                  <p className="qv-author">by {selectedBook.author}</p>

                  {selectedBook.description && (
                    <p className="qv-desc">{selectedBook.description}</p>
                  )}

                  <div className="qv-price-row">
                    <span className="qv-price">${parseFloat(selectedBook.price).toFixed(2)}</span>
                    {selectedBook.originalPrice && selectedBook.originalPrice > selectedBook.price && (
                      <span className="qv-original-price">
                        ${parseFloat(selectedBook.originalPrice).toFixed(2)}
                      </span>
                    )}
                  </div>

                  <div className="qv-badges">
                    {selectedBook.stock > 0 ? (
                      <span className="stock-badge in-stock">
                        In Stock ({selectedBook.stock})
                      </span>
                    ) : (
                      <span className="stock-badge out-of-stock">
                        Out of Stock
                      </span>
                    )}

                    {selectedBook.isInCart && (
                      <span className="in-cart-badge">In Cart</span>
                    )}
                  </div>

                  <div className="qv-actions">
                    {selectedBook.stock > 0 && (
                      <button
                        onClick={() => {
                          handleAddToCart(selectedBook, selectedBook.quantity || 1);
                          closeQuickView();
                        }}
                        className="btn-wishlist-success"
                        style={{ flex: 1 }}
                      >
                        <ShoppingCart className="badge-icon" />
                        Add to Cart
                      </button>
                    )}

                    <button
                      onClick={() => {
                        handleRemoveItem(selectedBook.bookId);
                        closeQuickView();
                      }}
                      className="btn-wishlist-danger"
                      style={{ flex: 1 }}
                    >
                      <Trash2 className="badge-icon" />
                      Remove from Wishlist
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;