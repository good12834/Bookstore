import React from "react";

const styles = {
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontWeight: 500,
    cursor: "pointer",
    border: "none",
    transition: "all 0.2s ease",
    outline: "none",
    fontFamily: "'DM Sans', sans-serif",
    lineHeight: 1,
    textDecoration: "none",
  },
  primary: {
    backgroundColor: "var(--amber)",
    color: "#fff",
    boxShadow: "0 4px 14px rgba(200, 137, 58, 0.35)",
    border: "1.5px solid var(--amber)",
  },
  secondary: {
    backgroundColor: "var(--ink)",
    color: "#fff",
    border: "1.5px solid rgba(255,255,255,0.15)",
  },
  outline: {
    backgroundColor: "transparent",
    color: "var(--amber)",
    border: "2px solid var(--amber)",
  },
  ghost: {
    backgroundColor: "transparent",
    color: "var(--ink)",
    border: "2px solid transparent",
  },
  destructive: {
    backgroundColor: "#dc2626",
    color: "#fff",
    border: "1.5px solid #dc2626",
  },
  sm: { padding: "6px 14px", fontSize: 12, borderRadius: 50 },
  md: { padding: "10px 22px", fontSize: 14, borderRadius: 50 },
  lg: { padding: "14px 32px", fontSize: 15, borderRadius: 50 },
  xl: { padding: "18px 42px", fontSize: 16, borderRadius: 50 },
};

export const Button = ({
  children,
  onClick,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  type = "button",
  fullWidth = false,
  icon,
  loading = false,
  style = {},
}) => {
  const variantStyle = styles[variant] || styles.primary;
  const sizeStyle = styles[size] || styles.md;

  const combinedStyle = {
    ...styles.base,
    ...variantStyle,
    ...sizeStyle,
    ...(fullWidth ? { width: "100%" } : {}),
    ...(disabled ? { opacity: 0.5, cursor: "not-allowed", pointerEvents: "none" } : {}),
    ...style,
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={combinedStyle}
      className={className}
      onMouseEnter={(e) => {
        if (!disabled) {
          if (variant === "primary") {
            e.currentTarget.style.backgroundColor = "var(--amber-light)";
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 8px 25px rgba(200, 137, 58, 0.45)";
          } else if (variant === "outline") {
            e.currentTarget.style.backgroundColor = "var(--amber-glow)";
            e.currentTarget.style.color = "var(--amber-light)";
            e.currentTarget.style.transform = "translateY(-2px)";
          } else if (variant === "ghost") {
            e.currentTarget.style.backgroundColor = "var(--amber-glow)";
            e.currentTarget.style.color = "var(--amber)";
          } else if (variant === "secondary") {
            e.currentTarget.style.backgroundColor = "var(--charcoal)";
            e.currentTarget.style.transform = "translateY(-2px)";
          }
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = variantStyle.backgroundColor;
          e.currentTarget.style.color = variantStyle.color;
          e.currentTarget.style.transform = "none";
          e.currentTarget.style.boxShadow = variant === "primary"
            ? "0 4px 14px rgba(200, 137, 58, 0.35)"
            : "none";
        }
      }}
    >
      {loading ? (
        <svg
          style={{ animation: "spin 0.8s linear infinite", width: 16, height: 16 }}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            style={{ opacity: 0.25 }}
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            style={{ opacity: 0.75 }}
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : icon ? (
        <span style={{ fontSize: 16, display: "flex" }}>{icon}</span>
      ) : null}
      {children && <span>{children}</span>}
    </button>
  );
};