const api = typeof browser !== "undefined" ? browser : chrome;

const toggle = document.getElementById("injectToggle");

// 1. On Popup Open: Set the initial toggle state
api.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
  if (!tab?.url) return;

  const domain = new URL(tab.url).hostname;

  api.storage.local.get([domain], (result) => {
    const isEnabled = result[domain] || false;
    updateButtonUI(isEnabled);
  });
});

// 2. Handle Toggle Change
toggle.addEventListener("change", () => {
  api.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    if (!tab?.url) return;

    const domain = new URL(tab.url).hostname;
    const newState = toggle.checked;

    api.storage.local.set({ [domain]: newState }, () => {
      updateButtonUI(newState);

      // Notify content script to show/hide the panel immediately
      api.tabs.sendMessage(tab.id, {
        type: "TOGGLE_PANEL",
        enabled: newState,
      });
    });
  });
});

// 3. Update UI Function
function updateButtonUI(isEnabled) {
  toggle.checked = isEnabled;
}
