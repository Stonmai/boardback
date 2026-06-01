'use client';

import React, { useMemo, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Node,
  NodeChange,
  SelectionMode,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useStore } from '@/store/useStore';
import BookmarkNode from './nodes/BookmarkNode';
import NoteNode from './nodes/NoteNode';
import GroupNode from './nodes/GroupNode';
import Toolbar from './Toolbar';
import PreviewModal from './PreviewModal';
import IntroModal from './IntroModal';
import CursorEffect from './CursorEffect';
import NodeContextMenu from './nodes/NodeContextMenu';
import { Clipboard } from 'lucide-react';
import { NodeActionBar } from './NodeActionBar';


import { v4 as uuidv4 } from 'uuid';
import { fetchMetadata } from '@/utils/metadata';

const nodeTypes = {
  bookmark: BookmarkNode,
  tab: BookmarkNode,
  note: NoteNode,
  group: GroupNode,
};

// Set on every internal copy/cut; compared against paste to detect internal origin.
let _internalClipboardToken = '';
let _internalClipboardText = '';

// Module-level ref so onPaneContextMenu (outside ReactFlow context) can convert coords.
let _screenToFlowPosition: ((pos: { x: number; y: number }) => { x: number; y: number }) | null = null;
const ScreenToFlowBridge = () => {
  const { screenToFlowPosition } = useReactFlow();
  _screenToFlowPosition = screenToFlowPosition;
  return null;
};

type HandlerProps = {
  addNode: (node: any) => void;
  updateNode: (id: string, data: any) => void;
};

const SyncHandler = ({ addNode, updateNode }: HandlerProps) => {
  const { screenToFlowPosition, fitView } = useReactFlow();
  const addNodeToRoom = useStore(s => s.addNodeToRoom);

  useEffect(() => {
    const handleSyncResponse = (event: any) => {
      const pendingCaptures = event.detail;
      if (!Array.isArray(pendingCaptures) || pendingCaptures.length === 0) return;

      const COL_W = 220;
      const ROW_H = 280;
      const cols = Math.ceil(Math.sqrt(pendingCaptures.length));
      const rows = Math.ceil(pendingCaptures.length / cols);

      // Centre the grid on the current viewport
      const center = screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
      const originX = center.x - ((cols - 1) * COL_W) / 2;
      const originY = center.y - ((rows - 1) * ROW_H) / 2;

      const currentRoomId = useStore.getState().currentRoomId;
      const currentRoomIds: string[] = [];

      pendingCaptures.forEach((capture: any, index: number) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        const nodeId = uuidv4();
        const roomId = capture.roomId as string | undefined;
        const nodePayload = {
          id: nodeId,
          type: 'bookmark' as const,
          position: { x: originX + col * COL_W, y: originY + row * ROW_H },
          width: 300,
          selected: true,
          data: capture,
          createdAt: new Date().toISOString(),
        };
        if (roomId) {
          addNodeToRoom(roomId, nodePayload);
          if (roomId === currentRoomId) currentRoomIds.push(nodeId);
        } else {
          addNode(nodePayload);
          currentRoomIds.push(nodeId);
        }
        if (!capture.screenshot && capture.url) {
          fetchMetadata(capture.url).then((metadata: any) => { updateNode(nodeId, metadata); });
        }
      });

      // Fit view only to nodes added to the current room
      if (currentRoomIds.length > 0) {
        setTimeout(() => {
          fitView({ nodes: currentRoomIds.map(id => ({ id })), padding: 0.3, duration: 0, maxZoom: 1 });
        }, 100);
      }
    };

    const requestSync = () => window.dispatchEvent(new CustomEvent('WHITEBOARD_SYNC_REQUEST'));

    window.addEventListener('WHITEBOARD_SYNC_RESPONSE', handleSyncResponse);
    window.addEventListener('WHITEBOARD_EXT_READY', requestSync);

    // Delay the first sync to ensure Dexie has finished rehydrating persisted state.
    // Without this, nodes added by sync can be overwritten when Dexie loads.
    const initTimer = setTimeout(requestSync, 500);
    const interval = setInterval(requestSync, 2000);

    return () => {
      window.removeEventListener('WHITEBOARD_SYNC_RESPONSE', handleSyncResponse);
      window.removeEventListener('WHITEBOARD_EXT_READY', requestSync);
      clearTimeout(initTimer);
      clearInterval(interval);
    };
  }, [addNode, addNodeToRoom, updateNode, screenToFlowPosition, fitView]);

  return null;
};

