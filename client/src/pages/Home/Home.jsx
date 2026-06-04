import React, { useEffect, useState, useCallback } from "react";
import "./Home.css";
import { Link } from "react-router-dom";
import { booksApi } from "../../api/booksApi";
import { useAuth } from "../../context/AuthContext";

/* ─── Hero Slider Data ─── */
const SLIDES = [
  {
    id: 1,
    bg: "https://images.unsplash.com/photo-1526243741027-444d633d7365?w=1600&auto=format&fit=crop&q=80",
    badge: "New Season Collection",
    title: (
      <>
        Stories That <em>Move</em> the World
      </>
    ),
    desc: "Handpicked titles from celebrated authors across every genre. Your next great read is waiting.",
    cta: "Shop Now",
    ctaLink: "/shop",
    ghost: "Browse Categories",
    ghostLink: "/shop",
  },
  {
    id: 2,
    bg: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1600&auto=format&fit=crop&q=80",
    badge: "Best Sellers 2024",
    title: (
      <>
        The Books Everyone <em>Is Talking</em> About
      </>
    ),
    desc: "Discover the most celebrated reads of the year, loved by millions of readers worldwide.",
    cta: "View Best Sellers",
    ctaLink: "/shop",
    ghost: "Explore More",
    ghostLink: "/shop",
  },
  {
    id: 3,
    bg: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1600&auto=format&fit=crop&q=80",
    badge: "Limited Edition",
    title: (
      <>
        Rare Finds & <em>Hidden Gems</em>
      </>
    ),
    desc: "Uncover collector's editions, signed copies, and rare titles curated for the passionate reader.",
    cta: "Discover Now",
    ctaLink: "/shop",
    ghost: "Learn More",
    ghostLink: "/shop",
  },
];

/* ─── Book Card Component ─── */
const BookCard = ({ book, badge }) => (
  <div className="book-card-pro">
    <div className="book-card-img-wrapper">
      <img
        src={
          book.coverImage ||
          "https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&auto=format&fit=crop&q=60"
        }
        alt={book.title}
      />
      {badge && <span className="book-card-badge">{badge}</span>}
      <div className="book-card-overlay">
        <Link to={`/books/${book._id}`} className="btn-quick-view">
          Quick View
        </Link>
      </div>
    </div>
    <div className="book-card-body">
      <h5 className="book-card-title">{book.title}</h5>
      <p className="book-card-author">{book.author || "Unknown Author"}</p>
      <div className="book-card-footer">
        <span className="book-card-price">
          ${book.price?.toFixed(2) || "N/A"}
        </span>
        <Link
          to={`/books/${book._id}`}
          className="btn-add-cart"
          title="View Details"
        >
          <i className="bi bi-arrow-right"></i>
        </Link>
      </div>
    </div>
  </div>
);

