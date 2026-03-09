'use client';

import React from 'react';
import { StickyNote, Plus, Tag, Group, Wand2, Undo2, Redo2, X, Menu, MoreHorizontal, Check, Settings, ExternalLink, LayersPlus } from 'lucide-react';
import { useReactFlow } from '@xyflow/react';
import { useStore, RoomData } from '@/store/useStore';
import { v4 as uuidv4 } from 'uuid';

// ── Emoji helpers ─────────────────────────────────────────────────────────────
const EMOJI_GROUPS = [
  {
    title: "People",
    emojis: [
      '😁','🥴','😋','🥹','😎','🥳','🤗','🤢','🥶','😷',
      '🧐','🤠','🤑','😈','🥰','🥸','🫠','🤭','🙂','😀',
      '😄','😆','😅','😂','🤣','😊','😇','😍','🤩','😘',
      '😗','😚','😙','😌','😏','😴','🤤','😪','😵','🤯',
      '🥺','😡','😱','😭','😬','😮','🤓','🥱','😤','🤥',
      '👩','🧑','👶','👼','👨','🧔','👵','👴','🧒','👧',
      '👍','👎','🫰','👏','🙌','🤝','🙏','✌️','👌','👀',
      '🫶','🤞','🖐️','✋','🫡','🤟','🤘','✊','🦾','🦶',
      '🥷','🦹','🧛','🧙','🧟','🫅','🧝','🧞'
    ]
  },
  {
    title: "Places",
    emojis: [
      '🛋️','🍳','🛏️','🚿','🏠','🏡','🏢','🏗️',
      '🏰','🏯','🏛️','🕌','🏕️','🛖','🏘️','🌃',
      '🌆','🌇','🏙️','🏚️','🏬','🏪','🏭','💒',
      '🗼','🗽','🗿','🏟️','🏛','🏞️','🏖️','🏜️'
    ]
  },
  {
    title: "Productivity",
    emojis: [
      '💼','📝','📌','📎','🔧','⚙️','💡','🔑',
      '📚','📊','📈','📋','🗂️','📦','📬','🗒️',
      '✏️','📐','📏','✂️','🔒','📍','🖊️','📓',
      '🧠','🛠️','🎒','📁','📂','🗃️','🗄️','📅',
      '⏰','⌛','🕒','🕓','🕔','🗓️','📑','📕',
      '📗','📘','📙', '👔',
    ]
  },
  {
    title: "Entertainment",
    emojis: [
      '🎨','🎬','🎵','🎸','🎹','🎷','🎺','🥁',
      '🎭','🎪','📸','🎤','🎧','📻','🎞️','🎉',
      '🎻','🪕','🪘','📽️','🎟️','🎫','🎰','🎳',
      '🪩','🎯', '📺',
    ]
  },
  {
    title: "Shopping",
    emojis: [
      '💄','💋','💅','🧧','💰','💳','🛒','🛍️',
      '👗','👠','👒','🧴','🧼','🪞','💍','⌚',
      '🧢','👟','🧥','🧦','👛','👜','🎒'
    ]
  },  
  {
    title: "Travel",
    emojis: [
      '✈️','🚂','🚢','🚗','🏎️','🚲','🛴','🚁',
      '🚤','🛶','🚕','🚓','🚑','🚒','🚜','🚚',
      '🚍','🚉','🚄','🚅','🛫','🛬'
    ]
  },
  {
    title: "Technology",
    emojis: [
      '💻', '📱', '🖥️', '📷', '🔭', '🤖', '👾',
      '🛸', '🚀', '🔌', '🔋', '💾', '🖨️', '⌨️',
      '🖱️', '📡', '🧭', '🛰️', '📀', '💿', '📼',
      '🧬', '🧫', '🔬', '🧪', '💉', '🩸'
    ]
  },
  {
    title: "Animals",
    emojis: [
      '🐷','🦊','🐱','🐶','🦁','🦋','🐙','🦄',
      '🐸','🦜','🦉','🐺','🐼','🦘','🐉','🦅',
      '🐝','🦩','🐬','🦈','🐘','🦒','🦓','🦔',
      '🐢','🐍','🦎','🦖','🦕','🐓','🐇','🐿️',
      '🐕','🐈','🦔','🦦','🦥','🦬'
    ]
  },
  {
    title: "Nature",
    emojis: [
      '🌿','🌸','🌊','⭐','🌙','☀️','🌈','🌲',
        '🌳','🌴','🌺','🌻','🪷','🌹','🍀','🌱',
        '🌾','❄️','🌧️','⛈️','🌤️','🌬️','🏔️','🌋',
        '🏝️','🪾','🪴','🪨','🌵','🌼','🌞','🌛'
    ]
  },
  {
    title: "Food & Drink",
    emojis: [
      '☕','🍵','🍕','🍔','🌮','🍣','🍜','🍩',
      '🎂','🍺','🥂','🍷','🍎','🥗','🧁','🥤',
      '🍿','🍪','🍫','🍬','🍭','🥐','🥞','🍞',
      '🧀','🍗','🍖','🍤','🍱','🍛','🍚','🍙',
      '🍉','🍓','🍌','🍇','🍑','🍍'
    ]
  },
  {
    title: "Activities",
    emojis: [
      '🎯','⛳️','🏆','🥇','🎮','🕹️','🎲','🧩','♟️',
      '🏀','⚽','🏈','🎾','🏋️','🚴','🧘','🤸',
      '🥊','🥋','🏊','🏄','⛹️','🤾','🎳','🏓',
      '🏸','🥏','🎣'
    ]
  },
  {
    title: "Spaces",
    emojis: [
      '🌌','🌠','🪐','🌍','🌎','🌏','🌕','🌖',
      '🌗','🌘','🌑','🌒','🌓','🌔','☄️','🛰️',
      '🚀','🛸','⭐','✨','🌟','💫','🔭'
    ]
  },
  {
    title: "Miscellaneous",
    emojis: [
      '💎','👑','🔮','🏅','💯','🏹','🎗️','🌟','✨',
      '🎁','🎀','🧸','🪄','🎃','🎄','🎆','🔨',
      '🏁','⚡','🔥','💥','💤','✅','❌','⭕',
      '♥️','💝','💘','💖','💗','💓','💞'
    ]
  }
]

const FALLBACK_EMOJI: Record<string, string> = {
  'personal':     '😎',
  'office':       '💼',
  'social-media': '📱',
  'learning':     '🧠',
  'favorite':     '♥️',
};

