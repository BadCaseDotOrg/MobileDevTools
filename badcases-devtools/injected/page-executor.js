// page-executor.js — injected into the page context
window.addEventListener("BC_RUN_CODE", (e) => {
  const code = e.detail.code;
  try {
    const result = eval(code);
    window.dispatchEvent(
      new CustomEvent("BC_CODE_RESULT", { detail: { result } }),
    );
  } catch (err) {
    window.dispatchEvent(
      new CustomEvent("BC_CODE_RESULT", { detail: { error: err.toString() } }),
    );
  }
});

// injected/page-executor.js
window.addEventListener("BC_RUN_CODE_INTERNAL", async (e) => {
  const { code, requestId } = e.detail;
  try {
    const result = new Function(`return (${code})`)();
    const finalResult = await Promise.resolve(result);

    window.dispatchEvent(
      new CustomEvent("BC_CODE_RESULT_INTERNAL", {
        detail: {
          requestId,
          result:
            typeof finalResult === "object"
              ? JSON.stringify(finalResult, null, 2)
              : String(finalResult),
        },
      }),
    );
  } catch (err) {
    window.dispatchEvent(
      new CustomEvent("BC_CODE_RESULT_INTERNAL", {
        detail: { requestId, error: err.message },
      }),
    );
  }
});
