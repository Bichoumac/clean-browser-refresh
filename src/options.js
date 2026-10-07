const { api, DEFAULTS, formatShortcut } = globalThis.CleanBrowserRefresh;

const $ = (id) => document.getElementById(id);
const MODIFIER_KEYS = new Set(["Control", "Alt", "AltGraph", "Shift", "Meta", "OS", "CapsLock"]);

let recording = false;
let statusTimer;

function render(settings) {
  $("enabled").checked = settings.enabled;
  $("stripHash").checked = settings.stripHash;
  $("shortcut").textContent = formatShortcut(settings.shortcut);
}

async function load() {
  render(await api.storage.sync.get(DEFAULTS));
}

async function save(partial) {
  await api.storage.sync.set(partial);
  await load();
  $("status").textContent = "Saved ✓";
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => ($("status").textContent = ""), 1500);
}

function setRecording(on) {
  recording = on;
  $("record").textContent = on ? "Cancel" : "Change";
  $("shortcut").classList.toggle("recording", on);
  $("hint").textContent = "";
  if (on) $("shortcut").textContent = "Press the key combination…";
  else load();
}

// Readable key label, respecting the keyboard layout (AZERTY, QWERTY…).
function keyLabel(event) {
  if (/^[a-z]$/i.test(event.key)) return event.key.toUpperCase();
  if (/^Digit\d$/.test(event.code)) return event.code.slice(5);
  if (/^Key[A-Z]$/.test(event.code)) return event.code.slice(3);
  if (/^Numpad/.test(event.code)) return `Numpad ${event.code.slice(6)}`;
  if (event.key === " ") return "Space";
  if (event.key.length === 1) return event.key.toUpperCase();
  return event.key;
}

document.addEventListener(
  "keydown",
  (event) => {
    if (!recording) return;
    event.preventDefault();
    event.stopPropagation();

    if (event.key === "Escape") return setRecording(false);
    if (MODIFIER_KEYS.has(event.key)) return;

    const hasModifier = event.ctrlKey || event.altKey || event.metaKey;
    const isFunctionKey = /^F\d{1,2}$/.test(event.key);
    if (!hasModifier && !isFunctionKey) {
      $("hint").textContent = "Add Ctrl, Alt or Cmd, or use an F1–F12 key.";
      return;
    }

    const shortcut = {
      code: event.code,
      label: keyLabel(event),
      ctrlKey: event.ctrlKey,
      altKey: event.altKey,
      shiftKey: event.shiftKey,
      metaKey: event.metaKey,
    };
    setRecording(false);
    save({ shortcut });
  },
  true
);

$("record").addEventListener("click", () => setRecording(!recording));
$("enabled").addEventListener("change", (e) => save({ enabled: e.target.checked }));
$("stripHash").addEventListener("change", (e) => save({ stripHash: e.target.checked }));
$("reset").addEventListener("click", () => save(structuredClone(DEFAULTS)));

async function showNativeShortcut() {
  const commands = await api.commands.getAll();
  const command = commands.find((c) => c.name === "clean-reload");
  $("native").textContent = command?.shortcut || "not set";
}

load();
showNativeShortcut();
