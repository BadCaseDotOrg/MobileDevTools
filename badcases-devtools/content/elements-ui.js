import { api } from "./overlay.js";

import { codeWindow } from "./main-panel-ui.js";

import { renderCSSRules } from "./styles-ui.js";

import { highlightElement } from "./styles-ui.js";

export function renderDOMTree(
  el = document.documentElement,
  container = codeWindow,
  level = 0,
) {
  if (!container) return;
  if (level === 0) container.innerHTML = "";

  // 1. Filter children (Ignore devtools and empty text)
  const children = Array.from(el.childNodes).filter((node) => {
    if (node.id === "devtools-panel") return false;
    return (
      node.nodeType === Node.ELEMENT_NODE ||
      (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== "")
    );
  });

  if (el.nodeType === Node.TEXT_NODE && el.textContent.trim() === "") return;

  // 2. Create the main row container
  const row = document.createElement("div");
  row.style.cssText = `padding-left: ${level * 12}px; cursor: pointer; user-select: none; display: flex; align-items: center; gap: 4px; font-family: monospace;`;
  row._element = el;

  const tagName = el.tagName ? el.tagName.toLowerCase() : "";

  // 3. Define the Closing Tag Row (for expanded state)
  let closeRow = null;
  if (el.nodeType === Node.ELEMENT_NODE && children.length > 0) {
    closeRow = document.createElement("div");
    closeRow._isClosingTag = true;
    closeRow.style.cssText = `padding-left: ${level * 12}px; font-family: monospace; color: #f92672; display: none;`;
    closeRow.textContent = `</${tagName}>`;
  }

  // 4. Create the Label and Inline Closing Tag
  const label = createHTMLLabel(el);
  label.className = "node-label";

  let inlineClosingSpan = null;
  if (el.nodeType === Node.ELEMENT_NODE && children.length > 0) {
    inlineClosingSpan = document.createElement("span");
    inlineClosingSpan.style.color = "#f92672";
    inlineClosingSpan.textContent = `</${tagName}>`;
    label.appendChild(inlineClosingSpan);
  }

  // 5. Toggle Arrow Logic
  const toggle = document.createElement("span");
  toggle.textContent = children.length ? "▶" : "•";
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

      children.forEach((child) =>
        renderDOMTree(child, childrenContainer, level + 1),
      );

      toggle.textContent = "▼";
      if (closeRow) closeRow.style.display = "block";
      if (inlineClosingSpan) inlineClosingSpan.style.display = "none";
    } else {
      if (row._childrenContainer) row._childrenContainer.remove();
      toggle.textContent = "▶";
      if (closeRow) closeRow.style.display = "none";
      if (inlineClosingSpan) inlineClosingSpan.style.display = "inline";
    }
    expanded = !expanded;
  });

  // 6. Editor Logic (Desktop DblClick + Mobile Long Press)
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
    textarea.style.cssText =
      "width: 100%; font-family: monospace; min-height: 60px; background: #1a1a1a; color: #fff; border: 1px solid #444; border-radius: 4px; padding: 5px;";

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
          (node) => node.tagName.includes("-"),
        );
        const isOurPanel =
          el.id === "devtools-panel" || el.closest("#devtools-panel");

        if ((isRoot || isCustom || hasCustomChild) && !isOurPanel) {
          const panel = document.getElementById("devtools-panel");
          const panelWasInside = panel && el.contains(panel);

          // TELEPORT TO SAFETY: Move to <html> (the absolute root)
          if (panelWasInside) {
            document.documentElement.appendChild(panel);
          }

          // Sync Attributes
          const currentAttrs = Array.from(el.attributes);
          currentAttrs.forEach((attr) => el.removeAttribute(attr.name));
          Array.from(newSource.attributes).forEach((attr) =>
            el.setAttribute(attr.name, attr.value),
          );

          // Sync Content
          if (el.innerHTML !== newSource.innerHTML) {
            el.innerHTML = newSource.innerHTML;
          }

          // TELEPORT BACK
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

  // Triggers
  label.addEventListener("dblclick", (e) => {
    e.stopPropagation();

    // DISABLE editing for <html>
    if (el.tagName === "HTML") return;

    startEditing(e);
  });
  label.addEventListener(
    "touchstart",
    (e) => {
      // DISABLE editing for <html>
      if (el.tagName === "HTML") return;

      touchTimer = setTimeout(() => {
        startEditing(e);
      }, 600);
    },
    { passive: true },
  );

  label.addEventListener("touchend", () => clearTimeout(touchTimer));
  label.addEventListener("touchmove", () => clearTimeout(touchTimer));

  // 7. Main Row Click (Inspection)
  row.addEventListener("click", (e) => {
    e.stopPropagation();
    if (el.nodeType === Node.ELEMENT_NODE) {
      highlightElement(el);
      renderCSSRules(el);
    }
  });

  // 8. Assembly
  row.appendChild(toggle);
  row.appendChild(label);
  container.appendChild(row);

  if (closeRow) {
    row.after(closeRow);
  }
}

