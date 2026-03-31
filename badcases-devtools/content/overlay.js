export const api = typeof browser !== "undefined" ? browser : chrome;

export function injectErrorCapture() {
  if (document.getElementById("devtools-error-capture")) return;

  const script = document.createElement("script");
  script.id = "devtools-error-capture";
  script.src = api.runtime.getURL("injected/page-error-capture.js");
  document.documentElement.appendChild(script);
  script.onload = () => script.remove();
}

export function injectNetworkSniffer() {
  if (document.getElementById("devtools-network-sniffer")) return;

  const script = document.createElement("script");
  script.id = "devtools-network-sniffer";
  script.src = api.runtime.getURL("injected/network-sniffer-inject.js");
  document.documentElement.appendChild(script);
  script.onload = () => script.remove();
}

import { panelDiv } from "./main-panel-ui.js";
import { consoleWindow } from "./main-panel-ui.js";
import { networkWindow } from "./main-panel-ui.js";
import { injectPanel } from "./main-panel-ui.js";

import { updateNetworkUI } from "./network-ui.js";
import { networkLog } from "./network-ui.js";

import { renderCSSRules } from "./styles-ui.js";

// --- Console listener ---
document.addEventListener("BC_PANEL_LOG", (e) => {
  if (!consoleWindow) return;
  consoleWindow.textContent += e.detail + "\n\n";
  consoleWindow.scrollTop = consoleWindow.scrollHeight;
});

//CSS Inspector Listeners
document.addEventListener("BC_ELEMENT_SELECTED", (e) => {
  const data = e.detail;
  if (!data || !data.element) return;

  renderCSSRules(data.element); // direct reference, no querySelector
});

//Enable/Disable Extension Listeners
const domain = window.location.hostname;

api.storage.local.get([domain], (result) => {
  if (result[domain]) {
    injectPanel(); // Only build the UI if enabled
    document.addEventListener("BC_NETWORK_REQUEST", (e) => {
      //console.log("Caught request:", e.detail.url); // Debug line
      networkLog.push(e.detail);

      updateNetworkUI(networkWindow);
    });

    injectErrorCapture();
    injectNetworkSniffer();
  }
});


api.runtime.onMessage.addListener((request) => {
  if (request.type === "TOGGLE_PANEL") {
    if (request.enabled) {
      // 1. Check if we already have a created panel in memory
      if (panelDiv) {
        // Re-attach the EXISTING element
        if (!panelDiv.isConnected) {
          document.documentElement.appendChild(panelDiv);
        }
      } else {
        // First time initialization
        injectPanel();
      }
    } else {
      // 2. Remove it from the DOM but KEEP it in the panelDiv variable
      if (panelDiv && panelDiv.isConnected) {
        panelDiv.remove();
      }
    }
  }
});