// Syncs full dossier data to Chrome extension storage
const DataSyncer = () => {
  const dossiers = useStore(s => s.dossiers);
  const currentDossierId = useStore(s => s.currentDossierId);
  const rooms = useStore(s => s.rooms);
  const currentRoomId = useStore(s => s.currentRoomId);
  const nodes = useStore(s => s.nodes);
  const edges = useStore(s => s.edges);
  const groups = useStore(s => s.groups);
  const tags = useStore(s => s.tags);

  useEffect(() => {
    // We send the full state of dossiers. To ensure the active dossier's live room 
    // is up to date, we "flush" the current live nodes/edges/groups into the 
    // relevant dossier/room before sending.
    const syncData = () => {
      // The extension popup only reads title/url/favicon from this mirror. Strip the heavy
      // base64 blobs (screenshot/ogImage/content) so we don't blow chrome.storage.local's quota.
      const slimNode = (node: any) => {
        if (!node?.data) return node;
        const { screenshot, ogImage, content, ...data } = node.data;
        return { ...node, data };
      };
      const slimNodes = (ns: any[]) => Array.isArray(ns) ? ns.map(slimNode) : ns;

      const flushedDossiers = dossiers.map(d => {
        const updatedRooms = (d.id === currentDossierId ? rooms : d.rooms).map(r => {
          if (d.id === currentDossierId && r.id === currentRoomId) {
            return { ...r, nodes: slimNodes(nodes), edges, groups };
          }
          return { ...r, nodes: slimNodes(r.nodes) };
        });
        return d.id === currentDossierId
          ? { ...d, rooms: updatedRooms, tags, currentRoomId }
          : { ...d, rooms: updatedRooms };
      });

      window.dispatchEvent(new CustomEvent('BOARDBACK_DATA_UPDATE', {
        detail: { dossiers: flushedDossiers, currentDossierId }
      }));
    };

    syncData();
    window.addEventListener('WHITEBOARD_EXT_READY', syncData);
    return () => window.removeEventListener('WHITEBOARD_EXT_READY', syncData);
  }, [dossiers, currentDossierId, rooms, currentRoomId, nodes, edges, groups, tags]);

  return null;
};

type PasteHandlerProps = HandlerProps;

