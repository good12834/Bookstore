import React, { useState, useEffect, useCallback, useRef } from "react";
import "../Shope/Shop.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "./../../context/CartContext";
import { useWishlist } from "./../../context/WishlistContext";
import { useToast } from "./../../context/ToastContext";
import { booksApi } from "./../../api/booksApi";
import { externalBooksApi } from "./../../api/externalBooksApi";


/* ── Helpers ── */
const renderStars = (rating) =>
  Array.from({ length: 5 }, (_, i) => (
    <i
      key={i}
      className={`bi bi-star${i < rating ? "-fill star-filled" : " star-empty"}`}
    />
  ));

const calcRating = (reviews = []) =>
  reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

/* ══════════════════════════════════════════
   FEATURED CARD
══════════════════════════════════════════ */
const FeaturedCard = ({ book, onAddToCart, onAddToWishlist, isInWishlist }) => {
  const rating = calcRating(book.Reviews);
  const reviewCount = book.Reviews?.length ?? 0;
  const inWishlist = book.id ? isInWishlist(book.id) : false;

  return (
    <div className="featured-card-shop" style={{ position: 'relative' }}>
      <div className="featured-img-wrap">
        <img
          src={
            book.imageUrl ||
            "https://placehold.co/400x600/f5f0e8/c8893a?text=Book"
          }
          alt={book.title}
        />
        <div className="featured-gradient" />
        <span className="book-tag book-tag-featured">Featured</span>
        <span className="book-img-price">${book.price}</span>
        <button
          onClick={() => onAddToWishlist(book)}
          title={inWishlist ? "In Wishlist" : "Add to Wishlist"}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: inWishlist ? '#ef4444' : '#fff',
            background: 'rgba(0,0,0,0.3)',
            border: 'none',
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 2,
          }}
        >
          <i className={`bi ${inWishlist ? 'bi-heart-fill' : 'bi-heart'}`} style={{ fontSize: 14 }} />
        </button>
      </div>
      <div className="book-card-body">
        <div className="book-stars">
          {renderStars(Math.round(rating))}
          <span className="book-review-count">({reviewCount})</span>
        </div>
        <h5 className="book-title">{book.title}</h5>
        <p className="book-author">{book.author}</p>
        <div className="book-card-actions">
          <button
            className="btn-add-cart-shop"
            onClick={() => onAddToCart(book)}
          >
            <i className="bi bi-bag-plus" /> Add to Cart
          </button>
        </div>
      </div>
    </div>
);
};

