import React from "react";
import "./About.css";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero-section position-relative overflow-hidden">
        <div className="container py-5">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <div className="about-hero-content fade-in">
                <h1 className="display-4 fw-bold mb-4">
                  About <span className="text-primary">BookStore</span>
                </h1>
                <p className="lead mb-4 text-white">
                  Welcome to BookStore, your premier destination for all things
                  books. We are passionate about connecting readers with their
                  next favorite book.
                </p>
                <Link to="/shop" className="btn btn-primary btn-lg px-4">
                  Explore Our Collection
                </Link>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="about-hero-image text-center">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
                  alt="About us"
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
        <div className="about-hero-shape position-absolute bottom-0 start-0 w-100 overflow-hidden">
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

      {/* Our Story Section */}
      <section className="our-story-section py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <div className="our-story-content px-4">
                <h2 className="section-title mb-4">Our Story</h2>
                <p className="text-white mb-4">
                  Founded in 2010, BookStore started as a small independent
                  bookshop with a big dream: to create a community where book
                  lovers could discover, share, and celebrate their passion for
                  reading. Over the years, we've grown into a beloved
                  destination for readers of all ages, offering a carefully
                  curated selection of books across all genres.
                </p>
                <p className="text-white mb-4">
                  Our journey has been guided by a simple belief: books have the
                  power to inspire, educate, and transform lives. Whether you're
                  looking for a gripping novel, an insightful non-fiction book,
                  or a beautiful children's story, we're here to help you find
                  the perfect read.
                </p>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="our-story-image text-center">
                <img
                  src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
                  alt="Our story"
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
      </section>

      {/* Our Mission Section */}
      <section className="our-mission-section py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <div className="our-mission-image text-center">
                <img
                  src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
                  alt="Our mission"
                  className="img-fluid rounded-4 shadow-lg"
                  style={{
                    maxHeight: "400px",
                    width: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
            </div>
            <div className="col-lg-6">
              <div className="our-mission-content px-4">
                <h2 className="section-title mb-4">Our Mission</h2>
                <p className="text-white mb-4">
                  At BookStore, our mission is to foster a love of reading and
                  make books accessible to everyone. We believe that every book
                  has the potential to change a life, and we're committed to
                  helping our customers find the stories that resonate with
                  them.
                </p>
                <p className="text-white mb-4">
                  We are dedicated to providing exceptional customer service,
                  offering a diverse selection of high-quality books, and
                  creating a welcoming environment where readers can explore,
                  discover, and connect.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="section-title">Meet Our Team</h2>
            <p className="text-muted">
              Our team is made up of passionate book lovers who are dedicated to
              helping you find your next favorite read.
            </p>
          </div>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="team-member-card text-center">
                <img
                  src="https://randomuser.me/api/portraits/men/32.jpg"
                  alt="Team member"
                  className="rounded-circle mb-3"
                  width="150"
                  height="150"
                />
                <h4 className="fw-bold">John Doe</h4>
                <p className="text-muted mb-3">Founder & CEO</p>
                <p className="text-muted small">
                  John is a lifelong book enthusiast with a passion for
                  connecting readers with great stories.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="team-member-card text-center">
                <img
                  src="https://randomuser.me/api/portraits/women/44.jpg"
                  alt="Team member"
                  className="rounded-circle mb-3"
                  width="150"
                  height="150"
                />
                <h4 className="fw-bold">Jane Smith</h4>
                <p className="text-muted mb-3">Head of Curation</p>
                <p className="text-muted small">
                  Jane has a keen eye for discovering new talent and ensuring
                  our collection is diverse and engaging.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="team-member-card text-center">
                <img
                  src="https://randomuser.me/api/portraits/men/36.jpg"
                  alt="Team member"
                  className="rounded-circle mb-3"
                  width="150"
                  height="150"
                />
                <h4 className="fw-bold">Michael Johnson</h4>
                <p className="text-muted mb-3">Customer Experience Lead</p>
                <p className="text-muted small">
                  Michael is dedicated to ensuring every customer has a seamless
                  and enjoyable shopping experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta-section py-5">
        <div className="container">
          <div className="about-cta-content text-center py-5">
            <h2 className="display-5 fw-bold mb-4">Join Our Community</h2>
            <p className="lead mb-4 text-white">
              Become a part of the BookStore community and stay updated with the
              latest book releases, exclusive offers, and literary events.
            </p>
            <Link to="/register" className="btn btn-primary btn-lg px-4 me-3">
              Create Account
            </Link>
            <Link to="/shop" className="btn btn-outline-primary btn-lg px-4">
              Start Shopping
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