const PasteHandler = ({ addNode, updateNode }: PasteHandlerProps) => {
  const { getViewport } = useReactFlow();
  const getViewportRef = React.useRef(getViewport);
  useEffect(() => { getViewportRef.current = getViewport; });

  useEffect(() => {
    const handlePaste = async (event: ClipboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

      const isUrl = (s: string) => /^https?:\/\/[^\s]+$/.test(s.trim());

      const plainText = event.clipboardData?.getData('text/plain')?.trim() || '';

      // Clipboard text matches what we wrote internally → paste nodes
      if (_internalClipboardToken && plainText === _internalClipboardText) {
        const store = useStore.getState();
        if (store.clipboard.length > 0) {
          const vp = getViewportRef.current();
          const center = {
            x: (window.innerWidth * 0.5 - vp.x) / vp.zoom,
            y: (window.innerHeight * 0.5 - vp.y) / vp.zoom,
          };
          store.pasteNodes(center);
        }
        return;
      }

      const vp = getViewportRef.current();
      const centerX = (window.innerWidth * 0.5 - vp.x) / vp.zoom;
      const centerY = (window.innerHeight * 0.5 - vp.y) / vp.zoom;

      // Build { url, title } entries from plain text first
      const entries: { url: string; title: string }[] = [];
      const plainLines = plainText.split('\n').map(l => l.trim()).filter(Boolean);
      let pendingTitle = '';
      for (const line of plainLines) {
        if (isUrl(line)) {
          let fallback = line;
          try { fallback = new URL(line).hostname.replace('www.', ''); } catch (e) {}
          entries.push({ url: line, title: pendingTitle || fallback });
          pendingTitle = '';
        } else {
          pendingTitle = line.length > 80 ? line.slice(0, 80) + '…' : line;
        }
      }

      // If plain text had no URLs, try extracting from HTML clipboard (browser-copied links)
      if (entries.length === 0) {
        const html = event.clipboardData?.getData('text/html') || '';
        if (html) {
          const doc = new DOMParser().parseFromString(html, 'text/html');
          doc.querySelectorAll('a[href]').forEach(a => {
            const href = (a as HTMLAnchorElement).href;
            const title = a.textContent?.trim() || '';
            if (isUrl(href)) {
              let fallback = href;
              try { fallback = new URL(href).hostname.replace('www.', ''); } catch (e) {}
              entries.push({ url: href, title: title || fallback });
            }
          });
        }
      }

      const text = plainText;
      const lines = plainLines;

      if (entries.length >= 2) {
        // Multiple URLs — create one bookmark per URL in a grid layout
        const COLS = Math.ceil(Math.sqrt(entries.length));
        const NODE_W = 300, NODE_H = 200, GAP = 32;
        const gridW = COLS * (NODE_W + GAP) - GAP;
        const startX = centerX - gridW / 2;
        const startY = centerY - Math.ceil(entries.length / COLS) * (NODE_H + GAP) / 2;

        entries.forEach(({ url, title }, i) => {
          const col = i % COLS;
          const row = Math.floor(i / COLS);
          const position = {
            x: startX + col * (NODE_W + GAP),
            y: startY + row * (NODE_H + GAP),
          };
          const nodeId = uuidv4();
          addNode({
            id: nodeId,
            type: 'bookmark',
            position,
            width: NODE_W,
            data: { title, url, tags: ['pasted url'] },
            createdAt: new Date().toISOString(),
          });
          fetchMetadata(url).then(metadata => { updateNode(nodeId, metadata); });
        });
      } else if (entries.length === 1) {
        // Single URL
        const { url, title } = entries[0];
        const nodeId = uuidv4();
        addNode({
          id: nodeId,
          type: 'bookmark',
          position: { x: centerX + (Math.random() - 0.5) * 80, y: centerY + (Math.random() - 0.5) * 80 },
          width: 300,
          data: { title, url, tags: ['pasted url'] },
          createdAt: new Date().toISOString(),
        });
        fetchMetadata(url).then(metadata => { updateNode(nodeId, metadata); });
      } else {
        // No URLs — paste as a note
        const noteLines = text.split('\n');
        const estimatedHeight = 40 + 46 + noteLines.length * 36;
        const noteWidth = Math.min(700, Math.max(360, Math.round(estimatedHeight * 1.6)));
        const noteHeight = Math.min(1000, Math.max(240, estimatedHeight));
        addNode({
          id: uuidv4(),
          type: 'note',
          position: { x: centerX + (Math.random() - 0.5) * 80, y: centerY + (Math.random() - 0.5) * 80 },
          width: noteWidth,
          height: noteHeight,
          data: { title: '', content: text, tags: ['pasted note'] },
          createdAt: new Date().toISOString(),
        });
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [addNode, updateNode]);

  return null;
};

const NavigationHandler = () => {
  const { setCenter } = useReactFlow();
  const pendingNavigation = useStore(s => s.pendingNavigation);
  const setPendingNavigation = useStore(s => s.setPendingNavigation);
  const currentRoomId = useStore(s => s.currentRoomId);
  // Store the target in a ref so the currentRoomId effect can read it
  // after the new room's nodes have been rendered by ReactFlow.
  const navRef = React.useRef<{ x: number; y: number } | null>(null);

  // Capture the pending navigation and clear it from the store immediately.
  useEffect(() => {
    if (!pendingNavigation) return;
    navRef.current = pendingNavigation;
    setPendingNavigation(null);
  }, [pendingNavigation, setPendingNavigation]);

  // After the room switch is committed and ReactFlow has painted the new nodes,
  // apply the saved navigation target.
  useEffect(() => {
    if (!navRef.current) return;
    const { x, y } = navRef.current;
    navRef.current = null;
    const timer = setTimeout(() => setCenter(x, y, { zoom: 1, duration: 400 }), 150);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRoomId]);

  return null;
};

const ZoomHandler = () => {
  const { zoomIn, zoomOut } = useReactFlow();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (!meta) return;
      if (e.key === '=' || e.key === '+') { e.preventDefault(); zoomIn({ duration: 0 }); }
      if (e.key === '-') { e.preventDefault(); zoomOut({ duration: 0 }); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomIn, zoomOut]);

  return null;
};

const PaneContextMenu = ({ x, y, canvasPos }: { x: number; y: number; canvasPos: { x: number; y: number } }) => {
  const pasteNodes = useStore(s => s.pasteNodes);
  const setPaneContextMenu = useStore(s => s.setPaneContextMenu);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onClick = () => setPaneContextMenu(null);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setPaneContextMenu(null); };
    window.addEventListener('click', onClick);
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('click', onClick); window.removeEventListener('keydown', onKey); };
  }, [setPaneContextMenu]);

  return createPortal(
    <div
      ref={menuRef}
      className="glass-dark rounded-2xl shadow-2xl border border-white/20 overflow-hidden"
      style={{ position: 'fixed', top: y, left: x, width: 160, zIndex: 99999 }}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
    >
      <button
        className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-white/80 hover:bg-white/10 hover:text-white transition-colors text-left"
        onClick={() => { pasteNodes(canvasPos); setPaneContextMenu(null); }}
      >
        <Clipboard size={13} /> Paste
      </button>
    </div>,
    document.body
  );
};

