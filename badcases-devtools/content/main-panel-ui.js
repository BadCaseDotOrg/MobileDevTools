import { api } from "./overlay.js";

import { updateStorageUI } from "./storage-ui.js";

import { updateNetworkUI } from "./network-ui.js";

import { enablePicker } from "./styles-ui.js";

import { renderDOMTree } from "./elements-ui.js";

export let panelDiv = null;
export let shadow = null;
export let consoleWindow = null;
export let cssWindow = null;
export let codeWindow = null;
export let networkWindow = null;
export let storageWindow = null;

// Initialize history state at the top level of the script
let commandHistory = [];
let historyIndex = -1;
let currentInputBuffer = "";
// Function to bridge the Console UI to the Background Service Worker
// main-panel-ui.js

async function sendCodeToPage(codeString) {
  try {
    // THIS sends the "BC_EXECUTE_JS" message that the worker/background.js is waiting for
    const response = await api.runtime.sendMessage({
      type: "BC_EXECUTE_JS",
      code: codeString,
    });

    // Now we take the result from the background and show it in the UI
    if (response && response.success) {
      window.dispatchEvent(
        new CustomEvent("BC_CODE_RESULT", {
          detail: { result: response.result },
        }),
      );
    } else {
      window.dispatchEvent(
        new CustomEvent("BC_CODE_RESULT", {
          detail: {
            error: response ? response.error : "No response from background",
          },
        }),
      );
    }
  } catch (err) {
    // If the background script isn't running or the extension was reloaded
    window.dispatchEvent(
      new CustomEvent("BC_CODE_RESULT", {
        detail: { error: "Extension Bridge Error: " + err.message },
      }),
    );
  }
}

