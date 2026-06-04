import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { CartContext } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import {
  FaStar,
  FaCheck,
  FaShoppingCart,
  FaSearch,
  FaBook,
} from "react-icons/fa";

const BookDetails = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const { addToCart } = useContext(CartContext);
  const { addToast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/books/${id}`
        );
        setBook(res.data);
      } catch (error) {
        console.error("Error fetching book:", error);
      }
    };
    fetchBook();
  }, [id]);

  const handleAddToCart = () => {
    addToCart(book, quantity);
    addToast(`${quantity} x ${book.title} added to cart!`, "success");
  };

  if (!book)
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );

  return (
    <div className="container mt-5 fade-in">
      <div className="row g-5">
        {/* Book Cover */}
        <div className="col-md-5">
          <div className="position-relative">
            <img
              src={book.imageUrl || "https://placehold.co/400x600"}
              className="img-fluid rounded-4 shadow-lg w-100"
              alt={book.title}
            />
          </div>
        </div>

        {/* Book Info */}
        <div className="col-md-7">
          <div className="mb-2 text-warning">
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} />
            ))}{" "}
            <span className="text-muted ms-2 small">(4.8)</span>
          </div>
          <h1
            className="display-4 fw-bold mb-2"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            {book.title}
          </h1>
          <h4 className="text-muted mb-4">{book.author}</h4>

          <div className="d-flex align-items-center mb-4">
            <h2 className="text-primary fw-bold me-4 mb-0">${book.price}</h2>
            <span
              className={`badge rounded-pill px-3 py-2 ${
                book.stock > 0
                  ? "bg-success bg-opacity-10 text-success"
                  : "bg-danger bg-opacity-10 text-danger"
              }`}
            >
              {book.stock > 0 ? "In Stock" : "Out of Stock"}
            </span>
          </div>

          <p className="lead mb-4">{book.description}</p>

          <div className="d-flex align-items-center gap-3 mb-5">
            <input
              type="number"
              className="form-control form-control-lg text-center"
              style={{ width: "80px", borderRadius: "12px" }}
              value={quantity}
              min="1"
              max={book.stock}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
            />
            <button
              className="btn btn-primary btn-lg rounded-pill px-5"
              onClick={handleAddToCart}
              disabled={book.stock === 0}
            >
              Add to Cart
            </button>
          </div>

          {/* Tabs */}
          <ul className="nav nav-pills mb-3 border-bottom pb-2">
            <li className="nav-item">
              <button
                className={`nav-link rounded-pill px-4 ${
                  activeTab === "description" ? "active" : "text-muted"
                }`}
                onClick={() => setActiveTab("description")}
              >
                Description
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link rounded-pill px-4 ${
                  activeTab === "reviews" ? "active" : "text-muted"
                }`}
                onClick={() => setActiveTab("reviews")}
              >
                Reviews
              </button>
            </li>
          </ul>

          <div className="tab-content py-3">
            {activeTab === "description" && (
              <p className="text-muted">Detailed description goes here...</p>
            )}
            {activeTab === "reviews" && (
              <div>
                {book.Reviews && book.Reviews.length > 0 ? (
                  <ul className="list-unstyled">
                    {book.Reviews.map((review) => (
                      <li
                        className="mb-3 p-3 bg-light rounded-3"
                        key={review.id}
                      >
                        <div className="d-flex align-items-center mb-2">
                          <div className="text-warning me-2">
                            {[...Array(review.rating)].map((_, i) => (
                              <FaStar key={i} size={12} />
                            ))}
                          </div>
                        </div>
                        <p className="mb-0 text-muted">{review.comment}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted">No reviews yet.</p>
                )}
              </div>
            )}
          </div>

          {/* Related Books Section */}
          <section className="related-books-section mt-5">
            <div className="container">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="section-title">People also bought</h2>
                <Link to="/shop" className="btn btn-outline-primary">
                  View All
                </Link>
              </div>
              <div className="row g-4">
                {featuredBooks.slice(0, 4).map((relatedBook) => (
                  <div key={relatedBook._id} className="col-md-3">
                    <div className="card book-card h-100">
                      <img
                        src={
                          relatedBook.coverImage ||
                          "https://via.placeholder.com/150x200?text=Book+Cover"
                        }
                        className="card-img-top"
                        alt={relatedBook.title}
                        style={{
                          height: "200px",
                          width: "100%",
                          objectFit: "cover",
                        }}
                      />
                      <div className="card-body">
                        <h5 className="card-title text-truncate">
                          {relatedBook.title}
                        </h5>
                        <p className="card-text text-muted small">
                          {relatedBook.author || "Unknown Author"}
                        </p>
                        <p className="fw-bold">
                          ${relatedBook.price?.toFixed(2) || "N/A"}
                        </p>
                        <Link
                          to={`/books/${relatedBook._id}`}
                          className="btn btn-sm btn-outline-primary"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