const Canvas = () => {
  const [isMounted, setIsMounted] = React.useState(false);
  const [isTouchDevice, setIsTouchDevice] = React.useState(() => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches);
  React.useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)');
    const handler = (e: MediaQueryListEvent) => setIsTouchDevice(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  const currentRoomId = useStore(s => s.currentRoomId);
  const clipboard = useStore(s => s.clipboard);
  const paneContextMenu = useStore(s => s.paneContextMenu);
  const setPaneContextMenu = useStore(s => s.setPaneContextMenu);

  const rawNodes = useStore((state) => state.nodes);
  const activeTagFilters = useStore((state) => state.activeTagFilters);
  const nodes = React.useMemo(() => {
    // Pre-compute which groups match the filter (by own tags or by having matching children)
    const getPid = (n: any): string | undefined => n.parentId || n.parentNode;
    const matchingGroupIds = new Set<string>();
    if (activeTagFilters.length > 0) {
      // Groups that directly have a matching tag
      rawNodes.forEach(n => {
        if (n.type === 'group' && (n.data.tags as string[] | undefined)?.some(t => activeTagFilters.includes(t))) {
          matchingGroupIds.add(n.id);
        }
      });
      // Also mark parent groups of any matching child node
      rawNodes.forEach(n => {
        if (n.type !== 'group' && (n.data.tags as string[] | undefined)?.some(t => activeTagFilters.includes(t))) {
          const pid = getPid(n);
          if (pid) matchingGroupIds.add(pid);
        }
      });
    }

    return rawNodes.map(n => {
      // Group nodes are stored with only style.width/style.height, no top-level
      // width/height. ReactFlow's getNodesInside treats such nodes as
      // "notInitialized" and always includes them in rubber-band selection,
      // bypassing SelectionMode.Full. Providing explicit dimensions here fixes this.
      if (n.type === 'group') {
        const base = {
          ...n,
          width: (n.style?.width as number) ?? (n.width as number) ?? 800,
          height: (n.style?.height as number) ?? (n.height as number) ?? 600,
        };
        if (activeTagFilters.length === 0) return base;
        return { ...base, hidden: !matchingGroupIds.has(n.id) };
      }
      if (activeTagFilters.length === 0) return n;
      const pid = getPid(n);
      const nodeMatches = (n.data.tags as string[] | undefined)?.some(t => activeTagFilters.includes(t));
      const parentMatches = pid ? matchingGroupIds.has(pid) : false;
      return { ...n, hidden: !nodeMatches && !parentMatches };
    });
  }, [rawNodes, activeTagFilters]);
  const edges = useStore((state) => state.edges);

  useEffect(() => {
    setIsMounted(true);
    if (navigator.storage?.persist) {
      navigator.storage.persist();
    }
  }, []);

  const storeOnNodesChange = useStore((state) => state.onNodesChange);

  // Custom selection: intercept ReactFlow's selection changes so we control
  // exactly which nodes get marked selected. Groups are excluded from
  // rubber-band selection (a batch of select:true changes) but can still be
  // selected individually by clicking.
  const onNodesChange = useCallback((changes: NodeChange[]) => {
    const selectOn = changes.filter((c) => c.type === 'select' && (c as any).selected === true);
    if (selectOn.length > 1) {
      // Batch selection (rubber-band) — deselect any group nodes that crept in
      const currentNodes = useStore.getState().nodes;
      const groupIds = new Set(currentNodes.filter((n) => n.type === 'group').map((n) => n.id));
      const filtered = changes.map((c) =>
        c.type === 'select' && (c as any).selected && groupIds.has(c.id)
          ? { ...c, selected: false }
          : c
      );
      storeOnNodesChange(filtered);
    } else {
      storeOnNodesChange(changes);
    }
  }, [storeOnNodesChange]);
  const onEdgesChange = useStore((state) => state.onEdgesChange);
  const onConnect = useStore((state) => state.onConnect);
  const addNode = useStore((state) => state.addNode);
  const updateNode = useStore((state) => state.updateNode);
  const setContextMenuNodeId = useStore((state) => state.setContextMenuNodeId);
  const autoArrange = useStore((state) => state.autoArrange);
  const previewNodeId = useStore((state) => state.previewNodeId);
  const setPreviewNodeId = useStore((state) => state.setPreviewNodeId);
  const setNodes = useStore((state) => state.setNodes);
  const undo = useStore((state) => state.undo);
  const redo = useStore((state) => state.redo);
  const copyNodes = useStore((state) => state.copyNodes);
  const pasteNodes = useStore((state) => state.pasteNodes);

  // Track which group is being hovered during a drag
  const [dropTargetId, setDropTargetId] = React.useState<string | null>(null);

  // Helper: get the bounding rect of a group node in flow coordinates
  const getGroupBounds = useCallback((groupNode: Node) => {
    const w = (groupNode.style?.width as number) ?? (groupNode.width as number) ?? 800;
    const h = (groupNode.style?.height as number) ?? (groupNode.height as number) ?? 600;
    return {
      x: groupNode.position.x,
      y: groupNode.position.y,
      x2: groupNode.position.x + w,
      y2: groupNode.position.y + h,
    };
  }, []);

  // Find which group (if any) a dragged node overlaps
  const findOverlappingGroup = useCallback(
    (draggedNode: Node, allNodes: Node[]) => {
      const dw = (draggedNode.style?.width as number) ?? 180;
      const dh = (draggedNode.style?.height as number) ?? 100;
      const dx = draggedNode.position.x;
      const dy = draggedNode.position.y;

      return allNodes.find((n) => {
        if (n.type !== 'group' || n.id === draggedNode.id) return false;
        const b = getGroupBounds(n);
        // Centre of dragged node must be inside group bounds
        const cx = dx + dw / 2;
        const cy = dy + dh / 2;
        return cx > b.x && cx < b.x2 && cy > b.y && cy < b.y2;
      }) ?? null;
    },
    [getGroupBounds]
  );

  const onNodeDragStart = useCallback(
    (_: React.MouseEvent, draggedNode: Node, draggedNodes: Node[]) => {
      if (draggedNode.type === 'group') return;
      // Remove extent:'parent' for ALL selected nodes so they are free to leave the group.
      // parentId stays so coordinate space is unchanged during this drag.
      const allDragged = draggedNodes.length > 1 ? draggedNodes : [draggedNode];
      const idsToFree = new Set(
        allDragged.filter((n) => (n as any).extent === 'parent').map((n) => n.id)
      );
      if (idsToFree.size > 0) {
        const currentNodes = useStore.getState().nodes;
        setNodes(
          currentNodes.map((n) =>
            idsToFree.has(n.id) ? { ...n, extent: undefined } : n
          )
        );
      }
    },
    [setNodes]
  );

  // ReactFlow 11 uses `parentNode`; v12+ uses `parentId`. Support both.
  const getParentId = (n: Node) => (n as any).parentId || (n as any).parentNode;

  const onNodeDrag = useCallback(
    (_: React.MouseEvent, draggedNode: Node) => {
      if (draggedNode.type === 'group') return;
      const currentNodes = useStore.getState().nodes;

      // Compute absolute position.
      // During drag, a child node's position is relative to its parent.
      let absolutePos = draggedNode.position;
      const parentId = getParentId(draggedNode);
      if (parentId) {
        const parent = currentNodes.find((n) => n.id === parentId);
        if (parent) {
          absolutePos = {
            x: parent.position.x + draggedNode.position.x,
            y: parent.position.y + draggedNode.position.y,
          };
        }
      }
      const fakeNode = { ...draggedNode, position: absolutePos };
      const over = findOverlappingGroup(fakeNode, currentNodes);
      const newTarget = over?.id ?? null;

      if (newTarget !== dropTargetId) {
        setDropTargetId(newTarget);
        setNodes(
          currentNodes.map((n) =>
            n.type === 'group'
              ? { ...n, data: { ...n.data, __dropTarget: n.id === newTarget } }
              : n
          )
        );
      }
    },
    [dropTargetId, findOverlappingGroup, setNodes]
  );

  const onNodeDragStop = useCallback(
    (_: React.MouseEvent, draggedNode: Node) => {
      if (draggedNode.type === 'group') return;
      // Read from store — onNodesChange (fired by ReactFlow before onNodeDragStop)
      // has already written the final positions here.
      const currentNodes = useStore.getState().nodes;

      // Clear all drop-target highlights
      const cleared = currentNodes.map((n) =>
        n.type === 'group' ? { ...n, data: { ...n.data, __dropTarget: false } } : n
      );

      // All selected non-group nodes moved together — identify them by selected flag.
      // Always include the primary draggedNode in case selection state is stale.
      const draggedIds = new Set(
        cleared
          .filter((n) => n.type !== 'group' && ((n as any).selected || n.id === draggedNode.id))
          .map((n) => n.id)
      );

      // Build absolute-position + target-group for every dragged node
      const draggedMeta = new Map<string, { absolutePos: { x: number; y: number }; targetGroup: Node | null }>();
      for (const n of cleared) {
        if (!draggedIds.has(n.id)) continue;
        let absolutePos = n.position;
        const oldParentId = getParentId(n);
        const oldParent = oldParentId ? cleared.find((p) => p.id === oldParentId) : null;
        if (oldParent) {
          absolutePos = {
            x: oldParent.position.x + n.position.x,
            y: oldParent.position.y + n.position.y,
          };
        }
        const fakeNode = { ...n, position: absolutePos, parentId: undefined };
        const targetGroup = findOverlappingGroup(fakeNode, cleared);
        draggedMeta.set(n.id, { absolutePos, targetGroup });
      }

      const updated = cleared.map((n) => {
        if (!draggedIds.has(n.id)) return n;
        const meta = draggedMeta.get(n.id);
        if (!meta) return n;
        const { absolutePos, targetGroup } = meta;

        if (targetGroup) {
          // ── Drag INTO a group ──
          return {
            ...n,
            position: {
              x: absolutePos.x - targetGroup.position.x,
              y: absolutePos.y - targetGroup.position.y,
            },
            parentId: targetGroup.id,
            extent: undefined,
          };
        } else {
          // ── Drag OUT of a group ──
          return {
            ...n,
            position: absolutePos,
            parentId: undefined,
            extent: undefined,
          };
        }
      });

      setNodes(updated);
      setDropTargetId(null);
    },
    [findOverlappingGroup, setNodes]
  );

  const previewNode = useMemo(() => {
    const node = nodes.find(n => n.id === previewNodeId);
    if (!node) return null;
    return {
      id: node.id,
      type: node.type as any,
      position: node.position,
      data: node.data,
      createdAt: new Date().toISOString()
    };
  }, [nodes, previewNodeId]);


  // Keyboard shortcuts — undo/redo only; copy/cut are handled via native copy/cut events below
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (!meta) return;
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
      const store = useStore.getState();
      if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); store.undo(); }
      if ((e.key === 'z' && e.shiftKey) || e.key === 'y') { e.preventDefault(); store.redo(); }
      // For 'c': call copyNodes() here so clipboard is ready before the copy event fires.
      // Do NOT preventDefault — let the native copy event fire so we can use setData() synchronously.
      if (e.key === 'c') {
        const target2 = e.target as HTMLElement;
        if (!target2.isContentEditable) store.copyNodes();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Native copy event — writes clipboard synchronously (reliable on all browsers/OS)
  useEffect(() => {
    const handleCopy = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
      const { clipboard } = useStore.getState();
      if (clipboard.length === 0) return;
      _internalClipboardToken = `__bb_${Date.now()}__`;
      const textLines = clipboard.flatMap((n: any) => {
        if ((n.type === 'bookmark' || n.type === 'tab') && n.data?.url) return [n.data.url as string];
        if (n.type === 'note' && n.data?.content) return [n.data.content as string];
        return [];
      });
      _internalClipboardText = textLines.join('\n');
      e.preventDefault();
      e.clipboardData!.setData('text/plain', _internalClipboardText);
    };
    window.addEventListener('copy', handleCopy);
    return () => window.removeEventListener('copy', handleCopy);
  }, []);

  // Native cut event — same as copy but also removes the nodes
  useEffect(() => {
    const handleCut = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
      const store = useStore.getState();
      if (store.selectedNodes.length === 0) return;
      store.cutNodes();
      const { clipboard } = useStore.getState();
      if (clipboard.length === 0) return;
      _internalClipboardToken = `__bb_${Date.now()}__`;
      const textLines = clipboard.flatMap((n: any) => {
        if ((n.type === 'bookmark' || n.type === 'tab') && n.data?.url) return [n.data.url as string];
        if (n.type === 'note' && n.data?.content) return [n.data.content as string];
        return [];
      });
      _internalClipboardText = textLines.join('\n');
      e.preventDefault();
      e.clipboardData!.setData('text/plain', _internalClipboardText);
    };
    window.addEventListener('cut', handleCut);
    return () => window.removeEventListener('cut', handleCut);
  }, []);

  if (!isMounted) return <div className="w-full h-screen overflow-hidden relative" style={{ background: 'var(--canvas-bg)' }} />;

  return (
    <div className="w-full h-screen overflow-hidden relative" style={{ background: 'var(--canvas-bg)' }}>
      <ReactFlow
        key={currentRoomId}
        nodes={nodes as unknown as Node[]}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={({ nodes }: { nodes: Node[] }) => useStore.getState().setSelectedNodes(nodes.map(n => n.id))}
        nodeTypes={nodeTypes as any}
        fitView
        fitViewOptions={{ padding: 0.6, maxZoom: 1 }}
        minZoom={0.1}
        defaultViewport={{ x: 0, y: 0, zoom: 0.55 }}
        connectionMode={'loose' as any}
        connectionRadius={40}
        snapToGrid={false}
        nodesDraggable={true}
        elevateNodesOnSelect={true}
        panOnDrag={isTouchDevice ? true : [1, 2]}
        panActivationKeyCode={["Space", "Meta"]}
        panOnScroll={true}
        zoomOnScroll={false}
        zoomOnDoubleClick={false}
        zoomOnPinch={true}
        selectionOnDrag={!isTouchDevice}
        selectionKeyCode={null}
        multiSelectionKeyCode={["Meta", "Control"]}
        selectionMode={SelectionMode.Partial}
        onNodeDragStart={onNodeDragStart}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        onPaneClick={() => { setContextMenuNodeId(null); setPaneContextMenu(null); }}
        onPaneContextMenu={(e: MouseEvent | React.MouseEvent<Element>) => {
          e.preventDefault();
          setContextMenuNodeId(null);
          if (clipboard.length > 0 && _screenToFlowPosition) {
            const canvasPos = _screenToFlowPosition({ x: (e as any).clientX, y: (e as any).clientY });
            setPaneContextMenu({ x: (e as any).clientX, y: (e as any).clientY, canvasPos });
          } else {
            setPaneContextMenu(null);
          }
        }}
        defaultEdgeOptions={{
          style: { strokeWidth: 2.5, strokeLinecap: 'round' },
          animated: false,
        }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={100}
          size={5}
          color="rgba(255,255,255,0.18)"
        />
        <Toolbar />
        <PasteHandler addNode={addNode} updateNode={updateNode} />
        <SyncHandler addNode={addNode} updateNode={updateNode} />
        <ZoomHandler />
        <NavigationHandler />
        <DataSyncer />
        <ScreenToFlowBridge />
      </ReactFlow>

      <NodeActionBar />

      {paneContextMenu && (
        <PaneContextMenu
          x={paneContextMenu.x}
          y={paneContextMenu.y}
          canvasPos={paneContextMenu.canvasPos}
        />
      )}

      {previewNode && (
        <PreviewModal
          node={previewNode}
          onClose={() => setPreviewNodeId(null)}
        />
      )}

      <IntroModal />
      <CursorEffect />
    </div>
  );
};

export default Canvas;