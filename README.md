# Clean Browser Refresh

A Chrome / Firefox extension (Manifest V3) that refreshes the current page **without its URL parameters** (query string), using a configurable keyboard shortcut.

```
https://site.com/page?utm_source=news&id=42#section
                ↓  Alt + Shift + R  (default)
https://site.com/page#section
```

Handy for getting rid of tracking parameters (`utm_*`, `fbclid`, `gclid`…), resetting filters or search state kept in the URL, or simply reloading a "clean" version of a page.

## Features

- Keyboard shortcut configurable from the options page (you record the combination by pressing it). Default: `Alt + Shift + R`.
- A single F1–F12 key is accepted, for example to replace `F5`.
- Option to also remove the fragment (`#anchor`).
- Clicking the extension icon does the same thing.
- Optional native browser shortcut (`clean-reload` command). It works even when the page does not have focus.
- If there is no query string, the page is simply reloaded.
- Navigation uses `location.replace()`: like a real refresh, no entry is added to the history.

## Project structure

```
src/
├── manifest.json   # Manifest V3 shared by Chrome and Firefox
├── common.js       # Default settings, URL cleaning, shortcut matching
├── content.js      # Listens for the shortcut in the page
├── background.js   # Icon click + native shortcut (commands)
├── options.html    # Settings page
├── options.css
├── options.js
└── icons/
```

### Chrome / Firefox compatibility

- `background` declares both `service_worker` (used by Chrome) and `scripts` (used by Firefox, which does not support extension service workers). Chrome only shows a warning for the `scripts` key and ignores it.
- `common.js` uses `browser` if it exists (Firefox), otherwise `chrome`. In MV3, both APIs return promises.
- `browser_specific_settings.gecko` is required by Firefox and ignored by Chrome. **Replace the `clean-browser-refresh@example.com` `id`** with your own before signing or publishing on addons.mozilla.org.
- Minimum versions: Chrome 121+ and Firefox 121+.

## Building the packages

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or later (includes `npm`).
- The project sources (`git clone` or a copy of this folder).

### 1. Install the tooling

From the project root:

```bash
npm install
```

This installs [web-ext](https://github.com/mozilla/web-ext), Mozilla's command-line tool for building, linting and running extensions.

### 2. Check the extension

```bash
npm run lint
```

Fix any error reported before going further (warnings about the `background.scripts` key are expected, see above).

### 3. Build the package (Chrome and Firefox)

```bash
npm run build
```

This creates `dist/clean-browser-refresh-<version>.zip`, containing the content of `src/`. The same archive is used for:

- **Chrome / Edge / Brave**: loading the extension unpacked, or uploading it to the Chrome Web Store / Edge Add-ons.
- **Firefox**: uploading it to addons.mozilla.org (AMO).

To release a new version, bump `version` in `src/manifest.json` (and in `package.json` to keep them aligned) before building.

### 4. (Optional) Build a signed `.xpi` for Firefox

Release versions of Firefox only permanently install **signed** add-ons. Mozilla can sign the extension for you without publishing it on the store (*unlisted* channel):

1. Sign in on [addons.mozilla.org](https://addons.mozilla.org/) and create API credentials at [Developer Hub → Manage API Keys](https://addons.mozilla.org/developers/addon/api/key/).
2. Make sure the gecko `id` in `src/manifest.json` is your own (see above).
3. Export the credentials and run the signing script:

   ```bash
   # Linux / macOS / WSL
   export WEB_EXT_API_KEY="user:12345678:123"
   export WEB_EXT_API_SECRET="your-secret"
   npm run sign:firefox
   ```

   ```powershell
   # Windows PowerShell
   $env:WEB_EXT_API_KEY = "user:12345678:123"
   $env:WEB_EXT_API_SECRET = "your-secret"
   npm run sign:firefox
   ```

4. Once Mozilla's automatic review is done, the signed file is downloaded to `dist/` as a `.xpi`.

Each signed upload must have a new version number: bump `version` in `src/manifest.json` before signing again.

## Installation

### Chrome / Edge / Brave

Chrome no longer allows installing packaged extensions (`.crx`) from outside the Chrome Web Store, so the extension is loaded unpacked:

1. Unzip `dist/clean-browser-refresh-<version>.zip` into a permanent folder (do not delete it afterwards, the browser loads the extension from there). You can also use the `src/` folder directly.
2. Open `chrome://extensions` (`edge://extensions` in Edge, `brave://extensions` in Brave).
3. Enable **Developer mode**.
4. Click **Load unpacked** and select the unzipped folder (the one containing `manifest.json`).
5. Optional: pin the extension to the toolbar via the puzzle icon.

To update, replace the folder content with the new version and click the reload button on the extension's card.

### Firefox — signed `.xpi` (permanent install)

1. Open `about:addons`.
2. Click the ⚙ gear icon → **Install Add-on From File…**.
3. Select the `.xpi` file from `dist/` and confirm.
4. If needed, grant access to websites: `about:addons` → Clean Browser Refresh → **Permissions** → enable access to all sites. Without it, the keyboard shortcut cannot work in pages.

You can also drag and drop the `.xpi` file onto a Firefox window.

### Firefox — unsigned (temporary install, for testing)

1. Open `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on…** and select `src/manifest.json` (or the `.zip` from `dist/`).
3. If needed, grant access to websites as described above.

The extension is removed when Firefox is closed. Firefox Developer Edition, Nightly and ESR can install the unsigned `.zip` permanently after setting `xpinstall.signatures.required` to `false` in `about:config`.

### Development mode with web-ext

```bash
npm run start:firefox   # launches Firefox with the extension, reloaded on every change
npm run start:chrome    # launches Chromium with the extension
```

## Configuration

Right-click the extension icon → **Options** (Chrome), or `about:addons` → Clean Browser Refresh → **Preferences** (Firefox).

The native browser shortcut is set separately: `chrome://extensions/shortcuts` in Chrome, or `about:addons` → ⚙ → **Manage Extension Shortcuts** in Firefox.

## Limitations

- The configurable shortcut relies on a content script. It therefore does not work on internal browser pages (`chrome://`, `about:`), nor on the Chrome Web Store or addons.mozilla.org. It does not work on `file://` pages either, unless file URL access is enabled in Chrome. On web pages where the content script is blocked (stores) and on `file://` pages, the icon and the native shortcut still work.
- Some shortcuts are reserved by the browser and never reach the page (`Ctrl+T`, `Ctrl+W`, `Ctrl+N`, `Ctrl+Tab`…).
- Right after the page starts loading, there is a short moment during which the saved settings have not been read yet. During that time, the default shortcut applies.

## AI disclosure

This extension was written with the help of AI. The code and documentation were generated by an AI model and then reviewed by the project maintainer.

| | |
|---|---|
| Model | Claude Opus 5.5 (`claude-opus-5-5`) by [Anthropic](https://www.anthropic.com/) |
| Tool | [Claude Code](https://claude.com/claude-code) (VS Code extension) |
| AI contributions | Renaming the project to *Clean Browser Refresh*, translating the code and UI into English, writing this README (build and installation guides), adding the `build` file name and `sign:firefox` scripts |
| Date | October 2026 |

As with any AI-generated code, review it before relying on it, and report any issue you find.
