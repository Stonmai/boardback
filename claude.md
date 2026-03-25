# BoardBack — Claude Instructions

Local-first visual workspace for bookmarks and web captures. No backend. No auth. No cloud.

---

## Core Principles

1. **Local-first**: IndexedDB (Dexie) is the single source of truth. Never add server calls or external APIs.
2. **Performance**: Memoize node components. Avoid re-renders. No heavy logic in render.
3. **Minimal**: Don't add features, abstractions, or dependencies beyond what's asked.
4. **Typed**: All props/data use TypeScript. Shared types live in `packages/shared/types.ts` — never duplicate them.

---

## Monorepo Layout

```
packages/
  web/src/
    app/              → Next.js pages (layout.tsx, page.tsx)
    components/
      Canvas.tsx      → React Flow container + extension sync handler
      Toolbar.tsx
      PreviewModal.tsx
      nodes/
        BookmarkNode.tsx   → Used for both 'bookmark' and 'tab' types (488 lines, memo'd)
        NoteNode.tsx
        GroupNode.tsx
        NodeContextMenu.tsx
    store/
      useStore.ts     → Zustand store (855 lines) — all state + actions here
      dexieStorage.ts → IndexedDB adapter (async get/set/delete)
    utils/
      clustering.ts   → Auto-arrange: domain grouping + union-find + row-packing
      cn.ts           → Tailwind class merge utility
      metadata.ts
  extension/src/
    background/index.ts   → Tab listeners, new tab hijacking
    popup/index.tsx        → Room selector, tag input, capture button
    content/index.ts
    options/index.tsx
    config.ts              → APP_URL, LEGACY_URLS
  shared/
    types.ts          → WhiteboardNode, GroupFrame, Tag, TagColor, RoomData — source of truth
```

---

## Tech Stack

| Package | Version |
|---------|---------|
| Next.js | ^16.1.6 |
| React | ^19.2.4 |
| @xyflow/react (React Flow) | 12.10.1 |
| Zustand | ^5.0.11 |
| Dexie | ^4.3.0 |
| Tailwind CSS | ^4.2.1 |
| TypeScript | ^5 |
| lucide-react | ^0.577.0 |
| uuid | ^13.0.0 |
| serwist (PWA/SW) | ^9.5.6 |

Extension: Manifest V3, Webpack 5, React 19, @types/chrome.

---

## Shared Types (`packages/shared/types.ts`)

```ts
WhiteboardNode {
  id: string           // UUID
  type: 'bookmark' | 'tab' | 'note' | 'group'
  position: { x, y }
  width?: number
  height?: number
  data: {
    title, url?, content?, favicon?, screenshot?,
    tags: string[], color: string, description?
  }
  createdAt: string    // ISO timestamp
  parentId?: string    // for child nodes inside groups
}

GroupFrame { id, label, color, nodeIds[] }
RoomData   { id, name, emoji, nodes[], edges[], groups[] }
Tag        { id, name, color: TagColor }
```

Node color constants: `BOOKMARK_COLORS`, `NOTE_COLORS`, `ACCENT_HEX`.

---

## Zustand Store (`packages/web/src/store/useStore.ts`)

**State shape:**
```ts
nodes, edges, groups, rooms, currentRoomId,
tags, selectedNodes, previewNodeId, editingNodeId, contextMenuNodeId,
clipboard,           // Node[] for copy/paste/cut
_past, _future       // undo/redo history (max 50 entries)
```

**Rules:**
- All state mutations go through store actions — never mutate directly in components.
- Persist middleware + Dexie adapter handles IndexedDB sync automatically.
- Undo snapshot: call before major mutations (add, delete, cut, drag). Drag snapshots only if movement > 0.5px.
- Room switching: `switchRoom(id)` saves current state into rooms array then loads target room.
- Module-level vars `_dragging` / `_preDragSnapshot` track drag state without triggering renders.

**Paste pattern:** remap IDs with `idMap`, detect parents, adjust child offsets.

---

## React Flow (Canvas)

- Node types registered: `bookmark`, `tab` → `BookmarkNode`; `note` → `NoteNode`; `group` → `GroupNode`.
- All nodes have 4-directional handles (top/bottom/left/right).
- Keep node `data` fully serializable (no functions, no class instances).
- Do not break `parentId` relationships — `removeGroup` unparents children and recalculates absolute positions.
- `Canvas.tsx` includes the `SyncHandler` that listens for `'sync-response'` custom events from the extension.

---

## Styling

- **Tailwind CSS only.** No CSS modules, no styled-components.
- Inline styles only for dynamic values: colors, transforms, glassmorphism effects.
- CSS variables: `--accent-color`, `--accent-glow` for per-node theming.
- Glassmorphism: `backdrop-filter: blur(20px)` + semi-transparent backgrounds.
- Utility: use `cn()` from `utils/cn.ts` (clsx + tailwind-merge).

---

## Extension Communication

- Popup → background → web app via `chrome.runtime.sendMessage`.
- Rooms list synced via `chrome.storage.local`.
- Capture payload: `{ title, url, favicon, tags, roomId, screenshot? }`.
- New captures placed in a `sqrt(N)` grid centered on viewport.
- New tab hijacking: detects browser-specific URLs (including Vivaldi), redirects to `APP_URL`.
- Manifest V3 only — no background servers, no persistent connections.

---

## Scripts

```bash
npm run web:dev          # Next.js dev server (port 3000)
npm run web:build        # Next.js production build
npm run extension:dev    # Webpack watch
npm run extension:build  # Webpack production build
```

---

## Component Patterns

- Wrap node components in `memo()`.
- Local UI state (edit mode, color picker, tag input) lives in the component.
- Store-connected state always goes through Zustand actions.
- Double-click → edit mode; `Cmd+Enter` → save; `Escape` → cancel.
- Context menus close on `Escape` or outside click.

---

## Adding Features

1. Check if similar logic exists in `useStore.ts` or `clustering.ts`.
2. Reuse existing node types before adding new ones.
3. Update `packages/shared/types.ts` if new data shapes are needed.
4. Keep changes minimal — one concern per PR.

---

## Hard Rules

- No auth, no backend, no external APIs.
- No new state libraries.
- No data stored outside IndexedDB.
- No major new dependencies without strong justification.
- No server components unless clearly beneficial.
- No duplication of shared types.
