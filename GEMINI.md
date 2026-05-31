# GEMINI.md - BoardBack Project Context

## Project Overview
**BoardBack** is a local-first visual workspace for browser tabs and bookmarks. It allows users to capture web content, arrange it on an infinite canvas, and map their thinking using connections and sticky notes. All data is stored privately on the user's device via IndexedDB.

### Key Features
- **Visual Canvas**: Infinite canvas using React Flow for arranging bookmarks and notes.
- **One-Click Capture**: Chrome extension for saving tab screenshots and metadata.
- **Local-First**: No accounts, no cloud, no tracking. Data persists in IndexedDB.
- **Dossiers & Rooms**: Organize content into multiple dossiers and rooms.
- **Auto-Arrangement**: Intelligent layout logic to group bookmarks by domain or tags.

## Architecture
The project is a monorepo managed with npm workspaces:
- `packages/web`: Next.js web application (Visual Canvas).
- `packages/extension`: Chrome/Vivaldi extension (Capture Tool).
- `packages/shared`: Shared TypeScript types and constants.

### Tech Stack
- **Frontend**: Next.js 16 (React 19), TypeScript.
- **Styling**: Tailwind CSS 4.
- **Canvas**: React Flow (@xyflow/react v12).
- **State Management**: Zustand (with persistence).
- **Storage**: Dexie.js (IndexedDB wrapper).
- **Extension Build**: Webpack, Chrome MV3.

## Building and Running

### Development
```bash
# Install dependencies from root
npm install

# Start the web app (available at http://localhost:3000)
npm run web:dev

# Start the extension in watch mode
npm run extension:dev
```

### Production Build
```bash
# Build the web app
npm run web:build

# Build the extension (output in packages/extension/dist)
npm run extension:build
```

### Loading the Extension
1. Open `chrome://extensions` in Chrome or Vivaldi.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select `packages/extension/dist`.

## Development Conventions

### State Management
- Use the Zustand store defined in `packages/web/src/store/useStore.ts`.
- The store is persisted using a custom `dexieStorage` adapter to handle large data volumes in IndexedDB.
- History (undo/redo) and clipboard (copy/paste) are managed within the store.

### Communication Bridge
- The web app and extension communicate via custom browser events (`WHITEBOARD_SYNC_REQUEST`, `WHITEBOARD_SYNC_RESPONSE`) and a content script bridge.
- The web app pings the extension every 2 seconds to check for pending captures.

### Coding Style
- Follow React 19 / Next.js 16 idiomatic patterns.
- Use Tailwind CSS for styling.
- Ensure all new data structures are added to `packages/shared/types.ts`.

### Storage Migration
- The store includes rehydration logic to migrate data from `localStorage` to `dexieStorage` and handle older room/dossier formats.

## Key Files
- `packages/web/src/store/useStore.ts`: Core application state and logic.
- `packages/web/src/components/Canvas.tsx`: Main React Flow integration and event handlers.
- `packages/extension/src/background/index.ts`: Extension service worker for tab capture and storage management.
- `packages/shared/types.ts`: Shared interface definitions.
