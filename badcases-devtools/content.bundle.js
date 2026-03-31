(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // content/storage-ui.js
  function updateStorageUI(storageWindow2) {
    currentType = storageWindow2.dataset.storageType || "local";
    const searchTerm = (storageWindow2.dataset.searchTerm || "").toLowerCase();
    let data = [];
    if (currentType === "cookies") {
      data = getCookieData();
    } else {
      data = Object.entries(window[`${currentType}Storage`]);
    }
    const filteredData = data.filter(
      ([k, v]) => k.toLowerCase().includes(searchTerm) || v.toLowerCase().includes(searchTerm)
    );
    storageWindow2.innerHTML = `
  <style>
    /* Main Container */
    .storage-container {
      display: flex; flex-direction: column; height: 100%; 
      background: #272822; color: #f8f8f2; font-family: monospace; font-size: 11px;
    }

    /* Toolbar & Inputs */
    .storage-toolbar {
      padding: 10px; border-bottom: 1px solid #444; display: flex; 
      gap: 8px; align-items: center; background: #1b1c18;
    }
    #storage-type-select {
      background: #3e3f3b; color: #66d9ef; border: 1px solid #555; 
      padding: 4px; border-radius: 3px; font-size: 9px; outline: none; cursor: pointer;
    }

  #storage-search {
  flex: 1;
  min-width: 50px;
  background: #272822; 
  border: 1px solid #555; 
  color: #e6db74; 
  padding: 4px 8px; 
  border-radius: 3px; 
  font-size: 11px; 
  outline: none;
}

#storage-clear {
  flex-shrink: 0;
  background: transparent; 
  cursor: pointer; 
  border: none;
  display: flex;
}

#storage-clear img {
width: 28px;
}

#storage-refresh {
  flex-shrink: 0;
  background: transparent; 
  border: none;
  display: flex;
  cursor: pointer; 
}
#storage-refresh img {
width: 28px;
}

.storage-container {
  display: flex; 
  flex-direction: column; 
  height: 100%; 
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  background: #272822; 
  color: #f8f8f2; 
  font-family: monospace; 
  font-size: 11px;
}

.storage-body {
  overflow-y: auto;
  overflow-x: hidden;
  width: 100%;
  display: flex;
}

.storage-table { 
  width: 100%; 
  table-layout: fixed;
  border-collapse: collapse; 
  margin: 0;
}

.storage-td { 
  padding: 4px 8px; 
  overflow: hidden; 
  text-overflow: ellipsis; 
  white-space: nowrap; 
  box-sizing: border-box;
}
    .storage-table thead { 
      position: sticky; 
      top: 0; 
      background: #3e3f3b; 
      text-align: left; 
      z-index: 10; 
    }
    .storage-table th { padding: 6px 8px; border-bottom: 1px solid #555; font-weight: normal; }
    
.storage-tr { 
  border-bottom: 1px solid #333; 
}

.storage-td img { 
width: 20px;
}
.storage-td div { 
    display: flex;
    justify-content: end;
}

.editable-val:focus {
  white-space: normal;
  overflow: visible;
  word-break: break-all;
  background: #3e3f3b;
  outline: 1px solid #66d9ef;
  z-index: 20;
  position: relative;
}
    .delete-storage-item {
      display: flex; background: none; border: none; color: #f92672; cursor: pointer; font-size: 14px;
    }
  </style>

  <div class="storage-container">
    <div class="storage-toolbar">
      <select id="storage-type-select">
        <option value="local" ${currentType === "local" ? "selected" : ""}>Local Storage</option>
        <option value="session" ${currentType === "session" ? "selected" : ""}>Session Storage</option>
        <option value="cookies" ${currentType === "cookies" ? "selected" : ""}>Cookies</option>
      </select>
      
      <input id="storage-search" type="text" placeholder="Filter..." value="${searchTerm}">
      
      <button id="storage-refresh"><img src="${api.runtime.getURL("img/arrow-rotate-right.svg")}"></button>
      <button id="storage-clear"><img src="${api.runtime.getURL("img/trash-can-list.svg")}"></button>
    </div>

    <div class="storage-body">
      <table class="storage-table">
        <thead>
          <tr>
            <th style="width: 30%;">Key</th>
            <th style="width: 60%;">Value</th>
            <th style="width: 10%;"></th>
          </tr>
        </thead>
        <tbody>
          ${filteredData.map(
      ([key, val]) => `
            <tr class="storage-tr">
              <td class="storage-td" style="color: #a6e22e;" title="${key}">${key}</td>
              <td class="storage-td editable-val" data-key="${key}" contenteditable="true" 
                  style="color: #75715e;">${val}</td>
              <td class="storage-td">
                <div><button class="delete-storage-item" data-key="${key}"><img src="${api.runtime.getURL("img/trash-can.svg")}"></button></div>
              </td>
            </tr>
          `
    ).join("")}
        </tbody>
      </table>
    </div>
  </div>
`;
    storageWindow2.querySelector("#storage-type-select").onchange = (e) => {
      storageWindow2.dataset.storageType = e.target.value;
      updateStorageUI(storageWindow2);
    };
    storageWindow2.querySelector("#storage-search").oninput = (e) => {
      storageWindow2.dataset.searchTerm = e.target.value;
      updateStorageUI(storageWindow2);
    };
    storageWindow2.querySelector("#storage-refresh").onclick = () => updateStorageUI(storageWindow2);
    storageWindow2.querySelectorAll(".editable-val").forEach((cell) => {
      cell.onblur = () => {
        const key = cell.dataset.key;
        const val = cell.innerText;
        if (currentType === "cookies") {
          document.cookie = `${encodeURIComponent(key)}=${encodeURIComponent(val)}; path=/`;
        } else {
          window[`${currentType}Storage`].setItem(key, val);
        }
      };
    });
    storageWindow2.querySelectorAll(".delete-storage-item").forEach((btn) => {
      btn.onclick = () => {
        if (!confirm(`Delete ${currentType}?`)) return;
        const key = btn.dataset.key;
        if (currentType === "cookies") {
          document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        } else {
          window[`${currentType}Storage`].removeItem(key);
        }
        updateStorageUI(storageWindow2);
      };
    });
    storageWindow2.querySelector("#storage-clear").onclick = () => {
      if (!confirm(`Delete all ${currentType}?`)) return;
      if (currentType === "cookies") {
        api.runtime.sendMessage({ action: "CLEAR_COOKIES" }, (response) => {
          if (response?.success) {
            updateStorageUI(storageWindow2);
          }
        });
      } else {
        window[currentType + "Storage"].clear();
        updateStorageUI(storageWindow2);
      }
    };
  }
  var getCookieData, currentType;
  var init_storage_ui = __esm({
    "content/storage-ui.js"() {
      init_overlay();
      getCookieData = () => {
        return document.cookie.split(";").filter((c) => c.trim()).map((c) => {
          const [key, ...val] = c.split("=");
          return [key.trim(), val.join("=")];
        });
      };
      currentType = null;
    }
  });

  // content/network-ui.js
  function updateNetworkUI(networkWindow2) {
    const filterType = networkWindow2.dataset.filterType || "all";
    const searchTerm = (networkWindow2.dataset.searchTerm || "").toLowerCase();
    const filteredLog = networkLog.filter((req) => {
      if (!req || !req.url) {
        return false;
      }
      const matchesSearch = req.url.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === "all" || req.type === filterType;
      return matchesSearch && matchesType;
    });
    const totalSize = filteredLog.reduce((acc, req) => acc + (req.size || 0), 0);
    const formatSize = (bytes) => bytes > 1024 ? (bytes / 1024).toFixed(1) + " KB" : bytes + " B";
    networkWindow2.innerHTML = `
  <style>
    /* Main Container */
    .network-container {
      display: flex; flex-direction: column; height: 100%; 
      background: #272822; color: #f8f8f2; font-family: monospace; font-size: 11px;
    }

    /* Toolbar & Inputs */
    .storage-toolbar {
      padding: 10px; border-bottom: 1px solid #444; display: flex; 
      gap: 8px; align-items: center; background: #1b1c18;
    }
    .filter-group {
      display: flex; gap: 5px; align-items: center;
    }
    #storage-type-select {
      background: #3e3f3b; color: #66d9ef; border: 1px solid #555; 
      padding: 4px; border-radius: 3px; font-size: 9px; outline: none; cursor: pointer;
    }
    #net-search {
      flex: 1; background: #272822; border: 1px solid #555; 
      color: #e6db74; padding: 4px 8px; border-radius: 3px; font-size: 11px; outline: none;
    }
#net-clear {
  flex-shrink: 0;
  background: transparent; 
  cursor: pointer; 
  border: none;
  display: flex;
}

#net-clear img {
width: 28px;
}
    .net-body {
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      margin: 0;
      padding: 0;
      height: 100%;
    }

    /* Table Styling */
    .net-table { 
      width: 100%; 
      border-collapse: collapse; 
      table-layout: fixed; 
      border-spacing: 0; 
      margin: 0;
    }
    .net-table thead { 
      position: sticky; 
      top: 0; 
      background: #3e3f3b; 
      text-align: left; 
      z-index: 10; 
    }
    .net-table th { padding: 6px 8px; border-bottom: 1px solid #555; font-weight: normal; }
    
    .net-tr { border-bottom: 1px solid #333; white-space: nowrap; }
    .net-td { padding: 4px 8px; overflow: hidden; text-overflow: ellipsis; }
    
    /* Footer */
    .net-footer {
      padding: 3px 10px; background: #1b1c18; border-top: 1px solid #444; 
      font-size: 10px; color: #75715e; display: flex; gap: 15px;
    }
  </style>

  <div class="network-container">
    <div class="storage-toolbar">
      <div class="filter-group">
        <select id="storage-type-select">
          ${["all", "fetch", "js", "css", "img"].map(
      (t) => `
            <option value="${t}" ${networkWindow2.dataset.filterType === t ? "selected" : ""}>
              ${t.charAt(0).toUpperCase() + t.slice(1)}
            </option>
          `
    ).join("")}
        </select>
      </div>
      
      <input id="net-search" type="text" placeholder="Filter URL..." value="${searchTerm}">
      <button id="net-clear"><img src="${api.runtime.getURL("img/trash-can-list.svg")}"></button>
    </div>

    <div class="net-body">
      <table class="net-table">
        <thead>
          <tr>
            <th style="width: 58%;">Name</th>
            <th style="width: 12%;">Status</th>
            <th style="width: 10%;">Type</th>
            <th style="width: 10%;">Size</th>
            <th style="width: 10%;">Time</th>
          </tr>
        </thead>
        <tbody>
          ${filteredLog.toReversed().map(
      (req) => `
            <tr class="net-tr">
              <td class="net-td" style="color: #a6e22e;" title="${req.url}">
                ${req.url.split("/").pop() || req.url}
              </td>
              <td class="net-td" style="color: ${req.status >= 400 ? "#f92672" : "#f8f8f2"};">
                ${req.status}
              </td>
              <td class="net-td" style="color: #75715e;">${req.type}</td>
              <td class="net-td" style="color: #75715e;">${formatSize(req.size)}</td>
              <td class="net-td" style="color: #e6db74;">${req.time}ms</td>
            </tr>
          `
    ).join("")}
        </tbody>
      </table>
    </div>

    <div class="net-footer">
      <span>${filteredLog.length} requests</span>
      <span>${formatSize(totalSize)} transferred</span>
    </div>
  </div>
`;
    networkWindow2.querySelector("#net-search").oninput = (e) => {
      networkWindow2.dataset.searchTerm = e.target.value;
      updateNetworkUI(networkWindow2);
    };
    const filterSelect = networkWindow2.querySelector("#net-filter-select");
    if (filterSelect) {
      filterSelect.onchange = (e) => {
        networkWindow2.dataset.filterType = e.target.value;
        updateNetworkUI(networkWindow2);
      };
    }
    networkWindow2.querySelector("#net-clear").onclick = () => {
      networkLog = [];
      updateNetworkUI(networkWindow2);
    };
  }
  var networkLog;
  var init_network_ui = __esm({
    "content/network-ui.js"() {
      init_overlay();
      networkLog = [];
    }
  });

  // content/css.js
  var CSS_COLOR_PROPERTIES, CSS_COLOR_VALUES, CSS_PROPERTY_VALUES, CSS_PROPERTIES;
  var init_css = __esm({
    "content/css.js"() {
      CSS_COLOR_PROPERTIES = Object.freeze([
        "accent-color",
        "background",
        "background-color",
        "border",
        "border-block",
        "border-block-color",
        "border-block-end",
        "border-block-end-color",
        "border-block-start",
        "border-block-start-color",
        "border-bottom",
        "border-bottom-color",
        "border-color",
        "border-inline",
        "border-inline-color",
        "border-inline-end",
        "border-inline-end-color",
        "border-inline-start",
        "border-inline-start-color",
        "border-left",
        "border-left-color",
        "border-right",
        "border-right-color",
        "border-top",
        "border-top-color",
        "box-shadow",
        "caret-color",
        "color",
        "column-rule",
        "column-rule-color",
        "outline",
        "outline-color",
        "scrollbar-color",
        "text-decoration",
        "text-decoration-color",
        "text-emphasis",
        "text-emphasis-color",
        "text-shadow"
      ]);
      CSS_COLOR_VALUES = Object.freeze([
        "AliceBlue",
        "AntiqueWhite",
        "Aqua",
        "Aquamarine",
        "Azure",
        "Beige",
        "Bisque",
        "Black",
        "BlanchedAlmond",
        "Blue",
        "BlueViolet",
        "Brown",
        "BurlyWood",
        "CadetBlue",
        "Chartreuse",
        "Chocolate",
        "Coral",
        "CornflowerBlue",
        "Cornsilk",
        "Crimson",
        "Cyan",
        "DarkBlue",
        "DarkCyan",
        "DarkGoldenRod",
        "DarkGray",
        "DarkGrey",
        "DarkGreen",
        "DarkKhaki",
        "DarkMagenta",
        "DarkOliveGreen",
        "DarkOrange",
        "DarkOrchid",
        "DarkRed",
        "DarkSalmon",
        "DarkSeaGreen",
        "DarkSlateBlue",
        "DarkSlateGray",
        "DarkSlateGrey",
        "DarkTurquoise",
        "DarkViolet",
        "DeepPink",
        "DeepSkyBlue",
        "DimGray",
        "DimGrey",
        "DodgerBlue",
        "FireBrick",
        "FloralWhite",
        "ForestGreen",
        "Fuchsia",
        "Gainsboro",
        "GhostWhite",
        "Gold",
        "GoldenRod",
        "Gray",
        "Grey",
        "Green",
        "GreenYellow",
        "HoneyDew",
        "HotPink",
        "IndianRed",
        "Indigo",
        "Ivory",
        "Khaki",
        "Lavender",
        "LavenderBlush",
        "LawnGreen",
        "LemonChiffon",
        "LightBlue",
        "LightCoral",
        "LightCyan",
        "LightGoldenRodYellow",
        "LightGray",
        "LightGrey",
        "LightGreen",
        "LightPink",
        "LightSalmon",
        "LightSeaGreen",
        "LightSkyBlue",
        "LightSlateGray",
        "LightSlateGrey",
        "LightSteelBlue",
        "LightYellow",
        "Lime",
        "LimeGreen",
        "Linen",
        "Magenta",
        "Maroon",
        "MediumAquaMarine",
        "MediumBlue",
        "MediumOrchid",
        "MediumPurple",
        "MediumSeaGreen",
        "MediumSlateBlue",
        "MediumSpringGreen",
        "MediumTurquoise",
        "MediumVioletRed",
        "MidnightBlue",
        "MintCream",
        "MistyRose",
        "Moccasin",
        "NavajoWhite",
        "Navy",
        "OldLace",
        "Olive",
        "OliveDrab",
        "Orange",
        "OrangeRed",
        "Orchid",
        "PaleGoldenRod",
        "PaleGreen",
        "PaleTurquoise",
        "PaleVioletRed",
        "PapayaWhip",
        "PeachPuff",
        "Peru",
        "Pink",
        "Plum",
        "PowderBlue",
        "Purple",
        "RebeccaPurple",
        "Red",
        "RosyBrown",
        "RoyalBlue",
        "SaddleBrown",
        "Salmon",
        "SandyBrown",
        "SeaGreen",
        "SeaShell",
        "Sienna",
        "Silver",
        "SkyBlue",
        "SlateBlue",
        "SlateGray",
        "SlateGrey",
        "Snow",
        "SpringGreen",
        "SteelBlue",
        "Tan",
        "Teal",
        "Thistle",
        "Tomato",
        "Transparent",
        "Turquoise",
        "Violet",
        "Wheat",
        "White",
        "WhiteSmoke",
        "Yellow",
        "YellowGreen"
      ]);
      CSS_PROPERTY_VALUES = Object.freeze({
        "align-content": [
          "baseline",
          "center",
          "end",
          "flex-end",
          "flex-start",
          "normal",
          "space-around",
          "space-between",
          "space-evenly",
          "start",
          "stretch",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "align-items": [
          "anchor-center",
          "baseline",
          "center",
          "end",
          "flex-end",
          "flex-start",
          "normal",
          "self-end",
          "self-start",
          "start",
          "stretch",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "align-self": [
          "anchor-center",
          "auto",
          "baseline",
          "center",
          "end",
          "flex-end",
          "flex-start",
          "normal",
          "self-end",
          "self-start",
          "start",
          "stretch",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        all: ["inherit", "initial", "revert", "revert-layer", "unset"],
        "anchor-name": [
          "none",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "anchor-scope": [
          "all",
          "none",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        animation: [
          "auto",
          "none",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "animation-composition": [
          "accumulate",
          "add",
          "replace",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "animation-delay": ["inherit", "initial", "revert", "revert-layer", "unset"],
        "animation-direction": [
          "alternate",
          "alternate-reverse",
          "normal",
          "reverse",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "animation-duration": [
          "auto",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "animation-fill-mode": [
          "backwards",
          "both",
          "forwards",
          "none",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "animation-iteration-count": [
          "infinite",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "animation-name": [
          "auto",
          "none",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "animation-play-state": [
          "paused",
          "running",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "animation-range": ["inherit", "initial", "revert", "revert-layer", "unset"],
        "animation-range-end": [
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "animation-range-start": [
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "animation-timeline": [
          "auto",
          "none",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "animation-timing-function": [
          "cubic-bezier",
          "ease",
          "ease-in",
          "ease-in-out",
          "jump-both",
          "jump-end",
          "jump-none",
          "jump-start",
          "linear",
          "step-end",
          "step-start",
          "steps",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "animation-trigger": [
          "none",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "app-region": [
          "drag",
          "no-drag",
          "none",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        appearance: [
          "auto",
          "none",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "aspect-ratio": [
          "1/1",
          "16/9",
          "auto",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "backdrop-filter": [
          "blur",
          "brightness",
          "contrast",
          "drop-shadow",
          "grayscale",
          "hue-rotate",
          "invert",
          "none",
          "opacity",
          "saturate",
          "sepia",
          "url",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "backface-visibility": [
          "hidden",
          "visible",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        background: [
          "border-box",
          "bottom",
          "center",
          "content-box",
          "currentColor",
          "fixed",
          "left",
          "local",
          "no-repeat",
          "none",
          "padding-box",
          "repeat",
          "repeat-x",
          "repeat-y",
          "repeating-linear-gradient",
          "repeating-radial-gradient",
          "right",
          "round",
          "scroll",
          "space",
          "top",
          "url",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "background-attachment": [
          "fixed",
          "local",
          "scroll",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "background-blend-mode": [
          "color",
          "color-burn",
          "color-dodge",
          "darken",
          "difference",
          "exclusion",
          "hard-light",
          "hue",
          "lighten",
          "luminosity",
          "multiply",
          "normal",
          "overlay",
          "saturation",
          "screen",
          "soft-light",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "background-clip": [
          "border-box",
          "content-box",
          "padding-box",
          "text",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "background-color": [
          "currentColor",
          "currentcolor",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "background-image": [
          "url",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "background-origin": [
          "border-box",
          "content-box",
          "padding-box",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "background-position": [
          "bottom",
          "center",
          "left",
          "right",
          "top",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "background-position-x": [
          "center",
          "left",
          "right",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "background-position-y": [
          "bottom",
          "center",
          "top",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "background-repeat": [
          "no-repeat",
          "repeat",
          "repeat-x",
          "repeat-y",
          "round",
          "space",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "background-size": [
          "auto",
          "contain",
          "cover",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "baseline-shift": [
          "baseline",
          "sub",
          "super",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "baseline-source": [
          "auto",
          "first",
          "last",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "block-size": [
          "auto",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        border: [
          "dashed",
          "dotted",
          "double",
          "groove",
          "hidden",
          "medium",
          "none",
          "outset",
          "solid",
          "thick",
          "thin",
          "transparent",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "border-block": ["inherit", "initial", "revert", "revert-layer", "unset"],
        "border-block-color": [
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "border-block-end": ["inherit", "initial", "revert", "revert-layer", "unset"],
        "border-block-end-color": [
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "border-block-end-style": [
          "dashed",
          "dotted",
          "double",
          "groove",
          "hidden",
          "none",
          "outset",
          "solid",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "border-block-end-width": [
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "border-block-start": [
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "border-block-start-color": [
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "border-block-start-style": [
          "dashed",
          "dotted",
          "double",
          "groove",
          "hidden",
          "none",
          "outset",
          "solid",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "border-block-start-width": [
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "border-block-style": [
          "dashed",
          "dotted",
          "double",
          "groove",
          "hidden",
          "none",
          "outset",
          "solid",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "border-block-width": [
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "border-bottom": [
          "dashed",
          "dotted",
          "double",
          "groove",
          "hidden",
          "none",
          "outset",
          "solid",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "border-bottom-color": [
          "none",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "border-bottom-left-radius": [
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "border-bottom-right-radius": [
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "border-bottom-style": [
          "dashed",
          "dotted",
          "double",
          "groove",
          "hidden",
          "none",
          "outset",
          "solid",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "border-bottom-width": [
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "border-collapse": [
          "collapse",
          "separate",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "border-color": [
          "none",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "border-end-end-radius": [
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "border-end-start-radius": [
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "border-radius": ["inherit", "initial", "revert", "revert-layer", "unset"],
        "border-style": [
          "dashed",
          "dotted",
          "double",
          "groove",
          "hidden",
          "inset",
          "none",
          "outset",
          "ridge",
          "solid",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "border-width": [
          "medium",
          "thick",
          "thin",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "box-align": [
          "baseline",
          "center",
          "end",
          "start",
          "stretch",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "box-decoration-break": [
          "clone",
          "slice",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "box-direction": [
          "inherit",
          "normal",
          "reverse",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "box-lines": [
          "multiple",
          "single",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "box-orient": [
          "block-axis",
          "horizontal",
          "inline-axis",
          "vertical",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "box-pack": [
          "center",
          "end",
          "justify",
          "start",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "box-shadow": [
          "inset",
          "none",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "box-sizing": [
          "border-box",
          "content-box",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "break-after": [
          "all",
          "always",
          "avoid",
          "avoid-column",
          "avoid-page",
          "avoid-region",
          "column",
          "left",
          "page",
          "recto",
          "region",
          "right",
          "verso",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "break-before": [
          "all",
          "always",
          "avoid",
          "avoid-column",
          "avoid-page",
          "avoid-region",
          "column",
          "left",
          "page",
          "recto",
          "region",
          "right",
          "verso",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "break-inside": [
          "avoid",
          "avoid-column",
          "avoid-page",
          "avoid-region",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "caption-side": [
          "block-end",
          "block-start",
          "bottom",
          "inline-end",
          "inline-start",
          "top",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        clear: [
          "both",
          "inline-end",
          "inline-start",
          "left",
          "none",
          "right",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "clip-path": [
          "border-box",
          "content-box",
          "fill-box",
          "margin-box",
          "none",
          "padding-box",
          "stroke-box",
          "view-box",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "clip-rule": [
          "evenodd",
          "nonzero",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "color-interpolation": [
          "auto",
          "linearRGB",
          "sRGB",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "color-scheme": [
          "dark",
          "light",
          "normal",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "column-fill": [
          "auto",
          "balance",
          "balance-all",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "column-rule-style": [
          "dashed",
          "dotted",
          "double",
          "groove",
          "hidden",
          "inset",
          "none",
          "outset",
          "ridge",
          "solid",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "column-span": [
          "all",
          "none",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        contain: [
          "content",
          "inline-size",
          "layout",
          "none",
          "paint",
          "size",
          "strict",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "contain-intrinsic-size": [
          "auto",
          "none",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "container-type": [
          "inline-size",
          "normal",
          "size",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "content-visibility": [
          "auto",
          "hidden",
          "visible",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        cursor: [
          "alias",
          "all-scroll",
          "auto",
          "cell",
          "col-resize",
          "context-menu",
          "copy",
          "crosshair",
          "default",
          "e-resize",
          "ew-resize",
          "grab",
          "grabbing",
          "help",
          "move",
          "n-resize",
          "ne-resize",
          "nesw-resize",
          "no-drop",
          "none",
          "not-allowed",
          "ns-resize",
          "nw-resize",
          "nwse-resize",
          "pointer",
          "progress",
          "row-resize",
          "s-resize",
          "se-resize",
          "sw-resize",
          "text",
          "vertical-text",
          "w-resize",
          "wait",
          "zoom-in",
          "zoom-out",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        direction: [
          "ltr",
          "rtl",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        display: [
          "block",
          "contents",
          "flex",
          "flow",
          "flow-root",
          "grid",
          "grid-lanes",
          "inline",
          "inline-block",
          "inline-flex",
          "inline-grid",
          "inline-grid-lanes",
          "inline-table",
          "list-item",
          "math",
          "none",
          "ruby",
          "ruby-text",
          "table",
          "table-caption",
          "table-cell",
          "table-column",
          "table-column-group",
          "table-footer-group",
          "table-header-group",
          "table-row",
          "table-row-group",
          "-webkit-box",
          "-webkit-inline-box",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "empty-cells": [
          "hide",
          "show",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "field-sizing": [
          "content",
          "fixed",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        flex: [
          "auto",
          "none",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "flex-basis": [
          "auto",
          "content",
          "fit-content",
          "max-content",
          "min-content",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "flex-direction": [
          "column",
          "column-reverse",
          "row",
          "row-reverse",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "flex-flow": [
          "column",
          "column-reverse",
          "nowrap",
          "row",
          "row-reverse",
          "wrap",
          "wrap-reverse",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "flex-grow": ["inherit", "initial", "revert", "revert-layer", "unset"],
        "flex-shrink": ["inherit", "initial", "revert", "revert-layer", "unset"],
        "flex-wrap": [
          "balance",
          "nowrap",
          "wrap",
          "wrap-reverse",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        float: [
          "inline-end",
          "inline-start",
          "left",
          "none",
          "right",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "font-family": [
          "cursive",
          "fantasy",
          "monospace",
          "sans-serif",
          "serif",
          "system-ui",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "font-kerning": [
          "auto",
          "none",
          "normal",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "font-stretch": [
          "condensed",
          "expanded",
          "extra-condensed",
          "extra-expanded",
          "normal",
          "semi-condensed",
          "semi-expanded",
          "ultra-condensed",
          "ultra-expanded",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "font-style": [
          "italic",
          "normal",
          "oblique",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "font-variant": [
          "all-petite-caps",
          "all-small-caps",
          "common-ligatures",
          "historical-forms",
          "historical-ligatures",
          "none",
          "normal",
          "no-common-ligatures",
          "no-discretionary-ligatures",
          "no-historical-ligatures",
          "ordinal",
          "petite-caps",
          "slashed-zero",
          "small-caps",
          "titling-caps",
          "unicase",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "font-weight": [
          "bold",
          "bolder",
          "lighter",
          "normal",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "forced-color-adjust": [
          "auto",
          "none",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "grid-auto-columns": [
          "auto",
          "max-content",
          "min-content",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "grid-auto-flow": [
          "column",
          "dense",
          "row",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "grid-auto-rows": [
          "auto",
          "max-content",
          "min-content",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "grid-column-end": [
          "auto",
          "span",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "grid-column-start": [
          "auto",
          "span",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "grid-row-end": [
          "auto",
          "span",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "grid-row-start": [
          "auto",
          "span",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "grid-template-areas": [
          "none",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "grid-template-columns": [
          "auto",
          "max-content",
          "min-content",
          "none",
          "subgrid",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "grid-template-rows": [
          "auto",
          "max-content",
          "min-content",
          "none",
          "subgrid",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "hanging-punctuation": [
          "allow-end",
          "first",
          "force-end",
          "last",
          "none",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "hyphenate-character": [
          "auto",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "hyphenate-limit-chars": [
          "auto",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        hyphens: [
          "auto",
          "manual",
          "none",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "image-orientation": [
          "from-image",
          "none",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "image-rendering": [
          "auto",
          "crisp-edges",
          "pixelated",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "image-resolution": [
          "from-image",
          "snap",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "initial-letter": [
          "drop",
          "normal",
          "raise",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "inline-size": [
          "auto",
          "fit-content",
          "max-content",
          "min-content",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        inset: ["auto", "inherit", "initial", "revert", "revert-layer", "unset"],
        "inset-block": [
          "auto",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "inset-inline": [
          "auto",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        isolation: [
          "auto",
          "isolate",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "justify-content": [
          "center",
          "end",
          "flex-end",
          "flex-start",
          "left",
          "normal",
          "right",
          "space-around",
          "space-between",
          "space-evenly",
          "start",
          "stretch",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "justify-items": [
          "anchor-center",
          "baseline",
          "center",
          "end",
          "flex-end",
          "flex-start",
          "legacy",
          "left",
          "normal",
          "right",
          "self-end",
          "self-start",
          "start",
          "stretch",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "justify-self": [
          "anchor-center",
          "auto",
          "baseline",
          "center",
          "end",
          "flex-end",
          "flex-start",
          "left",
          "normal",
          "right",
          "self-end",
          "self-start",
          "start",
          "stretch",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        left: ["auto", "inherit", "initial", "revert", "revert-layer", "unset"],
        "letter-spacing": [
          "normal",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "line-break": [
          "anywhere",
          "auto",
          "loose",
          "normal",
          "strict",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "line-clamp": [
          "none",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "line-height": [
          "normal",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "list-style-image": [
          "none",
          "url",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "list-style-position": [
          "inside",
          "outside",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "list-style-type": [
          "circle",
          "disc",
          "decimal",
          "decimal-leading-zero",
          "lower-alpha",
          "lower-greek",
          "lower-latin",
          "lower-roman",
          "none",
          "square",
          "upper-alpha",
          "upper-latin",
          "upper-roman",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        margin: ["auto", "inherit", "initial", "revert", "revert-layer", "unset"],
        "margin-block": [
          "auto",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "margin-inline": [
          "auto",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "mask-clip": [
          "border-box",
          "content-box",
          "fill-box",
          "margin-box",
          "no-clip",
          "padding-box",
          "stroke-box",
          "view-box",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "mask-composite": [
          "add",
          "exclude",
          "intersect",
          "subtract",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "mask-image": [
          "none",
          "url",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "mask-mode": [
          "alpha",
          "luminance",
          "match-source",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "mask-origin": [
          "border-box",
          "content-box",
          "fill-box",
          "margin-box",
          "padding-box",
          "stroke-box",
          "view-box",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "mask-repeat": [
          "no-repeat",
          "repeat",
          "repeat-x",
          "repeat-y",
          "round",
          "space",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "mask-type": [
          "alpha",
          "luminance",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "math-depth": [
          "auto-add",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "math-shift": [
          "compact",
          "normal",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "math-style": [
          "compact",
          "normal",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "max-block-size": [
          "auto",
          "fit-content",
          "max-content",
          "min-content",
          "none",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "max-height": [
          "fit-content",
          "max-content",
          "min-content",
          "none",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "max-inline-size": [
          "auto",
          "fit-content",
          "max-content",
          "min-content",
          "none",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "max-width": [
          "fit-content",
          "max-content",
          "min-content",
          "none",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "mix-blend-mode": [
          "color",
          "color-burn",
          "color-dodge",
          "darken",
          "difference",
          "exclusion",
          "hard-light",
          "hue",
          "lighten",
          "luminosity",
          "multiply",
          "normal",
          "overlay",
          "plus-darker",
          "plus-lighter",
          "saturation",
          "screen",
          "soft-light",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "object-fit": [
          "contain",
          "cover",
          "fill",
          "none",
          "scale-down",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "object-position": [
          "bottom",
          "center",
          "left",
          "right",
          "top",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "offset-anchor": [
          "auto",
          "bottom",
          "center",
          "left",
          "right",
          "top",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "offset-path": [
          "none",
          "ray",
          "url",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "offset-position": [
          "auto",
          "bottom",
          "center",
          "left",
          "right",
          "top",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        opacity: ["inherit", "initial", "revert", "revert-layer", "unset"],
        order: ["inherit", "initial", "revert", "revert-layer", "unset"],
        orphans: ["inherit", "initial", "revert", "revert-layer", "unset"],
        "outline-style": [
          "dashed",
          "dotted",
          "double",
          "groove",
          "hidden",
          "inset",
          "none",
          "outset",
          "ridge",
          "solid",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        overflow: [
          "auto",
          "clip",
          "hidden",
          "scroll",
          "visible",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "overflow-anchor": [
          "auto",
          "none",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "overflow-wrap": [
          "anywhere",
          "break-word",
          "normal",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "overscroll-behavior": [
          "auto",
          "contain",
          "none",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        padding: ["inherit", "initial", "revert", "revert-layer", "unset"],
        "page-break-after": [
          "always",
          "auto",
          "avoid",
          "left",
          "right",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "perspective-origin": [
          "bottom",
          "center",
          "left",
          "right",
          "top",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "pointer-events": [
          "all",
          "auto",
          "fill",
          "none",
          "painted",
          "stroke",
          "visible",
          "visibleFill",
          "visiblePainted",
          "visibleStroke",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        position: [
          "absolute",
          "fixed",
          "relative",
          "static",
          "sticky",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "print-color-adjust": [
          "economy",
          "exact",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        resize: [
          "block",
          "both",
          "horizontal",
          "inline",
          "none",
          "vertical",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        right: ["auto", "inherit", "initial", "revert", "revert-layer", "unset"],
        "row-gap": [
          "normal",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "ruby-align": [
          "center",
          "distribute-letter",
          "distribute-space",
          "left",
          "right",
          "space-around",
          "space-between",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "ruby-position": [
          "alternate",
          "over",
          "under",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "scroll-behavior": [
          "auto",
          "smooth",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "scroll-snap-align": [
          "center",
          "end",
          "none",
          "start",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "scroll-snap-stop": [
          "always",
          "normal",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "scroll-snap-type": [
          "both",
          "block",
          "inline",
          "none",
          "x",
          "y",
          "mandatory",
          "proximity",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "shape-outside": [
          "border-box",
          "content-box",
          "margin-box",
          "none",
          "padding-box",
          "url",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        speak: [
          "always",
          "auto",
          "never",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "table-layout": [
          "auto",
          "fixed",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "text-align": [
          "center",
          "end",
          "justify",
          "left",
          "match-parent",
          "right",
          "start",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "text-align-last": [
          "auto",
          "center",
          "end",
          "justify",
          "left",
          "right",
          "start",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "text-anchor": [
          "end",
          "middle",
          "start",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "text-combine-upright": [
          "all",
          "none",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "text-decoration-line": [
          "blink",
          "line-through",
          "none",
          "overline",
          "underline",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "text-decoration-skip-ink": [
          "all",
          "auto",
          "none",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "text-decoration-style": [
          "dashed",
          "dotted",
          "double",
          "solid",
          "wavy",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "text-emphasis-position": [
          "over",
          "under",
          "left",
          "right",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "text-emphasis-style": [
          "circle",
          "dot",
          "double-circle",
          "filled",
          "none",
          "open",
          "sesame",
          "triangle",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "text-indent": [
          "each-line",
          "hanging",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "text-justify": [
          "auto",
          "distribute",
          "inter-character",
          "inter-word",
          "none",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "text-orientation": [
          "mixed",
          "sideways",
          "upright",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "text-overflow": [
          "clip",
          "ellipsis",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "text-rendering": [
          "auto",
          "geometricPrecision",
          "optimizeLegibility",
          "optimizeSpeed",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "text-shadow": [
          "none",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "text-transform": [
          "capitalize",
          "full-width",
          "lowercase",
          "none",
          "uppercase",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "text-wrap": [
          "balance",
          "nowrap",
          "pretty",
          "stable",
          "wrap",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "touch-action": [
          "auto",
          "manipulation",
          "none",
          "pan-down",
          "pan-left",
          "pan-right",
          "pan-up",
          "pan-x",
          "pan-y",
          "pinch-zoom",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        transform: ["none", "inherit", "initial", "revert", "revert-layer", "unset"],
        "transform-box": [
          "border-box",
          "content-box",
          "fill-box",
          "stroke-box",
          "view-box",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "transform-style": [
          "flat",
          "preserve-3d",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "transition-property": [
          "all",
          "none",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "transition-timing-function": [
          "ease",
          "ease-in",
          "ease-in-out",
          "ease-out",
          "linear",
          "step-end",
          "step-start",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "unicode-bidi": [
          "isolate",
          "isolate-override",
          "normal",
          "plaintext",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "user-select": [
          "all",
          "auto",
          "contain",
          "none",
          "text",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "vertical-align": [
          "baseline",
          "bottom",
          "middle",
          "sub",
          "super",
          "text-bottom",
          "text-top",
          "top",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "view-transition-name": [
          "none",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        visibility: [
          "collapse",
          "hidden",
          "visible",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "white-space": [
          "break-spaces",
          "normal",
          "nowrap",
          "pre",
          "pre-line",
          "pre-wrap",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "will-change": [
          "auto",
          "contents",
          "scroll-position",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "word-break": [
          "break-all",
          "break-word",
          "keep-all",
          "normal",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "writing-mode": [
          "horizontal-tb",
          "vertical-lr",
          "vertical-rl",
          "inherit",
          "initial",
          "revert",
          "revert-layer",
          "unset"
        ],
        "z-index": ["auto", "inherit", "initial", "revert", "revert-layer", "unset"]
      });
      CSS_PROPERTIES = Object.freeze([
        "accent-color",
        "align-content",
        "align-items",
        "align-self",
        "all",
        "animation",
        "animation-delay",
        "animation-direction",
        "animation-duration",
        "animation-fill-mode",
        "animation-iteration-count",
        "animation-name",
        "animation-play-state",
        "animation-timing-function",
        "aspect-ratio",
        "backdrop-filter",
        "backface-visibility",
        "background",
        "background-attachment",
        "background-blend-mode",
        "background-clip",
        "background-color",
        "background-image",
        "background-origin",
        "background-position",
        "background-position-x",
        "background-position-y",
        "background-repeat",
        "background-size",
        "block-size",
        "border",
        "border-block",
        "border-block-color",
        "border-block-end",
        "border-block-end-color",
        "border-block-end-style",
        "border-block-end-width",
        "border-block-start",
        "border-block-start-color",
        "border-block-start-style",
        "border-block-start-width",
        "border-block-style",
        "border-block-width",
        "border-bottom",
        "border-bottom-color",
        "border-bottom-left-radius",
        "border-bottom-right-radius",
        "border-bottom-style",
        "border-bottom-width",
        "border-collapse",
        "border-color",
        "border-end-end-radius",
        "border-end-start-radius",
        "border-image",
        "border-image-outset",
        "border-image-repeat",
        "border-image-slice",
        "border-image-source",
        "border-image-width",
        "border-inline",
        "border-inline-color",
        "border-inline-end",
        "border-inline-end-color",
        "border-inline-end-style",
        "border-inline-end-width",
        "border-inline-start",
        "border-inline-start-color",
        "border-inline-start-style",
        "border-inline-start-width",
        "border-inline-style",
        "border-inline-width",
        "border-left",
        "border-left-color",
        "border-left-style",
        "border-left-width",
        "border-radius",
        "border-right",
        "border-right-color",
        "border-right-style",
        "border-right-width",
        "border-spacing",
        "border-start-end-radius",
        "border-start-start-radius",
        "border-style",
        "border-top",
        "border-top-color",
        "border-top-left-radius",
        "border-top-right-radius",
        "border-top-style",
        "border-top-width",
        "border-width",
        "bottom",
        "box-decoration-break",
        "box-reflect",
        "box-shadow",
        "box-sizing",
        "break-after",
        "break-before",
        "break-inside",
        "caption-side",
        "caret-color",
        "@charset",
        "clear",
        "clip",
        "clip-path",
        "color",
        "color-scheme",
        "column-count",
        "column-fill",
        "column-gap",
        "column-rule",
        "column-rule-color",
        "column-rule-style",
        "column-rule-width",
        "column-span",
        "column-width",
        "columns",
        "@container",
        "content",
        "counter-increment",
        "counter-reset",
        "counter-set",
        "@counter-style",
        "cursor",
        "direction",
        "display",
        "empty-cells",
        "filter",
        "flex",
        "flex-basis",
        "flex-direction",
        "flex-flow",
        "flex-grow",
        "flex-shrink",
        "flex-wrap",
        "float",
        "font",
        "@font-face",
        "font-family",
        "font-feature-settings",
        "font-kerning",
        "font-language-override",
        "@font-palette-values",
        "font-size",
        "font-size-adjust",
        "font-stretch",
        "font-style",
        "font-synthesis",
        "font-variant",
        "font-variant-alternates",
        "font-variant-caps",
        "font-variant-east-asian",
        "font-variant-ligatures",
        "font-variant-numeric",
        "font-variant-position",
        "font-weight",
        "gap",
        "grid",
        "grid-area",
        "grid-auto-columns",
        "grid-auto-flow",
        "grid-auto-rows",
        "grid-column",
        "grid-column-end",
        "grid-column-start",
        "grid-row",
        "grid-row-end",
        "grid-row-start",
        "grid-template",
        "grid-template-areas",
        "grid-template-columns",
        "grid-template-rows",
        "hanging-punctuation",
        "height",
        "hyphens",
        "hyphenate-character",
        "image-rendering",
        "@import",
        "initial-letter",
        "inline-size",
        "inset",
        "inset-block",
        "inset-block-end",
        "inset-block-start",
        "inset-inline",
        "inset-inline-end",
        "inset-inline-start",
        "isolation",
        "justify-content",
        "justify-items",
        "justify-self",
        "@keyframes",
        "@layer",
        "left",
        "letter-spacing",
        "line-break",
        "line-height",
        "list-style",
        "list-style-image",
        "list-style-position",
        "list-style-type",
        "margin",
        "margin-block",
        "margin-block-end",
        "margin-block-start",
        "margin-bottom",
        "margin-inline",
        "margin-inline-end",
        "margin-inline-start",
        "margin-left",
        "margin-right",
        "margin-top",
        "marker",
        "marker-end",
        "marker-mid",
        "marker-start",
        "mask",
        "mask-clip",
        "mask-composite",
        "mask-image",
        "mask-mode",
        "mask-origin",
        "mask-position",
        "mask-repeat",
        "mask-size",
        "mask-type",
        "max-height",
        "max-width",
        "@media",
        "max-block-size",
        "max-inline-size",
        "min-block-size",
        "min-inline-size",
        "min-height",
        "min-width",
        "mix-blend-mode",
        "@namespace",
        "object-fit",
        "object-position",
        "offset",
        "offset-anchor",
        "offset-distance",
        "offset-path",
        "offset-position",
        "offset-rotate",
        "opacity",
        "order",
        "orphans",
        "outline",
        "outline-color",
        "outline-offset",
        "outline-style",
        "outline-width",
        "overflow-wrap",
        "overflow-x",
        "overflow-y",
        "overscroll-behavior",
        "overscroll-behavior-block",
        "overscroll-behavior-inline",
        "overscroll-behavior-x",
        "overscroll-behavior-y",
        "padding",
        "padding-block",
        "padding-block-end",
        "padding-block-start",
        "padding-bottom",
        "padding-inline",
        "padding-inline-end",
        "padding-inline-start",
        "padding-left",
        "padding-right",
        "padding-top",
        "@page",
        "page-break-after",
        "page-break-before",
        "page-break-inside",
        "paint-order",
        "perspective",
        "perspective-origin",
        "place-content",
        "place-items",
        "place-self",
        "pointer-events",
        "position",
        "@property",
        "quotes",
        "resize",
        "right",
        "rotate",
        "row-gap",
        "scale",
        "@scope",
        "scroll-behavior",
        "scroll-margin",
        "scroll-margin-block",
        "scroll-margin-block-end",
        "scroll-margin-block-start",
        "scroll-margin-bottom",
        "scroll-margin-inline",
        "scroll-margin-inline-end",
        "scroll-margin-inline-start",
        "scroll-margin-left",
        "scroll-margin-right",
        "scroll-margin-top",
        "scroll-padding",
        "scroll-padding-block",
        "scroll-padding-block-end",
        "scroll-padding-block-start",
        "scroll-padding-bottom",
        "scroll-padding-inline",
        "scroll-padding-inline-end",
        "scroll-padding-inline-start",
        "scroll-padding-left",
        "scroll-padding-right",
        "scroll-padding-top",
        "scroll-snap-align",
        "scroll-snap-stop",
        "scroll-snap-type",
        "scrollbar-color",
        "shape-outside",
        "@starting-style",
        "@supports",
        "tab-size",
        "table-layout",
        "text-align",
        "text-align-last",
        "text-combine-upright",
        "text-decoration",
        "text-decoration-color",
        "text-decoration-line",
        "text-decoration-style",
        "text-decoration-thickness",
        "text-emphasis",
        "text-emphasis-color",
        "text-emphasis-position",
        "text-emphasis-style",
        "text-indent",
        "text-justify",
        "text-orientation",
        "text-overflow",
        "text-shadow",
        "text-transform",
        "text-underline-offset",
        "text-underline-position",
        "top",
        "transform",
        "transform-origin",
        "transform-style",
        "transition",
        "transition-delay",
        "transition-duration",
        "transition-property",
        "transition-timing-function",
        "translate",
        "unicode-bidi",
        "user-select",
        "vertical-align",
        "visibility",
        "white-space",
        "widows",
        "width",
        "word-break",
        "word-spacing",
        "word-wrap",
        "writing-mode",
        "z-index",
        "zoom"
      ]);
    }
  });

  // content/elements-ui.js
  function renderDOMTree(el = document.documentElement, container = codeWindow, level = 0) {
    if (!container) return;
    if (level === 0) container.innerHTML = "";
    const children = Array.from(el.childNodes).filter((node) => {
      if (node.id === "devtools-panel") return false;
      return node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== "";
    });
    if (el.nodeType === Node.TEXT_NODE && el.textContent.trim() === "") return;
    const row = document.createElement("div");
    row.style.cssText = `padding-left: ${level * 12}px; cursor: pointer; user-select: none; display: flex; align-items: center; gap: 4px; font-family: monospace;`;
    row._element = el;
    const tagName = el.tagName ? el.tagName.toLowerCase() : "";
    let closeRow = null;
    if (el.nodeType === Node.ELEMENT_NODE && children.length > 0) {
      closeRow = document.createElement("div");
      closeRow._isClosingTag = true;
      closeRow.style.cssText = `padding-left: ${level * 12}px; font-family: monospace; color: #f92672; display: none;`;
      closeRow.textContent = `</${tagName}>`;
    }
    const label = createHTMLLabel(el);
    label.className = "node-label";
    let inlineClosingSpan = null;
    if (el.nodeType === Node.ELEMENT_NODE && children.length > 0) {
      inlineClosingSpan = document.createElement("span");
      inlineClosingSpan.style.color = "#f92672";
      inlineClosingSpan.textContent = `</${tagName}>`;
      label.appendChild(inlineClosingSpan);
    }
    const toggle = document.createElement("span");
    toggle.textContent = children.length ? "\u25B6" : "\u2022";
    toggle.style.width = "12px";
    toggle.style.flexShrink = "0";
    let expanded = false;
    toggle.addEventListener("click", (e) => {
      if (!children.length) return;
      e.stopPropagation();
      if (!expanded) {
        const childrenContainer = document.createElement("div");
        childrenContainer.style.display = "flex";
        childrenContainer.style.flexDirection = "column";
        childrenContainer.style.width = "100%";
        row.after(childrenContainer);
        row._childrenContainer = childrenContainer;
        children.forEach(
          (child) => renderDOMTree(child, childrenContainer, level + 1)
        );
        toggle.textContent = "\u25BC";
        if (closeRow) closeRow.style.display = "block";
        if (inlineClosingSpan) inlineClosingSpan.style.display = "none";
      } else {
        if (row._childrenContainer) row._childrenContainer.remove();
        toggle.textContent = "\u25B6";
        if (closeRow) closeRow.style.display = "none";
        if (inlineClosingSpan) inlineClosingSpan.style.display = "inline";
      }
      expanded = !expanded;
    });
    let touchTimer = null;
    const startEditing = (e) => {
      e.stopPropagation();
      if (el.nodeType !== Node.ELEMENT_NODE) return;
      if (inlineClosingSpan && inlineClosingSpan.parentNode === label) {
        label.removeChild(inlineClosingSpan);
      }
      const originalHTML = el.outerHTML;
      const textarea = document.createElement("textarea");
      textarea.value = originalHTML;
      textarea.style.cssText = "width: 100%; font-family: monospace; min-height: 60px; background: #1a1a1a; color: #fff; border: 1px solid #444; border-radius: 4px; padding: 5px;";
      row.replaceChild(textarea, label);
      textarea.focus();
      function commit() {
        try {
          const cleanValue = textarea.value.trim();
          if (!cleanValue) throw new Error("Empty HTML");
          const parser = new DOMParser();
          const doc = parser.parseFromString(cleanValue, "text/html");
          let newSource;
          if (el.tagName === "HTML") newSource = doc.documentElement;
          else if (el.tagName === "HEAD") newSource = doc.head;
          else if (el.tagName === "BODY") newSource = doc.body;
          else newSource = doc.body.firstElementChild;
          if (!newSource && cleanValue !== "") throw new Error("Invalid HTML");
          const isRoot = ["HTML", "HEAD", "BODY"].includes(el.tagName);
          const isCustom = el.tagName.includes("-");
          const hasCustomChild = !!Array.from(el.querySelectorAll("*")).find(
            (node) => node.tagName.includes("-")
          );
          const isOurPanel = el.id === "devtools-panel" || el.closest("#devtools-panel");
          if ((isRoot || isCustom || hasCustomChild) && !isOurPanel) {
            const panel = document.getElementById("devtools-panel");
            const panelWasInside = panel && el.contains(panel);
            if (panelWasInside) {
              document.documentElement.appendChild(panel);
            }
            const currentAttrs = Array.from(el.attributes);
            currentAttrs.forEach((attr) => el.removeAttribute(attr.name));
            Array.from(newSource.attributes).forEach(
              (attr) => el.setAttribute(attr.name, attr.value)
            );
            if (el.innerHTML !== newSource.innerHTML) {
              el.innerHTML = newSource.innerHTML;
            }
            if (panelWasInside) {
              if (el.tagName !== "HTML") {
                el.appendChild(panel);
              }
            }
          } else {
            el.replaceWith(newSource);
            el = newSource;
          }
          renderDOMTree(document.documentElement, codeWindow);
          requestAnimationFrame(() => {
            expandToElement(el, codeWindow);
          });
        } catch (err) {
          console.error("Save Error:", err);
          textarea.style.border = "1px solid red";
        }
      }
      textarea.addEventListener("blur", commit);
      textarea.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter" && !ev.shiftKey) {
          ev.preventDefault();
          commit();
        }
        if (ev.key === "Escape") {
          row.replaceChild(label, textarea);
          if (inlineClosingSpan && !expanded)
            label.appendChild(inlineClosingSpan);
        }
      });
    };
    label.addEventListener("dblclick", (e) => {
      e.stopPropagation();
      if (el.tagName === "HTML") return;
      startEditing(e);
    });
    label.addEventListener(
      "touchstart",
      (e) => {
        if (el.tagName === "HTML") return;
        touchTimer = setTimeout(() => {
          startEditing(e);
        }, 600);
      },
      { passive: true }
    );
    label.addEventListener("touchend", () => clearTimeout(touchTimer));
    label.addEventListener("touchmove", () => clearTimeout(touchTimer));
    row.addEventListener("click", (e) => {
      e.stopPropagation();
      if (el.nodeType === Node.ELEMENT_NODE) {
        highlightElement(el);
        renderCSSRules(el);
      }
    });
    row.appendChild(toggle);
    row.appendChild(label);
    container.appendChild(row);
    if (closeRow) {
      row.after(closeRow);
    }
  }
  function createHTMLLabel(el) {
    if (el.nodeType === Node.TEXT_NODE) {
      const span2 = document.createElement("span");
      span2.textContent = `"${el.textContent.trim()}"`;
      span2.style.color = "#ccc";
      return span2;
    }
    const span = document.createElement("span");
    const tag = document.createElement("span");
    tag.textContent = `<${el.tagName.toLowerCase()}`;
    tag.style.color = "#f92672";
    span.appendChild(tag);
    Array.from(el.attributes).forEach((attr) => {
      span.appendChild(document.createTextNode(" "));
      const name = document.createElement("span");
      name.textContent = attr.name;
      name.style.color = "#66d9ef";
      span.appendChild(name);
      span.appendChild(document.createTextNode("="));
      const value = document.createElement("span");
      value.textContent = `"${attr.value}"`;
      value.style.color = "#e6db74";
      span.appendChild(value);
    });
    const close = document.createElement("span");
    close.textContent = ">";
    close.style.color = "#f92672";
    span.appendChild(close);
    return span;
  }
  function expandToElement(targetEl, container = codeWindow) {
    if (!container || !targetEl) return;
    const path = [];
    let curr = targetEl;
    while (curr) {
      path.unshift(curr);
      if (curr === document.documentElement) break;
      curr = curr.parentElement;
    }
    let currentSearchContainer = container;
    for (let i = 0; i < path.length; i++) {
      const el = path[i];
      const rows = Array.from(currentSearchContainer.children);
      const row = rows.find((r) => r._element === el);
      if (!row) {
        console.warn("Could not find row for element:", el);
        break;
      }
      if (i < path.length - 1) {
        const toggle = row.querySelector("span");
        if (toggle && toggle.textContent === "\u25B6") {
          toggle.click();
        }
        if (row._childrenContainer) {
          currentSearchContainer = row._childrenContainer;
        } else {
          break;
        }
      } else {
        setTimeout(() => {
          row.scrollIntoView({ behavior: "smooth", block: "center" });
          highlightElement(el);
          renderCSSRules(el);
          row.style.backgroundColor = "rgba(102, 217, 239, 0.2)";
        }, 100);
      }
    }
  }
  var init_elements_ui = __esm({
    "content/elements-ui.js"() {
      init_overlay();
      init_main_panel_ui();
      init_styles_ui();
      init_styles_ui();
    }
  });

  // content/styles-ui.js
  function getCSSSuggestions(input2 = "") {
    const query = input2.toLowerCase().trim();
    return CSS_PROPERTIES.filter((p) => p.toLowerCase().includes(query)).sort(
      (a, b) => {
        if (!query) return 0;
        const aStarts = a.startsWith(query);
        const bStarts = b.startsWith(query);
        return aStarts === bStarts ? 0 : aStarts ? -1 : 1;
      }
    );
  }
  function hexToRGBA(hex, alpha = 1) {
    if (!hex.startsWith("#")) {
      return hex;
    }
    let r = 0, g = 0, b = 0;
    const cleanHex = hex.replace("#", "");
    if (cleanHex.length === 3) {
      r = parseInt(cleanHex[0] + cleanHex[0], 16);
      g = parseInt(cleanHex[1] + cleanHex[1], 16);
      b = parseInt(cleanHex[2] + cleanHex[2], 16);
    } else if (cleanHex.length === 6) {
      r = parseInt(cleanHex.substring(0, 2), 16);
      g = parseInt(cleanHex.substring(2, 4), 16);
      b = parseInt(cleanHex.substring(4, 6), 16);
    } else {
      return hex;
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  function getOrCreatePopup() {
    let popup = shadow.getElementById("css-autocomplete-popup");
    if (!popup) {
      popup = document.createElement("div");
      popup.id = "css-autocomplete-popup";
      popup.tabIndex = -1;
      popup.style.cssText = `
      position: fixed;
      background: #272822;
      border: 1px solid #66d9ef;
      border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
      z-index: 9999999; 
      display: block;
      max-height: 200px;
      overflow-y: auto;
      min-width: 160px;
      pointer-events: auto;
    `;
      shadow.appendChild(popup);
    }
    return popup;
  }
  function showPopup(targetEl, suggestions, onSelect) {
    const popup = getOrCreatePopup();
    if (suggestions.length === 0) {
      popup.style.display = "none";
      return;
    }
    popup.innerHTML = "";
    const rect = targetEl.getBoundingClientRect();
    popup.style.left = `${rect.left}px`;
    popup.style.top = `${rect.bottom}px`;
    popup.style.display = "block";
    suggestions.forEach((text) => {
      const item = document.createElement("div");
      item.className = "autocomplete-item";
      item.textContent = text;
      item.style.cssText = "padding: 5px 10px; cursor: pointer; color: #f8f8f2; font-family: monospace; font-size: 12px;";
      item.onmouseenter = () => item.style.background = "#3e3f3b";
      item.onmouseleave = () => item.style.background = "transparent";
      item.onmousedown = (e) => {
        e.preventDefault();
        onSelect(text);
        popup.style.display = "none";
      };
      popup.appendChild(item);
    });
  }
  function enablePicker() {
    if (overlayActive) return;
    overlayActive = true;
    if (panelDiv) {
      panelDiv.classList.add("bc-collapsed");
    }
    const onSelect = (e) => {
      const target = e.touches ? document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY) : e.target;
      if (!target) return;
      e.preventDefault();
      e.stopPropagation();
      highlightElement(target);
      const info = {
        tag: target.tagName,
        id: target.id,
        className: target.className,
        selector: getSelector(target),
        outerHTML: target.outerHTML
      };
      document.dispatchEvent(
        new CustomEvent("BC_ELEMENT_SELECTED", {
          detail: { ...info, element: target }
        })
      );
      if (codeWindow) {
        renderDOMTree(document.documentElement, codeWindow);
        requestAnimationFrame(() => {
          expandToElement(target, codeWindow);
        });
      }
      overlayActive = false;
      document.removeEventListener("click", onSelect, true);
      document.removeEventListener("touchstart", onSelect, {
        capture: true,
        passive: false
      });
      if (panelDiv) {
        panelDiv.classList.remove("bc-collapsed");
      }
    };
    document.addEventListener("click", onSelect, true);
    document.addEventListener("touchstart", onSelect, {
      capture: true,
      passive: false
    });
  }
  function highlightElement(el) {
    if (lastHighlight) lastHighlight.style.outline = "";
    el.style.outline = "2px solid red";
    lastHighlight = el;
  }
  function getSelector(el) {
    if (el.id && typeof el.id === "string") return `#${el.id}`;
    let path = [];
    while (el && el.parentElement) {
      let name = el.tagName.toLowerCase();
      const classAttr = el.getAttribute("class");
      if (classAttr) {
        const classes = classAttr.trim().split(/\s+/).filter(Boolean);
        if (classes.length > 0) {
          name += "." + classes.join(".");
        }
      }
      path.unshift(name);
      el = el.parentElement;
      if (el.tagName.toLowerCase() === "body") {
        path.unshift("body");
        break;
      }
    }
    return path.join(" > ");
  }
  function renderCSSRules(el, container = cssWindow) {
    if (!el || !container) return;
    if (!shadow.getElementById("css-inspector-styles")) {
      const style = document.createElement("style");
      style.id = "css-inspector-styles";
      style.textContent = `
      .css-editable-span:focus { background: rgba(102, 217, 239, 0.2); outline: 1px solid #66d9ef; border-radius: 2px; min-width: 8px; display: inline-block; }
      .css-editable-span { padding: 0 2px; transition: background 0.1s; min-height: 1.2em; }
      .row-overridden .prop-span, .row-overridden .val-span { text-decoration: line-through !important; opacity: 0.5 !important; }
      .decl-row { display: flex; align-items: center; gap: 5px; padding-left: 12px; cursor: pointer; }
      .decl-row:hover { background: rgba(255,255,255,0.05); }
      #css-autocomplete-popup {
        position: fixed;
        background: #272822;
        border: 1px solid #66d9ef;
        border-radius: 4px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.5);
        z-index: 10000;
        display: none;
        max-height: 200px;
        overflow-y: auto;
        min-width: 150px;
      }
      .autocomplete-item { padding: 4px 8px; color: #f8f8f2; cursor: pointer; font-family: monospace; font-size: 12px; }
      .autocomplete-item:hover { background: #66d9ef; color: #272822; }
      .copy-flash { background: #a6e22e !important; color: #000 !important; }
    `;
      shadow.appendChild(style);
    }
    container.innerHTML = "";
    function setupCopyHandlers(targetEl, textGetter) {
      let touchTimer = null;
      const copyAction = async (e) => {
        e.stopPropagation();
        if (document.activeElement && document.activeElement.contentEditable === "true")
          return;
        const text = textGetter();
        try {
          await navigator.clipboard.writeText(text);
          targetEl.classList.add("copy-flash");
          setTimeout(() => targetEl.classList.remove("copy-flash"), 200);
        } catch (err) {
          console.error("Copy failed", err);
        }
      };
      targetEl.addEventListener("dblclick", copyAction);
      targetEl.addEventListener(
        "touchstart",
        (e) => {
          touchTimer = setTimeout(() => copyAction(e), 600);
        },
        { passive: true }
      );
      targetEl.addEventListener("touchend", () => clearTimeout(touchTimer));
      targetEl.addEventListener("touchmove", () => clearTimeout(touchTimer));
    }
    function getSpecificity(selector) {
      if (selector === "element.style") return 1e4;
      let a = 0, b = 0, c = 0;
      const tokens = selector.split(/(?=[ #\.\[:])|(?<=[ #\.\[:])/);
      tokens.forEach((token) => {
        if (token.startsWith("#")) a++;
        else if (token.startsWith(".") || token.startsWith("[") || token.startsWith(":") && !token.startsWith("::"))
          b++;
        else if (/^[a-zA-Z]/.test(token) || token.startsWith("::")) c++;
      });
      return a * 100 + b * 10 + c;
    }
    const matchedRules = [];
    if (el.style && el.style.cssText.trim()) {
      matchedRules.push({
        selectorText: "element.style",
        cssText: el.style.cssText,
        styleRef: el.style,
        inline: true,
        priority: 1e4,
        source: "inline"
      });
    }
    for (const sheet of document.styleSheets) {
      try {
        const fullHref = sheet.href || "";
        const fileName = fullHref ? fullHref.split("/").pop() : "inline";
        const rules = sheet.cssRules || [];
        for (const rule of rules) {
          if (rule.type === CSSRule.STYLE_RULE && el.matches(rule.selectorText)) {
            matchedRules.push({
              selectorText: rule.selectorText,
              cssText: rule.style.cssText,
              styleRef: rule.style,
              inline: false,
              priority: getSpecificity(rule.selectorText),
              source: fileName,
              href: fullHref
              // Store the full URL for the link
            });
          }
        }
      } catch (e) {
        if (sheet.href) {
          console.warn("CORS blocked access to:", sheet.href);
        }
        continue;
      }
    }
    matchedRules.sort((a, b) => b.priority - a.priority);
    const refreshOverrides = () => {
      const seenProps = /* @__PURE__ */ new Set();
      matchedRules.forEach((rule) => {
        if (!rule.domElement) return;
        const rows = Array.from(rule.domElement.querySelectorAll(".decl-row"));
        for (let i = rows.length - 1; i >= 0; i--) {
          const row = rows[i];
          const p = row.querySelector(".prop-span").textContent.trim();
          const v = row.querySelector(".val-span").textContent.trim();
          const cb = row.querySelector("input");
          if (!p) continue;
          if (!cb.checked) {
            rule.styleRef.removeProperty(p);
            row.classList.remove("row-overridden");
            continue;
          }
          if (seenProps.has(p)) {
            row.classList.add("row-overridden");
          } else {
            row.classList.remove("row-overridden");
            rule.styleRef.setProperty(p, v);
            if (!/:(?!not\()[\w-]+/.test(rule.selectorText || ""))
              seenProps.add(p);
          }
        }
      });
    };
    matchedRules.forEach((rule) => {
      const ruleDiv = document.createElement("div");
      ruleDiv.style.marginBottom = "8px";
      rule.domElement = ruleDiv;
      const header = document.createElement("div");
      header.style.cssText = "display: flex; justify-content: space-between; align-items: baseline;";
      const sel = document.createElement("div");
      sel.textContent = rule.selectorText + " {";
      sel.style.color = "#f92672";
      sel.style.fontWeight = "bold";
      sel.style.cursor = "pointer";
      const declContainer = document.createElement("div");
      setupCopyHandlers(sel, () => {
        const allDecls = Array.from(declContainer.querySelectorAll(".decl-row")).map((row) => {
          const p = row.querySelector(".prop-span").textContent.trim();
          const v = row.querySelector(".val-span").textContent.trim();
          return p && v ? `  ${p}: ${v};` : "";
        }).filter(Boolean).join("\n");
        return `${rule.selectorText} {
${allDecls}
}`;
      });
      let sourceLink = null;
      if (rule.source !== "inline") {
        sourceLink = document.createElement("a");
        sourceLink.href = rule.href || "#";
        sourceLink.onclick = (e) => {
          if (sourceLink.href === "#") {
            e.preventDefault();
            console.log("Opening source for:", rule.source);
          }
        };
      } else {
        sourceLink = document.createElement("span");
      }
      sourceLink.textContent = rule.source;
      sourceLink.target = "_blank";
      sourceLink.style.color = "#75715e";
      sourceLink.style.fontSize = "10px";
      sourceLink.style.textDecoration = "underline";
      sourceLink.style.cursor = "pointer";
      header.appendChild(sel);
      header.appendChild(sourceLink);
      ruleDiv.appendChild(header);
      ruleDiv.appendChild(declContainer);
      const createDeclRow = (pStr = "", vStr = "") => {
        const decl = document.createElement("div");
        decl.className = "decl-row";
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = true;
        const propSpan = document.createElement("span");
        propSpan.className = "css-editable-span prop-span";
        propSpan.textContent = pStr;
        propSpan.style.color = "#66d9ef";
        propSpan.setAttribute("tabindex", "0");
        propSpan.contentEditable = true;
        const valSpan = document.createElement("span");
        valSpan.className = "css-editable-span val-span";
        valSpan.textContent = vStr;
        valSpan.style.color = "#e6db74";
        propSpan.setAttribute("tabindex", "0");
        valSpan.contentEditable = true;
        setupCopyHandlers(
          decl,
          () => `${propSpan.textContent.trim()}: ${valSpan.textContent.trim()};`
        );
        let colorInput = null;
        const currentProp = pStr.trim().toLowerCase();
        if (typeof CSS_COLOR_PROPERTIES !== "undefined" && CSS_COLOR_PROPERTIES.includes(currentProp)) {
          colorInput = document.createElement("input");
          colorInput.type = "color";
          colorInput.style.cssText = `width: 14px; height: 14px; padding: 0; margin-right: 4px; border: 1px solid #555; vertical-align: middle; cursor: pointer; background: none;`;
          colorInput.style.background = hexToRGBA(valSpan.textContent);
          colorInput.value = hexToRGBA(valSpan.textContent);
          if (/^#[0-9A-F]{6}$/i.test(vStr.trim())) {
            colorInput.value = vStr.trim();
            colorInput.style.background = hexToRGBA(vStr.trim());
          }
          colorInput.addEventListener("input", () => {
            valSpan.textContent = hexToRGBA(colorInput.value);
            colorInput.style.background = hexToRGBA(colorInput.value);
            apply();
          });
        }
        const apply = () => {
          const p = propSpan.textContent.trim().toLowerCase();
          const v = valSpan.textContent.trim();
          if (checkbox.checked && p && v) {
            if (lastProp && lastProp !== p)
              rule.styleRef.removeProperty(lastProp);
            rule.styleRef.setProperty(p, v);
            lastProp = p;
            decl.style.opacity = "1";
          } else {
            if (lastProp) rule.styleRef.removeProperty(lastProp);
            decl.style.opacity = "0.4";
          }
          refreshOverrides();
        };
        let lastProp = pStr;
        propSpan.addEventListener("focus", () => {
          showPopup(
            propSpan,
            getCSSSuggestions(propSpan.textContent),
            (selected) => {
              propSpan.textContent = selected;
              apply();
              valSpan.focus();
            }
          );
        });
        valSpan.addEventListener("blur", (e) => {
          const popup = shadow.getElementById("css-autocomplete-popup");
          if (popup && !popup.contains(e.relatedTarget)) {
            setTimeout(() => {
              popup.style.display = "none";
            }, 150);
          }
        });
        valSpan.addEventListener("input", (e) => {
          const p = propSpan.textContent.trim().toLowerCase();
          const v = valSpan.textContent.trim();
          if (colorInput) {
            colorInput.style.background = hexToRGBA(v);
            if (/^#[0-9A-F]{6}$/i.test(v)) colorInput.value = v;
          }
          const suggestions = getValSuggestions(p, v);
          showPopup(valSpan, suggestions, (selectedVal) => {
            valSpan.textContent = selectedVal;
            if (colorInput) {
              if (/^#[0-9A-F]{6}$/i.test(selectedVal))
                colorInput.value = selectedVal;
              colorInput.style.background = hexToRGBA(selectedVal);
            }
            apply();
          });
          apply();
        });
        valSpan.addEventListener("focus", () => {
          const p = propSpan.textContent.trim().toLowerCase();
          const v = valSpan.textContent.trim();
          const suggestions = getValSuggestions(p, v);
          showPopup(valSpan, suggestions, (selectedVal) => {
            valSpan.textContent = selectedVal;
            if (colorInput) colorInput.style.background = hexToRGBA(selectedVal);
            apply();
          });
        });
        valSpan.addEventListener("keydown", (e) => {
          e.stopPropagation();
          const popup = shadow.getElementById("css-autocomplete-popup");
          const isVisible = popup && popup.style.display === "block";
          const p = propSpan.textContent.trim().toLowerCase();
          const v = valSpan.textContent.trim();
          if ((e.key === "Tab" || e.key === "Enter") && isVisible) {
            const first = popup.querySelector(".autocomplete-item");
            if (first) {
              e.preventDefault();
              const selectedValue = first.textContent;
              valSpan.textContent = selectedValue;
              popup.style.display = "none";
              const range = document.createRange();
              const sel2 = window.getSelection();
              range.selectNodeContents(valSpan);
              range.collapse(false);
              sel2.removeAllRanges();
              sel2.addRange(range);
              if (colorInput) {
                colorInput.style.background = hexToRGBA(selectedValue);
                if (/^#[0-9A-F]{6}$/i.test(selectedValue))
                  colorInput.value = selectedValue;
              }
              apply();
              return;
            }
          }
          if (navigator.userAgent.includes("Firefox") && e.key === "Backspace") {
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
              const range = selection.getRangeAt(0);
              if (range.collapsed && range.startOffset > 0) {
                range.setStart(range.startContainer, range.startOffset - 1);
                range.deleteContents();
                e.preventDefault();
                const newV = valSpan.textContent.trim();
                showPopup(valSpan, getValSuggestions(p, newV), (selected) => {
                  valSpan.textContent = selected;
                  apply();
                });
                apply();
              }
            }
          }
          if (e.key === "Enter") {
            e.preventDefault();
            valSpan.blur();
          }
          if (e.key === "Escape" && isVisible) popup.style.display = "none";
        });
        propSpan.addEventListener("keydown", (e) => {
          e.stopPropagation();
          const popup = shadow.getElementById("css-autocomplete-popup");
          const isVisible = popup && popup.style.display === "block";
          if ((e.key === "Tab" || e.key === "Enter") && isVisible) {
            const first = popup.querySelector(".autocomplete-item");
            if (first) {
              e.preventDefault();
              propSpan.textContent = first.textContent;
              popup.style.display = "none";
              const range = document.createRange();
              const sel2 = window.getSelection();
              range.selectNodeContents(propSpan);
              range.collapse(false);
              sel2.removeAllRanges();
              sel2.addRange(range);
              apply();
              valSpan.focus();
              return;
            }
          }
          const isFirefox = navigator.userAgent.includes("Firefox");
          if (isFirefox && e.key === "Backspace") {
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
              const range = selection.getRangeAt(0);
              if (range.collapsed && range.startOffset > 0) {
                range.setStart(range.startContainer, range.startOffset - 1);
                range.deleteContents();
                e.preventDefault();
              } else if (!range.collapsed) {
                range.deleteContents();
                e.preventDefault();
              }
            }
            const p = propSpan.textContent.trim().toLowerCase();
            const suggestions = getCSSSuggestions(p);
            showPopup(propSpan, suggestions, (selected) => {
              propSpan.textContent = selected;
              apply();
            });
            apply();
          }
          setTimeout(() => {
            const p = propSpan.textContent.trim().toLowerCase();
            const v = valSpan.textContent.trim();
            const suggestions = getCSSSuggestions(p);
            showPopup(propSpan, suggestions, (selected) => {
              propSpan.textContent = selected;
              apply();
              valSpan.focus();
            });
            apply();
          }, 0);
          if (e.key === "Enter") {
            e.preventDefault();
            propSpan.blur();
          }
          if (e.key === "Escape" && isVisible) popup.style.display = "none";
        });
        checkbox.addEventListener("change", apply);
        [propSpan, valSpan].forEach((s) => s.addEventListener("input", apply));
        decl.appendChild(checkbox);
        decl.appendChild(propSpan);
        decl.appendChild(document.createTextNode(": "));
        if (colorInput) decl.appendChild(colorInput);
        decl.appendChild(valSpan);
        decl.appendChild(document.createTextNode(";"));
        return decl;
      };
      const declPairs = rule.cssText.split(";").map((s) => s.trim()).filter(Boolean);
      declPairs.forEach((pair) => {
        const splitIdx = pair.indexOf(":");
        if (splitIdx !== -1) {
          declContainer.appendChild(
            createDeclRow(
              pair.substring(0, splitIdx).trim(),
              pair.substring(splitIdx + 1).trim()
            )
          );
        }
      });
      const closeBrace = document.createElement("div");
      closeBrace.textContent = "}";
      closeBrace.style.cssText = "cursor: pointer; color: #f92672; font-weight: bold; width: fit-content;";
      closeBrace.addEventListener("click", () => {
        const newRow = createDeclRow();
        declContainer.appendChild(newRow);
        newRow.querySelector(".prop-span").focus();
      });
      ruleDiv.appendChild(closeBrace);
      container.appendChild(ruleDiv);
    });
    refreshOverrides();
  }
  var lastHighlight, overlayActive, getValSuggestions;
  var init_styles_ui = __esm({
    "content/styles-ui.js"() {
      init_overlay();
      init_css();
      init_css();
      init_css();
      init_css();
      init_main_panel_ui();
      init_main_panel_ui();
      init_main_panel_ui();
      init_main_panel_ui();
      init_elements_ui();
      init_elements_ui();
      lastHighlight = null;
      overlayActive = false;
      getValSuggestions = (prop, query = "") => {
        const p = prop.trim().toLowerCase();
        const propertySpecific = (typeof CSS_PROPERTY_VALUES !== "undefined" ? CSS_PROPERTY_VALUES[p] : []) || [];
        const colorValues = typeof CSS_COLOR_PROPERTIES !== "undefined" && CSS_COLOR_PROPERTIES.includes(p) ? typeof CSS_COLOR_VALUES !== "undefined" ? CSS_COLOR_VALUES : [] : [];
        const combined = [.../* @__PURE__ */ new Set([...propertySpecific, ...colorValues])];
        return combined.filter((v) => v.toLowerCase().includes(query.toLowerCase()));
      };
    }
  });

  // content/main-panel-ui.js
  async function sendCodeToPage(codeString) {
    try {
      const response = await api.runtime.sendMessage({
        type: "BC_EXECUTE_JS",
        code: codeString
      });
      if (response && response.success) {
        window.dispatchEvent(
          new CustomEvent("BC_CODE_RESULT", {
            detail: { result: response.result }
          })
        );
      } else {
        window.dispatchEvent(
          new CustomEvent("BC_CODE_RESULT", {
            detail: {
              error: response ? response.error : "No response from background"
            }
          })
        );
      }
    } catch (err) {
      window.dispatchEvent(
        new CustomEvent("BC_CODE_RESULT", {
          detail: { error: "Extension Bridge Error: " + err.message }
        })
      );
    }
  }
  function createWindow(title, bgColor, textColor, icon) {
    const container = document.createElement("div");
    container.id = "content-" + title.toLowerCase().replace(/\s+/g, "-") + "-wrapper";
    container.className = "content-wrapper";
    if (title === "Storage" || title === "Network") {
      container.style.display = "none";
    }
    const header = document.createElement("div");
    header.className = "content-header";
    header.style.color = textColor;
    const headerContent = document.createElement("div");
    headerContent.className = "header-content-wrapper";
    headerContent.style.display = "flex";
    headerContent.style.alignItems = "center";
    headerContent.style.gap = "8px";
    const headerIcon = document.createElement("img");
    headerIcon.src = api.runtime.getURL("img/" + icon);
    headerIcon.style.width = "16px";
    headerIcon.style.height = "16px";
    headerIcon.style.flexShrink = "0";
    headerIcon.alt = "";
    const titleSpan = document.createElement("span");
    titleSpan.textContent = title;
    titleSpan.style.whiteSpace = "nowrap";
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
      const inputLabel = document.createElement("span");
      inputLabel.className = "console-input-label";
      inputLabel.textContent = ">";
      inputWrapper.appendChild(inputLabel);
      input = document.createElement("textarea");
      input.className = "console-input";
      input.placeholder = "Enter JS...";
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
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          const code = input.value.trim();
          if (!code) return;
          const lowerCode = code.toLowerCase();
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
                  detail: "[Storage Service]\n" + formattedData
                })
              );
            });
            input.value = "";
            return;
          }
          if (commandHistory.length === 0 || commandHistory[commandHistory.length - 1] !== code) {
            commandHistory.push(code);
            api.storage.local.set({ bc_history: commandHistory });
          }
          historyIndex = -1;
          currentInputBuffer = "";
          document.dispatchEvent(
            new CustomEvent("BC_PANEL_LOG", { detail: "> " + code })
          );
          sendCodeToPage(code);
          input.value = "";
        } else if (e.key === "ArrowUp") {
          if (commandHistory.length === 0) return;
          if (historyIndex === -1) {
            currentInputBuffer = input.value;
          }
          if (historyIndex < commandHistory.length - 1) {
            historyIndex++;
            input.value = commandHistory[commandHistory.length - 1 - historyIndex];
            setTimeout(() => {
              input.selectionStart = input.selectionEnd = input.value.length;
            }, 0);
          }
        } else if (e.key === "ArrowDown") {
          if (historyIndex > -1) {
            historyIndex--;
            if (historyIndex === -1) {
              input.value = currentInputBuffer;
            } else {
              input.value = commandHistory[commandHistory.length - 1 - historyIndex];
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
        content.scrollTop = content.scrollHeight;
      });
    }
    header.addEventListener("click", (e) => {
      if (e.target === handle) return;
      if (title == "Storage") {
        updateStorageUI(storageWindow);
      }
      if (title == "Network") {
        updateNetworkUI(networkWindow);
      }
      if (title == "Elements" || title == "Styles") {
        content.style.display = content.style.display === "none" ? "block" : "none";
      } else if (title == "Network" || title == "Storage") {
        content.style.display = content.style.display === "none" ? "flex" : "none";
      }
      if (title == "Console") {
        inputWrapper.style.display = inputWrapper.style.display === "none" ? "flex" : "none";
        content.style.display = inputWrapper.style.display;
      }
      if (content.style.display === "block" || content.style.display === "flex") {
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
        let getCurrentHeight = function(el) {
          return parseFloat(getComputedStyle(el).height);
        };
        const reduceBy = panelHeight - window.innerHeight;
        const contents = [
          consoleContent,
          cssContent,
          codeContent,
          networkContent,
          storageContent
        ];
        contents.forEach((el) => {
          const currentHeight = getCurrentHeight(el);
          const newHeight = currentHeight - reduceBy / 3;
          el.style.height = `${newHeight}px`;
          el.style.minHeight = `${newHeight}px`;
        });
      }
    });
    function addResizeEvents(handle2, content2) {
      const onMove = (startY, startHeight, moveY) => {
        let newHeight = startHeight - (moveY - startY);
        let panelHeight = panelDiv.getBoundingClientRect().height;
        const availableHeight = window.innerHeight - panelHeight;
        console.log(
          `newHeight: ${newHeight} window.innerHeight: ${window.innerHeight} panelHeight: ${panelHeight} availableHeight: ${availableHeight}`
        );
        newHeight = Math.max(50, newHeight);
        content2.style.height = newHeight + "px";
        content2.style.minHeight = newHeight + "px";
        panelHeight = panelDiv.getBoundingClientRect().height;
        if (panelHeight > window.innerHeight) {
          content2.style.height = parseInt(content2.style.height) - (panelHeight - window.innerHeight) + "px";
          content2.style.minHeight = parseInt(content2.style.minHeight) - (panelHeight - window.innerHeight) + "px";
        }
      };
      handle2.addEventListener("touchstart", (e) => {
        e.preventDefault();
        const startY = e.touches[0].clientY;
        const startHeight = content2.offsetHeight;
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
      handle2.addEventListener("mousedown", (e) => {
        e.preventDefault();
        const startY = e.clientY;
        const startHeight = content2.offsetHeight;
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
  function injectPanel() {
    if (panelDiv) return;
    panelDiv = document.createElement("div");
    panelDiv.id = "devtools-panel";
    document.documentElement.appendChild(panelDiv);
    shadow = panelDiv.attachShadow({ mode: "open" });
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
    const topBar = document.createElement("div");
    topBar.className = "devtools-topbar";
    const extensionIcon = document.createElement("img");
    extensionIcon.src = api.runtime.getURL("img/icon128.png");
    extensionIcon.className = "extension-topbar-icon";
    extensionIcon.style.height = "44px";
    extensionIcon.style.paddingRight = "14px";
    topBar.appendChild(extensionIcon);
    const btnContainer = document.createElement("div");
    btnContainer.className = "topbar-buttons-container";
    topBar.appendChild(btnContainer);
    const topbarHandle = document.createElement("div");
    topbarHandle.className = "topbar-drag-handle";
    const handleIcon = document.createElement("img");
    handleIcon.src = api.runtime.getURL("img/grip.svg");
    topbarHandle.appendChild(handleIcon);
    topBar.appendChild(topbarHandle);
    function createTopbarButton(text, iconFile, onClick) {
      const btn = document.createElement("button");
      btn.className = "topbar-button";
      btn.onclick = (e) => {
        e.stopPropagation();
        onClick();
      };
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
    const inspectBtn = createTopbarButton(
      "Inspect Element",
      "magnifying-glass.svg",
      () => enablePicker()
    );
    const elCSSBtn = createTopbarButton(
      "Elements/Styles",
      "square-code.svg",
      () => {
      }
    );
    const netStorBtn = createTopbarButton(
      "Network/Storage",
      "server.svg",
      () => {
      }
    );
    btnContainer.appendChild(inspectBtn);
    btnContainer.appendChild(elCSSBtn);
    btnContainer.appendChild(netStorBtn);
    elCSSBtn.style.display = "none";
    shadow.appendChild(topBar);
    topBar.onclick = (e) => {
      if (e.target === topBar || e.target === btnContainer) {
        panelDiv.classList.toggle("bc-collapsed");
      }
    };
    let isDragging = false;
    topbarHandle.addEventListener("pointerdown", (e) => {
      isDragging = true;
      topbarHandle.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    window.addEventListener("pointermove", (e) => {
      if (!isDragging) return;
      const touchY = e.clientY;
      const screenHeight = window.innerHeight;
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
      { passive: false }
    );
    window.addEventListener(
      "touchmove",
      (e) => {
        if (!isDragging) return;
        const touchY = e.touches[0].clientY;
        const screenHeight = window.innerHeight;
        if (touchY < screenHeight / 2) {
          panelDiv.style.bottom = "unset";
          panelDiv.style.top = "0";
        } else {
          panelDiv.style.top = "unset";
          panelDiv.style.bottom = "0";
        }
      },
      { passive: false }
    );
    window.addEventListener("touchend", () => {
      isDragging = false;
    });
    consoleWindow = createWindow(
      "Console",
      "#111",
      "rgb(202 202 202)",
      "terminal.svg"
    );
    cssWindow = createWindow("Styles", "#111", "rgb(202 202 202)", "palette.svg");
    codeWindow = createWindow("Elements", "#111", "rgb(202 202 202)", "code.svg");
    networkWindow = createWindow(
      "Network",
      "#222",
      "rgb(202 202 202)",
      "network-wired.svg"
    );
    storageWindow = createWindow(
      "Storage",
      "#222",
      "rgb(202 202 202)",
      "database.svg"
    );
    netStorBtn.onclick = (e) => {
      if (e) e.stopPropagation();
      const cssWindowWrapper = shadow.getElementById("content-styles-wrapper");
      const codeWindowWrapper = shadow.getElementById("content-elements-wrapper");
      const networkWindowWrapper = shadow.getElementById(
        "content-network-wrapper"
      );
      const storageWindowWrapper = shadow.getElementById(
        "content-storage-wrapper"
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
        "content-network-wrapper"
      );
      const storageWindowWrapper = shadow.getElementById(
        "content-storage-wrapper"
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
        commandHistory = result.bc_history;
        console.log("BC_PANEL: History loaded", commandHistory.length);
      }
    });
    shadow.addEventListener("mousedown", (e) => {
      const popup = shadow.getElementById("css-autocomplete-popup");
      if (!popup || popup.style.display === "none") return;
      if (!popup.contains(e.target) && !e.target.classList.contains("css-editable-span")) {
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
      true
    );
    const isPortrait = window.matchMedia("(orientation: portrait)") || window.innerHeight > window.innerWidth;
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
    function revertIcons() {
      const buttons = shadow.querySelectorAll(".topbar-button");
      buttons.forEach((btn) => {
        btn.style.paddingInline = "";
        const span = btn.querySelector("span");
        const img = btn.querySelector("img");
        if (span) span.style.display = "";
        if (img) {
          img.style.transform = "";
        }
      });
    }
    function checkOrientation() {
      const isPortraitMedia = window.matchMedia(
        "(orientation: portrait)"
      ).matches;
      const isPortraitDimensions = window.innerHeight > window.innerWidth;
      if (isPortraitMedia || isPortraitDimensions) {
        maximizeIcons();
      } else {
        revertIcons();
      }
    }
    checkOrientation();
    window.addEventListener("resize", checkOrientation);
    renderDOMTree(window.html, codeWindow);
  }
  var panelDiv, shadow, consoleWindow, cssWindow, codeWindow, networkWindow, storageWindow, commandHistory, historyIndex, currentInputBuffer;
  var init_main_panel_ui = __esm({
    "content/main-panel-ui.js"() {
      init_overlay();
      init_storage_ui();
      init_network_ui();
      init_styles_ui();
      init_elements_ui();
      panelDiv = null;
      shadow = null;
      consoleWindow = null;
      cssWindow = null;
      codeWindow = null;
      networkWindow = null;
      storageWindow = null;
      commandHistory = [];
      historyIndex = -1;
      currentInputBuffer = "";
    }
  });

  // content/overlay.js
  function injectErrorCapture() {
    if (document.getElementById("devtools-error-capture")) return;
    const script = document.createElement("script");
    script.id = "devtools-error-capture";
    script.src = api.runtime.getURL("injected/page-error-capture.js");
    document.documentElement.appendChild(script);
    script.onload = () => script.remove();
  }
  function injectNetworkSniffer() {
    if (document.getElementById("devtools-network-sniffer")) return;
    const script = document.createElement("script");
    script.id = "devtools-network-sniffer";
    script.src = api.runtime.getURL("injected/network-sniffer-inject.js");
    document.documentElement.appendChild(script);
    script.onload = () => script.remove();
  }
  var api, domain;
  var init_overlay = __esm({
    "content/overlay.js"() {
      init_main_panel_ui();
      init_main_panel_ui();
      init_main_panel_ui();
      init_main_panel_ui();
      init_network_ui();
      init_network_ui();
      init_styles_ui();
      api = typeof browser !== "undefined" ? browser : chrome;
      document.addEventListener("BC_PANEL_LOG", (e) => {
        if (!consoleWindow) return;
        consoleWindow.textContent += e.detail + "\n\n";
        consoleWindow.scrollTop = consoleWindow.scrollHeight;
      });
      document.addEventListener("BC_ELEMENT_SELECTED", (e) => {
        const data = e.detail;
        if (!data || !data.element) return;
        renderCSSRules(data.element);
      });
      domain = window.location.hostname;
      api.storage.local.get([domain], (result) => {
        if (result[domain]) {
          injectPanel();
          document.addEventListener("BC_NETWORK_REQUEST", (e) => {
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
            if (panelDiv) {
              if (!panelDiv.isConnected) {
                document.documentElement.appendChild(panelDiv);
              }
            } else {
              injectPanel();
            }
          } else {
            if (panelDiv && panelDiv.isConnected) {
              panelDiv.remove();
            }
          }
        }
      });
    }
  });

  // content/main.js
  var require_main = __commonJS({
    "content/main.js"() {
      init_overlay();
      init_main_panel_ui();
      init_styles_ui();
      api.runtime.onMessage.addListener((msg, sender, sendResponse) => {
        if (msg.type === "INJECT_PANEL") injectPanel();
        if (msg.type === "ENABLE_PICKER") enablePicker();
      });
      document.addEventListener("BC_ELEMENT_SELECTED", (e) => {
        const data = e.detail;
        const msg = `Selected element:
Tag: ${data.tag}
ID: ${data.id || "(none)"}
Class: ${data.className || "(none)"}
Selector: ${data.selector}`;
        const logEvent = new CustomEvent("BC_PANEL_LOG", { detail: msg });
        document.dispatchEvent(logEvent);
      });
    }
  });
  require_main();
})();
//# sourceMappingURL=content.bundle.js.map
