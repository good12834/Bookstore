import React, { useState, useEffect } from "react";
import axios from "axios";
import "../Orders/Orders.css";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/orders/me`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        setOrders(res.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError("Could not load your orders. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusClass = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "pending") return "order-status-pending";
    if (s === "processing") return "order-status-processing";
    if (s === "shipped") return "order-status-shipped";
    if (s === "delivered") return "order-status-delivered";
    if (s === "cancelled") return "order-status-cancelled";
    return "";
  };

  if (loading) {
    return (
      <div className="orders-page-wrapper">
        <div className="orders-header">
          <div className="container">
            <p className="orders-header-eyebrow">Your Account</p>
            <h1 className="orders-header-title">My Orders</h1>
            <p className="orders-header-sub">Review your order history</p>
          </div>
        </div>
        <div className="container">
          <div className="orders-loading-state">
            <div className="orders-loader-ring" />
            <p className="orders-loading-text">Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-page-wrapper">
        <div className="orders-header">
          <div className="container">
            <p className="orders-header-eyebrow">Your Account</p>
            <h1 className="orders-header-title">My Orders</h1>
            <p className="orders-header-sub">Review your order history</p>
          </div>
        </div>
        <div className="container">
          <div className="orders-error-state">
            <div className="orders-error-icon">!</div>
            <h2 className="orders-error-title">Something went wrong</h2>
            <p className="orders-error-desc">{error}</p>
            <button className="btn-retry" onClick={() => window.location.reload()}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page-wrapper">
      <div className="orders-header">
        <div className="container">
          <p className="orders-header-eyebrow">Your Account</p>
          <h1 className="orders-header-title">My Orders</h1>
          <p className="orders-header-sub">Review your order history</p>
        </div>
      </div>

      <div className="container">
        {orders.length === 0 ? (
          <div className="orders-empty-state">
            <div className="orders-empty-icon">📦</div>
            <h2 className="orders-empty-title">No orders yet</h2>
            <p className="orders-empty-desc">
              You haven&apos;t placed any orders yet. Browse our collection and find your next great read.
            </p>
            <a href="/shop" className="btn-shop-now">
              Browse Books
            </a>
          </div>
        ) : (
          <div className="accordion orders-accordion" id="ordersAccordion">
            {orders.map((order, index) => (
              <div className="accordion-item" key={order.id}>
                <h2 className="accordion-header" id={`heading${index}`}>
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#collapse${index}`}
                    aria-expanded="false"
                    aria-controls={`collapse${index}`}
                  >
                    <span className="order-btn-id">#{order.id}</span>
                    <span className="order-btn-separator">—</span>
                    <span className="order-btn-amount">${order.totalAmount}</span>
                    <span className={`order-status-badge ${getStatusClass(order.status)}`}>
                      {order.status}
                    </span>
                  </button>
                </h2>
                <div
                  id={`collapse${index}`}
                  className="accordion-collapse collapse"
                  data-bs-parent="#ordersAccordion"
                >
                  <div className="accordion-body">
                    <div className="order-details-grid">
                      <div className="order-detail-item">
                        <span className="order-detail-label">Date</span>
                        <span className="order-detail-value">
                          {new Date(order.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="order-detail-item">
                        <span className="order-detail-label">Payment Method</span>
                        <span className="order-detail-value">{order.paymentMethod}</span>
                      </div>
                      <div className="order-detail-item">
                        <span className="order-detail-label">Shipping Address</span>
                        <span className="order-detail-value">{order.shippingAddress}</span>
                      </div>
                      <div className="order-detail-item">
                        <span className="order-detail-label">Status</span>
                        <span className={`order-status-badge ${getStatusClass(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>

                    <h3 className="order-items-heading">
                      Items ({order.OrderItems ? order.OrderItems.length : 0})
                    </h3>
                    <ul className="order-items-list">
                      {order.OrderItems &&
                        order.OrderItems.map((item) => (
                          <li key={item.id} className="order-item-row">
                            <div className="order-item-info">
                              <div className="order-item-cover-placeholder">📖</div>
                              <span className="order-item-title">
                                {item.Book ? item.Book.title : "Unknown Book"}
                              </span>
                            </div>
                            <div className="order-item-meta">
                              <span className="order-item-qty">Qty: {item.quantity}</span>
                              <span className="order-item-price">${item.price}</span>
                            </div>
                          </li>
                        ))}
                    </ul>

                    <div className="order-total-footer">
                      <span className="order-total-label">Total</span>
                      <span className="order-total-amount">${order.totalAmount}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
