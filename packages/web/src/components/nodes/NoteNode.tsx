'use client';

import React, { memo, useState, useRef, useCallback } from 'react';
import { Handle, Position, NodeProps, NodeResizer, Node, useReactFlow } from '@xyflow/react';
import { Trash2, X, Palette, Pencil, Tag, Copy, Scissors } from 'lucide-react';
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
    gradient: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 60%, #d8b4fe 100%)',
    glow: '0 0 0 2px rgba(168,85,247,0.4), 0 0 30px rgba(168,85,247,0.25)',
    ring: 'rgba(168,85,247,0.6)',
    text: '#2e1065',
    swatch: '#a855f7',
  },
  teal: {
    gradient: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 60%, #99f6e4 100%)',
    glow: '0 0 0 2px rgba(20,184,166,0.4), 0 0 30px rgba(20,184,166,0.25)',
    ring: 'rgba(20,184,166,0.6)',
    text: '#042f2e',
    swatch: '#14b8a6',
  },
  yellow: {
    gradient: 'linear-gradient(135deg, #fefce8 0%, #fef9c3 60%, #fef08a 100%)',
    glow: '0 0 0 2px rgba(234,179,8,0.4), 0 0 30px rgba(234,179,8,0.25)',
    ring: 'rgba(234,179,8,0.6)',
    text: '#422006',
    swatch: '#eab308',
  },
  pink: {
    gradient: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 60%, #fbcfe8 100%)',
    glow: '0 0 0 2px rgba(236,72,153,0.4), 0 0 30px rgba(236,72,153,0.25)',
    ring: 'rgba(236,72,153,0.6)',
    text: '#500724',
    swatch: '#ec4899',
  },
  blue: {
    gradient: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 60%, #bfdbfe 100%)',
    glow: '0 0 0 2px rgba(59,130,246,0.4), 0 0 30px rgba(59,130,246,0.25)',
    ring: 'rgba(59,130,246,0.6)',
    text: '#1e3a5f',
    swatch: '#3b82f6',
  },
  lime: {
    gradient: 'linear-gradient(135deg, #f7fee7 0%, #ecfccb 60%, #d9f99d 100%)',
    glow: '0 0 0 2px rgba(132,204,22,0.4), 0 0 30px rgba(132,204,22,0.25)',
    ring: 'rgba(132,204,22,0.6)',
    text: '#1a2e05',
    swatch: '#84cc16',
  },
  orange: {
    gradient: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 60%, #fed7aa 100%)',
    glow: '0 0 0 2px rgba(249,115,22,0.4), 0 0 30px rgba(249,115,22,0.25)',
    ring: 'rgba(249,115,22,0.6)',
    text: '#431407',
    swatch: '#f97316',
  },
  slate: {
    gradient: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 60%, #e2e8f0 100%)',
    glow: '0 0 0 2px rgba(100,116,139,0.4), 0 0 20px rgba(100,116,139,0.2)',
    ring: 'rgba(100,116,139,0.5)',
    text: '#1e293b',
    swatch: '#64748b',
  },
};

const NoteNode = ({ id, data, selected }: NodeProps<Node<WhiteboardNode['data']>>) => {
  const nodeRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const getRect = useCallback(() => nodeRef.current?.getBoundingClientRect() ?? null, []);
  const [isEditing, setIsEditing] = useState(false);
  const { updateNode: rfUpdateNode } = useReactFlow();
  const [contextMenuPos, setContextMenuPos] = useState<boolean>(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [content, setContent] = useState(
    Array.isArray(data.content) ? (data.content as string[]).join('\n') : (data.content || '')
  );
  const [nodeWidth, setNodeWidth] = useState(0);

  const updateNode = useStore((s) => s.updateNode);
  const deleteNode = useStore((s) => s.deleteNode);
  const editingNodeId = useStore((s) => s.editingNodeId);
  const setEditingNodeId = useStore((s) => s.setEditingNodeId);
  const copyNodeById = useStore((s) => s.copyNodeById);
  const cutNodeById = useStore((s) => s.cutNodeById);
  const contextMenuNodeId = useStore((s) => s.contextMenuNodeId);
  const setContextMenuNodeId = useStore((s) => s.setContextMenuNodeId);
  const setPaneContextMenu = useStore((s) => s.setPaneContextMenu);

  const contextMenu = contextMenuNodeId === id && contextMenuPos;
  const closeContextMenu = () => { setContextMenuNodeId(null); setPaneContextMenu(null); };

  // Scale the note text up with the node width; base size acts as the minimum.
  React.useEffect(() => {
    const el = nodeRef.current;
    if (!el) return;
    const update = () => setNodeWidth(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const contentSize = Math.round(12 * Math.max(1, Math.min(2, nodeWidth / 240)));

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
    updateNode(id, { content, title: '' });
    setIsEditing(false);
  }, [id, content, updateNode]);

  const handleCancel = useCallback(() => {
    setContent(Array.isArray(data.content) ? (data.content as string[]).join('\n') : (data.content || ''));
    setIsEditing(false);
  }, [data.content]);

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

  React.useEffect(() => {
    if (!showTagInput && !showColorPicker) return;
    const onPointerDown = (e: PointerEvent) => {
      if (nodeRef.current && !nodeRef.current.contains(e.target as unknown as globalThis.Node)) {
        setShowTagInput(false);
        setShowColorPicker(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [showTagInput, showColorPicker]);

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
          ? style.glow
          : 'var(--node-shadow)',
        border: selected
          ? `2px solid ${style.ring}`
          : 'var(--node-border)',
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

      <NodeResizer color="var(--text-muted)" isVisible={selected} minWidth={160} minHeight={80} />

      {/* Card content */}
      <div className="h-full p-8 rounded-[14px] flex flex-col" style={{ color: style.text, overflow: 'hidden' }}>
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          {isEditing ? (
            <div className="nodrag flex flex-col flex-1 min-h-0">
              <textarea
                ref={contentRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); handleSave(); }
                  if (e.key === 'Escape') { e.preventDefault(); handleCancel(); }
                }}
                placeholder="Start typing..."
                className="w-full outline-none resize-none flex-1 min-h-0 nowheel overflow-y-auto"
                style={{
                  fontSize: contentSize,
                  background: 'transparent',
                  color: style.text,
                  border: 'none',
                  padding: 0,
                }}
              />
            </div>
          ) : (
            <div
              className="cursor-text flex-1 min-h-0 wrap-break-word overflow-hidden"
              onDoubleClick={() => enterEditing()}
            >
              <p
                className="whitespace-pre-wrap leading-relaxed wrap-break-word font-medium"
                style={{ fontSize: contentSize, color: style.text, opacity: content ? 0.88 : 0.45 }}
              >
                {content || 'Click to write…'}
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
                  border: 'var(--border-panel)',
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
            'nodrag absolute -bottom-14 left-1/2 -translate-x-1/2 flex items-center gap-1.5 glass p-1.5 rounded-2xl shadow-xl transition-all duration-200 z-50',
            isEditing || selected
              ? 'opacity-100 translate-y-0'
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
                      border: key === currentColor ? '2px solid var(--text-primary)' : 'var(--border-panel)',
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
                        style={{ background: 'var(--surface-inset-bg)', color: 'var(--text-muted)', border: 'var(--border-panel)' }}
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
                  style={{ background: 'var(--surface-inset-bg)', border: 'var(--border-panel)' }}
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
