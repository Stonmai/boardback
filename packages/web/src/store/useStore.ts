import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { dexieStorage } from './dexieStorage';
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges
} from '@xyflow/react';
import { WhiteboardNode, GroupFrame, Tag } from '@whiteboard/shared/types';
import { findPlacement, extractDomain } from '@/utils/clustering';

// Module-level drag tracking — snapshot only if position actually changed
let _dragging = false;
let _preDragSnapshot: { nodes: Node<WhiteboardNode['data']>[]; edges: Edge[] } | null = null;

const BOOKMARK_COLORS = ['blue', 'green', 'amber', 'yellow', 'purple', 'pink'];
const NOTE_COLORS = ['purple', 'teal', 'yellow', 'pink', 'blue', 'lime'];

export type RoomType = string;

export interface RoomData {
  id: RoomType;
  name: string;
  emoji?: string;
  nodes: Node<WhiteboardNode['data']>[];
  edges: Edge[];
  groups: GroupFrame[];
}

export interface Dossier {
  id: string;
  name: string;
  emoji: string;
  rooms: RoomData[];
  tags: Tag[];
  currentRoomId: string;
}

const DEFAULT_TAGS: Tag[] = [
  { id: 'work', label: 'Work', color: 'slate' },
  { id: 'personal', label: 'Personal', color: 'slate' },
  { id: 'urgent', label: 'Urgent', color: 'slate' },
  { id: 'idea', label: 'Idea', color: 'slate' },
  { id: 'reference', label: 'Reference', color: 'slate' },
  { id: 'later', label: 'Later', color: 'slate' },
];

const DEFAULT_ROOMS: RoomData[] = [
  { id: 'personal',     name: 'Personal',     emoji: '😎', nodes: [], edges: [], groups: [] },
  { id: 'office',       name: 'Office',       emoji: '💼', nodes: [], edges: [], groups: [] },
  { id: 'social-media', name: 'Social Media', emoji: '📱', nodes: [], edges: [], groups: [] },
  { id: 'learning',     name: 'Learning',     emoji: '🧠', nodes: [], edges: [], groups: [] },
  { id: 'favorites',     name: 'Favorites',     emoji: '♥️', nodes: [], edges: [], groups: [] },
];

const DEFAULT_DOSSIER: Dossier = {
  id: 'default',
  name: 'Default',
  emoji: '📁',
  rooms: DEFAULT_ROOMS,
  tags: DEFAULT_TAGS,
  currentRoomId: 'personal',
};

const ACCENT_HEX: Record<string, string> = {
  white: '#94a3b8', blue: '#3b82f6', green: '#32d4a1', amber: '#f5d70b',
  purple: '#a855f7', pink: '#f472b6', teal: '#22d3ee', orange: '#ec9439',
  lime: '#a3e635', slate: '#475569',
};

type HistoryEntry = { nodes: Node<WhiteboardNode['data']>[]; edges: Edge[] };

interface WhiteboardState {
  nodes: Node<WhiteboardNode['data']>[];
  edges: Edge[];
  groups: GroupFrame[];
  tags: Tag[];
  selectedNodes: string[];
  previewNodeId: string | null;
  editingNodeId: string | null;
  contextMenuNodeId: string | null;
  paneContextMenu: { x: number; y: number; canvasPos: { x: number; y: number } } | null;
  clipboard: Node<WhiteboardNode['data']>[];
  clipboardEdges: Edge[];
  _past: HistoryEntry[];
  _future: HistoryEntry[];
  rooms: RoomData[];
  currentRoomId: RoomType;
  dossiers: Dossier[];
  currentDossierId: string;
  hasSeenIntro: boolean;
  activeTagFilters: string[];
  autoOpenBookmarks: boolean;
  pendingNavigation: { x: number; y: number } | null;

  // Actions
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange<Edge>;
  onConnect: OnConnect;
  addNode: (node: WhiteboardNode) => void;
  addNodeToRoom: (roomId: string, node: WhiteboardNode) => void;
  deleteNode: (id: string) => void;
  updateNode: (id: string, data: Partial<WhiteboardNode['data']>) => void;
  updateGroupSize: (id: string, x: number, y: number, width: number, height: number) => void;
  copyNodes: () => void;
  cutNodes: () => void;
  copyNodeById: (id: string) => void;
  cutNodeById: (id: string) => void;
  pasteNodes: (center?: { x: number; y: number }) => void;
  createGroup: (group: GroupFrame) => void;
  deleteGroup: (id: string) => void;
  removeGroup: (id: string) => void;
  addTag: (tag: Tag) => void;
  removeTag: (id: string) => void;
  setSelectedNodes: (ids: string[]) => void;
  setPreviewNodeId: (id: string | null) => void;
  setEditingNodeId: (id: string | null) => void;
  setContextMenuNodeId: (id: string | null) => void;
  setPaneContextMenu: (menu: { x: number; y: number; canvasPos: { x: number; y: number } } | null) => void;
  setNodes: (nodes: Node<WhiteboardNode['data']>[]) => void;
  autoArrange: () => void;
  switchRoom: (id: RoomType) => void;
  addRoom: (name: string, emoji: string) => void;
  deleteRoom: (id: string) => void;
  updateRoomEmoji: (id: string, emoji: string) => void;
  updateRoomName: (id: string, name: string) => void;
  reorderRooms: (rooms: RoomData[]) => void;
  switchDossier: (id: string) => void;
  addDossier: (name: string, emoji: string) => void;
  duplicateDossier: (id: string) => void;
  deleteDossier: (id: string) => void;
  updateDossierName: (id: string, name: string) => void;
  updateDossierEmoji: (id: string, emoji: string) => void;
  exportDossier: (name: string) => void;
  parseDossierFile: (file: File) => Promise<Dossier | null>;
  commitImportDossier: (dossier: Dossier, name: string) => void;
  snapshot: () => void;
  undo: () => void;
  redo: () => void;
  dismissIntro: () => void;
  toggleTagFilter: (tag: string) => void;
  setAutoOpenBookmarks: (val: boolean) => void;
  setPendingNavigation: (nav: { x: number; y: number } | null) => void;
  _getParentId: (n: Node) => string | undefined;
}

