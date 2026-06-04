import React from "react";

const PageTransition = ({ children }) => {
  return (
    <div
      style={{
        animation: "pageFadeIn 0.4s ease both",
      }}
    >
      {children}
      <style>{`
        @keyframes pageFadeIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default PageTransition;