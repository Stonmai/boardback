<div align="center">

<img src="packages/web/public/icon.png" alt="BoardBack" width="96" height="96" />

# BoardBack

**Your bookmark. Your browser. Your board.**

Capture anything from the web, arrange it on an infinite canvas, and map your thinking — all stored privately on your device.

[![Web App](https://img.shields.io/badge/Open_App-boardback--web.vercel.app-black?style=for-the-badge&logo=vercel)](https://boardback-web.vercel.app)
[![Chrome Extension](https://img.shields.io/badge/Chrome_Extension-Install_Free-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)](https://chromewebstore.google.com/detail/boardback-capture-tool/cnopkpkjbkbccgikjggidpojcjchclpe)

</div>

---

## What is BoardBack?

BoardBack is a **local-first visual workspace** for your browser tabs and bookmarks. No sign-up. No cloud. No tracking. Everything stays on your device.

Open a new tab, capture it in one click, and drag it onto your personal canvas. Draw connections between ideas, group related research, and see the whole picture at a glance.

---

## Features

### 🗂 Visual Canvas
Arrange bookmarks, notes, and web captures on an infinite canvas. Drag freely, zoom in/out, and group related items in labeled frames.

### ⚡ One-Click Capture
The Chrome extension saves any tab — screenshot, title, URL, and metadata — directly to your canvas. Capture one tab or all open tabs at once.

### 🔗 Connections & Mapping
Draw edges between any two nodes to map relationships, trace research threads, or plan a project visually.

### 🏷 Tags & Filtering
Color-tag bookmarks and filter the canvas instantly. Auto-arrange nodes by domain or tag for quick organization.

### 📝 Sticky Notes
Add plain-text notes alongside your bookmarks. Connect them to any node to add context.

### 🔒 100% Private
All data lives in your browser's IndexedDB. Nothing is sent to a server. No account, no analytics, no telemetry.

### 🌐 New Tab Override
Optionally replace your browser's new tab page with your BoardBack workspace (requires the extension).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Web app | Next.js 14, React, TypeScript |
| Canvas | React Flow (@xyflow/react v12) |
| State | Zustand |
| Storage | Dexie (IndexedDB) |
| Extension | React, Webpack, Chrome MV3 |
| Styling | Tailwind CSS |

---

## Project Structure

```
boardback/
├── packages/
│   ├── web/          # Next.js app — the visual canvas
│   ├── extension/    # Chrome/Vivaldi extension — capture tool
│   └── shared/       # Shared TypeScript types
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Chrome or Vivaldi (for the extension)

### Install & Run

```bash
# Install dependencies
npm install

# Start the web app
npm run web:dev
# → http://localhost:3000

# Start the extension in watch mode
npm run extension:dev
```

### Load the Extension (Dev)

1. Go to `chrome://extensions` (or `vivaldi://extensions`)
2. Enable **Developer mode**
3. Click **Load unpacked** → select `packages/extension/dist`
4. Pin **BoardBack** to your toolbar

---

## Using the Extension

| Action | What it does |
|---|---|
| **Capture Tab** | Saves the current tab (screenshot + metadata) to your canvas |
| **Capture All** | Saves all open tabs in the current window (skips BoardBack itself) |
| **Open App** | Opens the BoardBack canvas |

Captured tabs appear on the canvas automatically within a few seconds.

---

## Canvas Shortcuts

| Interaction | Action |
|---|---|
| `Space + drag` | Pan the canvas |
| Scroll | Zoom in / out |
| `Shift + drag` | Multi-select |
| `Cmd/Ctrl + click` | Add to selection |
| Paste a URL | Creates a bookmark node |
| Paste text | Creates a sticky note |
| Drag node into group | Attaches it to the group |
| `Cmd/Ctrl + Z` | Undo |
| `Cmd/Ctrl + Shift + Z` | Redo |
| `Cmd/Ctrl + C / X / V` | Copy / Cut / Paste nodes |
| `Cmd/Ctrl + +/-` | Zoom in / out |

---

## Build for Production

```bash
npm run web:build
npm run extension:build
```

> After building the extension, reload it in `chrome://extensions`.
> After deploying to a new domain, update `content_scripts.matches` in `packages/extension/public/manifest.json` to include your production URL.

---

## Privacy

BoardBack is local-first by design:

- All data is stored in your browser's IndexedDB
- No data is sent to any server
- No analytics, no telemetry, no account required
- The extension only communicates with the BoardBack web app on the same device

---

## Development Notes

- Extension ↔ web app communication uses `chrome.runtime.sendMessage` with `externally_connectable` (MV3)
- Extension detection: the web app pings both the production and dev extension IDs on load
- The intro screen appears once per device (tracked via `hasSeenIntro` in the persisted Zustand store)
- Vivaldi support: `vivaldi://newtab` is handled for new tab override; internal `chrome://` URLs are remapped to `vivaldi://` on capture

### Reset all local data

```js
indexedDB.deleteDatabase('boardback-db')
localStorage.clear()
location.reload()
```
