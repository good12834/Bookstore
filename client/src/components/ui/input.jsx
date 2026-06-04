import React from "react";

export const Input = ({
  type = "text",
  placeholder,
  value,
  onChange,
  className = "",
  label,
  error,
  icon,
  ...props
}) => {
  const [focused, setFocused] = React.useState(false);

  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  };

  const labelStyle = {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
    fontWeight: 500,
    color: "var(--ink)",
    letterSpacing: "0.3px",
  };

  const wrapperStyle = {
    position: "relative",
    display: "flex",
    alignItems: "center",
  };

  const inputStyle = {
    width: "100%",
    padding: icon ? "14px 20px 14px 44px" : "14px 20px",
    border: `1.5px solid ${error ? "#dc2626" : focused ? "var(--amber)" : "var(--border)"}`,
    borderRadius: "12px",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    color: "var(--ink)",
    background: "#fff",
    outline: "none",
    transition: "all 0.2s ease",
    boxShadow: focused
      ? "0 0 0 4px var(--amber-glow)"
      : "0 1px 2px rgba(0,0,0,0.04)",
    lineHeight: 1.4,
  };

  const iconStyle = {
    position: "absolute",
    left: "16px",
    color: "var(--muted-light)",
    fontSize: 16,
    display: "flex",
    pointerEvents: "none",
  };

  const errorStyle = {
    fontSize: 12,
    color: "#dc2626",
    margin: 0,
  };

  return (
    <div style={containerStyle} className={className}>
      {label && <label style={labelStyle}>{label}</label>}
      <div style={wrapperStyle}>
        {icon && <span style={iconStyle}>{icon}</span>}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          style={inputStyle}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
      </div>
      {error && <p style={errorStyle}>{error}</p>}
    </div>
  );
};