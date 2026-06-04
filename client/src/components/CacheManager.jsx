import React, { useState, useEffect } from "react";
import { booksApi } from "../api/booksApi";

const CacheManager = () => {
  const [cacheInfo, setCacheInfo] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isVisible) {
      updateCacheInfo();
      const interval = setInterval(updateCacheInfo, 2000); // Update every 2 seconds
      return () => clearInterval(interval);
    }
  }, [isVisible]);

  const updateCacheInfo = () => {
    const info = booksApi.getCacheInfo();
    setCacheInfo(info);
  };

  const clearCache = () => {
    booksApi.clearCache();
    updateCacheInfo();
  };

  if (!isVisible) {
    return (
      <div
        className="position-fixed bottom-0 end-0 m-3"
        style={{ zIndex: 9999 }}
      >
        <button
          className="btn btn-sm btn-outline-info rounded-circle"
          onClick={() => setIsVisible(true)}
          title="Show Cache Manager"
          style={{ width: "40px", height: "40px" }}
        >
          📊
        </button>
      </div>
    );
  }

  return (
    <div className="position-fixed bottom-0 end-0 m-3" style={{ zIndex: 9999 }}>
      <div
        className="card shadow-lg"
        style={{ width: "350px", maxHeight: "400px" }}
      >
        <div className="card-header d-flex justify-content-between align-items-center">
          <h6 className="mb-0">📊 API Cache Manager</h6>
          <div>
            <button
              className="btn btn-sm btn-outline-danger me-2"
              onClick={clearCache}
              title="Clear Cache"
            >
              🗑️
            </button>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setIsVisible(false)}
              title="Hide"
            >
              ✕
            </button>
          </div>
        </div>
        <div className="card-body" style={{ overflowY: "auto" }}>
          {cacheInfo && (
            <>
              <div className="mb-3">
                <strong>Cache Status:</strong>
                <div className="mt-1">
                  <span
                    className={`badge ${
                      cacheInfo.size > 0 ? "bg-success" : "bg-secondary"
                    }`}
                  >
                    {cacheInfo.size} entries cached
                  </span>
                </div>
              </div>

              {cacheInfo.entries.length > 0 && (
                <div>
                  <strong>Cached Endpoints:</strong>
                  <div className="mt-2" style={{ fontSize: "0.8rem" }}>
                    {cacheInfo.entries.map((entry, index) => (
                      <div
                        key={index}
                        className={`p-2 mb-1 rounded border ${
                          entry.isValid ? "border-success" : "border-warning"
                        }`}
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <span
                            className="text-truncate"
                            style={{ maxWidth: "200px" }}
                          >
                            {entry.key}
                          </span>
                          <span
                            className={`badge ${
                              entry.isValid ? "bg-success" : "bg-warning"
                            }`}
                          >
                            {entry.isValid ? "Fresh" : "Stale"}
                          </span>
                        </div>
                        <small className="text-muted">
                          {new Date(entry.timestamp).toLocaleTimeString()}
                        </small>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CacheManager;
