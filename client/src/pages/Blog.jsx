import React from "react";
import "./Blog.css";
import { Link } from "react-router-dom";

const Blog = () => {
  return (
    <div className="blog-page">
      {/* Hero Section */}
      <section className="blog-hero-section position-relative overflow-hidden">
        <div className="container py-5">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <div className="blog-hero-content fade-in">
                <h1 className="display-4 fw-bold mb-4">
                  BookStore <span className="text-primary">Blog</span>
                </h1>
                <p className="lead mb-4 text-white">
                  Dive into our blog for book reviews, reading lists, author
                  interviews, and more. Stay connected with the literary world.
                </p>
                <Link to="/blog" className="btn btn-primary btn-lg px-4">
                  Explore Articles
                </Link>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="blog-hero-image text-center">
                <img
                  src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
                  alt="Blog"
                  className="img-fluid rounded-4 shadow-lg"
                  style={{
                    maxHeight: "400px",
                    width: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="blog-hero-shape position-absolute bottom-0 start-0 w-100 overflow-hidden">
          <svg
            viewBox="0 0 1200 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 120L50 110C100 100 200 80 300 70C400 60 500 60 600 65C700 70 800 80 900 85C1000 90 1100 90 1150 90L1200 90V120H1150C1100 120 1000 120 900 120C800 120 700 120 600 120C500 120 400 120 300 120C200 120 100 120 50 120H0Z"
              fill="#f8f9fa"
            />
          </svg>
        </div>
      </section>

      {/* Featured Articles Section */}
      <section className="featured-articles-section py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="section-title">Featured Articles</h2>
            <p className="text-muted">
              Explore our latest articles, reviews, and recommendations.
            </p>
          </div>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="article-card">
                <img
                  src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
                  alt="Article"
                  className="img-fluid rounded-4 mb-3"
                  style={{ height: "200px", width: "100%", objectFit: "cover" }}
                />
                <h4 className="fw-bold mb-2">Top 10 Books of the Year</h4>
                <p className="text-muted small mb-3">
                  Discover the best books of the year, handpicked by our team of
                  literary experts.
                </p>
                <Link
                  to="/blog/top-10-books"
                  className="btn btn-sm btn-outline-primary"
                >
                  Read More
                </Link>
              </div>
            </div>
            <div className="col-md-4">
              <div className="article-card">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
                  alt="Article"
                  className="img-fluid rounded-4 mb-3"
                  style={{ height: "200px", width: "100%", objectFit: "cover" }}
                />
                <h4 className="fw-bold mb-2">Author Spotlight: Jane Austen</h4>
                <p className="text-muted small mb-3">
                  Learn about the life and works of one of the most beloved
                  authors in literary history.
                </p>
                <Link
                  to="/blog/author-spotlight"
                  className="btn btn-sm btn-outline-primary"
                >
                  Read More
                </Link>
              </div>
            </div>
            <div className="col-md-4">
              <div className="article-card">
                <img
                  src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
                  alt="Article"
                  className="img-fluid rounded-4 mb-3"
                  style={{ height: "200px", width: "100%", objectFit: "cover" }}
                />
                <h4 className="fw-bold mb-2">Book Club Recommendations</h4>
                <p className="text-muted small mb-3">
                  Find the perfect book for your next book club meeting with our
                  curated list of recommendations.
                </p>
                <Link
                  to="/blog/book-club"
                  className="btn btn-sm btn-outline-primary"
                >
                  Read More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="events-section py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="section-title">Upcoming Events</h2>
            <p className="text-muted">
              Join us for book signings, author talks, and literary events.
            </p>
          </div>
          <div className="row g-4">
            <div className="col-md-6">
              <div className="event-card">
                <div className="row g-0">
                  <div className="col-md-4">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
                      alt="Event"
                      className="img-fluid rounded-4 h-100"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <div className="col-md-8">
                    <div className="card-body">
                      <h5 className="card-title fw-bold">
                        Book Signing with Bestselling Author
                      </h5>
                      <p className="card-text text-muted small">
                        <i className="bi bi-calendar me-2"></i>
                        October 15, 2023 | 2:00 PM - 4:00 PM
                      </p>
                      <p className="card-text text-muted small">
                        <i className="bi bi-geo-alt me-2"></i>
                        BookStore, 123 Main Street
                      </p>
                      <p className="card-text text-muted small mt-2">
                        Meet and greet with the author of the year's most
                        anticipated novel.
                      </p>
                      <Link
                        to="/events/book-signing"
                        className="btn btn-sm btn-outline-primary mt-2"
                      >
                        Learn More
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="event-card">
                <div className="row g-0">
                  <div className="col-md-4">
                    <img
                      src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
                      alt="Event"
                      className="img-fluid rounded-4 h-100"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <div className="col-md-8">
                    <div className="card-body">
                      <h5 className="card-title fw-bold">
                        Children's Storytime
                      </h5>
                      <p className="card-text text-muted small">
                        <i className="bi bi-calendar me-2"></i>
                        October 20, 2023 | 10:00 AM - 11:00 AM
                      </p>
                      <p className="card-text text-muted small">
                        <i className="bi bi-geo-alt me-2"></i>
                        BookStore, 123 Main Street
                      </p>
                      <p className="card-text text-muted small mt-2">
                        Bring your little ones for a fun-filled storytime
                        session with our favorite children's books.
                      </p>
                      <Link
                        to="/events/storytime"
                        className="btn btn-sm btn-outline-primary mt-2"
                      >
                        Learn More
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="blog-cta-section py-5">
        <div className="container">
          <div className="blog-cta-content text-center py-5">
            <h2 className="display-5 fw-bold mb-4">Stay Connected</h2>
            <p className="lead mb-4 text-white">
              Subscribe to our newsletter for the latest updates, exclusive
              offers, and literary news.
            </p>
            <div
              className="input-group mb-3"
              style={{ maxWidth: "500px", margin: "0 auto" }}
            >
              <input
                type="email"
                className="form-control"
                placeholder="Enter your email"
                aria-label="Enter your email"
              />
              <button className="btn btn-primary" type="button">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Blog;