export function createWindow(title, bgColor, textColor, icon) {
  const container = document.createElement("div");
  container.id =
    "content-" + title.toLowerCase().replace(/\s+/g, "-") + "-wrapper";
  container.className = "content-wrapper";

  if (title === "Storage" || title === "Network") {
    container.style.display = "none";
  }
  const header = document.createElement("div");
  header.className = "content-header";
  header.style.color = textColor;

  // 1. Create the wrapper div
  const headerContent = document.createElement("div");
  headerContent.className = "header-content-wrapper";
  headerContent.style.display = "flex";
  headerContent.style.alignItems = "center";
  headerContent.style.gap = "8px";

  // 2. Create and configure the Icon
  const headerIcon = document.createElement("img");
  headerIcon.src = api.runtime.getURL("img/" + icon);
  headerIcon.style.width = "16px";
  headerIcon.style.height = "16px";
  headerIcon.style.flexShrink = "0";
  headerIcon.alt = "";

  // 3. Create the Title span
  const titleSpan = document.createElement("span");
  titleSpan.textContent = title;
  titleSpan.style.whiteSpace = "nowrap";

  // 4. Append to wrapper, then wrapper to header
  headerContent.appendChild(headerIcon);
  headerContent.appendChild(titleSpan);
  header.appendChild(headerContent);

  const handle = document.createElement("div");
  handle.className = "content-header-handle";
  const handleIcon = document.createElement("img");
  handleIcon.src = api.runtime.getURL("img/grip.svg");
  handleIcon.style.width = "16px";
  handle.style.display = "none";

  handle.appendChild(handleIcon);
  header.appendChild(handle);

  const content = document.createElement("pre");
  content.textContent = `${title} content`;
  content.id = "content-" + title.toLowerCase().replace(/\s+/g, "-");
  content.className = "content-window";
  content.style.backgroundColor = bgColor;
  if (title == "Console") {
    content.style.color = "#00FF00";
  } else {
    content.style.color = textColor;
  }
  content.style.display = "none";

  let inputWrapper = null;
  if (!title == "Elements") {
    content.style.overflowY = "clip";
  }
  if (title == "Console") {
    content.textContent = "";
    inputWrapper = document.createElement("div");
    inputWrapper.id = "console-input";
    inputWrapper.className = "console-input-wrapper";
    inputWrapper.style.display = "none";

    // Label
    const inputLabel = document.createElement("span");
    inputLabel.className = "console-input-label";
    inputLabel.textContent = ">";

    inputWrapper.appendChild(inputLabel);

    // Multiline input
    input = document.createElement("textarea");
    input.className = "console-input";
    input.placeholder = "Enter JS...";

    // Auto-resize on input
    input.addEventListener("input", () => {
      input.style.height = "20px";
      let newSize = input.scrollHeight;
      if (newSize === 28) {
        newSize = 20;
      }
      input.style.height = newSize + "px";
    });
    inputWrapper.appendChild(input);

    input.addEventListener("keydown", (e) => {
      // --- 1. HANDLE EXECUTION (ENTER) ---
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        const code = input.value.trim();
        if (!code) return;

        const lowerCode = code.toLowerCase();

        // A. Handle Local Commands (Clear / Storage)
        if (lowerCode === "clear" || lowerCode === "cls") {
          const output = shadow.querySelector("#content-console");
          if (output) output.innerHTML = "";
          input.value = "";
          return;
        }

        if (lowerCode === "storage" || lowerCode === "ls") {
          api.storage.local.get(null, (data) => {
            const formattedData = JSON.stringify(data, null, 2);
            document.dispatchEvent(
              new CustomEvent("BC_PANEL_LOG", {
                detail: "[Storage Service]\n" + formattedData,
              }),
            );
          });
          input.value = "";
          return;
        }

        // B. Save to History (Only if different from last entry)
        if (
          commandHistory.length === 0 ||
          commandHistory[commandHistory.length - 1] !== code
        ) {
          commandHistory.push(code);
          // Persist to storage
          api.storage.local.set({ bc_history: commandHistory });
        }

        // C. Reset History Navigation State
        historyIndex = -1;
        currentInputBuffer = "";

        // D. Log and Execute on Page
        document.dispatchEvent(
          new CustomEvent("BC_PANEL_LOG", { detail: "> " + code }),
        );

        sendCodeToPage(code);
        input.value = "";
      }

      // --- 2. HANDLE HISTORY BACKWARDS (UP) ---
      else if (e.key === "ArrowUp") {
        if (commandHistory.length === 0) return;

        // If starting a search, save whatever the user was currently typing
        if (historyIndex === -1) {
          currentInputBuffer = input.value;
        }

        if (historyIndex < commandHistory.length - 1) {
          historyIndex++;
          // Pull from the end of the array (most recent first)
          input.value =
            commandHistory[commandHistory.length - 1 - historyIndex];

          // Move cursor to end of the line
          setTimeout(() => {
            input.selectionStart = input.selectionEnd = input.value.length;
          }, 0);
        }
      }

      // --- 3. HANDLE HISTORY FORWARDS (DOWN) ---
      else if (e.key === "ArrowDown") {
        if (historyIndex > -1) {
          historyIndex--;
          if (historyIndex === -1) {
            // Restore what they were typing before they hit 'Up'
            input.value = currentInputBuffer;
          } else {
            input.value =
              commandHistory[commandHistory.length - 1 - historyIndex];
          }
        }
      }
    });
    window.addEventListener("BC_CODE_RESULT", (e) => {
      const { result, error } = e.detail;
      if (error) {
        content.textContent += "\nError: " + error;
      } else if (result) {
        content.textContent += "\n" + String(result);
      }
      content.scrollTop = content.scrollHeight; // auto-scroll
    });
  }
  // Collapse/expand header click
  header.addEventListener("click", (e) => {
    if (e.target === handle) return;
    if (title == "Storage") {
      updateStorageUI(storageWindow);
    }
    if (title == "Network") {
      updateNetworkUI(networkWindow);
    }
    if (title == "Elements" || title == "Styles") {
      content.style.display =
        content.style.display === "none" ? "block" : "none";
    } else if (title == "Network" || title == "Storage") {
      content.style.display =
        content.style.display === "none" ? "flex" : "none";
    }

    if (title == "Console") {
      inputWrapper.style.display =
        inputWrapper.style.display === "none" ? "flex" : "none";
      content.style.display = inputWrapper.style.display;
    }
    if (content.style.display === "block" || content.style.display === "flex") {
      // Sync the handle to match the content's display type
      handle.style.display = "flex";
    } else {
      handle.style.display = "none";
    }
    const panelHeight = panelDiv.getBoundingClientRect().height;
    const consoleContent = shadow.getElementById("content-console");
    const cssContent = shadow.getElementById("content-styles");
    const codeContent = shadow.getElementById("content-elements");
    const networkContent = shadow.getElementById("content-network");
    const storageContent = shadow.getElementById("content-storage");
    if (panelHeight > window.innerHeight) {
      const reduceBy = panelHeight - window.innerHeight;

      // Helper to get numeric height
      function getCurrentHeight(el) {
        return parseFloat(getComputedStyle(el).height);
      }

      const contents = [
        consoleContent,
        cssContent,
        codeContent,
        networkContent,
        storageContent,
      ];
      contents.forEach((el) => {
        const currentHeight = getCurrentHeight(el);
        const newHeight = currentHeight - reduceBy / 3;
        el.style.height = `${newHeight}px`;
        el.style.minHeight = `${newHeight}px`;
      });
    }
  });

  // Touch + mouse resize
  function addResizeEvents(handle, content) {
    const onMove = (startY, startHeight, moveY) => {
      let newHeight = startHeight - (moveY - startY);

      // Ensure panel's total height does not exceed viewport
      let panelHeight = panelDiv.getBoundingClientRect().height;
      const availableHeight = window.innerHeight - panelHeight;
      console.log(
        `newHeight: ${newHeight} window.innerHeight: ${window.innerHeight} panelHeight: ${panelHeight} availableHeight: ${availableHeight}`,
      );

      newHeight = Math.max(50, newHeight);
      content.style.height = newHeight + "px";
      content.style.minHeight = newHeight + "px";
      panelHeight = panelDiv.getBoundingClientRect().height;
      if (panelHeight > window.innerHeight) {
        content.style.height =
          parseInt(content.style.height) -
          (panelHeight - window.innerHeight) +
          "px";
        content.style.minHeight =
          parseInt(content.style.minHeight) -
          (panelHeight - window.innerHeight) +
          "px";
      }
    };

    handle.addEventListener("touchstart", (e) => {
      e.preventDefault();
      const startY = e.touches[0].clientY;
      const startHeight = content.offsetHeight;

      function onTouchMove(ev) {
        onMove(startY, startHeight, ev.touches[0].clientY);
      }
      function onTouchEnd() {
        shadow.removeEventListener("touchmove", onTouchMove);
        shadow.removeEventListener("touchend", onTouchEnd);
      }
      shadow.addEventListener("touchmove", onTouchMove);
      shadow.addEventListener("touchend", onTouchEnd);
    });

    handle.addEventListener("mousedown", (e) => {
      e.preventDefault();
      const startY = e.clientY;
      const startHeight = content.offsetHeight;

      function onMouseMove(ev) {
        onMove(startY, startHeight, ev.clientY);
      }
      function onMouseUp() {
        shadow.removeEventListener("mousemove", onMouseMove);
        shadow.removeEventListener("mouseup", onMouseUp);
      }
      shadow.addEventListener("mousemove", onMouseMove);
      shadow.addEventListener("mouseup", onMouseUp);
    });
  }

  addResizeEvents(handle, content);

  container.appendChild(header);
  container.appendChild(content);
  shadow.appendChild(container);
  if (title == "Console") {
    shadow.appendChild(inputWrapper);
  }
  return content;
}

