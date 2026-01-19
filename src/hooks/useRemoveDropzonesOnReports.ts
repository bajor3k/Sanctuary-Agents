
import { useEffect } from "react";

/** Strings that commonly appear on the three cards */
const TEXT_MATCHERS = [
  /drop\s*file/i,
  /drop\s*pyfee/i,
  /drop\s*pycash/i,
  /drop\s*pypi/i,
];

/** CSS selectors we've seen for these cards/containers */
const SELECTORS = [
  '[data-dropzone]',
  '[data-role="report-upload"]',
  '.report-upload-trio',
  '.report-dropzone',
  '.dropzone-card',
  '.file-drop-card',
  '.upload-zone',
  '.report-upload-row',
];

function looksLikeDropCard(el: Element) {
  // Quick text check
  const text = (el.textContent || "").trim();
  if (text && TEXT_MATCHERS.some(rx => rx.test(text))) return true;

  // Heuristic: upload icons or typical class/id hints
  const cls = el.className?.toString() ?? "";
  if (/upload|dropzone|drop-file|file-drop/i.test(cls)) return true;

  return false;
}

/** Remove the nearest card-like container around a matched element */
function removeCardNode(node: Element) {
  // Try to remove a card container
  const container =
    node.closest('.card, [role="group"], [data-card], .rounded-2xl, .rounded-xl')
    || node.closest('[class*="card"]')
    || node.parentElement;

  // Check if the container is still in the DOM before trying to remove it
  if (container && container.parentElement && document.body.contains(container)) {
    container.parentElement.removeChild(container);
  }
}

export function useRemoveDropzonesOnReports() {
  useEffect(() => {
    const root = document.querySelector('[data-route="reports"]') || document.body;
    if (!root) return;

    const sweep = () => {
      // 1) Remove by known selectors
      SELECTORS.forEach(sel => {
        root.querySelectorAll(sel).forEach(removeCardNode);
      });

      // 2) Fallback: find any element whose text matches the "Drop File..." patterns
      const treeWalker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
      let el: Element | null = treeWalker.currentNode as Element;
      while ((el = treeWalker.nextNode() as Element | null)) {
        try {
          if (looksLikeDropCard(el)) removeCardNode(el);
        } catch {/* ignore */}
      }
    };

    // Initial sweep
    sweep();

    // Watch for dynamically added nodes
    const mo = new MutationObserver(() => sweep());
    mo.observe(root, { childList: true, subtree: true });

    return () => mo.disconnect();
  }, []);
}
