const api = typeof browser !== "undefined" ? browser : chrome;
// worker/background.js
api.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "BC_EXECUTE_JS") {
    const tabId = sender.tab.id;

    // 1. Attach the debugger to the engine
    api.debugger.attach({ tabId }, "1.3", () => {
      // 2. Evaluate the code at the Protocol level (Immune to CSP)
      api.debugger.sendCommand(
        { tabId },
        "Runtime.evaluate",
        {
          expression: message.code,
          returnByValue: true,
          userGesture: true,
          awaitPromise: true,
        },
        (result) => {
          // Detach immediately before processing the result
          api.debugger.detach({ tabId });

          if (api.runtime.lastError) {
            sendResponse({
              success: false,
              error: api.runtime.lastError.message,
            });
          } else if (result.exceptionDetails) {
            const errorMsg =
              result.exceptionDetails.exception.description ||
              "Execution Error";
            sendResponse({ success: false, error: errorMsg });
          } else {
            let finalVal = result.result.value;

            // Handle Objects: If it's a JSON-compatible object, make it readable
            if (typeof finalVal === "object" && finalVal !== null) {
              finalVal = JSON.stringify(finalVal, null, 2);
            }

            if (finalVal !== undefined) {
              sendResponse({ success: true, result: String(finalVal) });
            }
          }
        },
      );
    });
    return true;
  }
});
api.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "CLEAR_COOKIES") {
    api.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const url = new URL(tabs[0].url);
      const cookies = await api.cookies.getAll({ domain: url.hostname });

      for (const cookie of cookies) {
        await api.cookies.remove({
          url:
            (cookie.secure ? "https://" : "http://") +
            cookie.domain +
            cookie.path,
          name: cookie.name,
        });
      }
      sendResponse({ success: true });
    });
    return true; // Keeps the message channel open for the async response
  }
});
