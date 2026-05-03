'use client';

import React, { memo, useState, useRef, useCallback } from 'react';
import { Handle, Position, NodeProps, NodeResizer, Node, useReactFlow } from '@xyflow/react';
import { Trash2, Check, X, Palette, Pencil, Tag, Copy, Scissors } from 'lucide-react';
import { WhiteboardNode } from '@whiteboard/shared/types';
import { cn } from '@/utils/cn';
import { useStore } from '@/store/useStore';
import NodeContextMenu from './NodeContextMenu';

const COLORS: Record<
  string,
  {
    gradient: string;
    glow: string;
    ring: string;
    text: string;
    swatch: string;
  }
> = {
  purple: {
    gradient: 'linear-gradient(135deg, #c084fc 0%, #a855f7 55%, #6d28d9 100%)',
    glow: '0 0 0 2px rgba(168,85,247,0.5), 0 0 30px rgba(168,85,247,0.4)',
    ring: 'rgba(168,85,247,0.7)',
    text: '#1a0800',
    swatch: '#a855f7',
  },
  teal: {
    gradient: 'linear-gradient(135deg, #a5f3fc 0%, #22d3ee 75%, #0d9488 100%)',
    glow: '0 0 0 2px rgba(34,211,238,0.5), 0 0 30px rgba(34,211,238,0.4)',
    ring: 'rgba(34,211,238,0.7)',
    text: '#0a0b16',
    swatch: '#22d3ee',
  },
  yellow: {
    gradient: 'linear-gradient(135deg, #fff8a2 0%, #f9d566 75%, #ecd32e 100%)',
    glow: '0 0 0 2px rgba(249,215,100,0.5), 0 0 30px rgba(249,215,100,0.4)',
    ring: 'rgba(249,215,100,0.7)',
    text: '#1a0800',
    swatch: '#ecd32e',
  },
  pink: {
    gradient: 'linear-gradient(135deg, #fda4af 0%, #f472b6 75%, #ec4899 100%)',
    glow: '0 0 0 2px rgba(244,114,182,0.5), 0 0 30px rgba(244,114,182,0.4)',
    ring: 'rgba(244,114,182,0.7)',
    text: '#1a0800',
    swatch: '#f472b6',
  },
  blue: {
    gradient: 'linear-gradient(135deg, #a5b4fc 0%, #60a5fa 75%, #2563eb 100%)',
    glow: '0 0 0 2px rgba(96,165,250,0.5), 0 0 30px rgba(96,165,250,0.4)',
    ring: 'rgba(96,165,250,0.7)',
    text: '#1a0800',
    swatch: '#60a5fa',
  },
  lime: {
    gradient: 'linear-gradient(135deg, #d9f99d 0%, #a3e635 75%, #65a30d 100%)',
    glow: '0 0 0 2px rgba(163,230,53,0.5), 0 0 30px rgba(163,230,53,0.4)',
    ring: 'rgba(163,230,53,0.7)',
    text: '#0c1a00',
    swatch: '#a3e635',
  },
  orange: {
    gradient: 'linear-gradient(135deg, #fde68a 0%, #fb923c 75%, #f97316 100%)',
    glow: '0 0 0 2px rgba(249,115,22,0.5), 0 0 30px rgba(249,115,22,0.4)',
    ring: 'rgba(249,115,22,0.7)',
    text: '#1a0800',
    swatch: '#f97316',
  },
  slate: {
    gradient: 'linear-gradient(135deg, #878ba3 0%, #656588 60%, #494e69 100%)',
    glow: '0 0 0 2px rgba(148,163,184,0.3), 0 0 20px rgba(148,163,184,0.2)',
    ring: 'rgba(148,163,184,0.5)',
    text: '#ffffff',
    swatch: '#3e3f5f',
  },
};

