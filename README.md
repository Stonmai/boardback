<div align="center">

# BoardBack

**Your bookmark. Your browser. Your board.**

A local-first visual workspace for organizing browser tabs and bookmarks on an infinite canvas.

[![Web App](https://img.shields.io/badge/Web_App-Live-black?style=for-the-badge&logo=vercel)](https://boardback-web.vercel.app)
[![Chrome Extension](https://img.shields.io/badge/Chrome_Extension-Install-blue?style=for-the-badge&logo=googlechrome)](https://chromewebstore.google.com/detail/boardback-capture-tool/cnopkpkjbkbccgikjggidpojcjchclpe)

</div>

---

## What is BoardBack?

Capture anything from Chrome with one click, arrange it on an infinite canvas, draw connections, group ideas — all stored **privately on your device** with no account required.

---

## Features

- **Infinite canvas** — Drag, zoom, and arrange bookmarks and notes freely
- **One-click capture** — Chrome extension captures the current tab or all open tabs at once
- **Paste URLs** — Drop any link onto the canvas directly
- **Sticky notes** — Add text notes and connect them to bookmarks
- **Groups** — Drag items into labeled group frames; auto-arrange by domain or tags
- **Connections** — Draw edges between any two nodes to map your thinking
- **Tag filtering** — Color-tag bookmarks and filter the canvas instantly
- **Undo / Redo** — Full history with `Cmd+Z` / `Cmd+Shift+Z`
- **100% local** — Data lives in your browser via IndexedDB; no cloud, no account, no tracking

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
│   ├── web/          # Next.js app (the canvas)
│   ├── extension/    # Chrome extension (capture tool)
│   └── shared/       # Shared TypeScript types
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Google Chrome (for the extension)

### Install dependencies

```bash
npm install
```

### Run the web app

```bash
npm run web:dev
# Opens at http://localhost:3000
```

### Run the extension (dev)

```bash
npm run extension:dev
```

Then load it in Chrome:

1. Go to `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select `packages/extension/dist`
5. Pin **BoardBack** to your toolbar

---

## Using the Extension

| Action | What it does |
|---|---|
| **Capture Tab** | Saves the current tab (screenshot + metadata) to the canvas |
| **Capture All** | Saves all open tabs in the current window |
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
- The extension only communicates with the BoardBack web app

---

## Development Notes

- The extension communicates with the web app via custom DOM events (`WHITEBOARD_SYNC_REQUEST` / `WHITEBOARD_SYNC_RESPONSE`)
- Extension detection works by the content script setting `data-whiteboard-ext="true"` on `<html>` — the web app reads this on load to show install status in the intro screen
- The intro screen only appears once (tracked via `hasSeenIntro` in the persisted store)

### Reset all data

```js
indexedDB.deleteDatabase('boardback-db')
localStorage.clear()
location.reload()
```