/* ══════════════════════════════════════════
   MAIN SHOP
══════════════════════════════════════════ */
const BookCard = ({ book, isExternal, onAddToCart, onAddToWishlist, isInWishlist }) => {
  const rating = isExternal
    ? (book.averageRating ?? 0)
    : calcRating(book.Reviews);
  const reviewCount = isExternal
    ? (book.ratingsCount ?? 0)
    : (book.Reviews?.length ?? 0);
  const price = isExternal ? (book.isFree ? "Free" : "N/A") : `$${book.price}`;
  const isFree = isExternal && book.isFree;
  const inWishlist = book.id ? isInWishlist(book.id) : false;

  return (
    <div className="book-card-shop">
      <div className="book-img-wrap">
        <img
          src={
            (isExternal ? book.thumbnail || book.coverImage : book.imageUrl) ||
            "https://placehold.co/400x600/f5f0e8/c8893a?text=Book"
          }
          alt={book.title}
        />
        <span className={`book-img-price${isFree ? " free" : ""}`}>
          {price}
        </span>
        {isExternal && (
          <span className="book-tag book-tag-external">
            <i className="bi bi-globe2 me-1" style={{ fontSize: 9 }} />
            External
          </span>
        )}
        <div className="book-overlay">
          {isExternal ? (
            <button
              className="btn-overlay"
              onClick={() =>
                window.open(book.infoLink || book.previewLink, "_blank")
              }
            >
              View Details
            </button>
          ) : (
            <button className="btn-overlay" onClick={() => onAddToCart(book)}>
              <i className="bi bi-bag-plus me-2" />
              Add to Cart
            </button>
          )}
        </div>
      </div>
      <div className="book-card-body">
        <div className="book-stars">
          {renderStars(Math.round(rating))}
          <span className="book-review-count">({reviewCount})</span>
        </div>
        <h5 className="book-title">{book.title}</h5>
        <p className="book-author">{book.author || "Unknown Author"}</p>
        <div className="book-card-actions">
          {isExternal ? (
            <>
              <button
                className="btn-view-ext"
                onClick={() =>
                  window.open(book.infoLink || book.previewLink, "_blank")
                }
              >
                View Details
              </button>

              <button className="btn-import-ext" title="Import to store">
                <i className="bi bi-cloud-download" />
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', width: '100%' }}>
              <button
                className="btn-add-cart-shop"
                onClick={() => onAddToCart(book)}
                style={{ flex: 1 }}
              >
                <i className="bi bi-bag-plus" /> Add to Cart
              </button>
              <button
                onClick={() => onAddToWishlist(book)}
                title={inWishlist ? "In Wishlist" : "Add to Wishlist"}
                style={{
                  color: inWishlist ? '#ef4444' : '#9ca3af',
                  border: '1px solid #e5e7eb',
                  background: '#fff',
                  borderRadius: '50%',
                  width: 36,
                  height: 36,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  flexShrink: 0,
                }}
              >
                <i className={`bi ${inWishlist ? 'bi-heart-fill' : 'bi-heart'}`} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

     
/* ══════════════════════════════════════════
   MAIN SHOP
══════════════════════════════════════════ */
const Shop = () => {
  const [books, setBooks] = useState([]);
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    category: "",
    minPrice: 0,
    maxPrice: 100,
    rating: 0,
    search: "",
  });
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [searchSource, setSearchSource] = useState("local");
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const searchTimeoutRef = useRef(null);
  const { addToCart } = useCart();
  const { addToWishlist, wishlist } = useWishlist();
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  /* Init from URL */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const s = params.get("search");
    const cat = params.get("category");
    if (s) {
      setSearchTerm(s);
      setFilters((p) => ({ ...p, search: s }));
    }
    if (cat) setFilters((p) => ({ ...p, category: cat }));
  }, []);

  /* Debounce search */
  useEffect(() => {
    clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      if (searchTerm !== filters.search) {
        setFilters((p) => ({ ...p, search: searchTerm }));
        navigate(
          searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : "?",
          { replace: true },
        );
      }
    }, 300);
    return () => clearTimeout(searchTimeoutRef.current);
  }, [searchTerm, navigate]);

  /* Fetch */
  useEffect(() => {
    fetchBooks();
  }, [filters, priceRange, searchSource]);
  useEffect(() => {
    fetchCategories();
    fetchFeaturedBooks();
  }, []);

  const fetchBooks = useCallback(async () => {
    setIsLoading(true);
    try {
      if (filters.search) booksApi.clearCache?.();

      if (searchSource === "external" && filters.search) {
        const ext = await externalBooksApi.searchExternalBooks(
          null,
          filters.search,
          { pageSize: 20 },
        );
        setBooks(ext);
      } else {
        const params = {
          search: filters.search || undefined,
          category: filters.category || undefined,
          minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
          maxPrice: priceRange[1] < 100 ? priceRange[1] : undefined,
          rating: filters.rating > 0 ? filters.rating : undefined,
        };
        setBooks(await booksApi.getAllBooks(params));
      }
    } catch {
      setBooks([]);
      showToast("Failed to fetch books. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [filters, priceRange, searchSource, showToast]);

  const fetchCategories = useCallback(async () => {
    try {
      const raw = await booksApi.getCategories();
      const map = new Map();
      raw.forEach((c) => map.set(c, (map.get(c) ?? 0) + 1));
      setCategories(
        [...map.entries()]
          .sort((a, b) => b[1] - a[1])
          .map(([name, count]) => ({ name, count })),
      );
    } catch {
      /* silent */
    }
  }, []);

  const fetchFeaturedBooks = useCallback(async () => {
    try {
      setFeaturedBooks(await booksApi.getFeaturedBooks());
    } catch {
      /* silent */
    }
  }, []);

  const handleAddToCart = (book) => {
    addToCart(book);
    showToast(`"${book.title}" added to cart!`, "success");
  };

  const handleAddToWishlist = async (book) => {
    if (!book.id) {
      showToast('Cannot add this book to wishlist', 'error');
      return;
    }
    const result = await addToWishlist(book.id);
    if (result) {
      showToast(`"${book.title}" added to wishlist!`, "success");
    }
  };

  // Check if book is in wishlist (sync check using loaded wishlist)
  const checkInWishlist = (bookId) => {
    return wishlist.some(item => item.bookId === bookId);
  };

  const clearAllFilters = () => {
    setFilters({
      category: "",
      minPrice: 0,
      maxPrice: 100,
      rating: 0,
      search: "",
    });
    setSearchTerm("");
    setPriceRange([0, 100]);
    navigate("?", { replace: true });
  };

  const hasActiveFilters =
    filters.category ||
    filters.rating > 0 ||
    priceRange[0] > 0 ||
    priceRange[1] < 100 ||
    filters.search;

  return (
    <div className="shop-page">
      {/* ── Header ── */}
      <div className="shop-header">
        <div className="container position-relative" style={{ zIndex: 1 }}>
          <p className="shop-header-eyebrow">Our Collection</p>
          <h1 className="shop-header-title">
            Browse <em>Every</em> Book
          </h1>
          <p className="shop-header-sub">
            {categories.length > 0
              ? `${categories.length} categories · thousands of titles`
              : "Filter, search, and discover your next read"}
          </p>
        </div>
      </div>

      <div className="container">
        {/* ── Featured Books ── */}
        {featuredBooks.length > 0 && (
          <div className="featured-section">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                marginBottom: 24,
              }}
            >
              <div>
                <p className="section-eyebrow">Handpicked</p>
                <h2 className="section-heading">Featured Books</h2>
              </div>
              <Link
                to="/shop"
                style={{
                  fontSize: 13,
                  color: "var(--amber)",
                  textDecoration: "none",
                  border: "1.5px solid var(--border)",
                  padding: "7px 18px",
                  borderRadius: 50,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                View All →
              </Link>
            </div>
            <div className="row g-4">
              {featuredBooks.slice(0, 4).map((book) => (
                <div key={book.id} className="col-lg-3 col-md-6">
                  <FeaturedCard
                    book={book}
                    onAddToCart={handleAddToCart}
                    onAddToWishlist={handleAddToWishlist}
                    isInWishlist={checkInWishlist}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Filters Bar (Top) ── */}
        <div className="filters-bar-top">
          <div className="filters-card">
            <div className="filters-head">
              <h5 className="filters-title">
                <i className="bi bi-sliders2" /> Filters
              </h5>
              {hasActiveFilters && (
                <button className="btn-clear-all" onClick={clearAllFilters}>
                  Clear all
                </button>
              )}
            </div>
            <div className="filters-body">
              {/* Search */}
              <div className="filter-section">
                <span className="filter-label">Search</span>
                <div className="filter-search-wrapper">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Title, author…"
                  />
                  <i className="bi bi-search filter-search-icon" />
                </div>
                <div className="source-toggle">
                  <button
                    className={`btn-source${searchSource === "local" ? " active-local" : ""}`}
                    onClick={() => setSearchSource("local")}
                  >
                    <i className="bi bi-shop" /> Local
                  </button>
                  <button
                    className={`btn-source${searchSource === "external" ? " active-ext" : ""}`}
                    onClick={() => setSearchSource("external")}
                    disabled={!filters.search}
                  >
                    <i className="bi bi-globe2" /> External
                  </button>
                </div>
                {searchSource === "external" && (
                  <p className="external-hint">
                    Search millions of books via Google Books & Project
                    Gutenberg
                  </p>
                )}
              </div>

              {/* Category */}
              <div className="filter-section">
                <span className="filter-label">Category</span>
                <select
                  className="filter-select"
                  value={filters.category}
                  onChange={(e) =>
                    setFilters((p) => ({ ...p, category: e.target.value }))
                  }
                >
                  <option value="">All Categories</option>
                  {categories.map((c, i) => (
                    <option key={i} value={c.name}>
                      {c.name} ({c.count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="filter-section">
                <span className="filter-label">Price Range</span>
                <div className="price-display">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
                <div className="price-track">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={priceRange[0]}
                    onChange={(e) =>
                      setPriceRange([+e.target.value, priceRange[1]])
                    }
                  />
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([priceRange[0], +e.target.value])
                    }
                  />
                </div>
              </div>

              {/* Min Rating */}
              <div className="filter-section">
                <span className="filter-label">Minimum Rating</span>
                <div className="star-filter">
                  {[1, 2, 3, 4, 5].map((r) => (
                    <button
                      key={r}
                      className={`btn-star${filters.rating >= r ? " active" : ""}`}
                      onClick={() =>
                        setFilters((p) => ({
                          ...p,
                          rating: p.rating === r ? 0 : r,
                        }))
                      }
                      aria-label={`${r} stars`}
                    >
                      <i className="bi bi-star-fill" />
                    </button>
                  ))}
                </div>
                {filters.rating > 0 && (
                  <p className="rating-hint">{filters.rating}+ stars only</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Book Grid ── */}
        <div className="shop-toolbar">
          <div>
            <p className="section-eyebrow" style={{ marginBottom: 4 }}>
              {searchSource === "external"
                ? "External Library"
                : "All Books"}
            </p>
            <h2 className="section-heading" style={{ fontSize: "1.5rem" }}>
              {isLoading
                ? "Searching…"
                : `${books.length} result${books.length !== 1 ? "s" : ""}`}
              {filters.search && (
                <span className="search-badge">
                  <i className="bi bi-search" />"{filters.search}"
                </span>
              )}
            </h2>
          </div>
        </div>

        {isLoading ? (
          <div className="loading-state">
            <div className="loader-ring" />
            <p className="loading-text">Finding your next read…</p>
          </div>
        ) : books.length > 0 ? (
          <div className="row g-4">
            {books.map((book, idx) => {
              const isExt = searchSource === "external";
              const key = isExt
                ? book.googleBooksId || book.gutendexId || idx
                : book.id;
              return (
                <div key={key} className="col-lg-4 col-md-6">
                  <BookCard
                    book={book}
                    isExternal={isExt}
                    onAddToCart={handleAddToCart}
                    onAddToWishlist={handleAddToWishlist}
                    isInWishlist={checkInWishlist}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <i className="bi bi-search" />
            </div>
            <h3 className="empty-title">No books found</h3>
            <p className="empty-desc">
              {searchSource === "external"
                ? "Try a different search term or switch back to the local store."
                : "Try adjusting your filters, or search our external library for millions more titles."}
            </p>
            {searchSource === "local" && !filters.search && (
              <button
                className="btn-try-ext"
                onClick={() => setSearchSource("external")}
              >
                <i className="bi bi-globe2" /> Search External APIs
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;