// injected/network-sniffer.js
(function () {
  const dispatch = (data) => {
    document.dispatchEvent(
      new CustomEvent("BC_NETWORK_REQUEST", { detail: data }),
    );
  };

  // --- Fetch ---
  const { fetch: originalFetch } = window;
  window.fetch = async (...args) => {
    const start = performance.now();
    const url = typeof args[0] === "string" ? args[0] : args[0].url || args[0];
    try {
      const response = await originalFetch(...args);
      const end = performance.now();

      // Clone the response so the page can still read it
      const clone = response.clone();
      let body = "";

      // Only try to parse text/json to avoid crashing on images/binary
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("json") || contentType.includes("text")) {
        body = await clone.text();
      }

      dispatch({
        url,
        method: args[1]?.method || "GET",
        status: response.status,
        type: "fetch",
        time: Math.round(end - start),
        size: response.headers.get("content-length") || 0,
        responseBody: body,
      });
      return response;
    } catch (err) {
      dispatch({
        url,
        method: "FETCH",
        status: "FAIL",
        type: "fetch",
        time: 0,
      });
      throw err;
    }
  };

  // --- XHR ---
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method, url) {
    this._networkData = { method, url, start: performance.now() };
    return originalOpen.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function () {
    this.addEventListener("load", () => {
      dispatch({
        url: this._networkData.url,
        method: this._networkData.method,
        status: this.status,
        type: "xhr",
        time: Math.round(performance.now() - this._networkData.start),
        size: this.getResponseHeader("Content-Length") || 0,
      });
    });
    return originalSend.apply(this, arguments);
  };
})();
