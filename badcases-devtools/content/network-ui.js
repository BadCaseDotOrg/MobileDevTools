import { api } from "./overlay.js";

export let networkLog = [];

/**
 * Adds a new request to the log and refreshes the UI if visible
 */
export function addNetworkEntry(entry, networkWindow) {
  networkLog.push(entry);

  // Cap the log at 500 to prevent memory leaks
  if (networkLog.length > 500) networkLog.shift();

  // Auto-update UI if the window is currently open
  if (networkWindow && networkWindow.style.display !== "none") {
    updateNetworkUI(networkWindow);
  }
}
export function updateNetworkUI(networkWindow) {
  const filterType = networkWindow.dataset.filterType || "all";
  const searchTerm = (networkWindow.dataset.searchTerm || "").toLowerCase();

  // Filter logic
  const filteredLog = networkLog.filter((req) => {
    // 1. Log the request to the console
    //console.log("Processing request:", req);

    // 2. Verify req and req.url exist before accessing properties
    if (!req || !req.url) {
      return false;
    }

    const matchesSearch = req.url
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || req.type === filterType;

    return matchesSearch && matchesType;
  });

  // Calculate Totals
  const totalSize = filteredLog.reduce((acc, req) => acc + (req.size || 0), 0);
  const formatSize = (bytes) =>
    bytes > 1024 ? (bytes / 1024).toFixed(1) + " KB" : bytes + " B";

  networkWindow.innerHTML = `
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
          ${["all", "fetch", "js", "css", "img"]
            .map(
              (t) => `
            <option value="${t}" ${networkWindow.dataset.filterType === t ? "selected" : ""}>
              ${t.charAt(0).toUpperCase() + t.slice(1)}
            </option>
          `,
            )
            .join("")}
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
          ${filteredLog
            .toReversed()
            .map(
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
          `,
            )
            .join("")}
        </tbody>
      </table>
    </div>

    <div class="net-footer">
      <span>${filteredLog.length} requests</span>
      <span>${formatSize(totalSize)} transferred</span>
    </div>
  </div>
`;

  // --- EVENTS ---
  networkWindow.querySelector("#net-search").oninput = (e) => {
    networkWindow.dataset.searchTerm = e.target.value;
    updateNetworkUI(networkWindow);
  };

  const filterSelect = networkWindow.querySelector("#net-filter-select");

  if (filterSelect) {
    filterSelect.onchange = (e) => {
      networkWindow.dataset.filterType = e.target.value;
      updateNetworkUI(networkWindow);
    };
  }

  networkWindow.querySelector("#net-clear").onclick = () => {
    networkLog = [];
    updateNetworkUI(networkWindow);
  };
}
