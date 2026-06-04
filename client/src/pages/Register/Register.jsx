import React, { useState, useContext } from "react";
import '../Register/Register.css';
import { AuthContext } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(username, email, password);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="register-page">

      {/* ── Left: Visual Panel ── */}
      <div className="register-visual">
        <div className="register-visual-bg" />
        <div className="register-visual-overlay" />
        <div className="register-visual-content">

          {/* Brand */}
          <Link to="/" className="register-visual-brand">
            <span className="brand-accent">Book</span>
            <span className="brand-dot" />
            Store
          </Link>

          {/* Body copy */}
          <div className="register-visual-body">
            <p className="register-visual-eyebrow">Join Us</p>
            <h2 className="register-visual-heading">
              Start Your<br /><em>Reading Journey</em>
            </h2>
            <p className="register-visual-desc">
              Create an account to build your personal library, track orders,
              and receive curated book recommendations tailored to your taste.
            </p>
          </div>

          {/* Footer */}
          <div className="register-visual-footer">
            <div className="register-visual-divider" />
            <span className="register-visual-tagline">
              Join 120,000+ happy readers
            </span>
          </div>

        </div>
      </div>

      {/* ── Right: Form Panel ── */}
      <div className="register-form-panel">
        <div className="register-form-inner">

          {/* Mobile brand (shown below 900px) */}
          <Link to="/" className="register-mobile-brand">
            <span className="brand-accent">Book</span>
            <span className="brand-dot" />
            Store
          </Link>

          {/* Headings */}
          <p className="register-form-eyebrow">Create Account</p>
          <h1 className="register-form-title">Get started</h1>
          <p className="register-form-subtitle">
            Fill in your details to begin exploring our collection.
          </p>

          {/* Error */}
          {error && (
            <div className="register-error" role="alert">
              <i className="bi bi-exclamation-circle-fill" />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>

            {/* Username */}
            <div className="field-group">
              <label className="field-label" htmlFor="register-username">
                Username
              </label>
              <div className="field-input-wrap">
                <input
                  id="register-username"
                  type="text"
                  className="field-input"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
                <i className="bi bi-person" />
              </div>
            </div>

            {/* Email */}
            <div className="field-group">
              <label className="field-label" htmlFor="register-email">
                Email address
              </label>
              <div className="field-input-wrap">
                <input
                  id="register-email"
                  type="email"
                  className="field-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
                <i className="bi bi-envelope" />
              </div>
            </div>

            {/* Password */}
            <div className="field-group">
              <label className="field-label" htmlFor="register-password">
                Password
              </label>
              <div className="field-input-wrap">
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  className="field-input has-pw-toggle"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                <i className="bi bi-lock" />
                <button
                  type="button"
                  className="pw-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <i className={`bi bi-eye${showPassword ? '-slash' : ''}`} />
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" className="btn-register">
              Register
              <i className="bi bi-arrow-right" />
            </button>

          </form>

          {/* Login prompt */}
          <p className="register-login-prompt">
            Already have an account?{' '}
            <Link to="/login">Login</Link>
          </p>

        </div>
      </div>

    </div>
  );
};

export default Register;