// Listens for the configured shortcut in the page and reloads without the query string.
(() => {
  const { api, DEFAULTS, cleanUrl, matchesShortcut } = globalThis.CleanBrowserRefresh;

  let settings = { ...DEFAULTS };

  api.storage.sync.get(DEFAULTS).then((stored) => {
    settings = stored;
  });

  api.storage.onChanged.addListener((changes, area) => {
    if (area !== "sync") return;
    for (const [key, { newValue }] of Object.entries(changes)) {
      if (key in DEFAULTS) settings[key] = newValue ?? DEFAULTS[key];
    }
  });

  // Shift alone does not count: Shift + letter is still text input.
  function hasModifier(shortcut) {
    return shortcut.ctrlKey || shortcut.altKey || shortcut.metaKey;
  }

  function isEditable(target) {
    return (
      target instanceof Element &&
      (target.isContentEditable || target.closest("input, textarea, select") !== null)
    );
  }

  window.addEventListener(
    "keydown",
    (event) => {
      if (!settings.enabled || event.repeat || event.isComposing) return;
      if (!matchesShortcut(event, settings.shortcut)) return;
      if (!hasModifier(settings.shortcut) && isEditable(event.target)) return;

      const target = cleanUrl(location.href, settings.stripHash);
      if (!target) return;

      event.preventDefault();
      event.stopImmediatePropagation();

      // replace(): like a real refresh, no new history entry.
      if (target === location.href) location.reload();
      else location.replace(target);
    },
    true
  );
})();
