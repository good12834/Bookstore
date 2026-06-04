import React from "react";

const cardStyles = {
  container: {
    background: "#ffffff",
    borderRadius: "16px",
    border: "1px solid rgba(200, 137, 58, 0.12)",
    boxShadow: "0 4px 24px rgba(0, 0, 0, 0.06)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    overflow: "hidden",
  },
  header: {
    padding: "20px 24px 16px",
    borderBottom: "1px solid rgba(200, 137, 58, 0.10)",
  },
  title: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 20,
    fontWeight: 600,
    color: "var(--ink)",
    margin: 0,
    lineHeight: 1.3,
  },
  content: {
    padding: "24px",
  },
  footer: {
    padding: "16px 24px",
    borderTop: "1px solid rgba(200, 137, 58, 0.10)",
    background: "rgba(200, 137, 58, 0.03)",
  },
  hover: {
    transform: "translateY(-4px)",
    boxShadow: "0 12px 40px rgba(0, 0, 0, 0.10)",
  },
};

export const Card = ({ children, className = "", style = {}, hoverable = true }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      className={className}
      style={{
        ...cardStyles.container,
        ...(hoverable && isHovered ? cardStyles.hover : {}),
        ...style,
      }}
      onMouseEnter={() => hoverable && setIsHovered(true)}
      onMouseLeave={() => hoverable && setIsHovered(false)}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = "", style = {} }) => (
  <div className={className} style={{ ...cardStyles.header, ...style }}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = "", style = {} }) => (
  <h3 className={className} style={{ ...cardStyles.title, ...style }}>
    {children}
  </h3>
);

export const CardContent = ({ children, className = "", style = {} }) => (
  <div className={className} style={{ ...cardStyles.content, ...style }}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = "", style = {} }) => (
  <div className={className} style={{ ...cardStyles.footer, ...style }}>
    {children}
  </div>
);