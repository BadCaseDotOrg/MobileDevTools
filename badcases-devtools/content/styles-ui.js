import { api } from "./overlay.js";

import { CSS_COLOR_PROPERTIES } from "./css.js";
import { CSS_PROPERTIES } from "./css.js";
import { CSS_COLOR_VALUES } from "./css.js";
import { CSS_PROPERTY_VALUES } from "./css.js";

import { shadow } from "./main-panel-ui.js";
import { panelDiv } from "./main-panel-ui.js";
import { cssWindow } from "./main-panel-ui.js";
import { codeWindow } from "./main-panel-ui.js";

import { renderDOMTree } from "./elements-ui.js";
import { expandToElement } from "./elements-ui.js";

export let activePopup = null;

export let lastHighlight = null;

export let overlayActive = false;

export function getCSSSuggestions(input = "") {
  const query = input.toLowerCase().trim();

  // If empty, return the first 8 properties in the list (usually the most common ones)
  // If not empty, filter and sort by relevance
  return CSS_PROPERTIES.filter((p) => p.toLowerCase().includes(query)).sort(
    (a, b) => {
      if (!query) return 0; // No sorting needed for empty query
      const aStarts = a.startsWith(query);
      const bStarts = b.startsWith(query);
      return aStarts === bStarts ? 0 : aStarts ? -1 : 1;
    },
  );
}

export const getValSuggestions = (prop, query = "") => {
  const p = prop.trim().toLowerCase();
  const propertySpecific =
    (typeof CSS_PROPERTY_VALUES !== "undefined"
      ? CSS_PROPERTY_VALUES[p]
      : []) || [];
  const colorValues =
    typeof CSS_COLOR_PROPERTIES !== "undefined" &&
    CSS_COLOR_PROPERTIES.includes(p)
      ? typeof CSS_COLOR_VALUES !== "undefined"
        ? CSS_COLOR_VALUES
        : []
      : [];
  const combined = [...new Set([...propertySpecific, ...colorValues])];
  return combined.filter((v) => v.toLowerCase().includes(query.toLowerCase()));
};

