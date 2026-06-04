import React, { createContext, useState, useContext } from "react";

export const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = "success") => {
    const id = Date.now();
    const newToast = { id, message, type };

    setToasts((prevToasts) => [...prevToasts, newToast]);

    // Auto remove toast after 3 seconds
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  };

  const removeToast = (id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, removeToast }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 9999 }}>
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} removeToast={removeToast} />
      ))}
    </div>
  );
};

const Toast = ({ toast, removeToast }) => {
  const bgColor =
    {
      success: "bg-success",
      error: "bg-danger",
      warning: "bg-warning",
      info: "bg-info",
    }[toast.type] || "bg-success";

  return (
    <div
      className={`toast show ${bgColor} text-white`}
      role="alert"
      style={{ minWidth: "300px", marginBottom: "10px" }}
    >
      <div className="toast-body d-flex justify-content-between align-items-center">
        <span>{toast.message}</span>
        <button
          type="button"
          className="btn-close btn-close-white"
          onClick={() => removeToast(toast.id)}
        ></button>
      </div>
    </div>
  );
};