export function injectPanel() {
  if (panelDiv) return;

  // 1. Create the Host
  panelDiv = document.createElement("div");
  panelDiv.id = "devtools-panel";
  document.documentElement.appendChild(panelDiv);

  // 2. Attach the Shadow Root
  shadow = panelDiv.attachShadow({ mode: "open" });

  // 3. Create and inject the style element inside the Shadow Root
  const style = document.createElement("style");
  style.id = "devtools-panel-styles";
  style.textContent = `
    :host {
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100%;
      background-color: #222;
      color: #fff;
      z-index: 9999999;
      display: flex;
      flex-direction: column;
      font-family: monospace;
      font-size: 14px;
      overflow: hidden;
      transition: height 0.2s ease-in-out;
    }

    /* The Collapse State */
    :host(.bc-collapsed) {
      height: 52px !important; 
    }

    .devtools-header {
      padding: 8px;
      background: #333;
      border-bottom: 1px solid #444;
      display: flex;
      justify-content: space-between;
    }

    .content-wrapper {
      display: flex;
      flex-direction: column;
      border-top: 1px solid rgb(85, 85, 85);
    }

    .content-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: #252525;
      padding: 0px 14px;
      cursor: pointer;
      user-select: none;
      border-top: 1px solid #444;
      border-bottom: 1px solid #222;
      min-height: 40px;
      -webkit-tap-highlight-color: transparent;
      flex-shrink: 0;
    }

    .content-header:active {
      background-color: rgb(65, 65, 65);
    }

    .header-content-wrapper {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .content-header-handle, .topbar-drag-handle {
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: ns-resize;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
      touch-action: none;
    }

    .content-header-handle img, .topbar-drag-handle img {
      width: 20px;
      height: 20px;
      opacity: 0.65;
      transition: opacity 0.2s ease;
      pointer-events: none;
    }

    .content-header-handle:active img, .topbar-drag-handle:active img {
      opacity: 1;
    }

    .content-window {
      color: rgb(0, 255, 255);
      margin: 0px;
      padding: 6px;
      white-space: pre-wrap;
      word-break: break-word;
      min-height: 25dvh;
      height: 25dvh;
      overflow-y: auto;
    }


    .console-input-wrapper {
      display: flex;
      align-items: center;
      gap: 4px;
      background-color: rgb(17, 17, 17);
    }

    .console-input-label {
      padding-inline: 10px;
      font-family: monospace;
      color: rgb(0, 255, 0);
    }

    .console-input {
      font-family: monospace;
      background-color: rgb(17, 17, 17);
      color: rgb(255, 255, 255);
      border: none;
      padding: 4px;
      resize: vertical;
      width: 100%;
      height: 20px;
      overflow: clip;
      align-content: center;
      outline: none;
    }
    .devtools-topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0px 12px;
      background: #141414;
      border-bottom: 1px solid #333;
      min-height: 52px;
      cursor: pointer;
      flex-shrink: 0;
      user-select: none;
    }

    .topbar-buttons-container {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      white-space: nowrap;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      flex-grow: 1;
    }

    .topbar-buttons-container::-webkit-scrollbar {
      display: none;
    }

    .topbar-button {
      background: #2a2a2a;
      border: 1px solid #444;
      color: #ddd;
      padding: 11px 15px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      flex-shrink: 0;
      min-height: 44px;
      display: inline-flex;
      align-items: center;
      gap: 7px;
      -webkit-tap-highlight-color: transparent;
      transition: all 0.15s ease;
      white-space: nowrap;
    }

    .topbar-button:active {
      background: #3a3a3a;
      border-color: #a6e22e;
      transform: scale(0.97);
    }

    
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-track {
  background: #1e1e1e;
  border-radius: 5px;
}

::-webkit-scrollbar-thumb {
  background-color: #555;
  border-radius: 5px;
  border: 2px solid #1e1e1e;
}

::-webkit-scrollbar-thumb:hover {
  background-color: #888;
}

* {
  scrollbar-width: thin;
  scrollbar-color: #555 #1e1e1e;
}

  `;
  shadow.appendChild(style);

  // 4. Everything from here down must use shadow.appendChild
  const topBar = document.createElement("div");
  topBar.className = "devtools-topbar";

  // 1. Create and configure the icon
  const extensionIcon = document.createElement("img");
  extensionIcon.src = api.runtime.getURL("img/icon128.png");
  extensionIcon.className = "extension-topbar-icon";
  extensionIcon.style.height = "44px";
  extensionIcon.style.paddingRight = "14px";

  // 2. Append the icon first
  topBar.appendChild(extensionIcon);

  // 3. Then create and append the container
  const btnContainer = document.createElement("div");
  btnContainer.className = "topbar-buttons-container";
  topBar.appendChild(btnContainer);

  const topbarHandle = document.createElement("div");
  topbarHandle.className = "topbar-drag-handle";
  const handleIcon = document.createElement("img");
  handleIcon.src = api.runtime.getURL("img/grip.svg");
  topbarHandle.appendChild(handleIcon);
  topBar.appendChild(topbarHandle);

  // Helper to create buttons with icons
  function createTopbarButton(text, iconFile, onClick) {
    const btn = document.createElement("button");
    btn.className = "topbar-button";
    btn.onclick = (e) => {
      e.stopPropagation();
      onClick();
    };

    // Set button to flex for easy alignment
    btn.style.display = "inline-flex";
    btn.style.alignItems = "center";
    btn.style.gap = "6px";
    btn.style.padding = "4px 8px";

    const img = document.createElement("img");
    img.src = api.runtime.getURL(`img/${iconFile}`);
    img.style.width = "14px";
    img.style.height = "14px";
    img.style.flexShrink = "0";

    const span = document.createElement("span");
    span.textContent = text;

    btn.appendChild(img);
    btn.appendChild(span);
    return btn;
  }

  // 1. Inspect Element Button
  const inspectBtn = createTopbarButton(
    "Inspect Element",
    "magnifying-glass.svg",
    () => enablePicker(),
  );

  // 2. Elements/Styles Button
  const elCSSBtn = createTopbarButton(
    "Elements/Styles",
    "square-code.svg",
    () => {},
  );

  // 3. Network/Storage Button
  const netStorBtn = createTopbarButton(
    "Network/Storage",
    "server.svg",
    () => {},
  );

  btnContainer.appendChild(inspectBtn);
  btnContainer.appendChild(elCSSBtn);
  btnContainer.appendChild(netStorBtn);
  elCSSBtn.style.display = "none";

  shadow.appendChild(topBar);

  // Toggle collapse logic
  topBar.onclick = (e) => {
    if (e.target === topBar || e.target === btnContainer) {
      panelDiv.classList.toggle("bc-collapsed");
    }
  };

  // --- DRAG PANEL ON MAIN PAGE LOGIC (Desktop & Mobile) ---
  let isDragging = false;

  topbarHandle.addEventListener("pointerdown", (e) => {
    isDragging = true;
    topbarHandle.setPointerCapture(e.pointerId); // Keeps tracking even if mouse leaves handle
    e.preventDefault();
  });

  window.addEventListener("pointermove", (e) => {
    if (!isDragging) return;

    const touchY = e.clientY;
    const screenHeight = window.innerHeight;

    // Direct style manipulation of the host element on the main page
    if (touchY < screenHeight / 2) {
      panelDiv.style.bottom = "unset";
      panelDiv.style.top = "0";
    } else {
      panelDiv.style.top = "unset";
      panelDiv.style.bottom = "0";
    }
  });

  window.addEventListener("pointerup", (e) => {
    isDragging = false;
    topbarHandle.releasePointerCapture(e.pointerId);
  });
  topbarHandle.addEventListener(
    "touchstart",
    (e) => {
      isDragging = true;
      e.preventDefault();
    },
    { passive: false },
  );

  window.addEventListener(
    "touchmove",
    (e) => {
      if (!isDragging) return;
      const touchY = e.touches[0].clientY;
      const screenHeight = window.innerHeight;

      // Direct style manipulation of the host element on the main page
      if (touchY < screenHeight / 2) {
        panelDiv.style.bottom = "unset";
        panelDiv.style.top = "0";
      } else {
        panelDiv.style.top = "unset";
        panelDiv.style.bottom = "0";
      }
    },
    { passive: false },
  );

  window.addEventListener("touchend", () => {
    isDragging = false;
  });

  consoleWindow = createWindow(
    "Console",
    "#111",
    "rgb(202 202 202)",
    "terminal.svg",
  );
  cssWindow = createWindow("Styles", "#111", "rgb(202 202 202)", "palette.svg");
  codeWindow = createWindow("Elements", "#111", "rgb(202 202 202)", "code.svg");
  networkWindow = createWindow(
    "Network",
    "#222",
    "rgb(202 202 202)",
    "network-wired.svg",
  );
  storageWindow = createWindow(
    "Storage",
    "#222",
    "rgb(202 202 202)",
    "database.svg",
  );

  netStorBtn.onclick = (e) => {
    if (e) e.stopPropagation();
    const cssWindowWrapper = shadow.getElementById("content-styles-wrapper");
    const codeWindowWrapper = shadow.getElementById("content-elements-wrapper");
    const networkWindowWrapper = shadow.getElementById(
      "content-network-wrapper",
    );
    const storageWindowWrapper = shadow.getElementById(
      "content-storage-wrapper",
    );
    elCSSBtn.style.display = "flex";
    inspectBtn.style.display = "none";
    netStorBtn.style.display = "none";
    networkWindowWrapper.style.display = "flex";
    storageWindowWrapper.style.display = "flex";
    cssWindowWrapper.style.display = "none";
    codeWindowWrapper.style.display = "none";
  };

  elCSSBtn.onclick = (e) => {
    if (e) e.stopPropagation();
    const cssWindowWrapper = shadow.getElementById("content-styles-wrapper");
    const codeWindowWrapper = shadow.getElementById("content-elements-wrapper");
    const networkWindowWrapper = shadow.getElementById(
      "content-network-wrapper",
    );
    const storageWindowWrapper = shadow.getElementById(
      "content-storage-wrapper",
    );
    elCSSBtn.style.display = "none";
    inspectBtn.style.display = "flex";
    netStorBtn.style.display = "flex";
    networkWindowWrapper.style.display = "none";
    storageWindowWrapper.style.display = "none";
    cssWindowWrapper.style.display = "flex";
    codeWindowWrapper.style.display = "flex";
  };
  document.documentElement.appendChild(panelDiv);

  api.storage.local.get(["bc_history"], (result) => {
    if (result.bc_history) {
      // This updates the global variable we defined at the top
      commandHistory = result.bc_history;
      console.log("BC_PANEL: History loaded", commandHistory.length);
    }
  });
  // CSS Auto-Complete Listeners
  shadow.addEventListener("mousedown", (e) => {
    const popup = shadow.getElementById("css-autocomplete-popup");
    if (!popup || popup.style.display === "none") return;

    if (
      !popup.contains(e.target) &&
      !e.target.classList.contains("css-editable-span")
    ) {
      popup.style.display = "none";
    }
  });

  shadow.addEventListener(
    "scroll",
    (e) => {
      const popup = shadow.getElementById("css-autocomplete-popup");
      if (!popup || popup.style.display === "none") return;

      if (!popup.contains(e.target)) {
        popup.style.display = "none";
      }
    },
    true,
  );
  const isPortrait =
    window.matchMedia("(orientation: portrait)") ||
    window.innerHeight > window.innerWidth;
  // 1. Hide text and double the icon size
  function maximizeIcons() {
    const buttons = shadow.querySelectorAll(".topbar-button");

    buttons.forEach((btn) => {
      btn.style.paddingInline = "16px";
      const span = btn.querySelector("span");
      const img = btn.querySelector("img");

      if (span) span.style.display = "none";
      if (img) {
        img.style.transform = "scale(2)";
      }
    });
  }

  // 2. Revert to original layout
  function revertIcons() {
    const buttons = shadow.querySelectorAll(".topbar-button");

    buttons.forEach((btn) => {
      btn.style.paddingInline = "";
      const span = btn.querySelector("span");
      const img = btn.querySelector("img");

      if (span) span.style.display = ""; // Reverts to CSS default
      if (img) {
        img.style.transform = "";
      }
    });
  }
  function checkOrientation() {
    const isPortraitMedia = window.matchMedia(
      "(orientation: portrait)",
    ).matches;
    const isPortraitDimensions = window.innerHeight > window.innerWidth;

    // If either is true, we treat it as portrait
    if (isPortraitMedia || isPortraitDimensions) {
      maximizeIcons();
    } else {
      revertIcons();
    }
  }

  // 1. Run on initial load
  checkOrientation();

  // 2. Run whenever the window is resized (covers rotation and manual window snapping)
  window.addEventListener("resize", checkOrientation);
  renderDOMTree(window.html, codeWindow);
}