export function hexToRGBA(hex, alpha = 1.0) {
  // If it doesn't start with #, it's either a named color,
  // already rgba, or invalid. Return as-is.
  if (!hex.startsWith("#")) {
    return hex;
  }

  let r = 0,
    g = 0,
    b = 0;
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

export function getOrCreatePopup() {
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
export function showPopup(targetEl, suggestions, onSelect) {
  const popup = getOrCreatePopup();

  if (suggestions.length === 0) {
    popup.style.display = "none";
    return;
  }

  popup.innerHTML = "";
  const rect = targetEl.getBoundingClientRect();

  // Position it exactly under the span
  popup.style.left = `${rect.left}px`;
  popup.style.top = `${rect.bottom}px`;
  popup.style.display = "block";

  suggestions.forEach((text) => {
    const item = document.createElement("div");
    item.className = "autocomplete-item";
    item.textContent = text;
    item.style.cssText =
      "padding: 5px 10px; cursor: pointer; color: #f8f8f2; font-family: monospace; font-size: 12px;";

    item.onmouseenter = () => (item.style.background = "#3e3f3b");
    item.onmouseleave = () => (item.style.background = "transparent");

    item.onmousedown = (e) => {
      e.preventDefault(); // Prevent propSpan from blurring before click registers
      onSelect(text);
      popup.style.display = "none";
    };
    popup.appendChild(item);
  });
}

// --- Enable element picker ---
export function enablePicker() {
  if (overlayActive) return;
  overlayActive = true;

  // 1. Collapse the panel immediately so the user can see the full screen
  if (panelDiv) {
    panelDiv.classList.add("bc-collapsed");
  }

  const onSelect = (e) => {
    // Determine the target element (handling touch vs click)
    const target = e.touches
      ? document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY)
      : e.target;

    if (!target) return;

    e.preventDefault();
    e.stopPropagation();

    highlightElement(target);

    const info = {
      tag: target.tagName,
      id: target.id,
      className: target.className,
      selector: getSelector(target),
      outerHTML: target.outerHTML,
    };

    document.dispatchEvent(
      new CustomEvent("BC_ELEMENT_SELECTED", {
        detail: { ...info, element: target },
      }),
    );

    if (codeWindow) {
      renderDOMTree(document.documentElement, codeWindow);
      requestAnimationFrame(() => {
        expandToElement(target, codeWindow);
      });
    }

    // Cleanup
    overlayActive = false;
    document.removeEventListener("click", onSelect, true);
    document.removeEventListener("touchstart", onSelect, {
      capture: true,
      passive: false,
    });

    // 2. Expand the panel back to show the selected element's data
    if (panelDiv) {
      panelDiv.classList.remove("bc-collapsed");
    }
  };

  // Attach both listeners
  document.addEventListener("click", onSelect, true);
  document.addEventListener("touchstart", onSelect, {
    capture: true,
    passive: false,
  });
}

// --- Highlight element ---
export function highlightElement(el) {
  if (lastHighlight) lastHighlight.style.outline = "";
  el.style.outline = "2px solid red";
  lastHighlight = el;
}

export function getSelector(el) {
  if (el.id && typeof el.id === "string") return `#${el.id}`;

  let path = [];
  while (el && el.parentElement) {
    let name = el.tagName.toLowerCase();

    // Use getAttribute for class to safely handle SVGs and normal Elements
    const classAttr = el.getAttribute("class");

    if (classAttr) {
      // Split by any whitespace and filter out empty strings
      const classes = classAttr.trim().split(/\s+/).filter(Boolean);
      if (classes.length > 0) {
        name += "." + classes.join(".");
      }
    }

    path.unshift(name);
    el = el.parentElement;

    // Stop at body to keep the selector readable
    if (el.tagName.toLowerCase() === "body") {
      path.unshift("body");
      break;
    }
  }
  return path.join(" > ");
}

// --- Render CSS rules for a selected element ---
export function renderCSSRules(el, container = cssWindow) {
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
      if (
        document.activeElement &&
        document.activeElement.contentEditable === "true"
      )
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
      { passive: true },
    );
    targetEl.addEventListener("touchend", () => clearTimeout(touchTimer));
    targetEl.addEventListener("touchmove", () => clearTimeout(touchTimer));
  }

  function getSpecificity(selector) {
    if (selector === "element.style") return 10000;
    let a = 0,
      b = 0,
      c = 0;
    const tokens = selector.split(/(?=[ #\.\[:])|(?<=[ #\.\[:])/);
    tokens.forEach((token) => {
      if (token.startsWith("#")) a++;
      else if (
        token.startsWith(".") ||
        token.startsWith("[") ||
        (token.startsWith(":") && !token.startsWith("::"))
      )
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
      priority: 10000,
      source: "inline",
    });
  }

  for (const sheet of document.styleSheets) {
    try {
      // 1. Get the full URL and the short filename
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
            href: fullHref, // Store the full URL for the link
          });
        }
      }
    } catch (e) {
      // Handle CORS-blocked stylesheets
      if (sheet.href) {
        console.warn("CORS blocked access to:", sheet.href);
      }
      continue;
    }
  }

  matchedRules.sort((a, b) => b.priority - a.priority);

  const refreshOverrides = () => {
    const seenProps = new Set();
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
    header.style.cssText =
      "display: flex; justify-content: space-between; align-items: baseline;";

    const sel = document.createElement("div");
    sel.textContent = rule.selectorText + " {";
    sel.style.color = "#f92672";
    sel.style.fontWeight = "bold";
    sel.style.cursor = "pointer";

    const declContainer = document.createElement("div");

    setupCopyHandlers(sel, () => {
      const allDecls = Array.from(declContainer.querySelectorAll(".decl-row"))
        .map((row) => {
          const p = row.querySelector(".prop-span").textContent.trim();
          const v = row.querySelector(".val-span").textContent.trim();
          return p && v ? `  ${p}: ${v};` : "";
        })
        .filter(Boolean)
        .join("\n");
      return `${rule.selectorText} {\n${allDecls}\n}`;
    });
    let sourceLink = null;
    if (rule.source !== "inline") {
      sourceLink = document.createElement("a");
      sourceLink.href = rule.href || "#"; // Use the actual stylesheet URL if available
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
    sourceLink.target = "_blank"; // Opens in new tab if it's a real URL

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
      propSpan.setAttribute("tabindex", "0"); // FIX for Firefox focus
      propSpan.contentEditable = true;

      const valSpan = document.createElement("span");
      valSpan.className = "css-editable-span val-span";
      valSpan.textContent = vStr;
      valSpan.style.color = "#e6db74";
      propSpan.setAttribute("tabindex", "0"); // FIX for Firefox focus
      valSpan.contentEditable = true;

      setupCopyHandlers(
        decl,
        () => `${propSpan.textContent.trim()}: ${valSpan.textContent.trim()};`,
      );

      let colorInput = null;
      const currentProp = pStr.trim().toLowerCase();
      if (
        typeof CSS_COLOR_PROPERTIES !== "undefined" &&
        CSS_COLOR_PROPERTIES.includes(currentProp)
      ) {
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

      // Suggestion Logic for Property
      propSpan.addEventListener("focus", () => {
        showPopup(
          propSpan,
          getCSSSuggestions(propSpan.textContent),
          (selected) => {
            propSpan.textContent = selected;
            apply();
            valSpan.focus();
          },
        );
      });

      // Old Suggestion Logic for Value
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

        // 1. AUTOCOMPLETE SELECTION
        if ((e.key === "Tab" || e.key === "Enter") && isVisible) {
          const first = popup.querySelector(".autocomplete-item");
          if (first) {
            e.preventDefault();
            const selectedValue = first.textContent;
            valSpan.textContent = selectedValue;
            popup.style.display = "none";

            const range = document.createRange();
            const sel = window.getSelection();
            range.selectNodeContents(valSpan);
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);

            if (colorInput) {
              colorInput.style.background = hexToRGBA(selectedValue);
              if (/^#[0-9A-F]{6}$/i.test(selectedValue))
                colorInput.value = selectedValue;
            }
            apply();
            return;
          }
        }

        // 2. FIREFOX BACKSPACE FIX
        if (navigator.userAgent.includes("Firefox") && e.key === "Backspace") {
          const selection = window.getSelection();
          if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            if (range.collapsed && range.startOffset > 0) {
              range.setStart(range.startContainer, range.startOffset - 1);
              range.deleteContents();
              e.preventDefault();

              // Refresh suggestions after manual delete
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

        // 1. AUTOCOMPLETE SELECTION
        if ((e.key === "Tab" || e.key === "Enter") && isVisible) {
          const first = popup.querySelector(".autocomplete-item");
          if (first) {
            e.preventDefault();
            propSpan.textContent = first.textContent;
            popup.style.display = "none";

            const range = document.createRange();
            const sel = window.getSelection();
            range.selectNodeContents(propSpan);
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);

            apply();
            valSpan.focus();
            return;
          }
        }

        // 2. FIREFOX BACKSPACE & LIVE UPDATE FIX
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

          // Update the popup with fresh suggestions based on both spans
          const suggestions = getCSSSuggestions(p);
          showPopup(propSpan, suggestions, (selected) => {
            propSpan.textContent = selected;
            apply();
          });

          apply(); // Ensure the change hits the element live
        }

        // 3. THE REFRESH TRIGGER
        // We use a 0ms timeout to let the browser finish the keydown update
        // so textContent reflects the NEW state before we fetch suggestions.
        setTimeout(() => {
          const p = propSpan.textContent.trim().toLowerCase();
          const v = valSpan.textContent.trim();

          // Update the popup with fresh suggestions based on both spans
          const suggestions = getCSSSuggestions(p);
          showPopup(propSpan, suggestions, (selected) => {
            propSpan.textContent = selected;
            apply();
            valSpan.focus();
          });

          apply(); // Ensure the change hits the element live
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

    const declPairs = rule.cssText
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean);
    declPairs.forEach((pair) => {
      const splitIdx = pair.indexOf(":");
      if (splitIdx !== -1) {
        declContainer.appendChild(
          createDeclRow(
            pair.substring(0, splitIdx).trim(),
            pair.substring(splitIdx + 1).trim(),
          ),
        );
      }
    });

    const closeBrace = document.createElement("div");
    closeBrace.textContent = "}";
    closeBrace.style.cssText =
      "cursor: pointer; color: #f92672; font-weight: bold; width: fit-content;";
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
