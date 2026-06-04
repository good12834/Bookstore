import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  const [email, setEmail] = useState("");
  const currentYear = new Date().getFullYear();

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    alert("Thank you for subscribing to our newsletter!");
    setEmail("");
  };

  return (
    <footer className="site-footer">
      <div className="footer-glow" />
      
      <div className="footer-main">
        <div className="container">
          <div className="row g-5">
            {/* Brand Section */}
            <div className="col-lg-4 col-md-6">
              <div className="footer-brand-name">
                <span className="brand-accent-ft">Book</span>
                <span className="brand-dot-ft" />
                Store
              </div>
              <p className="footer-desc">
                Your premier destination for quality books. Discover, explore,
                and expand your knowledge with our vast collection of titles
                from every genre imaginable.
              </p>
              <div className="footer-socials">
                <a href="#" className="footer-social-link" aria-label="Facebook">
                  <i className="fab fa-facebook-f" />
                </a>
                <a href="#" className="footer-social-link" aria-label="Twitter">
                  <i className="fab fa-twitter" />
                </a>
                <a href="#" className="footer-social-link" aria-label="Instagram">
                  <i className="fab fa-instagram" />
                </a>
                <a href="#" className="footer-social-link" aria-label="YouTube">
                  <i className="fab fa-youtube" />
                </a>
              </div>
              <div className="footer-trust">
                <div className="footer-trust-item">
                  <i className="bi bi-shield-check" />
                  <span>Secure Payment</span>
                </div>
                <div className="footer-trust-item">
                  <i className="bi bi-truck" />
                  <span>Free Shipping Over $50</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="col-lg-2 col-md-6">
              <h5 className="footer-heading">Quick Links</h5>
              <ul className="footer-links">
                <li><Link to="/"><i className="bi bi-house-door" /> Home</Link></li>
                <li><Link to="/shop"><i className="bi bi-shop" /> Shop</Link></li>
                <li><Link to="/about"><i className="bi bi-info-circle" /> About</Link></li>
                <li><Link to="/orders"><i className="bi bi-box-seam" /> My Orders</Link></li>
                <li><Link to="/cart"><i className="bi bi-bag" /> Cart</Link></li>
                <li><Link to="/wishlist"><i className="bi bi-heart" /> Wishlist</Link></li>
              </ul>
            </div>

            {/* Categories */}
            <div className="col-lg-2 col-md-6">
              <h5 className="footer-heading">Categories</h5>
              <ul className="footer-links">
                <li><Link to="/shop?category=Fiction"><i className="bi bi-book" /> Fiction</Link></li>
                <li><Link to="/shop?category=Non-Fiction"><i className="bi bi-mortarboard" /> Non-Fiction</Link></li>
                <li><Link to="/shop?category=Children's Books"><i className="bi bi-stars" /> Children's Books</Link></li>
                <li><Link to="/shop?category=Academic"><i className="bi bi-laptop" /> Academic</Link></li>
                <li><Link to="/shop?category=Used Books"><i className="bi bi-archive" /> Used Books</Link></li>
              </ul>
            </div>

            {/* Newsletter & Contact */}
            <div className="col-lg-4 col-md-6">
              <h5 className="footer-heading">Stay Updated</h5>
              <p className="footer-newsletter-text">
                Subscribe to receive exclusive offers, new arrivals, and reading
                recommendations straight to your inbox.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="newsletter-form-pro">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit">
                  <i className="bi bi-send" /> Subscribe
                </button>
              </form>

              <div className="footer-contact">
                <div className="footer-contact-item">
                  <i className="bi bi-envelope" />
                  <a href="mailto:info@bookstore.com">info@bookstore.com</a>
                </div>
                <div className="footer-contact-item">
                  <i className="bi bi-telephone" />
                  <a href="tel:+1234567890">+1 (234) 567-890</a>
                </div>
                <div className="footer-contact-item">
                  <i className="bi bi-geo-alt" />
                  <span>123 Book Street, Library City</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-inner">
            <p className="footer-copy">
              &copy; {currentYear} BookStore. Made with <i className="bi bi-heart-fill" /> for readers.
            </p>
            <div className="footer-bottom-links">
              <a href="/privacy">Privacy Policy</a>
              <span className="sep" />
              <a href="/terms">Terms of Service</a>
              <span className="sep" />
              <a href="/support">Support</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;