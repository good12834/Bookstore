import React, { useContext, useState, useEffect } from "react";
import { CartContext } from "../../context/CartContext";
import { Link } from "react-router-dom";
import {
  FaTrash,
  FaArrowRight,
  FaPlus,
  FaMinus,
  FaShoppingCart,
  FaTag,
  FaShieldAlt,
  FaTruck,
  FaUndo,
  FaHeart,
  FaAngleLeft,
  FaCheckCircle,
  FaCreditCard,
  FaLock,
} from "react-icons/fa";
import "./Cart.css";

const Cart = () => {
  const {
    cart,
    removeFromCart,
    getCartTotal,
    updateQuantity,
    getCartCount,
    clearCart,
  } = useContext(CartContext);

  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [removingItem, setRemovingItem] = useState(null);

  const FREE_SHIPPING_THRESHOLD = 50;
  const subtotal = getCartTotal();
  const safePrice = (price) => parseFloat(price) || 0;
  const totalItems = getCartCount();
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : 9.99;
  const shippingProgress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const discountAmount = subtotal * promoDiscount;
  const orderTotal = subtotal - discountAmount + shipping;

  const handleQuantityChange = (bookId, newQuantity) => {
    if (newQuantity >= 1) {
      updateQuantity(bookId, newQuantity);
    }
  };

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (code === "BOOKLOVER10") {
      setPromoApplied(true);
      setPromoDiscount(0.1);
      setPromoError("");
    } else if (code === "WELCOME20") {
      setPromoApplied(true);
      setPromoDiscount(0.2);
      setPromoError("");
    } else if (code === "FREESHIP") {
      setPromoApplied(true);
      setPromoDiscount(0);
      setPromoError("");
    } else {
      setPromoError("Invalid promo code. Try: BOOKLOVER10, WELCOME20, or FREESHIP");
      setPromoApplied(false);
    }
  };

  const handleRemovePromo = () => {
    setPromoCode("");
    setPromoApplied(false);
    setPromoDiscount(0);
    setPromoError("");
  };

  const handleRemoveItem = (bookId) => {
    setRemovingItem(bookId);
    setTimeout(() => {
      removeFromCart(bookId);
      setRemovingItem(null);
    }, 300);
  };

  const handleClearCart = () => {
    if (window.confirm("Are you sure you want to clear your entire cart?")) {
      clearCart();
    }
  };

  const relatedBooks = [
    {
      id: "related-1",
      title: "The Art of Reading",
      price: 24.99,
      image: "https://placehold.co/60x90/6366f1/ffffff?text=Art",
    },
    {
      id: "related-2",
      title: "Literary Classics",
      price: 29.99,
      image: "https://placehold.co/60x90/6366f1/ffffff?text=Classics",
    },
    {
      id: "related-3",
      title: "Modern Prose",
      price: 19.99,
      image: "https://placehold.co/60x90/6366f1/ffffff?text=Prose",
    },
    {
      id: "related-4",
      title: "Poetry Collection",
      price: 15.99,
      image: "https://placehold.co/60x90/6366f1/ffffff?text=Poetry",
    },
  ];

  return (
    <div className="cart-page">
      <div className="cart-hero">
        <div className="cart-hero-overlay" />
        <div className="container cart-hero-content">
          <h1 className="cart-hero-title">Your Cart</h1>
          <p className="cart-hero-subtitle">
            {totalItems > 0
              ? `${totalItems} ${totalItems === 1 ? "item" : "items"} in your collection`
              : "Start building your library"}
          </p>
        </div>
      </div>

      <div className="container cart-content">
        {cart.length === 0 ? (
          <div className="empty-cart-section">
            <div className="empty-cart-card">
              <div className="empty-cart-icon-wrapper">
                <FaShoppingCart className="empty-cart-icon" />
                <div className="empty-cart-ring" />
              </div>
              <h2 className="empty-cart-title">Your cart is empty</h2>
              <p className="empty-cart-text">
                Looks like you haven't added any books to your cart yet.
                <br />
                Browse our collection and find your next great read.
              </p>
              <Link to="/shop" className="empty-cart-btn">
                <FaAngleLeft className="empty-cart-btn-icon" />
                Browse Books
              </Link>
            </div>

            <div className="empty-cart-benefits">
              <div className="benefit-item">
                <FaTruck className="benefit-icon" />
                <div className="benefit-info">
                  <h4>Free Shipping</h4>
                  <p>On orders over $50</p>
                </div>
              </div>
              <div className="benefit-item">
                <FaUndo className="benefit-icon" />
                <div className="benefit-info">
                  <h4>Easy Returns</h4>
                  <p>30-day return policy</p>
                </div>
              </div>
              <div className="benefit-item">
                <FaLock className="benefit-icon" />
                <div className="benefit-info">
                  <h4>Secure Checkout</h4>
                  <p>SSL encrypted payment</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="cart-layout">
              <div className="cart-items-section">
                <div className="cart-items-header">
                  <h3 className="cart-items-title">
                    Cart Items
                    <span className="cart-items-count-badge">{totalItems}</span>
                  </h3>
                  <button
                    className="cart-clear-btn"
                    onClick={handleClearCart}
                    title="Clear cart"
                  >
                    <FaTrash className="cart-clear-icon" />
                    Clear Cart
                  </button>
                </div>

                {/* Free shipping progress bar */}
                {subtotal < FREE_SHIPPING_THRESHOLD && (
                  <div className="shipping-progress-card">
                    <FaTruck className="shipping-progress-icon" />
                    <div className="shipping-progress-text">
                      <span>
                        Add{" "}
                        <strong>
                          ${(FREE_SHIPPING_THRESHOLD - subtotal).toFixed(2)}
                        </strong>{" "}
                        more for <strong>FREE shipping</strong>
                      </span>
                    </div>
                    <div className="shipping-progress-bar">
                      <div
                        className="shipping-progress-fill"
                        style={{ width: `${shippingProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {subtotal >= FREE_SHIPPING_THRESHOLD && (
                  <div className="shipping-progress-card shipping-reached">
                    <FaCheckCircle className="shipping-progress-icon success" />
                    <div className="shipping-progress-text">
                      <span>
                        <strong>You've unlocked FREE shipping!</strong>
                      </span>
                    </div>
                  </div>
                )}

                <div className="cart-items-list">
                  {cart.map((item, index) => (
                    <div
                      key={item.bookId}
                      className={`cart-item ${removingItem === item.bookId ? "cart-item-removing" : ""}`}
                      style={{ "--delay": `${index * 0.05}s` }}
                    >
                      <div className="cart-item-image-wrapper">
                        <img
                          src={
                            item.imageUrl ||
                            "https://placehold.co/80x120/6366f1/ffffff?text=Book"
                          }
                          alt={item.title}
                          className="cart-item-image"
                        />
                      </div>

                      <div className="cart-item-details">
                        <Link
                          to={`/books/${item.bookId}`}
                          className="cart-item-title"
                        >
                          {item.title}
                        </Link>
                        <span className="cart-item-id">ID: {item.bookId}</span>
                        <span className="cart-item-price">
                          ${safePrice(item.price).toFixed(2)}
                        </span>
                      </div>

                      <div className="cart-item-quantity">
                        <span className="cart-item-qty-label">Qty</span>
                        <div className="cart-qty-controls">
                          <button
                            className="cart-qty-btn cart-qty-minus"
                            onClick={() =>
                              handleQuantityChange(
                                item.bookId,
                                item.quantity - 1
                              )
                            }
                            disabled={item.quantity <= 1}
                          >
                            <FaMinus />
                          </button>
                          <input
                            type="number"
                            className="cart-qty-input"
                            value={item.quantity}
                            min="1"
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              if (value > 0) {
                                handleQuantityChange(item.bookId, value);
                              }
                            }}
                          />
                          <button
                            className="cart-qty-btn cart-qty-plus"
                            onClick={() =>
                              handleQuantityChange(
                                item.bookId,
                                item.quantity + 1
                              )
                            }
                          >
                            <FaPlus />
                          </button>
                        </div>
                      </div>

                      <div className="cart-item-total">
                        <span className="cart-item-total-label">Total</span>
                        <span className="cart-item-total-value">
                          ${(safePrice(item.price) * item.quantity).toFixed(2)}
                        </span>
                      </div>

                      <div className="cart-item-actions">
                        <button
                          className="cart-item-fav-btn"
                          title="Move to wishlist"
                        >
                          <FaHeart />
                        </button>
                        <button
                          className="cart-item-remove-btn"
                          onClick={() => handleRemoveItem(item.bookId)}
                          title="Remove item"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cart-continue-shopping">
                  <Link to="/shop" className="continue-shopping-link">
                    <FaAngleLeft className="continue-shopping-icon" />
                    Continue Shopping
                  </Link>
                </div>
              </div>

              <div className="cart-summary-section">
                <div className="cart-summary-sticky">
                  <div className="order-summary-card">
                    <div className="order-summary-header">
                      <FaCreditCard className="order-summary-icon" />
                      <h4>Order Summary</h4>
                    </div>

                    <div className="order-summary-body">
                      <div className="summary-row">
                        <span className="summary-label">Subtotal</span>
                        <span className="summary-value">
                          ${subtotal.toFixed(2)}
                        </span>
                      </div>

                      <div className="summary-row">
                        <span className="summary-label">Shipping</span>
                        <span
                          className={`summary-value ${shipping === 0 ? "summary-free" : ""}`}
                        >
                          {shipping === 0 ? (
                            <>
                              <FaCheckCircle className="summary-check-icon" />{" "}
                              FREE
                            </>
                          ) : (
                            `$${shipping.toFixed(2)}`
                          )}
                        </span>
                      </div>

                      {promoApplied && (
                        <div className="summary-row summary-discount-row">
                          <span className="summary-label">
                            <FaTag className="summary-tag-icon" /> Discount (
                            {(promoDiscount * 100).toFixed(0)}%)
                          </span>
                          <span className="summary-value summary-discount">
                            -${discountAmount.toFixed(2)}
                          </span>
                        </div>
                      )}

                      <hr className="summary-divider" />

                      <div className="summary-total">
                        <span className="summary-total-label">Total</span>
                        <span className="summary-total-value">
                          ${orderTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Promo Code */}
                    <div className="promo-section">
                      {!promoApplied ? (
                        <div className="promo-input-group">
                          <div className="promo-input-wrapper">
                            <FaTag className="promo-input-icon" />
                            <input
                              type="text"
                              className="promo-input"
                              placeholder="Promo code"
                              value={promoCode}
                              onChange={(e) => {
                                setPromoCode(e.target.value);
                                setPromoError("");
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleApplyPromo();
                              }}
                            />
                          </div>
                          <button
                            className="promo-apply-btn"
                            onClick={handleApplyPromo}
                            disabled={!promoCode.trim()}
                          >
                            Apply
                          </button>
                        </div>
                      ) : (
                        <div className="promo-applied">
                          <FaCheckCircle className="promo-applied-icon" />
                          <span>Promo code applied!</span>
                          <button
                            className="promo-remove-btn"
                            onClick={handleRemovePromo}
                          >
                            Remove
                          </button>
                        </div>
                      )}
                      {promoError && (
                        <p className="promo-error-msg">{promoError}</p>
                      )}
                    </div>

                    <Link
                      to="/checkout"
                      className="checkout-btn"
                      onClick={() => setIsCheckingOut(true)}
                    >
                      <span>Proceed to Checkout</span>
                      <FaArrowRight className="checkout-btn-icon" />
                    </Link>

                    <div className="secure-checkout-badge">
                      <FaLock className="secure-checkout-icon" />
                      <span>Secure checkout with SSL encryption</span>
                    </div>

                    <div className="payment-methods">
                      <FaCreditCard />
                      <span>Visa</span>
                      <span>MC</span>
                      <span>Amex</span>
                      <span>PayPal</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Related Books Suggestion */}
            <div className="related-books-section">
              <div className="related-books-header">
                <h3>You Might Also Like</h3>
              </div>
              <div className="related-books-grid">
                {relatedBooks.map((book) => (
                  <div key={book.id} className="related-book-card">
                    <img
                      src={book.image}
                      alt={book.title}
                      className="related-book-image"
                    />
                    <div className="related-book-info">
                      <h5 className="related-book-title">{book.title}</h5>
                      <span className="related-book-price">
                        ${book.price.toFixed(2)}
                      </span>
                    </div>
                    <button className="related-book-add-btn">+ Add</button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;