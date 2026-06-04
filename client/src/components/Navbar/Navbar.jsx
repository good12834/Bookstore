import React, { useState, useEffect, useRef, useCallback } from "react";
import "./Navbar.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";

const CATEGORIES = [
  { label: "Fiction", value: "Fiction" },
  { label: "Non-Fiction", value: "Non-Fiction" },
  { label: "Children's Books", value: "Children's Books" },
  { label: "Academic", value: "Academic" },
  { label: "Used Books", value: "Used Books" },
  { label: "Gifts & Stationery", value: "Gifts & Stationery" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { user, logout } = useAuth();
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const catRef = useRef(null);
  const userRef = useRef(null);

  const cartCount = cart.reduce((t, i) => t + i.quantity, 0);
  const isHeroPage = location.pathname === "/";

  /* ── Scroll detection ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Close dropdowns on outside click ── */
  useEffect(() => {
    const handler = (e) => {
      if (catRef.current && !catRef.current.contains(e.target))
        setCatOpen(false);
      if (userRef.current && !userRef.current.contains(e.target))
        setUserOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── Close drawer on route change ── */
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  /* ── Lock body scroll when drawer open ── */
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const handleLogout = useCallback(() => {
    logout();
    setUserOpen(false);
    setDrawerOpen(false);
    navigate("/login");
  }, [logout, navigate]);

  const navClass = [
    "navbar-pro",
    scrolled || !isHeroPage ? "navbar-scrolled" : "",
    !isHeroPage && !scrolled ? "navbar-solid" : "",
  ]
    .filter(Boolean)
    .join(" ");

  /* ── User initials avatar ── */
  const initials = user
    ? (user.name || user.email || "U").charAt(0).toUpperCase()
    : "";

  return (
    <>
      <nav className={navClass} role="navigation" aria-label="Main navigation">
        <div className="container">
          {/* Brand */}
          <Link className="navbar-brand-pro" to="/" aria-label="BookStore home">
            <span className="brand-accent">Book</span>
            <span className="brand-dot" />
            Store
          </Link>

          {/* ─── DESKTOP NAV ─── */}
          <ul className="navbar-links">
            <li>
              <Link
                className={`nav-link-pro${location.pathname === "/" ? " active" : ""}`}
                to="/"
              >
                Home
              </Link>
            </li>
             <li>
              <Link
                className={`nav-link-pro${location.pathname === "/about" ? " active" : ""}`}
                to="/about"
              >
                About
              </Link>
            </li>
            {/* Categories dropdown */}
            <li
              className={`nav-dropdown${catOpen ? " open" : ""}`}
              ref={catRef}
            >
              <button
                className="nav-dropdown-toggle"
                onClick={() => setCatOpen((v) => !v)}
                aria-expanded={catOpen}
                aria-haspopup="listbox"
              >
                Categories
                <i className="bi bi-chevron-down dropdown-chevron" />
              </button>
              <ul className="nav-dropdown-menu" role="listbox">
                {CATEGORIES.map((cat) => (
                  <li key={cat.value}>
                    <Link
                      to={`/shop?category=${encodeURIComponent(cat.value)}`}
                      onClick={() => setCatOpen(false)}
                    >
                      {cat.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>

            <li>
              <Link
                className={`nav-link-pro${location.pathname === "/shop" ? " active" : ""}`}
                to="/shop"
              >
                Shop
              </Link>
            </li>
           
          </ul>

          {/* ─── ACTIONS ─── */}
          <div className="nav-actions">
            {/* Wishlist */}
            <Link className="nav-icon-btn" to="/wishlist" aria-label="Wishlist">
              <i className="bi bi-heart" />
              {wishlist.length > 0 && (
                <span className="nav-badge">{wishlist.length}</span>
              )}
            </Link>

            {/* Cart */}
            <Link className="nav-icon-btn" to="/cart" aria-label="Cart">
              <i className="bi bi-bag" />
              {cartCount > 0 && <span className="nav-badge">{cartCount}</span>}
            </Link>

            <div className="nav-sep" />

            {/* Auth */}
            {user ? (
              <div
                className={`user-dropdown${userOpen ? " open" : ""}`}
                ref={userRef}
              >
                <button
                  className="btn-user"
                  onClick={() => setUserOpen((v) => !v)}
                  aria-expanded={userOpen}
                >
                  <span className="user-avatar">{initials}</span>
                  <span className="user-name">{user.name || user.email}</span>
                  <i
                    className="bi bi-chevron-down dropdown-chevron"
                    style={{ fontSize: 10, opacity: 0.5 }}
                  />
                </button>

                <ul className="user-dropdown-menu" role="menu">
                  <li>
                    <Link to="/orders" onClick={() => setUserOpen(false)}>
                      <i className="bi bi-bag-check" /> My Orders
                    </Link>
                  </li>
                  <li>
                    <Link to="/wishlist" onClick={() => setUserOpen(false)}>
                      <i className="bi bi-heart" /> Wishlist
                      {wishlist.length > 0 && (
                        <span className="mobile-badge" style={{ marginLeft: 6, fontSize: 10 }}>{wishlist.length}</span>
                      )}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/email-preferences"
                      onClick={() => setUserOpen(false)}
                    >
                      <i className="bi bi-envelope" /> Email Preferences
                    </Link>
                  </li>
                  {user.isAdmin && (
                    <li>
                      <Link to="/admin" onClick={() => setUserOpen(false)}>
                        <i className="bi bi-sliders" /> Admin Dashboard
                      </Link>
                    </li>
                  )}
                  <li>
                    <div className="dropdown-divider-pro" />
                  </li>
                  <li>
                    <button className="user-menu-logout" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right" /> Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="auth-btns d-flex align-items-center">
                <Link className="btn-nav-login" to="/login">
                  Login
                </Link>
                <Link className="btn-nav-register" to="/register">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* ─── MOBILE HAMBURGER ─── */}
          <button
            className={`hamburger-btn${drawerOpen ? " open" : ""}`}
            onClick={() => setDrawerOpen((v) => !v)}
            aria-label={drawerOpen ? "Close menu" : "Open menu"}
            aria-expanded={drawerOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      {/* ─── MOBILE DRAWER ─── */}
      <div
        className={`mobile-drawer${drawerOpen ? " open" : ""}`}
        onClick={(e) => e.target === e.currentTarget && setDrawerOpen(false)}
        aria-hidden={!drawerOpen}
      >
        <div className="mobile-drawer-panel" role="dialog" aria-modal="true">
          {/* Header */}
          <div className="mobile-drawer-head">
            <Link
              className="navbar-brand-pro"
              to="/"
              style={{ fontSize: 19 }}
              onClick={() => setDrawerOpen(false)}
            >
              <span className="brand-accent">Book</span>
              <span className="brand-dot" />
              Store
            </Link>
            <button
              className="mobile-drawer-close"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close menu"
            >
              <i className="bi bi-x" />
            </button>
          </div>

          {/* Navigation */}
          <ul className="mobile-nav-links">
            <li>
              <Link to="/">
                <i className="bi bi-house" /> Home
              </Link>
            </li>
            <li>
              <Link to="/shop">
                <i className="bi bi-grid" /> Shop
              </Link>
            </li>
            <li>
              <Link to="/about">
                <i className="bi bi-info-circle" /> About
              </Link>
            </li>

            <li>
              <div className="mobile-nav-section-label">Categories</div>
            </li>
            {CATEGORIES.map((cat) => (
              <li key={cat.value}>
                <Link to={`/shop?category=${encodeURIComponent(cat.value)}`}>
                  <i className="bi bi-bookmark" /> {cat.label}
                </Link>
              </li>
            ))}

            <li>
              <div className="mobile-nav-divider" />
            </li>

            <li>
              <Link to="/wishlist">
                <i className="bi bi-heart" /> Wishlist
                {wishlist.length > 0 && (
                  <span className="mobile-badge">{wishlist.length}</span>
                )}
              </Link>
            </li>
            <li>
              <Link to="/cart">
                <i className="bi bi-bag" /> Cart
                {cartCount > 0 && (
                  <span className="mobile-badge">{cartCount}</span>
                )}
              </Link>
            </li>

            {user && (
              <>
                <li>
                  <div className="mobile-nav-divider" />
                </li>
                <li>
                  <div className="mobile-nav-section-label">Account</div>
                </li>
                <li>
                  <Link to="/orders">
                    <i className="bi bi-bag-check" /> My Orders
                  </Link>
                </li>
                <li>
                  <Link to="/email-preferences">
                    <i className="bi bi-envelope" /> Email Preferences
                  </Link>
                </li>
                {user.isAdmin && (
                  <li>
                    <Link to="/admin">
                      <i className="bi bi-sliders" /> Admin Dashboard
                    </Link>
                  </li>
                )}
                <li>
                  <div className="mobile-nav-divider" />
                </li>
                <li>
                  <button className="mobile-logout-btn" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right" /> Logout
                  </button>
                </li>
              </>
            )}
          </ul>

          {/* Footer auth buttons */}
          {!user && (
            <div className="mobile-nav-footer">
              <Link className="btn-nav-login" to="/login">
                Login
              </Link>
              <Link className="btn-nav-register" to="/register">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;