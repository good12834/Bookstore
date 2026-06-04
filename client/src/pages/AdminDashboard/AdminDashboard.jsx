import React, { useState, useEffect, useContext, useCallback } from "react";
import axios from "axios";
import "../AdminDashboard/AdminDashboard.css";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

/* ── Auth header helper ── */
const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});
const API = () => import.meta.env.VITE_API_URL;

/* ── Status badge helper ── */
const StatusBadge = ({ status }) => {
  const map = {
    pending: "status-pending",
    processing: "status-processing",
    shipped: "status-shipped",
    delivered: "status-delivered",
    cancelled: "status-cancelled",
  };
  return (
    <span className={`admin-badge ${map[status] || "admin-badge-primary"}`}>
      {status}
    </span>
  );
};

/* ── Pagination ── */
const Pagination = ({ page, totalPages, onPage }) => {
  if (totalPages <= 1) return null;
  return (
    <nav className="admin-pagination">
      <ul className="pagination">
        <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
          <button
            className="admin-page-link"
            onClick={() => onPage(page - 1)}
            disabled={page === 1}
          >
            ‹ Prev
          </button>
        </li>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <li key={p} className={`page-item ${p === page ? "active" : ""}`}>
            <button className="admin-page-link" onClick={() => onPage(p)}>
              {p}
            </button>
          </li>
        ))}
        <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
          <button
            className="admin-page-link"
            onClick={() => onPage(page + 1)}
            disabled={page === totalPages}
          >
            Next ›
          </button>
        </li>
      </ul>
    </nav>
  );
};

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  /* ── State ── */
  const [stats, setStats] = useState({});
  const [books, setBooks] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState([]);
  const [usersPagination, setUsersPagination] = useState({});
  const [userPage, setUserPage] = useState(1);
  const [orders, setOrders] = useState([]);
  const [ordersPagination, setOrdersPagination] = useState({});
  const [orderPage, setOrderPage] = useState(1);
  const [orderStatusFilter, setOrderStatusFilter] = useState("");
  const [analytics, setAnalytics] = useState({});
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [lowStockBooks, setLowStockBooks] = useState([]);
  const [stockAlertThreshold, setStockAlertThreshold] = useState(5);
  const [emailStats, setEmailStats] = useState({});
  const [promotionalEmailContent, setPromotionalEmailContent] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);

  const emptyBook = {
    title: "",
    author: "",
    price: "",
    stock: "",
    category: "",
    description: "",
    imageUrl: "",
  };
  const [newBook, setNewBook] = useState(emptyBook);
  const [editingBook, setEditingBook] = useState(null);
  const [editFormData, setEditFormData] = useState(emptyBook);

  /* ── Auth guard ── */
  useEffect(() => {
    if (user === null) return;
    if (!user) {
      navigate("/login");
      return;
    }
    if (!user.isAdmin) {
      alert("Access denied.");
      navigate("/");
    }
  }, [user, navigate]);

  /* ── Data fetching by tab ── */
  useEffect(() => {
    if (!user?.isAdmin) return;
    fetchStats();
    if (activeTab === "overview") {
      fetchAnalytics();
      fetchLowStockBooks();
      fetchBooks();
    }
    if (activeTab === "books") {
      fetchBooks();
      fetchCategories();
      fetchLowStockBooks();
    }
    if (activeTab === "categories") {
      fetchBooks();
      fetchCategories();
    }
    if (activeTab === "stock") {
      fetchBooks();
      fetchLowStockBooks();
    }
    if (activeTab === "users") fetchUsers();
    if (activeTab === "orders") fetchOrders();
    if (activeTab === "analytics") fetchAnalytics();
    if (activeTab === "email") {
      fetchEmailStats();
      fetchOrders();
    }
  }, [activeTab, userPage, orderPage, orderStatusFilter, user]);

  /* ── API calls ── */
  const fetchStats = async () => {
    try {
      const r = await axios.get(`${API()}/api/admin/stats`, {
        headers: authHeader(),
      });
      setStats(r.data);
    } catch {}
  };
  const fetchBooks = async () => {
    try {
      const r = await axios.get(`${API()}/api/books`);
      setBooks(r.data);
    } catch {}
  };
  const fetchCategories = async () => {
    try {
      const r = await axios.get(`${API()}/api/books`);
      setCategories([
        ...new Set(r.data.map((b) => b.category).filter(Boolean)),
      ]);
    } catch {}
  };
  const fetchLowStockBooks = async () => {
    try {
      const r = await axios.get(`${API()}/api/books`);
      setLowStockBooks(r.data.filter((b) => b.stock <= stockAlertThreshold));
    } catch {}
  };
  const fetchAnalytics = async () => {
    try {
      const r = await axios.get(`${API()}/api/admin/analytics`, {
        headers: authHeader(),
      });
      setAnalytics(r.data);
    } catch {}
  };
  const fetchEmailStats = async () => {
    try {
      const r = await axios.get(`${API()}/api/admin/email/statistics`, {
        headers: authHeader(),
      });
      setEmailStats(r.data);
    } catch {}
  };

  const fetchUsers = async () => {
    try {
      const r = await axios.get(
        `${API()}/api/admin/users?page=${userPage}&limit=10`,
        { headers: authHeader() },
      );
      setUsers(r.data.users);
      setUsersPagination({
        totalPages: r.data.totalPages,
        currentPage: r.data.currentPage,
        totalUsers: r.data.totalUsers,
      });
    } catch {}
  };

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams({ page: orderPage, limit: 10 });
      if (orderStatusFilter) params.append("status", orderStatusFilter);
      const r = await axios.get(`${API()}/api/admin/orders?${params}`, {
        headers: authHeader(),
      });
      setOrders(r.data.orders);
      setOrdersPagination({
        totalPages: r.data.totalPages,
        currentPage: r.data.currentPage,
        totalOrders: r.data.totalOrders,
      });
    } catch {}
  };

  /* ── Book handlers ── */
  const handleCreateBook = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API()}/api/books`, newBook, {
        headers: authHeader(),
      });
      setNewBook(emptyBook);
      fetchBooks();
    } catch {
      alert("Failed to create book");
    }
  };
  const handleDeleteBook = async (id) => {
    if (!window.confirm("Delete this book?")) return;
    try {
      await axios.delete(`${API()}/api/books/${id}`, { headers: authHeader() });
      fetchBooks();
    } catch {
      alert("Failed to delete book");
    }
  };
  const handleEditBook = (book) => {
    setEditingBook(book);
    setEditFormData({
      title: book.title,
      author: book.author,
      price: book.price,
      stock: book.stock,
      category: book.category || "",
      description: book.description || "",
      imageUrl: book.imageUrl || "",
    });
  };
  const handleUpdateBook = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API()}/api/books/${editingBook.id}`, editFormData, {
        headers: authHeader(),
      });
      setEditingBook(null);
      fetchBooks();
    } catch {
      alert("Failed to update book");
    }
  };
  const cancelEdit = () => {
    setEditingBook(null);
    setEditFormData(emptyBook);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (
      !file ||
      !file.type.startsWith("image/") ||
      file.size > 5 * 1024 * 1024
    ) {
      alert("Please select an image under 5MB");
      return;
    }
    const formData = new FormData();
    formData.append("image", file);
    try {
      const r = await axios.post(`${API()}/api/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data", ...authHeader() },
      });
      const imageUrl = r.data.url;
      editingBook
        ? setEditFormData((p) => ({ ...p, imageUrl }))
        : setNewBook((p) => ({ ...p, imageUrl }));
    } catch {
      alert("Failed to upload image");
    }
  };

  const handleStockUpdate = async (bookId, newStock) => {
    try {
      await axios.put(
        `${API()}/api/books/${bookId}`,
        { stock: newStock },
        { headers: authHeader() },
      );
      fetchBooks();
      fetchLowStockBooks();
    } catch {
      alert("Failed to update stock");
    }
  };

  /* ── User / Order handlers ── */
  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      await axios.put(
        `${API()}/api/admin/users/${userId}/role`,
        { role: newRole },
        { headers: authHeader() },
      );
      fetchUsers();
    } catch {
      alert("Failed to update user role");
    }
  };
  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await axios.delete(`${API()}/api/admin/users/${userId}`, {
        headers: authHeader(),
      });
      fetchUsers();
    } catch {
      alert("Failed to delete user");
    }
  };
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(
        `${API()}/api/admin/orders/${orderId}/status`,
        { status: newStatus },
        { headers: authHeader() },
      );
      fetchOrders();
    } catch {
      alert("Failed to update order status");
    }
  };
  const handleSendPromotionalEmail = async () => {
    if (!promotionalEmailContent.trim()) {
      alert("Please enter email content");
      return;
    }
    try {
      await axios.post(
        `${API()}/api/admin/email/promotional/send-all`,
        { content: promotionalEmailContent },
        { headers: authHeader() },
      );
      alert("Emails sent!");
      setPromotionalEmailContent("");
    } catch {
      alert("Failed to send emails");
    }
  };
  const handleSendOrderShippedEmail = async (orderId) => {
    try {
      await axios.post(
        `${API()}/api/admin/orders/${orderId}/send-shipped-email`,
        {},
        { headers: authHeader() },
      );
      alert("Email sent!");
      fetchOrders();
    } catch {
      alert("Failed to send email");
    }
  };

  /* ── Nav helper ── */
  const nav = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  const NAV_ITEMS = [
    { id: "overview", icon: "bi-grid", label: "Overview" },
    { id: "books", icon: "bi-book", label: "Manage Books" },
    { id: "categories", icon: "bi-tags", label: "Categories" },
    {
      id: "stock",
      icon: "bi-box-seam",
      label: "Stock Management",
      alert: lowStockBooks.length,
    },
    { id: "users", icon: "bi-people", label: "Manage Users" },
    { id: "orders", icon: "bi-bag-check", label: "Manage Orders" },
    { id: "analytics", icon: "bi-bar-chart-line", label: "Analytics" },
    { id: "email", icon: "bi-envelope", label: "Email Management" },
  ];

  /* ── Loading guard ── */
  if (user === null)
    return (
      <div
        className="admin-layout"
        style={{ alignItems: "center", justifyContent: "center" }}
      >
        <div style={{ textAlign: "center" }}>
          <div className="admin-spinner mb-3" />
          <p className="admin-subtitle">Verifying admin access…</p>
        </div>
      </div>
    );

  /* ── Book form fields helper ── */
  const formVal = (field) =>
    editingBook ? editFormData[field] : newBook[field];
  const setFormVal = (field, val) =>
    editingBook
      ? setEditFormData((p) => ({ ...p, [field]: val }))
      : setNewBook((p) => ({ ...p, [field]: val }));

  return (
    <div className="admin-layout">
      {/* Mobile header */}
      <header className="admin-mobile-header d-lg-none">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <button
            className="admin-btn admin-btn-outline admin-btn-sm"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <i className={`bi bi-${sidebarOpen ? "x" : "list"}`} />
          </button>
          <Link to="/" className="admin-brand">
            <span className="brand-accent">Book</span>
            <span className="brand-dot" />
            Store
          </Link>
          <button
            className="admin-btn admin-btn-outline admin-btn-sm"
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/login");
            }}
          >
            <i className="bi bi-box-arrow-right" />
          </button>
        </div>
      </header>

      {/* Backdrop */}
      {sidebarOpen && (
        <div
          className="admin-sidebar-backdrop show"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`admin-sidebar${sidebarOpen ? " show" : ""}${sidebarHovered ? " expanded" : ""}`}
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
      >
        <div className="admin-sidebar-header d-none d-lg-block">
          <Link to="/" className="admin-brand">
            <span className="brand-accent">Book</span>
            <span className="brand-dot" />
            Store
          </Link>
          <p className="admin-subtitle mt-1 mb-0">Admin Panel</p>
        </div>

        <ul className="admin-sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <li className="admin-nav-item" key={item.id}>
              <button
                className={`admin-nav-link${activeTab === item.id ? " active" : ""}`}
                onClick={() => nav(item.id)}
              >
                <i className={`bi ${item.icon} admin-nav-icon`} />
                <span className="nav-label">{item.label}</span>
                {item.alert > 0 && (
                  <span
                    className="admin-badge admin-badge-danger"
                    style={{ marginLeft: "auto", fontSize: 10 }}
                  >
                    {item.alert}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* Main */}
      <main className="admin-main-content">
        {/* Desktop header */}
        <header
          className="admin-header d-none d-lg-flex"
          style={{ alignItems: "center", justifyContent: "space-between" }}
        >
          <div>
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 22,
                margin: 0,
              }}
            >
              Dashboard
            </h1>
            <p
              className="admin-subtitle"
              style={{ marginTop: 2, marginBottom: 0 }}
            >
              Welcome back, {user?.name || user?.email}
            </p>
          </div>
          <button
            className="admin-btn admin-btn-outline"
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/login");
            }}
          >
            <i className="bi bi-box-arrow-right" /> Sign Out
          </button>
        </header>

        <div className="container-fluid">
          {/* ══ OVERVIEW ══ */}
          {activeTab === "overview" && (
            <div>
              <div className="admin-stats-grid">
                {[
                  {
                    label: "Orders Count",
                    value: stats.totalOrders || 0,
                    desc: "Total Orders",
                    icon: "bi-bag-check",
                    cls: "admin-stat-card--primary",
                  },
                  {
                    label: "Revenue",
                    value: `$${stats.totalSales || 0}`,
                    desc: "Total Revenue",
                    icon: "bi-currency-dollar",
                    cls: "admin-stat-card--success",
                  },
                  {
                    label: "Stock Alerts",
                    value: lowStockBooks.length,
                    desc: "Low Stock Items",
                    icon: "bi-exclamation-triangle",
                    cls: "admin-stat-card--warning",
                  },
                  {
                    label: "Popular Books",
                    value: analytics.topBooks?.length || 0,
                    desc: "Top Sellers",
                    icon: "bi-book",
                    cls: "admin-stat-card--purple",
                  },
                ].map((s, i) => (
                  <div key={i} className={`admin-stat-card ${s.cls}`}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div className="admin-stat-label">{s.label}</div>
                        <div className="admin-stat-value">{s.value}</div>
                        <div className="admin-stat-desc">{s.desc}</div>
                      </div>
                      <i className={`bi ${s.icon} admin-stat-icon`} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="row">
                <div className="col-lg-8 mb-4">
                  <div className="admin-chart-card h-100">
                    <div className="admin-chart-header">
                      <h5 className="admin-chart-title">Sales Graph</h5>
                      <small style={{ color: "var(--muted)" }}>
                        Last 12 Months
                      </small>
                    </div>
                    <div className="admin-chart-body">
                      {analytics.salesData?.length > 0 ? (
                        <Line
                          data={{
                            labels: analytics.salesData.map((d) =>
                              new Date(
                                d.month || d.dataValues?.month,
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                year: "numeric",
                              }),
                            ),
                            datasets: [
                              {
                                label: "Sales ($)",
                                data: analytics.salesData.map(
                                  (d) =>
                                    d.totalSales || d.dataValues?.totalSales,
                                ),
                                borderColor: "#c8893a",
                                backgroundColor: "rgba(200,137,58,0.1)",
                                tension: 0.4,
                                fill: true,
                                pointBackgroundColor: "#c8893a",
                                pointRadius: 4,
                              },
                            ],
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { position: "top" } },
                            scales: { y: { beginAtZero: true } },
                          }}
                          height={300}
                        />
                      ) : (
                        <div
                          style={{
                            textAlign: "center",
                            padding: "60px 0",
                            color: "var(--muted)",
                          }}
                        >
                          No sales data available
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="col-lg-4 mb-4">
                  <div className="admin-table-card h-100">
                    <div className="admin-table-header">
                      <h5 className="admin-table-title">Low Stock Alerts</h5>
                    </div>
                    <div className="card-body">
                      {lowStockBooks.length > 0 ? (
                        <>
                          {lowStockBooks.slice(0, 5).map((book) => (
                            <div
                              key={book.id}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "10px 0",
                                borderBottom: "1px solid rgba(0,0,0,0.05)",
                              }}
                            >
                              <div>
                                <div style={{ fontWeight: 500, fontSize: 13 }}>
                                  {book.title}
                                </div>
                                <div
                                  style={{
                                    fontSize: 12,
                                    color: "var(--muted)",
                                  }}
                                >
                                  {book.author}
                                </div>
                              </div>
                              <span className="admin-badge admin-badge-warning">
                                {book.stock}
                              </span>
                            </div>
                          ))}
                          {lowStockBooks.length > 5 && (
                            <div style={{ textAlign: "center", marginTop: 14 }}>
                              <button
                                className="admin-btn admin-btn-outline admin-btn-sm"
                                onClick={() => setActiveTab("stock")}
                              >
                                View All ({lowStockBooks.length})
                              </button>
                            </div>
                          )}
                        </>
                      ) : (
                        <div
                          style={{
                            textAlign: "center",
                            padding: "40px 0",
                            color: "var(--muted)",
                          }}
                        >
                          <i
                            className="bi bi-check-circle"
                            style={{
                              fontSize: 40,
                              color: "var(--c-success)",
                              display: "block",
                              marginBottom: 12,
                            }}
                          />
                          All books are well stocked!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {analytics.topBooks?.length > 0 && (
                <div className="admin-table-card">
                  <div className="admin-table-header">
                    <h5 className="admin-table-title">Popular Books</h5>
                    <button
                      className="admin-btn admin-btn-outline admin-btn-sm"
                      onClick={() => setActiveTab("analytics")}
                    >
                      View Analytics
                    </button>
                  </div>
                  <div className="card-body" style={{ padding: 0 }}>
                    <div className="table-responsive">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Rank</th>
                            <th>Book Title</th>
                            <th>Author</th>
                            <th>Total Sold</th>
                            <th>Revenue</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analytics.topBooks.slice(0, 5).map((book, i) => (
                            <tr key={i}>
                              <td>
                                <span className="admin-badge admin-badge-primary">
                                  #{i + 1}
                                </span>
                              </td>
                              <td>{book.Book?.title || book.title}</td>
                              <td>{book.Book?.author || book.author}</td>
                              <td>
                                <strong>
                                  {book.totalSold || book.dataValues?.totalSold}
                                </strong>
                              </td>
                              <td
                                style={{
                                  color: "var(--c-success)",
                                  fontWeight: 500,
                                }}
                              >
                                $
                                {book.totalRevenue ||
                                  book.dataValues?.totalRevenue}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══ BOOKS ══ */}
          {activeTab === "books" && (
            <div>
              <div className="admin-form-card mb-4">
                <div className="card-header">
                  {editingBook ? "Edit Book" : "Add New Book"}
                </div>
                <div className="card-body">
                  <form
                    onSubmit={editingBook ? handleUpdateBook : handleCreateBook}
                  >
                    <div className="row g-3">
                      <div className="col-md-6">
                        <input
                          className="admin-form-control"
                          placeholder="Title"
                          value={formVal("title")}
                          onChange={(e) => setFormVal("title", e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <input
                          className="admin-form-control"
                          placeholder="Author"
                          value={formVal("author")}
                          onChange={(e) => setFormVal("author", e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-md-4">
                        <input
                          type="number"
                          className="admin-form-control"
                          placeholder="Price"
                          value={formVal("price")}
                          onChange={(e) => setFormVal("price", e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-md-4">
                        <input
                          type="number"
                          className="admin-form-control"
                          placeholder="Stock"
                          value={formVal("stock")}
                          onChange={(e) => setFormVal("stock", e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-md-4">
                        <select
                          className="admin-form-select"
                          value={formVal("category")}
                          onChange={(e) =>
                            setFormVal("category", e.target.value)
                          }
                        >
                          <option value="">Select Category</option>
                          {categories.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <input
                          className="admin-form-control"
                          placeholder="Image URL"
                          value={formVal("imageUrl")}
                          onChange={(e) =>
                            setFormVal("imageUrl", e.target.value)
                          }
                        />
                      </div>
                      <div className="col-md-6">
                        <input
                          type="file"
                          className="admin-form-control"
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                        <small
                          style={{
                            color: "var(--muted)",
                            fontSize: 11,
                            marginTop: 4,
                            display: "block",
                          }}
                        >
                          Max 5MB · JPG/PNG/GIF
                        </small>
                      </div>
                      {formVal("imageUrl") && (
                        <div className="col-12">
                          <img
                            src={formVal("imageUrl")}
                            alt="Preview"
                            style={{
                              maxWidth: 120,
                              maxHeight: 160,
                              objectFit: "cover",
                              borderRadius: 8,
                            }}
                            onError={(e) => (e.target.style.display = "none")}
                          />
                        </div>
                      )}
                      <div className="col-12">
                        <textarea
                          className="admin-form-control"
                          placeholder="Description"
                          rows={3}
                          value={formVal("description")}
                          onChange={(e) =>
                            setFormVal("description", e.target.value)
                          }
                        />
                      </div>
                      <div
                        className="col-12"
                        style={{ display: "flex", gap: 10 }}
                      >
                        <button
                          type="submit"
                          className={`admin-btn ${editingBook ? "admin-btn-success" : "admin-btn-primary"}`}
                        >
                          {editingBook ? "Update Book" : "Add Book"}
                        </button>
                        {editingBook && (
                          <button
                            type="button"
                            className="admin-btn admin-btn-outline"
                            onClick={cancelEdit}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </form>
                </div>
              </div>

              <div className="admin-table-card">
                <div className="admin-table-header">
                  <h5 className="admin-table-title">
                    All Books ({books.length})
                  </h5>
                </div>
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Author</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Category</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {books.map((book) => (
                        <tr key={book.id}>
                          <td style={{ fontWeight: 500 }}>{book.title}</td>
                          <td style={{ color: "var(--muted)" }}>
                            {book.author}
                          </td>
                          <td>${book.price}</td>
                          <td>
                            <span
                              className={`admin-badge ${book.stock <= stockAlertThreshold ? "admin-badge-warning" : "admin-badge-success"}`}
                            >
                              {book.stock}
                            </span>
                          </td>
                          <td>
                            {book.category || (
                              <span style={{ color: "var(--muted)" }}>—</span>
                            )}
                          </td>
                          <td style={{ display: "flex", gap: 6 }}>
                            <button
                              className="admin-btn admin-btn-outline admin-btn-sm"
                              onClick={() => handleEditBook(book)}
                            >
                              <i className="bi bi-pencil" /> Edit
                            </button>
                            <button
                              className="admin-btn admin-btn-danger admin-btn-sm"
                              onClick={() => handleDeleteBook(book.id)}
                            >
                              <i className="bi bi-trash" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══ CATEGORIES ══ */}
          {activeTab === "categories" && (
            <div>
              <div className="admin-form-card mb-4">
                <div className="card-header">Manage Categories</div>
                <div className="card-body">
                  <div className="row g-3 mb-4">
                    <div className="col-md-9">
                      <input
                        className="admin-form-control"
                        placeholder="New category name"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                      />
                    </div>
                    <div className="col-md-3">
                      <button
                        className="admin-btn admin-btn-primary w-100"
                        onClick={() => {
                          if (!newCategory.trim()) return;
                          if (categories.includes(newCategory.trim())) {
                            alert("Already exists");
                            return;
                          }
                          setCategories([...categories, newCategory.trim()]);
                          setNewCategory("");
                        }}
                      >
                        Add Category
                      </button>
                    </div>
                  </div>
                  <p
                    style={{
                      fontSize: 11,
                      letterSpacing: "2px",
                      textTransform: "uppercase",
                      color: "var(--amber)",
                      marginBottom: 12,
                    }}
                  >
                    Existing Categories ({categories.length})
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {categories.map((c) => (
                      <span key={c} className="admin-badge admin-badge-primary">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="admin-table-card">
                <div className="admin-table-header">
                  <h5 className="admin-table-title">Category Statistics</h5>
                </div>
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Books</th>
                        <th>Total Stock</th>
                        <th>Avg Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((cat) => {
                        const cb = books.filter((b) => b.category === cat);
                        const totalStock = cb.reduce((s, b) => s + b.stock, 0);
                        const avgPrice = cb.length
                          ? (
                              cb.reduce((s, b) => s + parseFloat(b.price), 0) /
                              cb.length
                            ).toFixed(2)
                          : "0.00";
                        return (
                          <tr key={cat}>
                            <td style={{ fontWeight: 500 }}>{cat}</td>
                            <td>
                              <span className="admin-badge admin-badge-primary">
                                {cb.length}
                              </span>
                            </td>
                            <td>{totalStock}</td>
                            <td>${avgPrice}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══ STOCK ══ */}
          {activeTab === "stock" && (
            <div>
              <div className="admin-form-card mb-4">
                <div
                  className="card-header"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 12,
                  }}
                >
                  <span>Stock Management</span>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <span style={{ fontSize: 13, color: "var(--muted)" }}>
                      Low stock threshold:
                    </span>
                    <input
                      type="number"
                      className="admin-form-control"
                      min={1}
                      max={50}
                      value={stockAlertThreshold}
                      style={{ width: 72 }}
                      onChange={(e) => {
                        setStockAlertThreshold(parseInt(e.target.value));
                        fetchLowStockBooks();
                      }}
                    />
                  </div>
                </div>
                <div className="card-body">
                  <div
                    className={`admin-alert ${lowStockBooks.length > 0 ? "admin-alert-warning" : "admin-alert-success"}`}
                  >
                    {lowStockBooks.length > 0
                      ? `⚠️ ${lowStockBooks.length} book(s) are running low on stock.`
                      : "✅ All books are adequately stocked!"}
                  </div>
                </div>
              </div>

              <div className="admin-table-card">
                <div className="admin-table-header">
                  <h5 className="admin-table-title">Stock Overview</h5>
                </div>
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Book</th>
                        <th>Author</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Status</th>
                        <th>Update</th>
                      </tr>
                    </thead>
                    <tbody>
                      {books.map((book) => (
                        <tr key={book.id}>
                          <td style={{ fontWeight: 500 }}>{book.title}</td>
                          <td style={{ color: "var(--muted)" }}>
                            {book.author}
                          </td>
                          <td>{book.category || "—"}</td>
                          <td>${book.price}</td>
                          <td>{book.stock}</td>
                          <td>
                            <span
                              className={`admin-badge ${book.stock <= stockAlertThreshold ? "admin-badge-warning" : "admin-badge-success"}`}
                            >
                              {book.stock <= stockAlertThreshold
                                ? "Low Stock"
                                : "In Stock"}
                            </span>
                          </td>
                          <td>
                            <div
                              style={{ display: "flex", gap: 6, width: 140 }}
                            >
                              <input
                                type="number"
                                className="admin-form-control admin-btn-sm"
                                defaultValue={book.stock}
                                id={`stock-${book.id}`}
                                style={{ flex: 1, padding: "6px 10px" }}
                              />
                              <button
                                className="admin-btn admin-btn-outline admin-btn-sm"
                                onClick={() => {
                                  const val = parseInt(
                                    document.getElementById(`stock-${book.id}`)
                                      .value,
                                  );
                                  handleStockUpdate(book.id, val);
                                }}
                              >
                                <i className="bi bi-check" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══ USERS ══ */}
          {activeTab === "users" && (
            <div>
              <div
                className="admin-stats-grid"
                style={{
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))",
                  marginBottom: 24,
                }}
              >
                <div className="admin-stat-card admin-stat-card--primary">
                  <div className="admin-stat-label">Total Users</div>
                  <div className="admin-stat-value">
                    {usersPagination.totalUsers || 0}
                  </div>
                  <div className="admin-stat-desc">Registered accounts</div>
                </div>
              </div>

              <div className="admin-table-card">
                <div className="admin-table-header">
                  <h5 className="admin-table-title">User Management</h5>
                </div>
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Joined</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id}>
                          <td style={{ fontWeight: 500 }}>{u.name}</td>
                          <td style={{ color: "var(--muted)" }}>{u.email}</td>
                          <td>
                            <select
                              className="admin-form-select"
                              style={{
                                width: "auto",
                                padding: "5px 28px 5px 10px",
                                fontSize: 13,
                              }}
                              value={u.role}
                              onChange={(e) =>
                                handleUpdateUserRole(u.id, e.target.value)
                              }
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td style={{ color: "var(--muted)", fontSize: 13 }}>
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td>
                            <button
                              className="admin-btn admin-btn-danger admin-btn-sm"
                              onClick={() => handleDeleteUser(u.id)}
                            >
                              <i className="bi bi-trash" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <Pagination
                page={userPage}
                totalPages={usersPagination.totalPages}
                onPage={setUserPage}
              />
            </div>
          )}

          {/* ══ ORDERS ══ */}
          {activeTab === "orders" && (
            <div>
              <div className="admin-table-card mb-4">
                <div
                  className="card-body"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 12,
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: 11,
                        letterSpacing: "2px",
                        textTransform: "uppercase",
                        color: "var(--amber)",
                      }}
                    >
                      Total
                    </span>
                    <div
                      style={{
                        fontFamily: "'Playfair Display',serif",
                        fontSize: 20,
                        fontWeight: 700,
                      }}
                    >
                      {ordersPagination.totalOrders || 0} Orders
                    </div>
                  </div>
                  <select
                    className="admin-form-select"
                    style={{ width: "auto" }}
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                  >
                    <option value="">All Statuses</option>
                    {[
                      "pending",
                      "processing",
                      "shipped",
                      "delivered",
                      "cancelled",
                    ].map((s) => (
                      <option key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {orders.map((order) => (
                <div key={order.id} className="admin-table-card mb-3">
                  <div
                    className="card-body"
                    style={{
                      padding: "16px 22px",
                      borderBottom: "1px solid rgba(0,0,0,0.06)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 12,
                      }}
                    >
                      <div>
                        <span
                          style={{
                            fontFamily: "'Playfair Display',serif",
                            fontWeight: 600,
                          }}
                        >
                          Order #{order.id}
                        </span>
                        <span
                          style={{
                            fontSize: 13,
                            color: "var(--muted)",
                            marginLeft: 10,
                          }}
                        >
                          {order.User?.name} · {order.User?.email}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <select
                          className="admin-form-select"
                          style={{ width: "auto", fontSize: 13 }}
                          value={order.status}
                          onChange={(e) =>
                            handleUpdateOrderStatus(order.id, e.target.value)
                          }
                        >
                          {[
                            "pending",
                            "processing",
                            "shipped",
                            "delivered",
                            "cancelled",
                          ].map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <span
                          style={{
                            fontFamily: "'Playfair Display',serif",
                            fontWeight: 600,
                            color: "var(--c-success)",
                          }}
                        >
                          ${order.totalAmount}
                        </span>
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--muted)",
                        marginTop: 6,
                      }}
                    >
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="table-responsive">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Book</th>
                          <th>Qty</th>
                          <th>Price</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.OrderItems?.map((item) => (
                          <tr key={item.id}>
                            <td>{item.Book?.title}</td>
                            <td>{item.quantity}</td>
                            <td>${item.price}</td>
                            <td style={{ fontWeight: 500 }}>
                              ${(item.quantity * item.price).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
              <Pagination
                page={orderPage}
                totalPages={ordersPagination.totalPages}
                onPage={setOrderPage}
              />
            </div>
          )}

          {/* ══ ANALYTICS ══ */}
          {activeTab === "analytics" && (
            <div>
              {[
                {
                  title: "Sales — Last 12 Months",
                  cols: ["Month", "Total Sales", "Orders"],
                  rows: analytics.salesData?.map((d) => [
                    new Date(d.month || d.dataValues?.month).toLocaleDateString(
                      "en-US",
                      { year: "numeric", month: "long" },
                    ),
                    `$${d.totalSales || d.dataValues?.totalSales}`,
                    d.orderCount || d.dataValues?.orderCount,
                  ]),
                },
                {
                  title: "Top Selling Books",
                  cols: ["Book", "Author", "Sold", "Revenue"],
                  rows: analytics.topBooks?.map((b) => [
                    b.Book?.title,
                    b.Book?.author,
                    b.totalSold || b.dataValues?.totalSold,
                    `$${b.totalRevenue || b.dataValues?.totalRevenue}`,
                  ]),
                },
                {
                  title: "Recent Orders",
                  cols: ["Order ID", "Customer", "Amount", "Date"],
                  rows: analytics.recentOrders?.map((o) => [
                    `#${o.id}`,
                    o.User?.name,
                    `$${o.totalAmount}`,
                    new Date(o.createdAt).toLocaleDateString(),
                  ]),
                },
              ].map((t) => (
                <div key={t.title} className="admin-table-card mb-4">
                  <div className="admin-table-header">
                    <h5 className="admin-table-title">{t.title}</h5>
                  </div>
                  <div className="table-responsive">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          {t.cols.map((c) => (
                            <th key={c}>{c}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {t.rows?.map((row, i) => (
                          <tr key={i}>
                            {row.map((cell, j) => (
                              <td key={j}>{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ══ EMAIL ══ */}
          {activeTab === "email" && (
            <div>
              <div className="admin-stats-grid mb-4">
                {[
                  {
                    label: "Total Users",
                    value: emailStats.totalUsers || 0,
                    desc: "Registered",
                    icon: "bi-people",
                    cls: "admin-stat-card--primary",
                  },
                  {
                    label: "Promo Subscribers",
                    value: emailStats.promotionalSubscribers || 0,
                    desc: `${emailStats.promotionalSubscriptionRate || 0}% of total`,
                    icon: "bi-megaphone",
                    cls: "admin-stat-card--success",
                  },
                  {
                    label: "Order Emails",
                    value: emailStats.orderEmailSubscribers || 0,
                    desc: `${emailStats.orderEmailSubscriptionRate || 0}% of total`,
                    icon: "bi-bag-check",
                    cls: "admin-stat-card--info",
                  },
                  {
                    label: "Newsletter",
                    value: emailStats.newsletterSubscribers || 0,
                    desc: "Active subscribers",
                    icon: "bi-envelope",
                    cls: "admin-stat-card--warning",
                  },
                ].map((s, i) => (
                  <div key={i} className={`admin-stat-card ${s.cls}`}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div className="admin-stat-label">{s.label}</div>
                        <div className="admin-stat-value">{s.value}</div>
                        <div className="admin-stat-desc">{s.desc}</div>
                      </div>
                      <i className={`bi ${s.icon} admin-stat-icon`} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="admin-table-card mb-4">
                <div className="admin-table-header">
                  <h5 className="admin-table-title">Send Promotional Email</h5>
                </div>
                <div className="card-body">
                  <textarea
                    className="admin-form-control mb-2"
                    rows={6}
                    placeholder="Email content (HTML supported)…"
                    value={promotionalEmailContent}
                    onChange={(e) => setPromotionalEmailContent(e.target.value)}
                  />
                  <small
                    style={{
                      color: "var(--muted)",
                      fontSize: 12,
                      display: "block",
                      marginBottom: 14,
                    }}
                  >
                    Will be sent to {emailStats.promotionalSubscribers || 0}{" "}
                    subscribers.
                  </small>
                  <button
                    className="admin-btn admin-btn-primary"
                    onClick={handleSendPromotionalEmail}
                    disabled={!promotionalEmailContent.trim()}
                  >
                    <i className="bi bi-send" /> Send to All Subscribers
                  </button>
                </div>
              </div>

              <div className="admin-table-card">
                <div className="admin-table-header">
                  <h5 className="admin-table-title">Order Email Management</h5>
                </div>
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Customer</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders
                        .filter(
                          (o) =>
                            o.status === "shipped" || o.status === "processing",
                        )
                        .map((order) => (
                          <tr key={order.id}>
                            <td>#{order.id}</td>
                            <td>{order.User?.name}</td>
                            <td style={{ color: "var(--muted)", fontSize: 13 }}>
                              {order.User?.email}
                            </td>
                            <td>
                              <StatusBadge status={order.status} />
                            </td>
                            <td style={{ fontSize: 13, color: "var(--muted)" }}>
                              {new Date(order.createdAt).toLocaleDateString()}
                            </td>
                            <td>
                              <button
                                className={`admin-btn admin-btn-sm ${order.status === "shipped" ? "admin-btn-success" : "admin-btn-primary"}`}
                                onClick={() =>
                                  handleSendOrderShippedEmail(order.id)
                                }
                              >
                                <i className="bi bi-send" />{" "}
                                {order.status === "shipped"
                                  ? "Resend"
                                  : "Send Shipped"}
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                  {orders.filter(
                    (o) => o.status === "shipped" || o.status === "processing",
                  ).length === 0 && (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "40px 0",
                        color: "var(--muted)",
                      }}
                    >
                      No orders ready for shipping emails.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
