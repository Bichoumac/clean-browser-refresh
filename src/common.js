// Code shared by the content script, the background script and the options page.
(() => {
  if (globalThis.CleanBrowserRefresh) return;

  // Firefox exposes `browser`, Chrome exposes `chrome` (both return promises in MV3).
  const api = globalThis.browser ?? globalThis.chrome;

  const DEFAULTS = Object.freeze({
    enabled: true,
    stripHash: false,
    // `code` is used for matching (keyboard-layout independent), `label` for display.
    shortcut: Object.freeze({
      code: "KeyR",
      label: "R",
      ctrlKey: false,
      altKey: true,
      shiftKey: true,
      metaKey: false,
    }),
  });

  const SUPPORTED_PROTOCOLS = new Set(["http:", "https:", "file:"]);

  /**
   * Returns the URL without its query string (and without its fragment if requested),
   * or null if the URL is not a regular web page.
   */
  function cleanUrl(href, stripHash) {
    let url;
    try {
      url = new URL(href);
    } catch {
      return null;
    }
    if (!SUPPORTED_PROTOCOLS.has(url.protocol)) return null;
    url.search = "";
    if (stripHash) url.hash = "";
    return url.href;
  }

  function matchesShortcut(event, shortcut) {
    return (
      !!shortcut &&
      event.code === shortcut.code &&
      event.ctrlKey === shortcut.ctrlKey &&
      event.altKey === shortcut.altKey &&
      event.shiftKey === shortcut.shiftKey &&
      event.metaKey === shortcut.metaKey
    );
  }

  const IS_MAC = /Mac|iPhone|iPad/.test(globalThis.navigator?.platform ?? "");

  function formatShortcut(shortcut) {
    if (!shortcut) return "—";
    const parts = [];
    if (shortcut.ctrlKey) parts.push(IS_MAC ? "⌃ Ctrl" : "Ctrl");
    if (shortcut.altKey) parts.push(IS_MAC ? "⌥ Option" : "Alt");
    if (shortcut.shiftKey) parts.push("Shift");
    if (shortcut.metaKey) parts.push(IS_MAC ? "⌘ Cmd" : "Meta");
    parts.push(shortcut.label);
    return parts.join(" + ");
  }

  globalThis.CleanBrowserRefresh = Object.freeze({ api, DEFAULTS, cleanUrl, matchesShortcut, formatShortcut });
})();
