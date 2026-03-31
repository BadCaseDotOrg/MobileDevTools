export function getDOMTree() {
  function walk(node) {
    return {
      tag: node.tagName,
      children: [...node.children].map(walk)
    };
  }
  return walk(document.documentElement);
}

export function findEl(selector) {
  return document.querySelector(selector);
}