const listeners = {};

export function on(action, handler) {
  if (!listeners[action]) listeners[action] = [];
  listeners[action].push(handler);
}

export function emit(action, data) {
  (listeners[action] || []).forEach(fn => fn(data));
}

// Bridge UI <-> content
window.addEventListener("message", (e) => {
  if (!e.data || !e.data.type) return;

  if (e.data.type === "DEVTOOLS_CMD") {
    emit(e.data.action, e.data.payload);
  }
});

export function respond(action, data) {
  window.postMessage({
    type: "DEVTOOLS_RES",
    action,
    data
  });
}