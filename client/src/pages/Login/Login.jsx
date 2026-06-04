
import React, { useState, useContext } from 'react';
import '../Login/Login.css';
import { AuthContext } from './../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* ── Left: Visual Panel ── */}
      <div className="login-visual">
        <div className="login-visual-bg" />
        <div className="login-visual-overlay" />
        <div className="login-visual-content">

          {/* Brand */}
          <Link to="/" className="login-visual-brand">
            <span className="brand-accent">Book</span>
            <span className="brand-dot" />
            Store
          </Link>

          {/* Body copy */}
          <div className="login-visual-body">
            <p className="login-visual-eyebrow">Welcome Back</p>
            <h2 className="login-visual-heading">
              Your Next Great<br /><em>Story Awaits</em>
            </h2>
            <p className="login-visual-desc">
              Sign in to access your personal library, track your orders,
              and discover curated recommendations just for you.
            </p>
          </div>

          {/* Footer */}
          <div className="login-visual-footer">
            <div className="login-visual-divider" />
            <span className="login-visual-tagline">
              Trusted by 120,000+ readers worldwide
            </span>
          </div>

        </div>
      </div>

      {/* ── Right: Form Panel ── */}
      <div className="login-form-panel">
        <div className="login-form-inner">

          {/* Mobile brand (shown below 900px) */}
          <Link to="/" className="login-mobile-brand">
            <span className="brand-accent">Book</span>
            <span className="brand-dot" />
            Store
          </Link>

          {/* Headings */}
          <p className="login-form-eyebrow">Sign In</p>
          <h1 className="login-form-title">Welcome back</h1>
          <p className="login-form-subtitle">
            Enter your credentials to continue your reading journey.
          </p>

          {/* Error */}
          {error && (
            <div className="login-error" role="alert">
              <i className="bi bi-exclamation-circle-fill" />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>

            {/* Email */}
            <div className="field-group">
              <label className="field-label" htmlFor="login-email">
                Email address
              </label>
              <div className="field-input-wrap">
                <input
                  id="login-email"
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
              <label className="field-label" htmlFor="login-password">
                Password
              </label>
              <div className="field-input-wrap">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="field-input has-pw-toggle"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
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

            {/* Forgot link */}
            <div className="field-row-meta">
              <Link to="/forgot-password" className="forgot-link">
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn-login"
              disabled={isLoading || !email || !password}
            >
              {isLoading ? (
                <>
                  <span className="btn-login-spinner" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign In
                  <i className="bi bi-arrow-right" />
                </>
              )}
            </button>

          </form>

          {/* Divider */}
          <div className="login-divider">or</div>

          {/* Register prompt */}
          <p className="login-register-prompt">
            Don't have an account?{' '}
            <Link to="/register">Create one for free</Link>
          </p>

        </div>
      </div>

    </div>
  );
};

export default Login;