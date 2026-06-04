import React, { useState, useContext, useEffect } from "react";
import { CartContext } from "../../context/CartContext";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../Checkout/Checkout.css";

const Checkout = () => {
  const { cart, getCartTotal, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("Credit Card");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [couponStatus, setCouponStatus] = useState(null); // null | "loading" | "success" | "error"
  const [couponMessage, setCouponMessage] = useState("");
  const [discount, setDiscount] = useState(0);

  // Order state
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null); // null | { type, message }

  // Current progress step (1 = Shipping, 2 = Payment, 3 = Review)
  const [currentStep, setCurrentStep] = useState(1);

  // Show toast and auto-dismiss
  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle blur for validation
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, formData[name]);
  };

  // Validate single field
  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "fullName":
        if (!value.trim()) error = "Full name is required";
        else if (value.trim().length < 2) error = "Name must be at least 2 characters";
        break;
      case "email":
        if (!value.trim()) error = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = "Please enter a valid email";
        break;
      case "phone":
        if (!value.trim()) error = "Phone number is required";
        else if (!/^[+]?[\d\s()-]{7,20}$/.test(value)) error = "Please enter a valid phone number";
        break;
      case "address":
        if (!value.trim()) error = "Address is required";
        else if (value.trim().length < 5) error = "Please enter a complete address";
        break;
      case "city":
        if (!value.trim()) error = "City is required";
        break;
      case "state":
        if (!value.trim()) error = "State/Province is required";
        break;
      case "zipCode":
        if (!value.trim()) error = "ZIP/Postal code is required";
        else if (!/^[\d\s-]{4,10}$/.test(value)) error = "Please enter a valid postal code";
        break;
      case "country":
        if (!value.trim()) error = "Country is required";
        break;
      default:
        break;
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };

  // Validate entire form
  const validateForm = () => {
    const fields = ["fullName", "email", "phone", "address", "city", "state", "zipCode", "country"];
    let valid = true;
    const newErrors = {};
    fields.forEach((field) => {
      if (!validateField(field, formData[field])) {
        newErrors[field] = errors[field];
        valid = false;
      }
    });
    // Mark all as touched
    const allTouched = {};
    fields.forEach((f) => (allTouched[f] = true));
    setTouched((prev) => ({ ...prev, ...allTouched }));
    setErrors((prev) => ({ ...prev, ...newErrors }));
    return valid;
  };

  // Handle coupon application
  const handleApplyCoupon = async () => {
    const code = couponCode.trim();
    if (!code) {
      setCouponStatus("error");
      setCouponMessage("Please enter a coupon code");
      return;
    }

    setCouponStatus("loading");
    setCouponMessage("");

    // Simulate coupon validation (replace with actual API call)
    setTimeout(() => {
      const validCoupons = {
        SAVE10: 10,
        SAVE20: 20,
        FREESHIP: 5,
        WELCOME15: 15,
      };

      const upperCode = code.toUpperCase();
      if (validCoupons[upperCode]) {
        const discPercent = validCoupons[upperCode];
        setDiscount(discPercent);
        setCouponStatus("success");
        setCouponMessage(`🎉 Coupon applied! You saved ${discPercent}%`);
      } else {
        setCouponStatus("error");
        setCouponMessage("Invalid coupon code. Please try again.");
        setDiscount(0);
      }
    }, 800);
  };

  // Remove coupon
  const handleRemoveCoupon = () => {
    setCouponCode("");
    setDiscount(0);
    setCouponStatus(null);
    setCouponMessage("");
  };

  // Calculate totals
  const subtotal = getCartTotal();
  const discountAmount = (subtotal * discount) / 100;
  const shipping = subtotal >= 50 ? 0 : 4.99;
  const tax = (subtotal - discountAmount) * 0.08;
  const total = subtotal - discountAmount + shipping + tax;

  // Handle place order
  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast("error", "Please fix the form errors before placing your order");
      return;
    }

    setLoading(true);

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/orders`,
        {
          items: cart,
          shippingAddress: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}, ${formData.country}`,
          paymentMethod,
          contactName: formData.fullName,
          contactEmail: formData.email,
          contactPhone: formData.phone,
          discount,
          couponCode: discount > 0 ? couponCode.toUpperCase() : "",
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      clearCart();
      showToast("success", "🎉 Order placed successfully! Redirecting...");
      setTimeout(() => navigate("/orders"), 1500);
    } catch (error) {
      console.error("Order failed:", error);
      showToast(
        "error",
        "Order failed: " + (error.response?.data?.error || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  // Navigation functions for progress steps
  const goToStep = (step) => {
    if (step < currentStep) {
      setCurrentStep(step);
    } else if (step === 2 && currentStep === 1) {
      if (validateForm()) {
        setCurrentStep(2);
      } else {
        showToast("error", "Please fill in all required fields");
      }
    } else if (step === 3 && currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (validateForm()) {
        setCurrentStep(2);
      } else {
        showToast("error", "Please fill in all required fields");
      }
    } else if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  // If not logged in
  if (!user) {
    return (
      <div className="checkout-container">
        <div className="not-logged-in">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#667eea"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ marginBottom: "1rem" }}
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <h3>Sign in to Checkout</h3>
          <p>Please log in to your account to proceed with your order.</p>
          <Link to="/login" className="login-link-btn">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  // If cart is empty
  if (!cart || cart.length === 0) {
    return (
      <div className="checkout-container">
        <div className="empty-cart-message">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#636e72" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "1rem" }}>
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <h3>Your Cart is Empty</h3>
          <p>Looks like you haven't added any books to your cart yet.</p>
          <Link to="/shop" className="shop-now-btn">
            Browse Books
          </Link>
        </div>
      </div>
    );
  }

  // Reusable field component helper
  const renderField = (name, label, type = "text", placeholder = "", options = {}) => {
    const hasError = touched[name] && errors[name];
    const isValid = touched[name] && !errors[name] && formData[name].trim() !== "";
    const fieldClass = `form-input${hasError ? " error" : ""}${isValid ? " valid" : ""}`;

    if (type === "textarea") {
      return (
        <div className="form-group">
          <label className="form-label" htmlFor={name}>{label}</label>
          <textarea
            id={name}
            name={name}
            className={`form-textarea${hasError ? " error" : ""}${isValid ? " valid" : ""}`}
            rows="3"
            placeholder={placeholder}
            value={formData[name]}
            onChange={handleInputChange}
            onBlur={handleBlur}
            required
          ></textarea>
          {hasError && <div className="field-error">⚠ {errors[name]}</div>}
        </div>
      );
    }

    if (type === "select") {
      return (
        <div className="form-group">
          <label className="form-label" htmlFor={name}>{label}</label>
          <select
            id={name}
            name={name}
            className={`form-select${hasError ? " error" : ""}`}
            value={formData[name]}
            onChange={handleInputChange}
            onBlur={handleBlur}
            required
          >
            {options.choices?.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          {hasError && <div className="field-error">⚠ {errors[name]}</div>}
        </div>
      );
    }

    return (
      <div className="form-group">
        <label className="form-label" htmlFor={name}>{label}</label>
        <input
          id={name}
          name={name}
          type={type}
          className={fieldClass}
          placeholder={placeholder}
          value={formData[name]}
          onChange={handleInputChange}
          onBlur={handleBlur}
          required
        />
        {hasError && <div className="field-error">⚠ {errors[name]}</div>}
      </div>
    );
  };

  return (
    <div className="checkout-container">
      {/* Toast Notification */}
      {toast && (
        <div className={`toast-banner ${toast.type}`}>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Progress Steps */}
      <div className="checkout-progress">
        <div className="progress-steps">
          <div
            className={`progress-step ${currentStep === 1 ? "active" : currentStep > 1 ? "completed" : ""}`}
            onClick={() => goToStep(1)}
            style={{ cursor: "pointer" }}
          >
            <div className="step-number">
              {currentStep > 1 ? "✓" : "1"}
            </div>
            <div className="step-label">Shipping</div>
          </div>
          <div className={`progress-line ${currentStep >= 2 ? "filled" : ""}`}></div>
          <div
            className={`progress-step ${currentStep === 2 ? "active" : currentStep > 2 ? "completed" : ""}`}
            onClick={() => goToStep(2)}
            style={{ cursor: currentStep >= 2 ? "pointer" : "default" }}
          >
            <div className="step-number">
              {currentStep > 2 ? "✓" : "2"}
            </div>
            <div className="step-label">Payment</div>
          </div>
          <div className={`progress-line ${currentStep >= 3 ? "filled" : ""}`}></div>
          <div
            className={`progress-step ${currentStep === 3 ? "active" : ""}`}
          >
            <div className="step-number">3</div>
            <div className="step-label">Review</div>
          </div>
        </div>
      </div>

      <div className="d-flex align-items-center justify-content-between" style={{ marginBottom: "0.25rem" }}>
        <h2 className="checkout-title">Checkout</h2>
      </div>
      <p className="checkout-subtitle">
        {currentStep === 1 && "Enter your shipping information below"}
        {currentStep === 2 && "Choose your preferred payment method"}
        {currentStep === 3 && "Review your order before placing it"}
      </p>

      <div className="checkout-layout">
        {/* Left Column - Form */}
        <div className="checkout-form-section">
          <form onSubmit={handlePlaceOrder}>
            {/* Step 1: Shipping Information */}
            {currentStep === 1 && (
              <>
                <div className="form-card-title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  Shipping Address
                </div>

                {renderField("fullName", "Full Name", "text", "John Doe")}
                <div className="form-row">
                  {renderField("email", "Email", "email", "john@example.com")}
                  {renderField("phone", "Phone Number", "tel", "+1 (555) 123-4567")}
                </div>
                {renderField("address", "Address", "textarea", "123 Main Street, Apt 4B")}
                <div className="form-row">
                  {renderField("city", "City", "text", "New York")}
                  {renderField("state", "State / Province", "text", "NY")}
                </div>
                <div className="form-row">
                  {renderField("zipCode", "ZIP / Postal Code", "text", "10001")}
                  {renderField("country", "Country", "select", "", { choices: ["United States", "Canada", "United Kingdom", "Australia", "Germany", "France", "Italy", "Spain", "Other"] })}
                </div>

                <button type="button" className="place-order-btn" onClick={handleNextStep}>
                  Continue to Payment
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </>
            )}

            {/* Step 2: Payment Method */}
            {currentStep === 2 && (
              <>
                <div className="form-card-title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                    <line x1="1" y1="10" x2="23" y2="10"></line>
                  </svg>
                  Payment Method
                </div>

                <div className="form-group">
                  <label className="form-label">Select Payment Method</label>
                  {["Credit Card", "Stripe", "Cash on Delivery", "PayPal"].map((method) => (
                    <div
                      key={method}
                      className={`payment-option ${paymentMethod === method ? "selected" : ""}`}
                      onClick={() => setPaymentMethod(method)}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method}
                        checked={paymentMethod === method}
                        onChange={() => setPaymentMethod(method)}
                      />
                      <div>
                        <div className="payment-label">{method}</div>
                        {method === "Credit Card" && (
                          <div className="payment-desc">Visa, Mastercard, American Express</div>
                        )}
                        {method === "Stripe" && (
                          <div className="payment-desc">Secure online payment via Stripe</div>
                        )}
                        {method === "Cash on Delivery" && (
                          <div className="payment-desc">Pay when you receive your order</div>
                        )}
                        {method === "PayPal" && (
                          <div className="payment-desc">Pay with your PayPal account</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupon Code */}
                <div className="form-card-title" style={{ marginTop: "1.5rem" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                    <line x1="7" y1="7" x2="7.01" y2="7"></line>
                  </svg>
                  Coupon Code
                </div>

                <div className="coupon-section">
                  <input
                    type="text"
                    className="coupon-input"
                    placeholder="Enter coupon code (e.g. SAVE10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={couponStatus === "success"}
                  />
                  {couponStatus === "success" ? (
                    <button
                      type="button"
                      className="coupon-btn"
                      style={{ background: "#e74c3c" }}
                      onClick={handleRemoveCoupon}
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="coupon-btn"
                      onClick={handleApplyCoupon}
                      disabled={couponStatus === "loading"}
                    >
                      {couponStatus === "loading" ? (
                        <span className="btn-spinner" style={{ width: "18px", height: "18px" }}></span>
                      ) : (
                        "Apply"
                      )}
                    </button>
                  )}
                </div>
                {couponStatus === "success" && (
                  <div className="coupon-success">✓ {couponMessage}</div>
                )}
                {couponStatus === "error" && (
                  <div className="coupon-error">✕ {couponMessage}</div>
                )}

                <div className="d-flex gap-2" style={{ marginTop: "1.5rem" }}>
                  <button
                    type="button"
                    className="place-order-btn"
                    style={{ background: "#e0e0e0", color: "#636e72", boxShadow: "none", flex: 1 }}
                    onClick={handlePrevStep}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                    Back
                  </button>
                  <button
                    type="button"
                    className="place-order-btn"
                    style={{ flex: 2 }}
                    onClick={handleNextStep}
                  >
                    Review Order
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </button>
                </div>
              </>
            )}

            {/* Step 3: Review & Place Order */}
            {currentStep === 3 && (
              <>
                <div className="form-card-title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 11 12 14 22 4"></polyline>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                  </svg>
                  Review Your Order
                </div>

                {/* Shipping Summary */}
                <div style={{ background: "#f8f9fa", borderRadius: "12px", padding: "1rem 1.25rem", marginBottom: "1.25rem" }}>
                  <h6 style={{ fontWeight: 700, color: "#2d3436", marginBottom: "0.5rem" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "6px" }}>
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    Shipping To
                  </h6>
                  <p style={{ margin: 0, color: "#636e72", fontSize: "0.9rem" }}>
                    <strong>{formData.fullName}</strong><br />
                    {formData.address}<br />
                    {formData.city}, {formData.state} {formData.zipCode}<br />
                    {formData.country}<br />
                    {formData.email} | {formData.phone}
                  </p>
                </div>

                {/* Payment Summary */}
                <div style={{ background: "#f8f9fa", borderRadius: "12px", padding: "1rem 1.25rem", marginBottom: "1.5rem" }}>
                  <h6 style={{ fontWeight: 700, color: "#2d3436", marginBottom: "0.25rem" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "6px" }}>
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                      <line x1="1" y1="10" x2="23" y2="10"></line>
                    </svg>
                    Payment Method
                  </h6>
                  <p style={{ margin: 0, color: "#636e72", fontSize: "0.9rem" }}>
                    {paymentMethod}
                  </p>
                </div>

                <button
                  type="submit"
                  className="place-order-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="btn-spinner"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 11 12 14 22 4"></polyline>
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                      </svg>
                      Place Order - ${total.toFixed(2)}
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="place-order-btn"
                  style={{ background: "#e0e0e0", color: "#636e72", boxShadow: "none", marginTop: "0.5rem" }}
                  onClick={handlePrevStep}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                  Back to Payment
                </button>
              </>
            )}
          </form>
        </div>

        {/* Right Column - Order Summary */}
        <div className="order-summary">
          <div className="summary-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "8px", verticalAlign: "middle" }}>
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            Order Summary
          </div>

          <ul className="summary-items">
            {cart.map((item) => (
              <li className="summary-item" key={item.bookId || item._id}>
                <div className="item-info">
                  <h6>{item.title}</h6>
                  <small>Qty: {item.quantity}</small>
                </div>
                <span className="item-price">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>

          <div className="summary-breakdown">
            <div className="breakdown-row">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="breakdown-row discount">
                <span>Discount ({discount}%)</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="breakdown-row">
              <span>Shipping</span>
              <span>{shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div className="breakdown-row">
              <span>Tax (8%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="breakdown-row total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Secure Payment Badge */}
          <div className="secure-badge">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <span>Secure checkout · Your info is encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;