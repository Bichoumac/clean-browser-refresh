// Chrome loads this file as a service worker (common.js via importScripts);
// Firefox loads it as a background script, after common.js (see manifest.json).
if (typeof importScripts === "function" && !globalThis.CleanBrowserRefresh) {
  importScripts("common.js");
}

const { api, DEFAULTS, cleanUrl } = globalThis.CleanBrowserRefresh;

async function cleanReloadTab(tab) {
  if (!tab?.id || !tab.url) return;

  const { stripHash } = await api.storage.sync.get({ stripHash: DEFAULTS.stripHash });
  const target = cleanUrl(tab.url, stripHash);
  if (!target) return;

  if (target === tab.url) await api.tabs.reload(tab.id);
  else await api.tabs.update(tab.id, { url: target });
}

// Click on the extension icon.
api.action.onClicked.addListener(cleanReloadTab);

// Native browser shortcut (optional, set in the browser's extension shortcut settings).
api.commands.onCommand.addListener(async (command, tab) => {
  if (command !== "clean-reload") return;
  if (!tab) [tab] = await api.tabs.query({ active: true, currentWindow: true });
  await cleanReloadTab(tab);
});
