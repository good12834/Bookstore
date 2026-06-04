import React, { useState, useEffect } from "react";
import "./EmailPreferences.css";
import { useAuth } from "../../context/AuthContext";

/* ── Preference items config ── */
const PREFERENCE_ITEMS = [
  {
    key: "orderConfirmations",
    title: "Order Confirmations",
    description: "Receive an email every time you place a new order.",
    icon: "bi-receipt",
  },
  {
    key: "orderUpdates",
    title: "Order Updates",
    description: "Get notified when your order is shipped or delivered.",
    icon: "bi-truck",
  },
  {
    key: "promotionalEmails",
    title: "Promotional Emails",
    description: "Receive special offers, discounts, and flash-sale alerts.",
    icon: "bi-tag",
  },
  {
    key: "newsletter",
    title: "Newsletter",
    description:
      "Curated book recommendations and store news, delivered weekly.",
    icon: "bi-book",
  },
];

/* ── Custom Toggle ── */
const Toggle = ({ checked, onChange, id }) => (
  <label className="ep-toggle" htmlFor={id}>
    <input
      id={id}
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      role="switch"
      aria-checked={checked}
    />
    <span className="ep-toggle-track" />
  </label>
);

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
const EmailPreferences = () => {
  const { user } = useAuth();

  const [preferences, setPreferences] = useState({
    orderConfirmations: true,
    orderUpdates: true,
    promotionalEmails: true,
    newsletter: true,
  });
  const [loading, setLoading] = useState(false);
  const [loadingPreferences, setLoadingPreferences] = useState(true);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', msg: string }

  /* ── Fetch on mount ── */
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/email/preferences`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        if (res.ok) {
          const data = await res.json();
          setPreferences((p) => ({ ...p, ...data.preferences }));
        }
      } catch (err) {
        console.error("Error fetching email preferences:", err);
      } finally {
        setLoadingPreferences(false);
      }
    };
    fetchPreferences();
  }, []);

  /* ── Auto-dismiss toast ── */
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const handleChange = (key, value) => {
    setPreferences((p) => ({ ...p, [key]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/email/preferences`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ preferences }),
        },
      );
      setToast(
        res.ok
          ? { type: "success", msg: "Preferences saved successfully." }
          : { type: "error", msg: "Failed to save preferences." },
      );
    } catch {
      setToast({
        type: "error",
        msg: "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = () => {
    const url = `${import.meta.env.VITE_API_URL}/api/email/unsubscribe?email=${encodeURIComponent(user?.email || "")}`;
    window.open(url, "_blank");
  };

  /* ── Loading state ── */
  if (loadingPreferences) {
    return (
      <div className="ep-page">
        <div className="ep-loading">
          <div className="ep-loader-ring" />
          <p className="ep-loading-text">Loading your preferences…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ep-page">
      <div className="ep-inner">
        {/* ── Header ── */}
        <div className="ep-header">
          <span className="ep-eyebrow">Account Settings</span>
          <h1 className="ep-title">
            Email <em>Preferences</em>
          </h1>
          <p className="ep-subtitle">
            Choose which notifications you'd like to receive from us.
          </p>
        </div>

        {/* ── Preferences card ── */}
        <div className="ep-card">
          <div className="ep-section-label">
            <span className="ep-section-title">Notification Types</span>
            <span className="ep-section-hint">
              {Object.values(preferences).filter(Boolean).length} of{" "}
              {PREFERENCE_ITEMS.length} enabled
            </span>
          </div>

          {PREFERENCE_ITEMS.map((item) => (
            <div className="ep-row" key={item.key}>
              <div className="ep-row-left">
                <div className="ep-icon-wrap">
                  <i
                    className={`bi ${item.icon}`}
                    style={{ fontSize: 18, color: "var(--amber)" }}
                  />
                </div>
                <div className="ep-row-info">
                  <div className="ep-row-title">{item.title}</div>
                  <div className="ep-row-desc">{item.description}</div>
                </div>
              </div>
              <Toggle
                id={`toggle-${item.key}`}
                checked={preferences[item.key]}
                onChange={(val) => handleChange(item.key, val)}
              />
            </div>
          ))}

          {/* ── Unsubscribe ── */}
          <div className="ep-unsub">
            <div className="ep-unsub-info">
              <div className="ep-unsub-label">
                <i className="bi bi-slash-circle me-2" />
                Unsubscribe from all
              </div>
              <div className="ep-unsub-desc">
                Stop receiving all promotional and marketing emails at once.
              </div>
            </div>
            <button className="btn-unsub" onClick={handleUnsubscribe}>
              Unsubscribe
            </button>
          </div>

          {/* ── Footer ── */}
          <div className="ep-footer">
            <div>
              {toast && (
                <span className={`ep-toast ep-toast-${toast.type}`}>
                  <i
                    className={`bi bi-${toast.type === "success" ? "check-circle" : "exclamation-circle"}`}
                  />
                  {toast.msg}
                </span>
              )}
            </div>
            <button
              className="btn-save"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="btn-save-spinner" />
                  Saving…
                </>
              ) : (
                <>
                  <i className="bi bi-check2" />
                  Save Preferences
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailPreferences;
