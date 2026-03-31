export function getSelector(el) {
  if (el.id && typeof el.id === 'string') return `#${el.id}`;
  
  let path = [];
  while (el && el.parentElement) {
    let name = el.tagName.toLowerCase();
    
    // Use getAttribute for class to safely handle SVGs and normal Elements
    const classAttr = el.getAttribute('class');
    
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
    if (el.tagName.toLowerCase() === 'body') {
      path.unshift('body');
      break;
    }
  }
  return path.join(" > ");
}