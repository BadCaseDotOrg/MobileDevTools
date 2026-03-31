import { api } from "./overlay.js";

import { injectPanel } from "./main-panel-ui.js";

import { enablePicker } from "./styles-ui.js";

// Messages from popup
api.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "INJECT_PANEL") injectPanel();
  if (msg.type === "ENABLE_PICKER") enablePicker();
});

// Listen for element selection from overlay
document.addEventListener("BC_ELEMENT_SELECTED", (e) => {
  const data = e.detail;
  const msg = `Selected element:
Tag: ${data.tag}
ID: ${data.id || "(none)"}
Class: ${data.className || "(none)"}
Selector: ${data.selector}`;

  // Log to consoleWindow
  const logEvent = new CustomEvent("BC_PANEL_LOG", { detail: msg });
  document.dispatchEvent(logEvent);
});