function uniqueDossierName(base: string, existing: Dossier[]): string {
  const names = new Set(existing.map(d => d.name));
  if (!names.has(base)) return base;
  let i = 1;
  while (names.has(`${base} (${i})`)) i++;
  return `${base} (${i})`;
}

export const useStore = create<WhiteboardState>()(
  persist(
    (set, get) => ({
  nodes: [] as Node<WhiteboardNode['data']>[],
  edges: [] as Edge[],
  groups: [] as GroupFrame[],
  rooms: DEFAULT_ROOMS,
  currentRoomId: 'personal' as RoomType,
  dossiers: [DEFAULT_DOSSIER],
  currentDossierId: 'default',
  tags: DEFAULT_TAGS,
  selectedNodes: [] as string[],
  previewNodeId: null,
  editingNodeId: null,
  contextMenuNodeId: null,
  paneContextMenu: null,
  clipboard: [] as Node<WhiteboardNode['data']>[],
  clipboardEdges: [] as Edge[],
  _past: [] as HistoryEntry[],
  _future: [] as HistoryEntry[],
  hasSeenIntro: false,
  activeTagFilters: [],
  autoOpenBookmarks: true,
  pendingNavigation: null,

  dismissIntro: () => set({ hasSeenIntro: true }),
  setPendingNavigation: (nav: { x: number; y: number } | null) => set({ pendingNavigation: nav }),
  toggleTagFilter: (tag: string) => {
    const { activeTagFilters } = get();
    set({
      activeTagFilters: activeTagFilters.includes(tag)
        ? activeTagFilters.filter((t: string) => t !== tag)
        : [...activeTagFilters, tag],
    });
  },
  setAutoOpenBookmarks: (val: boolean) => set({ autoOpenBookmarks: val }),

  // ReactFlow 11 uses `parentNode`; v12+ uses `parentId`. Read both.
  _getParentId: (n: Node): string | undefined => (n as any).parentId || (n as any).parentNode,

  copyNodes: () => {
    const { nodes, edges, selectedNodes, _getParentId } = get();
    const selected = nodes.filter((n: Node) => selectedNodes.includes(n.id));
    // Also include children of any selected groups
    const selectedGroupIds = new Set(selected.filter((n: Node) => n.type === 'group').map((n: Node) => n.id));
    const children = selectedGroupIds.size > 0
      ? nodes.filter((n: Node) => { const pid = _getParentId(n); return pid && selectedGroupIds.has(pid) && !selectedNodes.includes(n.id); })
      : [];
    const copied = [...selected, ...children];
    if (copied.length === 0) return;
    const copiedIds = new Set(copied.map((n: Node) => n.id));
    const copiedEdges = edges.filter((e: Edge) => copiedIds.has(e.source) && copiedIds.has(e.target));
    set({ clipboard: copied, clipboardEdges: copiedEdges });
  },

  cutNodes: () => {
    const { nodes, edges, selectedNodes, _past, _getParentId } = get();
    const selected = nodes.filter((n: Node) => selectedNodes.includes(n.id));
    const selectedGroupIds = new Set(selected.filter((n: Node) => n.type === 'group').map((n: Node) => n.id));
    const children = selectedGroupIds.size > 0
      ? nodes.filter((n: Node) => { const pid = _getParentId(n); return pid && selectedGroupIds.has(pid) && !selectedNodes.includes(n.id); })
      : [];
    const cut = [...selected, ...children];
    if (cut.length === 0) return;
    const cutIds = new Set(cut.map((n: Node) => n.id));
    const cutEdges = edges.filter((e: Edge) => cutIds.has(e.source) && cutIds.has(e.target));
    set({
      clipboard: cut,
      clipboardEdges: cutEdges,
      nodes: nodes.filter((n: Node) => !cutIds.has(n.id)),
      edges: edges.filter((e: Edge) => !cutIds.has(e.source) && !cutIds.has(e.target)),
      selectedNodes: [],
      _past: [..._past.slice(-49), { nodes, edges }],
      _future: [],
    });
  },

  copyNodeById: (id: string) => {
    const { nodes, edges, _getParentId } = get();
    const node = nodes.find((n: Node) => n.id === id);
    if (!node) return;
    const children = node.type === 'group'
      ? nodes.filter((n: Node) => _getParentId(n) === id)
      : [];
    const copied = [node, ...children];
    const copiedIds = new Set(copied.map((n: Node) => n.id));
    const copiedEdges = edges.filter((e: Edge) => copiedIds.has(e.source) && copiedIds.has(e.target));
    set({ clipboard: copied, clipboardEdges: copiedEdges });
  },

  cutNodeById: (id: string) => {
    const { nodes, edges, _past, _getParentId } = get();
    const node = nodes.find((n: Node) => n.id === id);
    if (!node) return;
    const children = node.type === 'group'
      ? nodes.filter((n: Node) => _getParentId(n) === id)
      : [];
    const cut = [node, ...children];
    const cutIds = new Set(cut.map((n: Node) => n.id));
    const cutEdges = edges.filter((e: Edge) => cutIds.has(e.source) && cutIds.has(e.target));
    set({
      clipboard: cut,
      clipboardEdges: cutEdges,
      nodes: nodes.filter((n: Node) => !cutIds.has(n.id)),
      edges: edges.filter((e: Edge) => !cutIds.has(e.source) && !cutIds.has(e.target)),
      selectedNodes: [],
      _past: [..._past.slice(-49), { nodes, edges }],
      _future: [],
    });
  },

  pasteNodes: (center?: { x: number; y: number }) => {
    const { clipboard, clipboardEdges, nodes, edges, _past, _getParentId } = get();
    if (clipboard.length === 0) return;
    const idMap = new Map<string, string>();
    // First pass: generate all new IDs
    clipboard.forEach((n: Node) => {
      idMap.set(n.id, `${n.id}-copy-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`);
    });
    const clipboardIds = new Set(clipboard.map((n: Node) => n.id));
    // Compute offset to move cluster center to target position
    const topLevel = clipboard.filter((n: Node) => { const pid = _getParentId(n); return !pid || !clipboardIds.has(pid); });
    let dx = 24, dy = 24;
    if (center && topLevel.length > 0) {
      const cx = topLevel.reduce((s: number, n: Node) => s + n.position.x, 0) / topLevel.length;
      const cy = topLevel.reduce((s: number, n: Node) => s + n.position.y, 0) / topLevel.length;
      dx = center.x - cx;
      dy = center.y - cy;
    }
    // Second pass: build pasted nodes with remapped parent references
    const pasted = clipboard.map((n: Node) => {
      const newId = idMap.get(n.id)!;
      const oldPid = _getParentId(n);
      const newParent = oldPid && clipboardIds.has(oldPid) ? idMap.get(oldPid) : undefined;
      const isChild = oldPid && clipboardIds.has(oldPid);
      // Preserve original dimensions; only clear measured so React Flow re-measures
      const sizeOverride = { measured: undefined };
      return {
        ...n,
        ...sizeOverride,
        id: newId,
        selected: true,
        parentId: newParent,
        position: isChild ? n.position : { x: n.position.x + dx, y: n.position.y + dy },
      };
    });
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const pastedEdges = clipboardEdges.map((e: Edge) => ({
      ...e,
      id: `${e.id}-copy-${suffix}`,
      source: idMap.get(e.source) || e.source,
      target: idMap.get(e.target) || e.target,
    }));
    set({
      nodes: [...nodes.map((n: Node) => ({ ...n, selected: false })), ...pasted],
      edges: [...edges, ...pastedEdges],
      selectedNodes: pasted.map((n: Node) => n.id),
      _past: [..._past.slice(-49), { nodes, edges }],
      _future: [],
    });
  },

  snapshot: () => {
    const { nodes, edges, _past } = get();
    set({ _past: [..._past.slice(-49), { nodes, edges }], _future: [] });
  },

  undo: () => {
    const { _past, _future, nodes, edges } = get();
    if (_past.length === 0) return;
    const prev = _past[_past.length - 1];
    set({
      nodes: prev.nodes,
      edges: prev.edges,
      _past: _past.slice(0, -1),
      _future: [{ nodes, edges }, ..._future.slice(0, 49)],
    });
  },

  redo: () => {
    const { _past, _future, nodes, edges } = get();
    if (_future.length === 0) return;
    const next = _future[0];
    set({
      nodes: next.nodes,
      edges: next.edges,
      _past: [..._past.slice(-49), { nodes, edges }],
      _future: _future.slice(1),
    });
  },

  onNodesChange: (changes: NodeChange[]) => {
    const posChanges = changes.filter(c => c.type === 'position') as Array<{ type: 'position'; dragging?: boolean }>;
    const isDragging = posChanges.some(c => c.dragging === true);
    const isDragEnd = posChanges.some(c => c.dragging === false) && _dragging;

    // Snapshot on remove
    if (changes.some(c => c.type === 'remove')) {
      const { nodes, edges, _past } = get();
      set({ _past: [..._past.slice(-49), { nodes, edges }], _future: [] });
    }

    // Save pre-drag state on drag start
    if (isDragging && !_dragging) {
      const { nodes, edges } = get();
      _preDragSnapshot = { nodes, edges };
      _dragging = true;
    }

    const newNodes = applyNodeChanges(changes, get().nodes);

    // On drag end, only commit to history if position actually changed
    if (isDragEnd) {
      _dragging = false;
      if (_preDragSnapshot) {
        const snap = _preDragSnapshot;
        _preDragSnapshot = null;
        const moved = newNodes.some(n => {
          const old = snap.nodes.find(o => o.id === n.id);
          return old && (Math.abs(old.position.x - n.position.x) > 0.5 || Math.abs(old.position.y - n.position.y) > 0.5);
        });
        if (moved) {
          const { edges, _past } = get();
          set({ nodes: newNodes, _past: [..._past.slice(-49), snap], _future: [] });
          return;
        }
      }
    }

    set({ nodes: newNodes });
  },

  onEdgesChange: (changes: EdgeChange<Edge>[]) => {
    if (changes.some(c => c.type === 'remove')) {
      const { nodes, edges, _past } = get();
      set({ _past: [..._past.slice(-49), { nodes, edges }], _future: [] });
    }
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },

  onConnect: (connection: Connection) => {
    const { nodes, edges, _past } = get();
    const sourceNode = nodes.find((n: Node) => n.id === connection.source);
    const accentHex = ACCENT_HEX[(sourceNode?.data?.color as string) ?? ''] ?? '#c8f135';
    set({
      _past: [..._past.slice(-49), { nodes, edges }],
      _future: [],
      edges: addEdge({
        ...connection,
        style: { stroke: accentHex, strokeWidth: 2.5 },
      } as Edge, edges),
    });
  },

  addNode: (node: WhiteboardNode) => {
    const { nodes, edges, _past } = get();
    const position = node.position || findPlacement(nodes, node.data);

    const palette = node.type === 'note' ? NOTE_COLORS : BOOKMARK_COLORS;
    const color = (node.data.color as string) || palette[Math.floor(Math.random() * palette.length)];

    const newNode: Node = {
      id: node.id,
      type: node.type,
      position,
      selected: node.selected,
      data: { ...node.data, color },
      style: { width: node.width, height: node.height },
    };

    let finalNodes: Node[];
    if (node.type === 'group') {
      // Insert after the last existing group so new group renders on top of older groups,
      // but still before non-group nodes (React Flow requires parents before children).
      const insertAt = nodes.reduce((last: number, n: Node, i: number) => n.type === 'group' ? i + 1 : last, 0);
      finalNodes = [...nodes.slice(0, insertAt), newNode, ...nodes.slice(insertAt)];
    } else {
      finalNodes = [...nodes, newNode];
    }
    set({
      nodes: finalNodes,
      _past: [..._past.slice(-49), { nodes, edges }],
      _future: [],
    });
  },

  addNodeToRoom: (roomId: string, node: WhiteboardNode) => {
    const { currentRoomId } = get();
    if (!roomId || roomId === currentRoomId) {
      get().addNode(node);
      return;
    }
    const { rooms, nodes: currentNodes, edges: currentEdges, groups: currentGroups } = get();
    const targetRoom = rooms.find((r: RoomData) => r.id === roomId);
    if (!targetRoom) { get().addNode(node); return; }

    const palette = node.type === 'note' ? NOTE_COLORS : BOOKMARK_COLORS;
    const color = (node.data.color as string) || palette[Math.floor(Math.random() * palette.length)];
    const position = node.position || findPlacement(targetRoom.nodes, node.data);
    const newNode: Node = {
      id: node.id,
      type: node.type,
      position,
      data: { ...node.data, color },
      style: { width: node.width, height: node.height },
    };
    set({
      rooms: rooms.map((r: RoomData) => {
        if (r.id === roomId) return { ...r, nodes: [...r.nodes, newNode] };
        // Keep the current room's entry in sync with live state so switchRoom reads fresh data
        if (r.id === currentRoomId) return { ...r, nodes: currentNodes, edges: currentEdges, groups: currentGroups };
        return r;
      }),
    });
  },

  deleteNode: (id: string) => {
    const { nodes, edges, _past } = get();
    set({
      nodes: nodes.filter((node: Node) => node.id !== id),
      edges: edges.filter((edge: Edge) => edge.source !== id && edge.target !== id),
      _past: [..._past.slice(-49), { nodes, edges }],
      _future: [],
    });
  },

  updateNode: (id: string, data: Partial<WhiteboardNode['data']>) => {
    set({
      nodes: get().nodes.map((node: Node) => {
        if (node.id === id) {
          return {
            ...node,
            data: { ...node.data, ...data },
          };
        }
        return node;
      }),
    });
  },


  updateGroupSize: (id: string, x: number, y: number, width: number, height: number) => {
    set({
      nodes: get().nodes.map((node: Node) =>
        node.id === id
          ? { ...node, position: { x, y }, style: { ...node.style, width, height } }
          : node
      ),
    });
  },

  createGroup: (group: GroupFrame) => {
    set({
      groups: [...get().groups, group],
    });
  },

  deleteGroup: (id: string) => {
    set({
      groups: get().groups.filter((group: GroupFrame) => group.id !== id),
    });
  },

  removeGroup: (id: string) => {
    const { nodes, edges, _past, _getParentId } = get();
    const groupNode = nodes.find((n: Node) => n.id === id);
    if (!groupNode) return;
    set({
      _past: [..._past.slice(-49), { nodes, edges }],
      _future: [],
      nodes: nodes
        .filter((n: Node) => n.id !== id)
        .map((n: Node) => {
          if (_getParentId(n) !== id) return n;
          return {
            ...n,
            parentId: undefined,
            extent: undefined,
            position: {
              x: groupNode.position.x + n.position.x,
              y: groupNode.position.y + n.position.y,
            },
          };
        }),
    });
  },

  addTag: (tag: Tag) => {
    set({
      tags: [...get().tags, tag],
    });
  },

  removeTag: (id: string) => {
    set({
      tags: get().tags.filter((tag: Tag) => tag.id !== id),
    });
  },

  setSelectedNodes: (ids: string[]) => {
    set({
      selectedNodes: ids,
    });
  },

  setPreviewNodeId: (id: string | null) => {
    set({ previewNodeId: id });
  },

  setEditingNodeId: (id: string | null) => {
    set({ editingNodeId: id });
  },

  setContextMenuNodeId: (id: string | null) => {
    set({ contextMenuNodeId: id });
  },

  setPaneContextMenu: (menu: { x: number; y: number; canvasPos: { x: number; y: number } } | null) => {
    set({ paneContextMenu: menu });
  },

  setNodes: (nodes: Node<WhiteboardNode['data']>[]) => {
    set({ nodes });
  },

  switchRoom: (id: RoomType) => {
    const { rooms, currentRoomId, nodes, edges, groups } = get();
    if (id === currentRoomId) return;
    const updatedRooms = rooms.map((r: RoomData) =>
      r.id === currentRoomId ? { ...r, nodes, edges, groups } : r
    );
    const newRoom = updatedRooms.find((r: RoomData) => r.id === id);
    if (!newRoom) return;
    set({
      rooms: updatedRooms,
      currentRoomId: id,
      nodes: newRoom.nodes,
      edges: newRoom.edges,
      groups: newRoom.groups,
      _past: [],
      _future: [],
    });
  },

  addRoom: (name: string, emoji: string) => {
    const { rooms } = get();
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'workspace';
    const id = `${slug}-${Date.now()}`;
    set({ rooms: [...rooms, { id, name, emoji, nodes: [], edges: [], groups: [] }] });
  },

  deleteRoom: (id: string) => {
    const { rooms, currentRoomId } = get();
    if (rooms.length <= 1) return;
    if (id === currentRoomId) {
      const next = rooms.find((r: RoomData) => r.id !== id)!;
      get().switchRoom(next.id);
    }
    set({ rooms: get().rooms.filter((r: RoomData) => r.id !== id) });
  },

  updateRoomEmoji: (id: string, emoji: string) => {
    set({ rooms: get().rooms.map((r: RoomData) => r.id === id ? { ...r, emoji } : r) });
  },
  updateRoomName: (id: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    set({ rooms: get().rooms.map((r: RoomData) => r.id === id ? { ...r, name: trimmed } : r) });
  },
  reorderRooms: (rooms: RoomData[]) => {
    set({ rooms });
  },

  switchDossier: (id: string) => {
    const { dossiers, currentDossierId, rooms, tags, currentRoomId, nodes, edges, groups } = get();
    if (id === currentDossierId) return;
    const flushedRooms = rooms.map((r: RoomData) =>
      r.id === currentRoomId ? { ...r, nodes, edges, groups } : r
    );
    const updatedDossiers = dossiers.map((d: Dossier) =>
      d.id === currentDossierId
        ? { ...d, rooms: flushedRooms, tags, currentRoomId }
        : d
    );
    const target = updatedDossiers.find((d: Dossier) => d.id === id);
    if (!target) return;
    const targetRoomId = target.currentRoomId || target.rooms[0]?.id;
    const targetRoom = target.rooms.find((r: RoomData) => r.id === targetRoomId) ?? target.rooms[0];
    if (!targetRoom) return;
    set({
      dossiers: updatedDossiers,
      currentDossierId: id,
      rooms: target.rooms,
      tags: target.tags,
      currentRoomId: targetRoom.id,
      nodes: targetRoom.nodes,
      edges: targetRoom.edges,
      groups: targetRoom.groups,
      _past: [],
      _future: [],
      activeTagFilters: [],
    });
  },

  addDossier: (name: string, emoji: string) => {
    const { dossiers } = get();
    const uniqueName = uniqueDossierName(name, dossiers);
    const slug = uniqueName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'dossier';
    const id = `${slug}-${Date.now()}`;
    const firstRoom: RoomData = { id: `room-${Date.now()}`, name: 'Main', emoji: '📌', nodes: [], edges: [], groups: [] };
    const newDossier: Dossier = { id, name: uniqueName, emoji, rooms: [firstRoom], tags: [], currentRoomId: firstRoom.id };
    set({ dossiers: [...dossiers, newDossier] });
  },

  duplicateDossier: (id: string) => {
    const { dossiers, currentDossierId, nodes, edges, groups, tags, currentRoomId } = get();
    // Flush live state into active dossier before reading source
    const flushed = dossiers.map((d: Dossier) =>
      d.id === currentDossierId
        ? { ...d, rooms: d.rooms.map((r: RoomData) => r.id === currentRoomId ? { ...r, nodes, edges, groups } : r), tags, currentRoomId }
        : d
    );
    const source = flushed.find((d: Dossier) => d.id === id);
    if (!source) return;
    const uniqueName = uniqueDossierName(`${source.name} copy`, flushed);
    const slug = uniqueName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'dossier';
    const newId = `${slug}-${Date.now()}`;
    const ts = Date.now();
    const roomIdMap = new Map(source.rooms.map((r: RoomData, i: number) => [r.id, `room-${ts}-${i}`]));
    const newRooms = source.rooms.map((r: RoomData) => ({ ...r, id: roomIdMap.get(r.id)! }));
    const duplicate: Dossier = {
      ...source,
      id: newId,
      name: uniqueName,
      rooms: newRooms,
      currentRoomId: roomIdMap.get(source.currentRoomId) ?? newRooms[0]?.id,
    };
    set({ dossiers: [...flushed, duplicate] });
  },

  deleteDossier: (id: string) => {
    const { dossiers, currentDossierId } = get();
    if (dossiers.length <= 1) return;
    if (id === currentDossierId) {
      const next = dossiers.find((d: Dossier) => d.id !== id)!;
      get().switchDossier(next.id);
    }
    set({ dossiers: get().dossiers.filter((d: Dossier) => d.id !== id) });
  },

  updateDossierName: (id: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    set({ dossiers: get().dossiers.map((d: Dossier) => d.id === id ? { ...d, name: trimmed } : d) });
  },

  updateDossierEmoji: (id: string, emoji: string) => {
    set({ dossiers: get().dossiers.map((d: Dossier) => d.id === id ? { ...d, emoji } : d) });
  },

  exportDossier: (name: string) => {
    const { dossiers, currentDossierId, rooms, tags, currentRoomId, nodes, edges, groups } = get();
    const flushedRooms = rooms.map((r: RoomData) =>
      r.id === currentRoomId ? { ...r, nodes, edges, groups } : r
    );
    const currentDossier = dossiers.find((d: Dossier) => d.id === currentDossierId);
    if (!currentDossier) return;
    const exportData = {
      version: 1,
      type: 'boardback-dossier',
      dossier: { ...currentDossier, name, rooms: flushedRooms, tags, currentRoomId },
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name.replace(/\s+/g, '-').toLowerCase()}.boardback`;
    a.click();
    URL.revokeObjectURL(url);
  },

  parseDossierFile: async (file: File): Promise<Dossier | null> => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (
        parsed?.version !== 1 ||
        parsed?.type !== 'boardback-dossier' ||
        typeof parsed?.dossier !== 'object' ||
        !Array.isArray(parsed.dossier.rooms)
      ) {
        console.error('[boardback] Invalid .boardback file');
        return null;
      }
      return parsed.dossier as Dossier;
    } catch (err) {
      console.error('[boardback] Import parse failed:', err);
      return null;
    }
  },

  commitImportDossier: (dossier: Dossier, name: string) => {
    const { dossiers } = get();
    const newId = `imported-${Date.now()}`;
    const importedDossier: Dossier = { ...dossier, id: newId, name: uniqueDossierName(name, dossiers) };
    set({ dossiers: [...dossiers, importedDossier] });
    get().switchDossier(newId);
  },

  autoArrange: () => {
    const allNodes = get().nodes;

    const NODE_W = 180, NODE_H = 120;
    const GROUP_PAD = 48, NODE_GAP = 24;
    const CLUSTER_GAP = 80;
    // Group label floats above the frame (top: -65px), so no title bar inside
    const GROUP_TITLE_H = 80;

    // Actual node dimensions — measured (post-render) is most accurate, fall back to explicit/style
    const nodeW = (n: Node): number =>
      (n as any).measured?.width ?? (n.width as number) ?? (n.style?.width as number) ?? NODE_W;
    const nodeH = (n: Node): number =>
      (n as any).measured?.height ?? (n.height as number) ?? (n.style?.height as number) ?? NODE_H;

    /**
     * Row-packing layout: places nodes left-to-right, wrapping to a new row
     * whenever the next node would exceed maxRowW. Each node uses its actual
     * dimensions, so nodes of varying sizes never overlap.
     *
     * padX/padY = initial offset (use GROUP_PAD for group children).
     * Returns per-node positions and the total bounding-box size of the content.
     */
    const packRows = (
      nodes: Node[],
      gap: number,
      maxRowW: number,
      padX = 0,
      padY = 0,
    ): { positions: Map<string, { x: number; y: number }>; totalW: number; totalH: number } => {
      const positions = new Map<string, { x: number; y: number }>();
      let x = padX, y = padY, rowH = 0, maxX = padX;

      nodes.forEach(n => {
        const w = nodeW(n), h = nodeH(n);
        // Wrap if placing this node would exceed the row limit (but always place at least one)
        if (x > padX && x + w > padX + maxRowW) {
          x = padX;
          y += rowH + gap;
          rowH = 0;
        }
        positions.set(n.id, { x, y });
        x += w + gap;
        rowH = Math.max(rowH, h);
        maxX = Math.max(maxX, x - gap); // trailing gap excluded
      });

      return {
        positions,
        totalW: maxX - padX,
        totalH: y + rowH - padY,
      };
    };

    // Compute a sensible max-row-width for a set of nodes targeting ~sqrt(N) columns
    const targetRowW = (nodes: Node[]): number => {
      const cols = Math.ceil(Math.sqrt(nodes.length));
      const avg = nodes.reduce((s, n) => s + nodeW(n), 0) / nodes.length;
      return cols * avg + (cols - 1) * NODE_GAP;
    };

    // Existing groups and their children — kept completely untouched
    const getPid = (n: Node): string | undefined => (n as any).parentId || (n as any).parentNode;
    const existingGroupIds = new Set(
      allNodes.filter((n: Node) => n.type === 'group').map((n: Node) => n.id)
    );
    const existingGroups = allNodes.filter((n: Node) => n.type === 'group');
    const childNodes = allNodes.filter((n: Node) => { const pid = getPid(n); return pid && existingGroupIds.has(pid); });

    // Top-level (ungrouped) nodes only
    const allEdges = get().edges;
    const connectedNodeIds = new Set<string>();
    allEdges.forEach((e: Edge) => { connectedNodeIds.add(e.source); connectedNodeIds.add(e.target); });

    const topBookmarks = allNodes.filter(
      (n: Node) => (n.type === 'bookmark' || n.type === 'tab') && !getPid(n)
    );
    const topNotes = allNodes.filter((n: Node) => n.type === 'note' && !getPid(n));

    // Group ungrouped bookmarks by domain — skip nodes that have edges (they keep their position)
    const domainMap = new Map<string, Node[]>();
    topBookmarks.forEach((n: Node<WhiteboardNode['data']>) => {
      if (connectedNodeIds.has(n.id)) return;
      const domain = extractDomain(n.data.url);
      if (domain) {
        if (!domainMap.has(domain)) domainMap.set(domain, []);
        domainMap.get(domain)!.push(n);
      }
    });

    const toBeGrouped = new Set<string>();
    const newGroups: Node[] = [];
    const newGroupChildren: Node[] = [];

    domainMap.forEach((domNodes, domain) => {
      const groupId = `group-${domain}`;
      if (existingGroupIds.has(groupId)) return;
      if (domNodes.length < 2) return;

      // Pack children inside the group with padding; title bar sits at top
      const { positions, totalW, totalH } = packRows(
        domNodes, NODE_GAP, targetRowW(domNodes),
        GROUP_PAD, GROUP_PAD,
      );
      const gw = Math.max(totalW + GROUP_PAD * 2, 400);
      const gh = Math.max(totalH + GROUP_PAD * 2 + GROUP_TITLE_H, 400);

      newGroups.push({
        id: groupId,
        type: 'group',
        position: { x: 0, y: 0 },
        style: { width: gw, height: gh },
        data: { title: domain.toUpperCase(), count: domNodes.length },
      });

      domNodes.forEach(n => {
        toBeGrouped.add(n.id);
        newGroupChildren.push({
          ...n,
          parentId: groupId,
          extent: undefined,
          position: positions.get(n.id)!,
        });
      });
    });

    const remainingNodes = [
      ...topBookmarks.filter((n: Node) => !toBeGrouped.has(n.id)),
      ...topNotes,
    ];

    // Cluster remaining nodes by edge connectivity (union-find)
    const remainingIds = new Set(remainingNodes.map(n => n.id));
    const parent = new Map<string, string>();
    const find = (id: string): string => {
      if (!parent.has(id)) parent.set(id, id);
      const p = parent.get(id)!;
      if (p !== id) parent.set(id, find(p));
      return parent.get(id)!;
    };
    const union = (a: string, b: string) => parent.set(find(a), find(b));

    remainingNodes.forEach((n: Node) => parent.set(n.id, n.id));
    allEdges.forEach((e: Edge) => {
      if (remainingIds.has(e.source) && remainingIds.has(e.target)) {
        union(e.source, e.target);
      }
    });

    const compMap = new Map<string, Node[]>();
    remainingNodes.forEach((n: Node) => {
      const root = find(n.id);
      if (!compMap.has(root)) compMap.set(root, []);
      compMap.get(root)!.push(n);
    });

    // Build layout blocks: all groups (existing + new) + connected components of ungrouped nodes
    interface Block {
      repId: string; nodes: Node[]; w: number; h: number;
      isGroup: boolean; packed?: Map<string, { x: number; y: number }>;
    }
    const blocks: Block[] = [
      // Existing groups — repositioned but size/children untouched
      ...existingGroups.map((g: Node) => ({
        repId: g.id, nodes: [g],
        w: (g.style?.width as number) ?? (g.width as number) ?? 550,
        h: (g.style?.height as number) ?? (g.height as number) ?? 450,
        isGroup: true,
      })),
      ...newGroups.map((g: Node) => ({
        repId: g.id, nodes: [g],
        w: (g.style?.width as number) ?? 800,
        h: (g.style?.height as number) ?? 600,
        isGroup: true,
      })),
    ];

    compMap.forEach((compNodes, root) => {
      if (compNodes.length === 1) {
        // Standalone node — place individually
        const { positions, totalW, totalH } = packRows(compNodes, NODE_GAP, targetRowW(compNodes));
        blocks.push({ repId: root, nodes: compNodes, w: totalW, h: totalH, isGroup: false, packed: positions });
      } else {
        // Connected group — preserve internal relative positions, move as one unit
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        compNodes.forEach(n => {
          const x = n.position.x, y = n.position.y;
          minX = Math.min(minX, x); minY = Math.min(minY, y);
          maxX = Math.max(maxX, x + nodeW(n)); maxY = Math.max(maxY, y + nodeH(n));
        });
        const relPositions = new Map<string, { x: number; y: number }>();
        compNodes.forEach(n => relPositions.set(n.id, { x: n.position.x - minX, y: n.position.y - minY }));
        blocks.push({ repId: root, nodes: compNodes, w: maxX - minX, h: maxY - minY, isGroup: false, packed: relPositions });
      }
    });

    // Sort: groups first, then larger clusters
    blocks.sort((a, b) => {
      if (a.isGroup && !b.isGroup) return -1;
      if (!a.isGroup && b.isGroup) return 1;
      return (b.w * b.h) - (a.w * a.h);
    });

    // Row-based block layout
    const totalArea = blocks.reduce((s: number, b) => s + (b.w + CLUSTER_GAP) * (b.h + CLUSTER_GAP), 0);
    const MAX_ROW_W = Math.max(1400, Math.sqrt(totalArea) * 1.5);
    const blockPositions = new Map<string, { x: number; y: number }>();
    let cx = 0, cy = 0, rowH = 0;

    blocks.forEach(block => {
      if (cx > 0 && cx + block.w > MAX_ROW_W) {
        cx = 0; cy += rowH + CLUSTER_GAP; rowH = 0;
      }
      blockPositions.set(block.repId, { x: cx, y: cy });
      cx += block.w + CLUSTER_GAP;
      rowH = Math.max(rowH, block.h);
    });

    // Resolve final per-node positions
    const nodePositions = new Map<string, { x: number; y: number }>();
    blocks.forEach(block => {
      const bp = blockPositions.get(block.repId)!;
      if (block.isGroup || block.nodes.length === 1) {
        nodePositions.set(block.nodes[0].id, bp);
      } else {
        block.packed!.forEach((pos, id) => {
          nodePositions.set(id, { x: bp.x + pos.x, y: bp.y + pos.y });
        });
      }
    });

    const finalNodes: Node[] = [
      ...existingGroups.map((g: Node) => ({ ...g, position: nodePositions.get(g.id) ?? g.position })),
      ...childNodes,       // children untouched (relative positions preserved)
      ...newGroups.map((g: Node) => ({ ...g, position: nodePositions.get(g.id) ?? { x: 0, y: 0 } })),
      ...newGroupChildren,
      ...remainingNodes.map((n: Node) => ({ ...n, position: nodePositions.get(n.id) ?? n.position })),
    ];

    const { nodes: curNodes, edges: curEdges, _past } = get();
    set({
      nodes: finalNodes,
      _past: [..._past.slice(-49), { nodes: curNodes, edges: curEdges }],
      _future: [],
    });
  },
}),
{
  name: 'boardback-storage',
  storage: typeof window !== 'undefined'
    ? createJSONStorage(() => dexieStorage)
    : createJSONStorage(() => dummyStorage),
  partialize: (state) => ({
    rooms: state.rooms,
    currentRoomId: state.currentRoomId,
    nodes: state.nodes,
    edges: state.edges,
    groups: state.groups,
    tags: state.tags,
    hasSeenIntro: state.hasSeenIntro,
    autoOpenBookmarks: state.autoOpenBookmarks,
    dossiers: state.dossiers,
    currentDossierId: state.currentDossierId,
  }),
  onRehydrateStorage: () => async (state: any) => {
    // Unblock Dexie writes — getItem has resolved so it's safe to persist now.
    dexieStorage.markHydrated();
    // One-time migration: copy localStorage data into Dexie then remove it
    if (typeof window !== 'undefined' && !state) {
      const LS_KEY = 'boardback-storage';
      const raw = window.localStorage.getItem(LS_KEY);
      if (raw) {
        try {
          await dexieStorage.setItem(LS_KEY, raw);
          window.localStorage.removeItem(LS_KEY);
        } catch (err) {
          console.warn('[boardback] localStorage→Dexie migration failed:', err);
        }
      }
      return;
    }
    if (!state.rooms || state.rooms.length === 0) {
      // Migrate from old format: move existing nodes/edges/groups into first room
      state.rooms = DEFAULT_ROOMS.map((r: RoomData) =>
        r.id === 'personal'
          ? { ...r, nodes: state.nodes || [], edges: state.edges || [], groups: state.groups || [] }
          : r
      );
      state.currentRoomId = 'personal';
    } else {
      // Top-level nodes/edges/groups are always the most up-to-date (persisted on every change).
      // Sync them back into the current room so rooms array stays consistent.
      const roomId = state.currentRoomId || 'personal';
      state.rooms = state.rooms.map((r: RoomData) =>
        r.id === roomId
          ? { ...r, nodes: state.nodes || [], edges: state.edges || [], groups: state.groups || [] }
          : r
      );
    }
    // Dossier migration: wrap existing rooms/tags into Default dossier on first load
    if (!state.dossiers || state.dossiers.length === 0) {
      state.dossiers = [{
        id: 'default',
        name: 'Default',
        emoji: '📁',
        rooms: state.rooms,
        tags: state.tags || [],
        currentRoomId: state.currentRoomId || 'personal',
      }];
      state.currentDossierId = 'default';
    } else {
      // Sync live rooms/tags back into the active dossier
      const dossierId = state.currentDossierId || 'default';
      state.dossiers = state.dossiers.map((d: Dossier) =>
        d.id === dossierId
          ? { ...d, rooms: state.rooms, tags: state.tags, currentRoomId: state.currentRoomId }
          : d
      );
    }
  },
}
)
);

const dummyStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};