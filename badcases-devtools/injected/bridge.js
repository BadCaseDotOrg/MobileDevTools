window.addEventListener("message", (e) => {
  if (e.data.type !== "INJECTED_EVAL") return;

  try {
    const result = eval(e.data.code);

    window.postMessage({
      type: "INJECTED_RES",
      result
    });
  } catch (err) {
    window.postMessage({
      type: "INJECTED_RES",
      error: err.toString()
    });
  }
});