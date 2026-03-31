import { api } from "./overlay.js";

export const getCookieData = () => {
  return document.cookie
    .split(";")
    .filter((c) => c.trim())
    .map((c) => {
      const [key, ...val] = c.split("=");
      return [key.trim(), val.join("=")];
    });
};

let currentType = null;

export function updateStorageUI(storageWindow) {
  currentType = storageWindow.dataset.storageType || "local";
  const searchTerm = (storageWindow.dataset.searchTerm || "").toLowerCase();

  // Fetch Data based on type
  let data = [];
  if (currentType === "cookies") {
    data = getCookieData();
  } else {
    data = Object.entries(window[`${currentType}Storage`]);
  }

  const filteredData = data.filter(
    ([k, v]) =>
      k.toLowerCase().includes(searchTerm) ||
      v.toLowerCase().includes(searchTerm),
  );

  storageWindow.innerHTML = `
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
          ${filteredData
            .map(
              ([key, val]) => `
            <tr class="storage-tr">
              <td class="storage-td" style="color: #a6e22e;" title="${key}">${key}</td>
              <td class="storage-td editable-val" data-key="${key}" contenteditable="true" 
                  style="color: #75715e;">${val}</td>
              <td class="storage-td">
                <div><button class="delete-storage-item" data-key="${key}"><img src="${api.runtime.getURL("img/trash-can.svg")}"></button></div>
              </td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>
    </div>
  </div>
`;

  // --- EVENTS ---

  storageWindow.querySelector("#storage-type-select").onchange = (e) => {
    storageWindow.dataset.storageType = e.target.value;
    updateStorageUI(storageWindow);
  };

  storageWindow.querySelector("#storage-search").oninput = (e) => {
    storageWindow.dataset.searchTerm = e.target.value;
    updateStorageUI(storageWindow);
  };

  storageWindow.querySelector("#storage-refresh").onclick = () =>
    updateStorageUI(storageWindow);

  storageWindow.querySelectorAll(".editable-val").forEach((cell) => {
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

  storageWindow.querySelectorAll(".delete-storage-item").forEach((btn) => {
    btn.onclick = () => {
      if (!confirm(`Delete ${currentType}?`)) return;

      const key = btn.dataset.key;
      if (currentType === "cookies") {
        document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      } else {
        window[`${currentType}Storage`].removeItem(key);
      }
      updateStorageUI(storageWindow);
    };
  });

  storageWindow.querySelector("#storage-clear").onclick = () => {
    if (!confirm(`Delete all ${currentType}?`)) return;

    if (currentType === "cookies") {
      api.runtime.sendMessage({ action: "CLEAR_COOKIES" }, (response) => {
        if (response?.success) {
          updateStorageUI(storageWindow);
        }
      });
    } else {
      window[currentType + "Storage"].clear();
      updateStorageUI(storageWindow);
    }
  };
}