// --- Helper: create syntax-highlighted label ---
export function createHTMLLabel(el) {
  if (el.nodeType === Node.TEXT_NODE) {
    const span = document.createElement("span");
    span.textContent = `"${el.textContent.trim()}"`;
    span.style.color = "#ccc";
    return span;
  }

  const span = document.createElement("span");

  // Tag name
  const tag = document.createElement("span");
  tag.textContent = `<${el.tagName.toLowerCase()}`;
  tag.style.color = "#f92672"; // pink
  span.appendChild(tag);

  // Attributes
  Array.from(el.attributes).forEach((attr) => {
    span.appendChild(document.createTextNode(" "));

    const name = document.createElement("span");
    name.textContent = attr.name;
    name.style.color = "#66d9ef"; // cyan
    span.appendChild(name);

    span.appendChild(document.createTextNode("="));

    const value = document.createElement("span");
    value.textContent = `"${attr.value}"`;
    value.style.color = "#e6db74"; // yellow
    span.appendChild(value);
  });

  // Closing tag
  const close = document.createElement("span");
  close.textContent = ">";
  close.style.color = "#f92672";
  span.appendChild(close);

  return span;
}

// --- Auto-expand tree to show element ---
export function expandToElement(targetEl, container = codeWindow) {
  if (!container || !targetEl) return;

  // 1. Build path from root -> target
  const path = [];
  let curr = targetEl;
  while (curr) {
    path.unshift(curr);
    // Stop at documentElement (html)
    if (curr === document.documentElement) break;
    curr = curr.parentElement;
  }

  // 2. Expand ancestors sequentially
  let currentSearchContainer = container;

  for (let i = 0; i < path.length; i++) {
    const el = path[i];
    // Find the row that represents this element
    const rows = Array.from(currentSearchContainer.children);
    const row = rows.find((r) => r._element === el);

    if (!row) {
      console.warn("Could not find row for element:", el);
      break;
    }

    // If it's not the final target, we need to expand it
    if (i < path.length - 1) {
      const toggle = row.querySelector("span"); // The first span is our toggle
      // If the toggle shows it's collapsed, click it
      if (toggle && toggle.textContent === "▶") {
        toggle.click();
      }

      // Because childrenContainer is a SIBLING (row.after),
      // the next container to search is row._childrenContainer
      if (row._childrenContainer) {
        currentSearchContainer = row._childrenContainer;
      } else {
        // If expansion failed to create a container, we can't go deeper
        break;
      }
    } else {
      // 3. Final Step: We reached the target row
      setTimeout(() => {
        row.scrollIntoView({ behavior: "smooth", block: "center" });

        // Highlight it
        highlightElement(el);
        renderCSSRules(el);

        row.style.backgroundColor = "rgba(102, 217, 239, 0.2)";
      }, 100);
    }
  }
}