const getRoomEmoji = (room: Pick<RoomData, 'id' | 'emoji'>): string =>
  room.emoji || FALLBACK_EMOJI[room.id] || '📌';

// ── Panel base style ──────────────────────────────────────────────────────────
const panelStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: 'calc(100% + 18px)',
  left: '50%',
  transform: 'translateX(-50%)',
  background: 'rgba(10, 11, 22, 0.94)',
  backdropFilter: 'blur(28px)',
  WebkitBackdropFilter: 'blur(28px)',
  border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: 20,
  padding: 14,
  boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
  zIndex: 200,
};

const emojiPickerStyle: React.CSSProperties = {
  ...panelStyle,
  padding: 10,
  borderRadius: 16,
  width: 288,
};

// ── Toolbar ───────────────────────────────────────────────────────────────────
const Toolbar = () => {
  // ── Emoji picker helper ───────────────────────────────────────────────────
  /**
   * Renders the categorized emoji picker content.
   * @param onSelect Callback when an emoji is clicked
   * @param currentEmoji (Optional) Currently selected emoji for highlighting
   * @param isInline (Optional) If true, renders without absolute positioning panel container
   */
  const renderEmojiPicker = (
    onSelect: (e: string) => void,
    currentEmoji?: string,
    isInline = false
  ) => {
    const content = (
      <div style={{ maxHeight: isInline ? 200 : 260, paddingRight: 4, overflowY: "auto", overflowX: 'hidden' }}>
        {EMOJI_GROUPS.map(group => (
          <div key={group.title} style={{ marginBottom: 10 }}>
            {/* Category title */}
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "rgba(255,255,255,0.35)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 5,
                paddingLeft: 2
              }}
            >
              {group.title}
            </div>

            {/* Emoji grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(8, 1fr)",
                gap: 2
              }}
            >
              {group.emojis.map(emoji => {
                const active = emoji === currentEmoji;
                return (
                  <button
                    key={emoji}
                    onClick={() => onSelect(emoji)}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 7,
                      background: active ? "rgba(200,241,53,0.12)" : "transparent",
                      border: active ? "1px solid rgba(200,241,53,0.3)" : "none",
                      fontSize: 18,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.1s"
                    }}
                    onMouseEnter={e => {
                      if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                    }}
                    onMouseLeave={e => {
                      if (!active) e.currentTarget.style.background = "transparent";
                    }}
                  >
                    {emoji}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );

    if (isInline) return <div style={{ marginTop: 8, marginBottom: 8 }}>{content}</div>;

    return (
      <div style={emojiPickerStyle} ref={emojiPickerRef as any}>
        {content}
      </div>
    );
  };

  const addNode = useStore((s) => s.addNode);
  const setEditingNodeId = useStore((s) => s.setEditingNodeId);
  const autoArrange = useStore((s) => s.autoArrange);
  const undo = useStore((s) => s.undo);
  const redo = useStore((s) => s.redo);
  const canUndo = useStore((s) => s._past.length > 0);
  const canRedo = useStore((s) => s._future.length > 0);
  const currentRoomId = useStore((s) => s.currentRoomId);
  const switchRoom = useStore((s) => s.switchRoom);
  const rooms = useStore((s) => s.rooms);
  const addRoom = useStore((s) => s.addRoom);
  const deleteRoom = useStore((s) => s.deleteRoom);
  const updateRoomEmoji = useStore((s) => s.updateRoomEmoji);
  const nodes = useStore((s) => s.nodes);
  const activeTagFilters = useStore((s) => s.activeTagFilters);
  const toggleTagFilter = useStore((s) => s.toggleTagFilter);
  const autoOpenBookmarks = useStore((s) => s.autoOpenBookmarks);
  const setAutoOpenBookmarks = useStore((s) => s.setAutoOpenBookmarks);
  const { screenToFlowPosition } = useReactFlow();

  const allTags = React.useMemo(() => {
    const set = new Set<string>();
    nodes.forEach(n => (n.data.tags as string[] | undefined)?.forEach(t => set.add(t)));
    return Array.from(set).sort();
  }, [nodes]);

  // ── State ─────────────────────────────────────────────────────────────────
  const [showRooms, setShowRooms] = React.useState(false);
  const [showTags, setShowTags] = React.useState(false);
  const [showMenu, setShowMenu] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const [isCompact, setIsCompact] = React.useState(false);
  const [maxInlineRooms, setMaxInlineRooms] = React.useState(8);
  const [showOverflow, setShowOverflow] = React.useState(false);
  const [showAddWs, setShowAddWs] = React.useState(false);
  const [newWsName, setNewWsName] = React.useState('');
  const [newWsEmoji, setNewWsEmoji] = React.useState('📌');
  const [activeEmojiGroup, setActiveEmojiGroup] = React.useState(0);
  // ID of the room whose emoji is being edited; 'new' for add-workspace panel
  const [emojiPickerFor, setEmojiPickerFor] = React.useState<string | null>(null);
  const [hoveredRoomId, setHoveredRoomId] = React.useState<string | null>(null);
  const [draggedRoomId, setDraggedRoomId] = React.useState<string | null>(null);

  const reorderRoomsAction = useStore((s) => s.reorderRooms);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    
    // Delay setting the state so the browser captures the original element 
    // for the drag ghost image at full opacity.
    requestAnimationFrame(() => {
      setDraggedRoomId(id);
    });
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedRoomId || draggedRoomId === targetId) return;

    const fromIndex = rooms.findIndex(r => r.id === draggedRoomId);
    const toIndex = rooms.findIndex(r => r.id === targetId);

    if (fromIndex !== -1 && toIndex !== -1) {
      const newRooms = [...rooms];
      const [moved] = newRooms.splice(fromIndex, 1);
      newRooms.splice(toIndex, 0, moved);
      reorderRoomsAction(newRooms);
    }
  };

  const handleDragEnd = () => {
    setDraggedRoomId(null);
  };

  React.useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      setIsMobile(w < 540);
      setIsCompact(w < 400);
      if (w < 640) setMaxInlineRooms(0);
      else if (w < 900) setMaxInlineRooms(3);
      else if (w < 1200) setMaxInlineRooms(5);
      else setMaxInlineRooms(8);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // ── Refs ──────────────────────────────────────────────────────────────────
  const roomsRef = React.useRef<HTMLDivElement>(null);
  const tagsRef = React.useRef<HTMLDivElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const settingsRef = React.useRef<HTMLDivElement>(null);
  const settingsBtnRef = React.useRef<HTMLButtonElement>(null);
  const roomsBtnRef = React.useRef<HTMLButtonElement>(null);
  const overflowRef = React.useRef<HTMLDivElement>(null);
  const addWsRef = React.useRef<HTMLDivElement>(null);
  const addWsBtnRef = React.useRef<HTMLButtonElement>(null);
  const tagsBtnRef = React.useRef<HTMLButtonElement>(null);
  const wsInputRef = React.useRef<HTMLInputElement>(null);
  // Emoji picker ref — attached to whichever tab is being edited
  const emojiPickerRef = React.useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;

  // ── Outside-click effects ─────────────────────────────────────────────────
  React.useEffect(() => {
    if (!showRooms) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        roomsRef.current && !roomsRef.current.contains(t) &&
        roomsBtnRef.current && !roomsBtnRef.current.contains(t)
      ) { setShowRooms(false); setShowAddWs(false); setEmojiPickerFor(null); setNewWsName(''); setShowSettings(false); }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showRooms]);

  React.useEffect(() => {
    if (!showTags) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        tagsRef.current && !tagsRef.current.contains(t) &&
        tagsBtnRef.current && !tagsBtnRef.current.contains(t)
      ) setShowTags(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showTags]);

  React.useEffect(() => {
    if (!showMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showMenu]);

  React.useEffect(() => {
    if (!showOverflow) return;
    const handler = (e: MouseEvent) => {
      if (overflowRef.current && !overflowRef.current.contains(e.target as Node)) setShowOverflow(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showOverflow]);

  React.useEffect(() => {
    if (!showAddWs) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        addWsRef.current && !addWsRef.current.contains(t) &&
        addWsBtnRef.current && !addWsBtnRef.current.contains(t)
      ) {
        setShowAddWs(false); setNewWsName(''); setNewWsEmoji('📌'); setEmojiPickerFor(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showAddWs]);

  // Emoji picker outside-click (for existing room tabs only; 'new' is inside addWsRef)
  React.useEffect(() => {
    if (!emojiPickerFor || emojiPickerFor === 'new') return;
    const handler = (e: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node))
        setEmojiPickerFor(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [emojiPickerFor]);

  React.useEffect(() => {
    if (showAddWs) setTimeout(() => wsInputRef.current?.focus(), 50);
    else { setNewWsName(''); setNewWsEmoji('📌'); setEmojiPickerFor(null); }
  }, [showAddWs]);

  React.useEffect(() => {
    if (!showSettings) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        settingsRef.current && !settingsRef.current.contains(t) &&
        settingsBtnRef.current && !settingsBtnRef.current.contains(t)
      ) setShowSettings(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showSettings]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const center = (offsetX = 0, offsetY = 0) => {
    const pos = screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    return { x: pos.x - offsetX + (Math.random() - 0.5) * 80, y: pos.y - offsetY + (Math.random() - 0.5) * 80 };
  };

  const handleAddBookmark = () => {
    const id = uuidv4();
    addNode({ id, type: 'bookmark', position: center(90, 65), width: 180, data: { title: '', url: '' }, createdAt: new Date().toISOString() });
    setEditingNodeId(id);
  };

  const handleAddSticker = () => {
    const id = uuidv4();
    addNode({ id, type: 'note', position: center(90, 65), width: 180, data: { title: '', content: '' }, createdAt: new Date().toISOString() });
    setEditingNodeId(id);
  };

  const handleAddGroup = () => {
    const id = uuidv4();
    addNode({ id, type: 'group', position: center(160, 120), width: 800, height: 600, data: { title: '' }, createdAt: new Date().toISOString() });
    setEditingNodeId(id);
  };

  const handleAddWorkspace = () => {
    const name = newWsName.trim();
    if (!name) return;
    addRoom(name, newWsEmoji);
    setShowAddWs(false);
  };

  // ── Computed ──────────────────────────────────────────────────────────────
  const currentRoom = rooms.find(r => r.id === currentRoomId) ?? rooms[0];
  const hasActiveFilters = activeTagFilters.length > 0;
  const visibleRooms = rooms.slice(0, maxInlineRooms);
  const overflowRooms = rooms.slice(maxInlineRooms);

  // ── Style helpers ─────────────────────────────────────────────────────────
  const labelStyle: React.CSSProperties = {
    fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.28)',
    textTransform: 'uppercase', letterSpacing: '0.08em', userSelect: 'none', lineHeight: 1,
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%',
  };

  const mkBtnStyle = (active = false): React.CSSProperties => ({
    width: isMobile ? 34 : 44, height: isMobile ? 32 : 36, borderRadius: 13,
    background: active ? 'rgba(200,241,53,0.12)' : 'transparent', border: 'none',
    color: active ? '#c8f135' : 'rgba(255,255,255,0.5)', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.18s ease', position: 'relative', top: isMobile ? 0 : '-5px',
  });

  const onEnter = (e: React.MouseEvent<HTMLButtonElement>, skip = false) => {
    if (skip) return;
    const el = e.currentTarget as HTMLButtonElement;
    el.style.background = 'rgba(255,255,255,0.07)';
    el.style.color = '#ffffff';
    el.style.transform = 'translateY(-2px)';
  };
  const onLeave = (e: React.MouseEvent<HTMLButtonElement>, skip = false) => {
    if (skip) return;
    const el = e.currentTarget as HTMLButtonElement;
    el.style.background = 'transparent';
    el.style.color = 'rgba(255,255,255,0.5)';
    el.style.transform = 'translateY(0)';
  };
  const onDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0) scale(0.92)';
  };

  // ── Add workspace panel (shared) ──────────────────────────────────────────
  const renderAddWsPanel = () => (
    <div ref={addWsRef} style={{ ...panelStyle, minWidth: 230 }}>
      <div style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>
        New workspace
      </div>
      {/* Emoji selector */}
      <div style={{ marginBottom: 10 }}>
        <button
          onClick={() => setEmojiPickerFor(emojiPickerFor === 'new' ? null : 'new')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 12, background: emojiPickerFor === 'new' ? 'rgba(200,241,53,0.10)' : 'rgba(255,255,255,0.06)', border: emojiPickerFor === 'new' ? '1px solid rgba(200,241,53,0.3)' : '1px solid rgba(255,255,255,0.09)', cursor: 'pointer', transition: 'all 0.15s' }}
        >
          <span style={{ fontSize: 22, lineHeight: 1 }}>{newWsEmoji}</span>
        </button>
        {emojiPickerFor === 'new' && renderEmojiPicker(
          (emoji) => {
            setNewWsEmoji(emoji);
            setEmojiPickerFor(null);
          },
          newWsEmoji,
          true
        )}
      </div>
      {/* Name input */}
      <div style={{ display: 'flex', gap: 7 }}>
        <input
          ref={wsInputRef}
          value={newWsName}
          onChange={e => setNewWsName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleAddWorkspace(); if (e.key === 'Escape') setShowAddWs(false); }}
          placeholder="Workspace name..."
          style={{ flex: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '8px 10px', color: '#ffffff', fontSize: 12, outline: 'none' }}
        />
        <button
          onClick={handleAddWorkspace}
          disabled={!newWsName.trim()}
          style={{ width: 34, height: 34, flexShrink: 0, borderRadius: 10, background: newWsName.trim() ? 'rgba(200,241,53,0.15)' : 'rgba(255,255,255,0.04)', border: newWsName.trim() ? '1px solid rgba(200,241,53,0.35)' : '1px solid rgba(255,255,255,0.08)', color: newWsName.trim() ? '#c8f135' : 'rgba(255,255,255,0.3)', cursor: newWsName.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
        >
          <Check size={15} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );

  // ── Shared rooms panel (mobile/compact) ───────────────────────────────────
  const renderRoomsPanel = (width: number) => (
    <div ref={roomsRef} style={{ ...panelStyle, width: Math.min(width, window.innerWidth - 32) }}>
      <div style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8, paddingLeft: 2 }}>
        Workspaces
      </div>
      {!showAddWs ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {rooms.map(room => {
            const active = room.id === currentRoomId;
            const isDragging = room.id === draggedRoomId;
            return (
              <div key={room.id}
                style={{ position: 'relative', opacity: isDragging ? 0.3 : 1, transition: 'all 0.2s cubic-bezier(.34,1.56,.64,1)', transform: isDragging ? 'scale(0.95)' : 'scale(1)', cursor: 'grab' }}
                draggable
                onDragStart={(e) => handleDragStart(e, room.id)}
                onDragOver={(e) => handleDragOver(e, room.id)}
                onDragEnd={handleDragEnd}
              >
                <button onClick={() => { switchRoom(room.id); setShowRooms(false); }}
                  style={{ width: '100%', borderRadius: 14, padding: '12px 8px', background: active ? 'rgba(200,241,53,0.12)' : 'rgba(255,255,255,0.04)', border: active ? '1px solid rgba(200,241,53,0.35)' : '1px solid rgba(255,255,255,0.07)', color: active ? '#c8f135' : 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, transition: 'all 0.15s' }}>
                  <span style={{ fontSize: 22 }}>{getRoomEmoji(room)}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', lineHeight: 1, maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{room.name}</span>
                </button>
                {!active && rooms.length > 1 && (
                  <button onClick={e => { e.stopPropagation(); deleteRoom(room.id); }} title="Delete workspace"
                    style={{ position: 'absolute', top: 4, right: 4, width: 18, height: 18, borderRadius: '50%', background: 'rgba(255,60,60,0.75)', border: '1.5px solid rgba(10,11,22,0.85)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, lineHeight: 1 }}>
                    ×
                  </button>
                )}
              </div>
            );
          })}
          {/* Add workspace */}
          <button onClick={() => setShowAddWs(true)}
            style={{ borderRadius: 14, padding: '12px 8px', background: 'rgba(255,255,255,0.03)', border: '1.5px dashed rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, transition: 'all 0.15s' }}>
            <span style={{ fontSize: 22 }}>＋</span>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', lineHeight: 1 }}>Add</span>
          </button>
        </div>
      ) : (
        /* Inline add form inside mobile panel */
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <button
              onClick={() => setEmojiPickerFor(emojiPickerFor === 'new' ? null : 'new')}
              style={{ fontSize: 22, lineHeight: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 10, padding: '6px 8px', cursor: 'pointer' }}
            >
              {newWsEmoji}
            </button>
            <input
              ref={wsInputRef}
              value={newWsName}
              onChange={e => setNewWsName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAddWorkspace(); if (e.key === 'Escape') { setShowAddWs(false); setEmojiPickerFor(null); } }}
              placeholder="Workspace name..."
              autoFocus
              style={{ flex: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '8px 10px', color: '#ffffff', fontSize: 12, outline: 'none' }}
            />
          </div>
          {emojiPickerFor === 'new' && renderEmojiPicker(
            (emoji) => { setNewWsEmoji(emoji); setEmojiPickerFor(null); },
            newWsEmoji,
            true
          )}
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={handleAddWorkspace} disabled={!newWsName.trim()}
              style={{ flex: 1, padding: '8px 0', borderRadius: 10, background: newWsName.trim() ? 'rgba(200,241,53,0.15)' : 'rgba(255,255,255,0.04)', border: newWsName.trim() ? '1px solid rgba(200,241,53,0.35)' : '1px solid rgba(255,255,255,0.08)', color: newWsName.trim() ? '#c8f135' : 'rgba(255,255,255,0.3)', cursor: newWsName.trim() ? 'pointer' : 'default', fontSize: 11, fontWeight: 700 }}>
              Add
            </button>
            <button onClick={() => { setShowAddWs(false); setEmojiPickerFor(null); }}
              style={{ flex: 1, padding: '8px 0', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // ── Tags panel ────────────────────────────────────────────────────────────
  const renderTagsPanel = () => (
    <div ref={tagsRef} style={{ ...panelStyle, minWidth: 200, maxWidth: Math.min(300, window.innerWidth - 32) }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Filter by tag</span>
        {hasActiveFilters && (
          <button onClick={() => { [...activeTagFilters].forEach(t => toggleTagFilter(t)); }} style={{ fontSize: 9, fontWeight: 700, color: 'rgba(200,241,53,0.7)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
            <X size={10} /> Clear
          </button>
        )}
      </div>
      {allTags.length === 0 ? (
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '8px 0', margin: 0 }}>No tags yet</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {allTags.map(tag => {
            const active = activeTagFilters.includes(tag);
            return (
              <button key={tag} onClick={() => toggleTagFilter(tag)} style={{ padding: '5px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: active ? 'rgba(200,241,53,0.15)' : 'rgba(255,255,255,0.06)', border: active ? '1px solid rgba(200,241,53,0.4)' : '1px solid rgba(255,255,255,0.08)', color: active ? '#c8f135' : 'rgba(255,255,255,0.55)', cursor: 'pointer', transition: 'all 0.15s', textTransform: 'uppercase' }}>
                {tag}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderSettingsPanel = () => (
    <div ref={settingsRef} style={{ ...panelStyle, minWidth: 240 }}>
      <div style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>Settings</div>
      
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          background: 'rgba(255,255,255,0.05)',
          padding: '10px 12px',
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.08)',
          cursor: 'pointer'
        }}
        onClick={() => setAutoOpenBookmarks(!autoOpenBookmarks)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ExternalLink size={16} color={autoOpenBookmarks ? '#c8f135' : 'rgba(255,255,255,0.3)'} />
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#fff', marginBottom: 1 }}>Auto-open bookmarks</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>Clicking card opens new tab</div>
          </div>
        </div>
        <div 
          style={{ 
            width: 32, 
            height: 18, 
            borderRadius: 20, 
            background: autoOpenBookmarks ? 'rgba(200,241,53,0.3)' : 'rgba(255,255,255,0.1)',
            border: autoOpenBookmarks ? '1px solid rgba(200,241,53,0.5)' : '1px solid rgba(255,255,255,0.15)',
            position: 'relative',
            transition: 'all 0.2s'
          }}
        >
          <div 
            style={{ 
              position: 'absolute',
              top: 2,
              left: autoOpenBookmarks ? 16 : 2,
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: autoOpenBookmarks ? '#c8f135' : 'rgba(255,255,255,0.4)',
              transition: 'all 0.2s'
            }} 
          />
        </div>
      </div>
    </div>
  );

  // ── Compact mode (< 400px) ────────────────────────────────────────────────
  if (isCompact) {
    const menuItems = [
      { icon: <StickyNote size={18} strokeWidth={2} />, label: 'Sticker', action: () => { handleAddSticker(); setShowMenu(false); setShowSettings(false); } },
      { icon: <Group size={18} strokeWidth={2} />, label: 'Group', action: () => { handleAddGroup(); setShowMenu(false); setShowSettings(false); } },
      { icon: <Tag size={18} strokeWidth={2} />, label: 'Tags', action: () => { setShowTags(v => !v); setShowMenu(false); setShowSettings(false); }, active: hasActiveFilters },
      { icon: <Wand2 size={18} strokeWidth={2} />, label: 'Arrange', action: () => { autoArrange(); setShowMenu(false); setShowSettings(false); } },
      { icon: <Settings size={18} strokeWidth={2} />, label: 'Settings', action: () => { setShowSettings(v => !v); setShowMenu(false); setShowTags(false); }, active: showSettings },
    ];

    return (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100]" style={{ userSelect: 'none' }}>
        <div className="relative" ref={menuRef}>
          {showTags && renderTagsPanel()}
          {showSettings && renderSettingsPanel()}
          {showRooms && renderRoomsPanel(220)}
          {showMenu && (
            <div style={{ ...panelStyle, width: Math.min(240, window.innerWidth - 32) }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {menuItems.map((item) => (
                  <button key={item.label} onClick={item.action}
                    style={{ borderRadius: 14, padding: '10px 4px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, background: item.active ? 'rgba(200,241,53,0.12)' : 'rgba(255,255,255,0.05)', border: item.active ? '1px solid rgba(200,241,53,0.35)' : '1px solid rgba(255,255,255,0.07)', color: item.active ? '#c8f135' : 'rgba(255,255,255,0.65)', cursor: 'pointer', transition: 'all 0.15s' }}>
                    {item.icon}
                    <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1 }}>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0 10px', background: 'rgba(10, 11, 22, 0.72)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 40, boxShadow: '0 24px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.07)', height: 60, animation: 'pillFloat 5s ease-in-out infinite' }}>
            <button ref={roomsBtnRef} onClick={() => { setShowRooms(v => !v); setShowMenu(false); setShowTags(false); setShowAddWs(false); setEmojiPickerFor(null); setShowSettings(false); }}
              style={{ width: 34, height: 34, borderRadius: 12, background: showRooms ? 'rgba(200,241,53,0.12)' : 'transparent', border: 'none', color: showRooms ? '#c8f135' : 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.18s', fontSize: 20 }}>
              {currentRoom ? getRoomEmoji(currentRoom) : '📌'}
            </button>
            <button onClick={undo} disabled={!canUndo}
              style={{ width: 30, height: 30, borderRadius: 10, background: 'transparent', border: 'none', color: canUndo ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.18)', cursor: canUndo ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Undo2 size={16} strokeWidth={2} />
            </button>
            <button onClick={redo} disabled={!canRedo}
              style={{ width: 30, height: 30, borderRadius: 10, background: 'transparent', border: 'none', color: canRedo ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.18)', cursor: canRedo ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Redo2 size={16} strokeWidth={2} />
            </button>
            <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
            <button onClick={handleAddBookmark}
              style={{ width: 40, height: 40, borderRadius: 14, background: '#c8f135', color: '#0a0b16', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(200,241,53,0.5)', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
              <Plus size={20} strokeWidth={2.5} />
            </button>
            <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
            <button onClick={() => { setShowMenu(v => !v); setShowRooms(false); setShowTags(false); setShowSettings(false); }} onMouseDown={e => e.stopPropagation()}
              style={{ width: 34, height: 34, borderRadius: 12, background: showMenu ? 'rgba(200,241,53,0.12)' : 'transparent', border: 'none', color: showMenu ? '#c8f135' : 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <Menu size={18} strokeWidth={2} />
              {hasActiveFilters && <span style={{ position: 'absolute', top: 4, right: 4, width: 7, height: 7, borderRadius: '50%', background: '#c8f135', border: '1.5px solid rgba(10,11,22,0.9)' }} />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Mobile layout (400–540px) ─────────────────────────────────────────────
  if (isMobile) {
    const mobileMenuItems = [
      { icon: <StickyNote size={18} strokeWidth={2} />, label: 'Sticker', action: () => { handleAddSticker(); setShowMenu(false); setShowSettings(false); } },
      { icon: <Group size={18} strokeWidth={2} />, label: 'Group', action: () => { handleAddGroup(); setShowMenu(false); setShowSettings(false); } },
      { icon: <Tag size={18} strokeWidth={2} />, label: 'Tags', action: () => { setShowTags(v => !v); setShowMenu(false); setShowSettings(false); }, active: hasActiveFilters },
      { icon: <Wand2 size={18} strokeWidth={2} />, label: 'Arrange', action: () => { autoArrange(); setShowMenu(false); setShowSettings(false); } },
      { icon: <Settings size={18} strokeWidth={2} />, label: 'Settings', action: () => { setShowSettings(v => !v); setShowMenu(false); setShowTags(false); }, active: showSettings },
    ];

    return (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100]" style={{ userSelect: 'none' }}>
        <div className="relative" ref={menuRef}>
          {showTags && renderTagsPanel()}
          {showSettings && renderSettingsPanel()}
          {showRooms && renderRoomsPanel(240)}
          {showMenu && (
            <div style={{ ...panelStyle, width: Math.min(240, window.innerWidth - 32) }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {mobileMenuItems.map((item) => (
                  <button key={item.label} onClick={item.action}
                    style={{ borderRadius: 14, padding: '10px 4px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, background: item.active ? 'rgba(200,241,53,0.12)' : 'rgba(255,255,255,0.05)', border: item.active ? '1px solid rgba(200,241,53,0.35)' : '1px solid rgba(255,255,255,0.07)', color: item.active ? '#c8f135' : 'rgba(255,255,255,0.65)', cursor: 'pointer', transition: 'all 0.15s' }}>
                    {item.icon}
                    <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1 }}>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 12px', background: 'rgba(10, 11, 22, 0.72)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 40, boxShadow: '0 24px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.07)', height: 60, animation: 'pillFloat 5s ease-in-out infinite' }}>
            <button ref={roomsBtnRef} onClick={() => { setShowRooms(v => !v); setShowMenu(false); setShowTags(false); setShowAddWs(false); setEmojiPickerFor(null); setShowSettings(false); }}
              style={{ width: 36, height: 36, borderRadius: 13, background: showRooms ? 'rgba(200,241,53,0.12)' : 'transparent', border: 'none', color: showRooms ? '#c8f135' : 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
              {currentRoom ? getRoomEmoji(currentRoom) : '📌'}
            </button>
            <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
            <button onClick={undo} disabled={!canUndo}
              style={{ width: 34, height: 34, borderRadius: 11, background: 'transparent', border: 'none', color: canUndo ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.18)', cursor: canUndo ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Undo2 size={18} strokeWidth={2} />
            </button>
            <button onClick={redo} disabled={!canRedo}
              style={{ width: 34, height: 34, borderRadius: 11, background: 'transparent', border: 'none', color: canRedo ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.18)', cursor: canRedo ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Redo2 size={18} strokeWidth={2} />
            </button>
            <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
            <button onClick={handleAddBookmark}
              style={{ width: 44, height: 44, borderRadius: 16, background: '#c8f135', color: '#0a0b16', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(200,241,53,0.5)', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
              <Plus size={22} strokeWidth={2.5} />
            </button>
            <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
            <button onClick={() => { setShowMenu(v => !v); setShowRooms(false); setShowTags(false); setShowSettings(false); }} onMouseDown={e => e.stopPropagation()}
              style={{ width: 38, height: 38, borderRadius: 13, background: showMenu ? 'rgba(200,241,53,0.12)' : 'transparent', border: 'none', color: showMenu ? '#c8f135' : 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <Menu size={20} strokeWidth={2} />
              {hasActiveFilters && <span style={{ position: 'absolute', top: 4, right: 4, width: 7, height: 7, borderRadius: '50%', background: '#c8f135', border: '1.5px solid rgba(10,11,22,0.9)' }} />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Desktop layout ────────────────────────────────────────────────────────
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100]" style={{ maxWidth: 'calc(100vw - 2rem)', userSelect: 'none' }}>
      <div className="flex items-center"
        style={{ gap: 8, padding: '0 16px', animation: 'pillFloat 5s ease-in-out infinite', background: 'rgba(10, 11, 22, 0.72)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: '40px', boxShadow: '0 24px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.07)', height: 76 }}>

        {/* ── Workspaces ─────────────────────────────────────────────────── */}
        {maxInlineRooms === 0 ? (
          /* 540–640px: single dropdown */
          <div className="relative" ref={roomsRef}>
            {showRooms && (
              <div style={{ ...panelStyle, width: Math.min(230, window.innerWidth - 32) }}>
                <div style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8, paddingLeft: 2 }}>Workspaces</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                  {rooms.map(room => {
                    const active = room.id === currentRoomId;
                    const isDragging = room.id === draggedRoomId;
                    return (
                      <div key={room.id}
                        style={{ position: 'relative', opacity: isDragging ? 0.3 : 1, transition: 'all 0.2s cubic-bezier(.34,1.56,.64,1)', transform: isDragging ? 'scale(0.95)' : 'scale(1)', cursor: 'grab' }}
                        draggable
                        onDragStart={(e) => handleDragStart(e, room.id)}
                        onDragOver={(e) => handleDragOver(e, room.id)}
                        onDragEnd={handleDragEnd}
                      >
                        <button onClick={() => { switchRoom(room.id); setShowRooms(false); }}
                          style={{ width: '100%', borderRadius: 14, padding: '12px 8px', background: active ? 'rgba(200,241,53,0.12)' : 'rgba(255,255,255,0.04)', border: active ? '1px solid rgba(200,241,53,0.35)' : '1px solid rgba(255,255,255,0.07)', color: active ? '#c8f135' : 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, transition: 'all 0.15s' }}>
                          <span style={{ fontSize: 22 }}>{getRoomEmoji(room)}</span>
                          <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', lineHeight: 1 }}>{room.name}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
                {/* Add workspace inline */}
                {!showAddWs ? (
                  <button onClick={() => setShowAddWs(true)}
                    style={{ width: '100%', padding: '9px 0', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1.5px dashed rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 11, fontWeight: 700, transition: 'all 0.15s' }}>
                    <LayersPlus size={14} strokeWidth={2} /> New
                  </button>
                ) : (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <button onClick={() => setEmojiPickerFor(emojiPickerFor === 'new' ? null : 'new')}
                        style={{ fontSize: 22, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 10, padding: '5px 7px', cursor: 'pointer', lineHeight: 1 }}>
                        {newWsEmoji}
                      </button>
                      <input ref={wsInputRef} value={newWsName} onChange={e => setNewWsName(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleAddWorkspace(); if (e.key === 'Escape') { setShowAddWs(false); setEmojiPickerFor(null); } }}
                        placeholder="Workspace name..."
                        autoFocus
                        style={{ flex: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '7px 9px', color: '#ffffff', fontSize: 12, outline: 'none' }}
                      />
                    </div>
                    {emojiPickerFor === 'new' && renderEmojiPicker(
                      (emoji) => { setNewWsEmoji(emoji); setEmojiPickerFor(null); },
                      newWsEmoji,
                      true
                    )}
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={handleAddWorkspace} disabled={!newWsName.trim()}
                        style={{ flex: 1, padding: '7px 0', borderRadius: 9, background: newWsName.trim() ? 'rgba(200,241,53,0.15)' : 'rgba(255,255,255,0.04)', border: newWsName.trim() ? '1px solid rgba(200,241,53,0.35)' : '1px solid rgba(255,255,255,0.08)', color: newWsName.trim() ? '#c8f135' : 'rgba(255,255,255,0.3)', cursor: newWsName.trim() ? 'pointer' : 'default', fontSize: 11, fontWeight: 700 }}>Add</button>
                      <button onClick={() => { setShowAddWs(false); setEmojiPickerFor(null); }}
                        style={{ flex: 1, padding: '7px 0', borderRadius: 9, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="flex flex-col items-center justify-center" style={{ margin: '0 12px' }}>
              <button ref={roomsBtnRef} onClick={() => setShowRooms(v => !v)}
                style={{ width: 44, height: 36, borderRadius: 13, background: showRooms ? 'rgba(200,241,53,0.12)' : 'transparent', border: 'none', color: showRooms ? '#c8f135' : 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, position: 'relative', top: '-5px' }}>
                {currentRoom ? getRoomEmoji(currentRoom) : '📌'}
              </button>
              <span style={{ fontSize: 9, fontWeight: 700, color: showRooms ? 'rgba(200,241,53,0.7)' : 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: '0.08em', userSelect: 'none', lineHeight: 1, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                {currentRoom?.name}
              </span>
            </div>
          </div>
        ) : (
          /* ≥640px: inline workspace tabs */
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {visibleRooms.map(room => {
              const active = room.id === currentRoomId;
              const pickerOpen = emojiPickerFor === room.id;
              return (
                /* emojiPickerRef attached to the tab container while its picker is open,
                   so outside-click doesn't fire when clicking within the tab */
                <div
                  key={room.id}
                  ref={pickerOpen ? emojiPickerRef : undefined}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    margin: '0 2px',
                    opacity: room.id === draggedRoomId ? 0.3 : 1,
                    transition: 'all 0.2s cubic-bezier(.34,1.56,.64,1)',
                    transform: room.id === draggedRoomId ? 'scale(0.95)' : 'scale(1)',
                    cursor: 'grab'
                  }}
                  onMouseEnter={() => setHoveredRoomId(room.id)}
                  onMouseLeave={() => setHoveredRoomId(null)}
                  draggable
                  onDragStart={(e) => handleDragStart(e, room.id)}
                  onDragOver={(e) => handleDragOver(e, room.id)}
                  onDragEnd={handleDragEnd}
                >
                  {/* Emoji picker panel */}
                  {pickerOpen && renderEmojiPicker(
                    (emoji) => { updateRoomEmoji(room.id, emoji); setEmojiPickerFor(null); },
                    getRoomEmoji(room)
                  )}
                  {/* Tab button:
                      - inactive → switch workspace
                      - active → toggle emoji picker */}
                  <button
                    onClick={() => {
                      if (active) {
                        setEmojiPickerFor(pickerOpen ? null : room.id);
                      } else {
                        switchRoom(room.id);
                        setEmojiPickerFor(null);
                        setShowOverflow(false);
                      }
                    }}
                    title={active ? 'Change emoji' : room.name}
                    style={{ width: 44, height: 36, borderRadius: 13, background: active ? 'rgba(200,241,53,0.12)' : 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: active ? 22 : 20, transition: 'all 0.18s', position: 'relative', top: '-5px', filter: active ? 'none' : 'grayscale(0.2) opacity(0.7)' }}
                    onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLButtonElement).style.filter = 'none'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)'; } }}
                    onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLButtonElement).style.filter = 'grayscale(0.2) opacity(0.7)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; } }}
                  >
                    {getRoomEmoji(room)}
                  </button>
                  <span style={{ ...labelStyle, color: active ? 'rgba(200,241,53,0.7)' : 'rgba(255,255,255,0.28)', maxWidth: 72 }}>
                    {room.name.length > 11 ? room.name.slice(0, 10) + '…' : room.name}
                  </span>
                  {/* Delete button — shown on hover for non-active rooms when >1 room exists */}
                  {!active && rooms.length > 1 && hoveredRoomId === room.id && (
                    <button
                      onClick={e => { e.stopPropagation(); deleteRoom(room.id); }}
                      title="Delete workspace"
                      style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: '50%', background: 'rgba(255,60,60,0.85)', border: '1.5px solid rgba(10,11,22,0.9)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, zIndex: 10, lineHeight: 1 }}
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            })}

            {/* Overflow menu */}
            {overflowRooms.length > 0 && (
              <div className="relative" ref={overflowRef} style={{ margin: '0 2px' }}>
                {showOverflow && (
                  <div style={{ ...panelStyle, minWidth: 170 }}>
                    <div style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8, paddingLeft: 2 }}>More workspaces</div>
                    {overflowRooms.map(room => {
                      const active = room.id === currentRoomId;
                      return (
                        <div key={room.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            marginBottom: 3,
                            opacity: room.id === draggedRoomId ? 0.3 : 1,
                            transition: 'all 0.2s cubic-bezier(.34,1.56,.64,1)',
                            transform: room.id === draggedRoomId ? 'scale(0.95)' : 'scale(1)',
                            cursor: 'grab'
                          }}
                          draggable
                          onDragStart={(e) => handleDragStart(e, room.id)}
                          onDragOver={(e) => handleDragOver(e, room.id)}
                          onDragEnd={handleDragEnd}
                        >
                          <button onClick={() => { switchRoom(room.id); setShowOverflow(false); }}
                            style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 10, background: active ? 'rgba(200,241,53,0.12)' : 'rgba(255,255,255,0.03)', border: active ? '1px solid rgba(200,241,53,0.35)' : '1px solid transparent', color: active ? '#c8f135' : 'rgba(255,255,255,0.6)', cursor: 'pointer', transition: 'all 0.15s', fontSize: 12, fontWeight: 600, textAlign: 'left' }}
                            onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLButtonElement).style.color = '#ffffff'; } }}
                            onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.6)'; } }}
                          >
                            <span style={{ fontSize: 18 }}>{getRoomEmoji(room)}</span>
                            {room.name}
                          </button>
                          {!active && rooms.length > 1 && (
                            <button onClick={() => deleteRoom(room.id)} title="Delete workspace"
                              style={{ width: 24, height: 24, flexShrink: 0, borderRadius: 7, background: 'transparent', border: 'none', color: 'rgba(255,100,100,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, transition: 'all 0.15s' }}
                              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,60,60,0.12)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,100,100,0.9)'; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,100,100,0.5)'; }}
                            >×</button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="flex flex-col items-center justify-center">
                  <button onClick={() => setShowOverflow(v => !v)}
                    style={{ width: 44, height: 36, borderRadius: 13, background: showOverflow ? 'rgba(200,241,53,0.12)' : 'transparent', border: 'none', color: showOverflow ? '#c8f135' : 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.18s', position: 'relative', top: '-5px' }}
                    onMouseEnter={e => { if (!showOverflow) { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLButtonElement).style.color = '#ffffff'; } }}
                    onMouseLeave={e => { if (!showOverflow) { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.5)'; } }}
                  >
                    <MoreHorizontal size={18} strokeWidth={2} />
                  </button>
                  <span style={labelStyle}>More</span>
                </div>
              </div>
            )}

            {/* Add workspace */}
            <div className="relative" style={{ margin: '0 2px' }}>
              {showAddWs && renderAddWsPanel()}
              <div className="flex flex-col items-center justify-center">
                <button
                  ref={addWsBtnRef}
                  onClick={() => { setShowAddWs(v => !v); setEmojiPickerFor(null); }}
                  style={{ width: 44, height: 35, borderRadius: 13, background: showAddWs ? 'rgba(200,241,53,0.12)' : 'transparent', border: 'none', color: showAddWs ? '#c8f135' : 'rgba(255,255,255,0.35)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.18s', position: 'relative', top: '-5px' }}
                  onMouseEnter={e => { if (!showAddWs) { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLButtonElement).style.color = '#ffffff'; } }}
                  onMouseLeave={e => { if (!showAddWs) { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.35)'; } }}
                >
                  <LayersPlus size={16} strokeWidth={2.5} />
                </button>
                <span style={labelStyle}>New</span>
              </div>
            </div>
          </div>
        )}

        <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />

        {/* Undo / Redo */}
        {[
          { icon: <Undo2 size={18} strokeWidth={2} />, action: undo, enabled: canUndo, label: '⌘Z' },
          { icon: <Redo2 size={18} strokeWidth={2} />, action: redo, enabled: canRedo, label: '⌘⇧Z' },
        ].map((item) => (
          <button key={item.label} onClick={item.action} disabled={!item.enabled} title={item.label}
            style={{ width: 36, height: 36, borderRadius: 10, background: 'transparent', border: 'none', color: item.enabled ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.18)', cursor: item.enabled ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
            onMouseEnter={e => { if (!item.enabled) return; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLButtonElement).style.color = '#ffffff'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = item.enabled ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.18)'; }}
          >
            {item.icon}
          </button>
        ))}

        <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />

        {/* Primary + bookmark */}
        <button onClick={handleAddBookmark}
          style={{ width: 52, height: 52, borderRadius: 18, background: '#c8f135', color: '#0a0b16', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 24px rgba(200,241,53,0.5), 0 0 8px rgba(200,241,53,0.3)', border: 'none', cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s cubic-bezier(.34,1.56,.64,1)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.12)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 36px rgba(200,241,53,0.7), 0 0 12px rgba(200,241,53,0.4)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 24px rgba(200,241,53,0.5), 0 0 8px rgba(200,241,53,0.3)'; }}
          onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.94)'; }}
          onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.12)'; }}
        >
          <Plus size={26} strokeWidth={2.5} />
        </button>

        <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />

        {/* Sticker */}
        <div className="flex flex-col items-center justify-center">
          <button style={mkBtnStyle()} onClick={handleAddSticker} onMouseEnter={e => onEnter(e)} onMouseLeave={e => onLeave(e)} onMouseDown={onDown}><StickyNote size={20} strokeWidth={2} /></button>
          <span style={labelStyle}>Sticker</span>
        </div>

        {/* Group */}
        <div className="flex flex-col items-center justify-center">
          <button style={mkBtnStyle()} onClick={handleAddGroup} onMouseEnter={e => onEnter(e)} onMouseLeave={e => onLeave(e)} onMouseDown={onDown}><Group size={20} strokeWidth={2} /></button>
          <span style={labelStyle}>Group</span>
        </div>

        {/* Tags */}
        <div className="relative flex flex-col items-center justify-center">
          {showTags && renderTagsPanel()}
          <button
            ref={tagsBtnRef}
            style={{ ...mkBtnStyle(hasActiveFilters), top: '-5px' }}
            onClick={() => { setShowTags(v => !v); setShowRooms(false); }}
            onMouseEnter={e => onEnter(e, hasActiveFilters || showTags)}
            onMouseLeave={e => onLeave(e, hasActiveFilters || showTags)}
            onMouseDown={onDown}
          >
            <Tag size={20} strokeWidth={2} />
            {hasActiveFilters && <span style={{ position: 'absolute', top: 2, right: 2, width: 7, height: 7, borderRadius: '50%', background: '#c8f135', border: '1.5px solid rgba(10,11,22,0.9)' }} />}
          </button>
          <span style={{ ...labelStyle, color: hasActiveFilters ? 'rgba(200,241,53,0.7)' : 'rgba(255,255,255,0.28)' }}>Tags</span>
        </div>

        {/* Arrange */}
        <div className="flex flex-col items-center justify-center">
          <button style={mkBtnStyle()} onClick={autoArrange} onMouseEnter={e => onEnter(e)} onMouseLeave={e => onLeave(e)} onMouseDown={onDown}><Wand2 size={20} strokeWidth={2} /></button>
          <span style={labelStyle}>Arrange</span>
        </div>

        <div className="relative flex flex-col items-center justify-center">
          {showSettings && renderSettingsPanel()}
          <button
            ref={settingsBtnRef}
            style={mkBtnStyle(showSettings)}
            onClick={() => { setShowSettings(v => !v); setShowRooms(false); setShowTags(false); }}
            onMouseEnter={e => onEnter(e, showSettings)}
            onMouseLeave={e => onLeave(e, showSettings)}
            onMouseDown={onDown}
          >
            <Settings size={20} strokeWidth={2} />
          </button>
          <span style={{ ...labelStyle, color: showSettings ? 'rgba(200,241,53,0.7)' : 'rgba(255,255,255,0.28)' }}>Settings</span>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
