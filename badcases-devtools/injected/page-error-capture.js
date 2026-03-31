// page-error-capture.js

(function () {
  //eval('alert("wtf")');
  const originalConsoleError = console.error;
  console.error = (...args) => {
    document.dispatchEvent(
      new CustomEvent("BC_PANEL_LOG", {
        detail:
          "[Console Error] " +
          args
            .map((a) => (typeof a === "object" ? JSON.stringify(a) : a))
            .join(" "),
      }),
    );
    originalConsoleError.apply(console, args);
  };

  const originalConsoleLog = console.log;
  console.log = (...args) => {
    document.dispatchEvent(
      new CustomEvent("BC_PANEL_LOG", {
        detail:
          "[Console Log] " +
          args
            .map((a) => (typeof a === "object" ? JSON.stringify(a) : a))
            .join(" "),
      }),
    );
    originalConsoleLog.apply(console, args);
  };

  window.addEventListener("error", (event) => {
    const msg = event.error?.stack || event.message;
    document.dispatchEvent(
      new CustomEvent("BC_PANEL_LOG", { detail: "[Runtime Error] " + msg }),
    );
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason =
      event.reason?.stack || event.reason || "Unknown Promise Rejection";
    document.dispatchEvent(
      new CustomEvent("BC_PANEL_LOG", { detail: "[Promise Error] " + reason }),
    );
  });
})();