/* ─── Books Grid Section ─── */
const BooksSection = ({ title, eyebrow, books, badge, className = "" }) => {
  if (!books?.length) return null;
  return (
    <section className={`books-section ${className}`}>
      <div className="container">
        <div className="section-header">
          <div>
            <p className="section-eyebrow">{eyebrow}</p>
            <h2 className="section-title-lg">{title}</h2>
          </div>
          <Link to="/shop" className="btn-view-all">
            View All &rarr;
          </Link>
        </div>
        <div className="row g-4">
          {books.slice(0, 4).map((book) => (
            <div key={book._id} className="col-lg-3 col-md-6">
              <BookCard book={book} badge={badge} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─── Main Component ─── */
const Home = () => {
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { user } = useAuth();

  /* Fetch books */
  useEffect(() => {
    const fetchFeaturedBooks = async () => {
      try {
        const books = await booksApi.getFeaturedBooks();
        setFeaturedBooks(books);
      } catch (err) {
        setError("Failed to fetch featured books");
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedBooks();
  }, []);

  /* Auto-advance slider */
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = useCallback((index) => {
    setCurrentSlide(((index % SLIDES.length) + SLIDES.length) % SLIDES.length);
  }, []);

  /* ─── Loading ─── */
  if (loading) {
    return (
      <div
        style={{
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--warm-white)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 48,
              height: 48,
              border: "3px solid #f0ece4",
              borderTop: "3px solid var(--amber)",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: "#b0a99f", fontSize: 14 }}>
            Loading your library…
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger text-center rounded-3">{error}</div>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* ══════════════════════════════
          HERO IMAGE SLIDER
      ══════════════════════════════ */}
      <section className="hero-slider">
        {SLIDES.map((slide, i) => (
          <div
            key={slide.id}
            className={`slide ${i === currentSlide ? "active" : ""}`}
          >
            <div
              className="slide-bg"
              style={{ backgroundImage: `url(${slide.bg})` }}
            />
            <div className="slide-overlay" />
            <div className="container h-100 position-relative">
              <div className="slide-content">
                <div className="slide-inner">
                  <span className="slide-badge">{slide.badge}</span>
                  <h1 className="slide-title">{slide.title}</h1>
                  <p className="slide-desc">{slide.desc}</p>
                  <div className="slide-actions">
                    <Link to={slide.ctaLink} className="btn-hero-primary">
                      {slide.cta}
                    </Link>
                    <Link to={slide.ghostLink} className="btn-hero-ghost">
                      {slide.ghost}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Dots */}
        <div className="slider-controls">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              className={`slider-dot ${i === currentSlide ? "active" : ""}`}
              onClick={() => goToSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Arrows */}
        <div className="slider-arrows">
          <button
            className="slider-arrow"
            onClick={() => goToSlide(currentSlide - 1)}
            aria-label="Previous slide"
          >
            <i className="bi bi-chevron-left"></i>
          </button>
          <button
            className="slider-arrow"
            onClick={() => goToSlide(currentSlide + 1)}
            aria-label="Next slide"
          >
            <i className="bi bi-chevron-right"></i>
          </button>
        </div>

        {/* Counter */}
        <div className="slide-counter d-none d-lg-block">
          <span className="current">0{currentSlide + 1}</span>
          <span style={{ margin: "4px 0" }}>—</span>
          <span>0{SLIDES.length}</span>
        </div>
      </section>

      {/* ══════════════════════════════
          SEARCH BAR
      ══════════════════════════════ */}
      <section className="search-section">
        <div className="container">
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="Search for titles, authors, or genres…"
            />
            <button className="search-btn">
              <i className="bi bi-search"></i>
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          STATS STRIP
      ══════════════════════════════ */}
      <div className="stats-strip">
        <div className="container">
          <div className="row g-0 text-center">
            {[
              { num: "50K+", label: "Titles Available" },
              { num: "120K", label: "Happy Readers" },
              { num: "4.9★", label: "Average Rating" },
              { num: "Free", label: "Shipping Over $40" },
            ].map((s, i) => (
              <div key={i} className="col-6 col-md-3">
                <div className="stat-item">
                  <span className="stat-number">{s.num}</span>
                  <span className="stat-label">{s.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════
          NEW ARRIVALS
      ══════════════════════════════ */}
      <BooksSection
        eyebrow="Just Arrived"
        title="New Arrivals"
        books={featuredBooks.slice(0, 4)}
        badge="New"
      />

      {/* ══════════════════════════════
          BEST SELLERS
      ══════════════════════════════ */}
      <BooksSection
        eyebrow="Reader Favorites"
        title="Best Sellers"
        books={featuredBooks.slice(4, 8)}
        badge="Bestseller"
      />

      {/* ══════════════════════════════
          WHY CHOOSE US
      ══════════════════════════════ */}
      <section className="why-section">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-5">
              <div className="why-image-wrapper">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80"
                  alt="Reading experience"
                />
                <div className="why-image-accent" />
              </div>
            </div>
            <div className="col-lg-7">
              <p className="section-eyebrow">Our Promise</p>
              <h2 className="section-title-lg mb-4">
                Why Readers Choose Our Bookstore
              </h2>
              <p
                style={{
                  color: "var(--muted)",
                  fontSize: 16,
                  lineHeight: 1.7,
                  marginBottom: 32,
                }}
              >
                We're not just selling books — we're building a community of
                lifelong readers. Every detail of our service is crafted with
                you in mind.
              </p>
              <div className="why-features">
                {[
                  {
                    icon: "bi-book-half",
                    title: "Vast Collection",
                    desc: "Thousands of titles across all genres, from timeless classics to today's hottest releases.",
                  },
                  {
                    icon: "bi-truck",
                    title: "Fast Delivery",
                    desc: "Free shipping on orders over $40. Get your books reliably within 2–3 business days.",
                  },
                  {
                    icon: "bi-award",
                    title: "Quality Guarantee",
                    desc: "Every book ships in perfect condition. Not satisfied? We'll make it right, no questions asked.",
                  },
                  {
                    icon: "bi-headset",
                    title: "Expert Support",
                    desc: "Our book-loving team is always here to help you find your perfect read.",
                  },
                ].map((f, i) => (
                  <div key={i} className="why-feature">
                    <div className="why-feature-icon">
                      <i className={`bi ${f.icon}`}></i>
                    </div>
                    <div>
                      <p className="why-feature-title">{f.title}</p>
                      <p className="why-feature-desc">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          STAFF PICKS
      ══════════════════════════════ */}
      <BooksSection
        eyebrow="Curated For You"
        title="Staff Picks"
        books={featuredBooks.slice(8, 12)}
        badge="Staff Pick"
      />

      {/* ══════════════════════════════
          TESTIMONIALS
      ══════════════════════════════ */}
      <section className="testimonial-section">
        <div className="container">
          <div className="text-center mb-5">
            <p className="section-eyebrow">Testimonials</p>
            <h2 className="section-title-lg">What Our Readers Say</h2>
          </div>
          <div className="row g-4">
            {[
              {
                text: "I've been using this bookstore for years and I'm always amazed by their vast collection and excellent service. The books arrive in perfect condition every time.",
                name: "Sarah Johnson",
                role: "Book Enthusiast",
                avatar: "https://randomuser.me/api/portraits/women/44.jpg",
              },
              {
                text: "The staff picks section is genuinely incredible. Found three of my all-time favorite books through their recommendations. It feels like they truly know readers.",
                name: "Marcus Chen",
                role: "Literary Blogger",
                avatar: "https://randomuser.me/api/portraits/men/32.jpg",
              },
              {
                text: "Fast shipping, beautiful packaging, and the rare editions section is a hidden treasure. This is the only bookstore I'll ever need. Highly recommended!",
                name: "Emily Rodriguez",
                role: "Collector & Reader",
                avatar: "https://randomuser.me/api/portraits/women/68.jpg",
              },
            ].map((t, i) => (
              <div key={i} className="col-md-4">
                <div className="testimonial-card-pro">
                  <div className="testimonial-stars">★★★★★</div>
                  <span className="testimonial-quote">"</span>
                  <p className="testimonial-text">{t.text}</p>
                  <div className="testimonial-author">
                    <img src={t.avatar} alt={t.name} />
                    <div>
                      <p className="testimonial-name">{t.name}</p>
                      <p className="testimonial-role">{t.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          CTA SECTION
      ══════════════════════════════ */}
      <section className="cta-section-pro">
        <div
          className="container text-center position-relative"
          style={{ zIndex: 1 }}
        >
          <p className="cta-eyebrow">Start Reading Today</p>
          <h2 className="cta-title">
            Ready to Begin Your
            <br />
            Reading Journey?
          </h2>
          <p className="cta-desc">
            Join over 120,000 satisfied readers and discover your next favorite
            book today. New arrivals every week.
          </p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Link to="/shop" className="btn-hero-primary">
              Browse Books
            </Link>
            {!user && (
              <Link to="/register" className="btn-hero-ghost">
                Create Free Account
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