const NoteNode = ({ id, data, selected }: NodeProps<Node<WhiteboardNode['data']>>) => {
  const nodeRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const getRect = useCallback(() => nodeRef.current?.getBoundingClientRect() ?? null, []);
  const [isEditing, setIsEditing] = useState(false);
  const [focusedField, setFocusedField] = useState<'title' | 'content' | null>(null);
  const { updateNode: rfUpdateNode } = useReactFlow();
  const [contextMenuPos, setContextMenuPos] = useState<boolean>(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [content, setContent] = useState(
    Array.isArray(data.content) ? (data.content as string[]).join('\n') : (data.content || '')
  );
  const [title, setTitle] = useState(data.title || '');

  const updateNode = useStore((s) => s.updateNode);
  const deleteNode = useStore((s) => s.deleteNode);
  const nodes = useStore((s) => s.nodes);
  const editingNodeId = useStore((s) => s.editingNodeId);
  const setEditingNodeId = useStore((s) => s.setEditingNodeId);
  const copyNodeById = useStore((s) => s.copyNodeById);
  const cutNodeById = useStore((s) => s.cutNodeById);
  const contextMenuNodeId = useStore((s) => s.contextMenuNodeId);
  const setContextMenuNodeId = useStore((s) => s.setContextMenuNodeId);
  const setPaneContextMenu = useStore((s) => s.setPaneContextMenu);

  const contextMenu = contextMenuNodeId === id && contextMenuPos;
  const closeContextMenu = () => { setContextMenuNodeId(null); setPaneContextMenu(null); };

  const toolbarOnTop = React.useMemo(() => {
    const self = nodes.find(n => n.id === id);
    if (!self) return false;
    const myX = self.position.x;
    const myY = self.position.y;
    const myW = self.width ?? 360;
    const myH = self.height ?? 280;
    const tbX1 = myX + myW / 2 - 120;
    const tbX2 = myX + myW / 2 + 120;
    const tbY1 = myY + myH;
    const tbY2 = tbY1 + 56;
    return nodes.some(n => {
      if (n.id === id || (n as any).parentId || (n as any).parentNode) return false;
      const nx = n.position.x;
      const ny = n.position.y;
      const nw = n.width ?? 180;
      const nh = n.height ?? 120;
      return nx < tbX2 && nx + nw > tbX1 && ny < tbY2 && ny + nh > tbY1;
    });
  }, [id, nodes]);

  const enterEditing = useCallback(() => {
    if (nodeRef.current) {
      rfUpdateNode(id, { height: nodeRef.current.offsetHeight });
    }
    setIsEditing(true);
    setTimeout(() => { contentRef.current?.focus(); contentRef.current?.setSelectionRange(contentRef.current.value.length, contentRef.current.value.length); }, 0);
  }, [id, rfUpdateNode]);

  React.useEffect(() => {
    if (editingNodeId === id) {
      enterEditing();
      setEditingNodeId(null);
    }
  }, [editingNodeId, id, setEditingNodeId, enterEditing]);

  React.useEffect(() => {
    if (!contextMenu) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeContextMenu(); };
    const onClick = () => closeContextMenu();
    window.addEventListener('keydown', onKey);
    window.addEventListener('click', onClick);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('click', onClick); };
  }, [contextMenu]);


  const currentColor = (data.color as string) || 'purple';
  const style = COLORS[currentColor] ?? COLORS.purple;

  const handleSave = useCallback(() => {
    updateNode(id, { content, title });
    setIsEditing(false);
  }, [id, content, title, updateNode]);

  const handleCancel = useCallback(() => {
    setContent(Array.isArray(data.content) ? (data.content as string[]).join('\n') : (data.content || ''));
    setTitle(data.title || '');
    setIsEditing(false);
  }, [data.content, data.title]);

  React.useEffect(() => {
    if (!isEditing) return;
    const onPointerDown = (e: PointerEvent) => {
      if (nodeRef.current && !nodeRef.current.contains(e.target as unknown as globalThis.Node)) {
        handleSave();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [isEditing, handleSave]);

  const handleColorChange = (color: string) => {
    updateNode(id, { color });
    setShowColorPicker(false);
  };

  const handleAddTag = (tag: string) => {
    const trimmed = tag.trim().toLowerCase();
    if (!trimmed) return;
    const existing = (data.tags as string[]) || [];
    if (!existing.includes(trimmed)) updateNode(id, { tags: [...existing, trimmed] });
    setTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    const existing = (data.tags as string[]) || [];
    updateNode(id, { tags: existing.filter(t => t !== tag) });
  };

  return (
    <div
      ref={nodeRef}
      className="group relative h-full w-full"
      onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setContextMenuPos(true); setContextMenuNodeId(id); setPaneContextMenu(null); }}
      onClick={() => closeContextMenu()}
      style={{
        borderRadius: 20,
        background: style.gradient,
        boxShadow: selected
          ? `${style.glow}, 0 20px 40px rgba(0,0,0,0.4)`
          : '0 10px 30px rgba(0,0,0,0.35)',
        border: selected
          ? `2px solid ${style.ring}`
          : '2px solid rgba(255,255,255,0.18)',
        transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
        overflow: 'visible',
        ['--accent-color' as string]: style.swatch,
        ['--accent-glow' as string]: style.swatch + '55',
      }}
    >
      {/* 4 connection handles — visible on hover, connectable in any direction */}
      <Handle type="source" position={Position.Top} id="top" style={{}}/>
      <Handle type="source" position={Position.Bottom} id="bottom" style={{}}/>
      <Handle type="source" position={Position.Left}   id="left" style={{}}/>
      <Handle type="source" position={Position.Right}  id="right" style={{}}/>

      <NodeResizer color="rgba(255,255,255,0.6)" isVisible={selected} minWidth={160} minHeight={80} />

      {/* Card content */}
      <div className="h-full p-3 rounded-[14px] flex flex-col" style={{ color: style.text, overflow: 'hidden' }}>
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          {isEditing ? (
            <div className="nodrag flex flex-col flex-1 min-h-0 gap-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); handleSave(); }
                  if (e.key === 'Escape') { e.preventDefault(); handleCancel(); }
                }}
                placeholder="Title"
                className="w-full rounded-lg px-2.5 py-1.5 text-[18px] font-bold outline-none flex-shrink-0"
                style={{
                  background: 'rgba(0,0,0,0.15)',
                  color: style.text,
                  border: focusedField === 'title' ? '1.5px solid rgba(255,255,255,0.7)' : '1.5px solid rgba(255,255,255,0.25)',
                }}
                onFocus={() => setFocusedField('title')}
                onBlur={() => setFocusedField(null)}
              />
              <textarea
                ref={contentRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); handleSave(); }
                  if (e.key === 'Escape') { e.preventDefault(); handleCancel(); }
                }}
                placeholder="Start typing..."
                className="w-full rounded-lg px-2.5 py-1.5 text-[18px] outline-none resize-none flex-1 min-h-0 nowheel overflow-y-auto"
                style={{
                  background: 'rgba(0,0,0,0.15)',
                  color: style.text,
                  border: focusedField === 'content' ? '1.5px solid rgba(255,255,255,0.7)' : '1.5px solid rgba(255,255,255,0.25)',
                }}
                onFocus={() => setFocusedField('content')}
                onBlur={() => setFocusedField(null)}
              />
              <div className="flex justify-end gap-2 flex-shrink-0">
                <button
                  onClick={handleCancel}
                  className="p-2 rounded-xl transition-colors"
                  style={{ background: 'rgba(0,0,0,0.2)', color: style.text }}
                >
                  <X size={15} />
                </button>
                <button
                  onClick={handleSave}
                  className="p-2 rounded-xl transition-colors"
                  style={{ background: 'rgba(0,0,0,0.25)', color: style.text }}
                >
                  <Check size={15} />
                </button>
              </div>
            </div>
          ) : (
            <div
              className="cursor-text flex-1 min-h-0 wrap-break-word overflow-hidden"
              onDoubleClick={() => enterEditing()}
            >
              <h3
                className="font-bold text-[18px] mb-1.5 wrap-break-word leading-tight"
                style={{ color: style.text, textShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
              >
                {title || 'New Note 🔖'}
              </h3>
              <p
                className="text-[18px] whitespace-pre-wrap leading-relaxed wrap-break-word font-medium"
                style={{ color: style.text, opacity: 0.88 }}
              >
                {content || 'Click to add content…'}
              </p>
            </div>
          )}

        </div>

        {data.tags && data.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-2 mt-auto">
            {(data.tags as string[]).map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-bold tracking-wider uppercase"
                style={{
                  background: 'rgba(0,0,0,0.2)',
                  color: style.text,
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Context menu */}
        {contextMenu && (
          <NodeContextMenu
            getRect={getRect}
            items={[
              { icon: Copy, label: 'Copy', onClick: () => { copyNodeById(id); closeContextMenu(); } },
              { icon: Scissors, label: 'Cut', onClick: () => { cutNodeById(id); closeContextMenu(); } },
              { divider: true },
              { icon: Palette, label: 'Color', onClick: () => { setShowColorPicker(true); setShowTagInput(false); closeContextMenu(); } },
              { icon: Tag, label: 'Tag', onClick: () => { setShowTagInput(true); setShowColorPicker(false); closeContextMenu(); } },
              { icon: Pencil, label: 'Edit', onClick: () => { enterEditing(); closeContextMenu(); } },
              { icon: Trash2, label: 'Delete', onClick: () => { deleteNode(id); closeContextMenu(); } },
            ]}
          />
        )}

        {/* Floating action bar */}
        <div
          className={cn(
            toolbarOnTop
              ? 'nodrag absolute -top-14 left-1/2 -translate-x-1/2 flex items-center gap-1.5 glass p-1.5 rounded-2xl shadow-xl transition-all duration-200 z-50'
              : 'nodrag absolute -bottom-14 left-1/2 -translate-x-1/2 flex items-center gap-1.5 glass p-1.5 rounded-2xl shadow-xl transition-all duration-200 z-50',
            isEditing || selected
              ? 'opacity-100 translate-y-0'
              : toolbarOnTop
                ? 'opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'
                : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'
          )}
          onPointerDown={e => e.stopPropagation()}
          onClick={e => e.stopPropagation()}
        >
          <div className="relative">
            <button
              className="p-2 hover:bg-white/10 rounded-xl text-white transition-colors"
              onClick={() => { setShowColorPicker(!showColorPicker); setShowTagInput(false); }}
            >
              <Palette size={15} />
            </button>

            {showColorPicker && (
              <div className="absolute bottom-full left-0 mb-3 p-2 glass-dark rounded-2xl shadow-2xl flex gap-2 z-60 border border-white/20">
                {Object.entries(COLORS).map(([key, val]) => (
                  <button
                    key={key}
                    aria-label={key}
                    className="transition-transform hover:scale-125"
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: val.swatch,
                      border: key === currentColor ? '2px solid #fff' : '2px solid rgba(255,255,255,0.2)',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleColorChange(key)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              className="p-2 hover:bg-white/10 rounded-xl text-white transition-colors"
              onClick={() => { setShowTagInput(!showTagInput); setShowColorPicker(false); }}
            >
              <Tag size={15} />
            </button>

            {showTagInput && (
              <div className="absolute bottom-full left-0 mb-3 p-2.5 glass-dark rounded-2xl shadow-2xl z-60 border border-white/20" style={{ width: 180 }}>
                {(data.tags as string[] || []).length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {[...new Set(data.tags as string[])].map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase cursor-pointer transition-colors hover:bg-red-500/20 hover:text-red-400"
                        style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}
                        onClick={() => handleRemoveTag(tag)}
                      >
                        {tag} <X size={8} />
                      </span>
                    ))}
                  </div>
                )}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); handleAddTag(tagInput); }
                    if (e.key === 'Escape') setShowTagInput(false);
                  }}
                  placeholder="Add tag & press Enter"
                  autoFocus
                  className="w-full rounded-lg px-2.5 py-1.5 text-[11px] text-white outline-none placeholder:text-white/30"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
                />
              </div>
            )}
          </div>

          {!isEditing && (
            <button
              className="p-2 hover:bg-white/10 rounded-xl text-white transition-colors"
              onClick={() => enterEditing()}
            >
              <Pencil size={15} />
            </button>
          )}
          <button
            className="p-2 hover:bg-red-500/20 rounded-xl text-white hover:text-red-400 transition-colors"
            onClick={() => deleteNode(id)}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(NoteNode);
