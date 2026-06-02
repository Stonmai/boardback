'use client';

import React, { memo, useState, useRef, useCallback } from 'react';
import { Handle, Position, NodeProps, NodeResizer, Node } from '@xyflow/react';
import { ExternalLink, FolderOpen, Palette, Check, X, Pencil, Tag, Copy, Scissors, Trash2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { WhiteboardNode } from '@whiteboard/shared/types';
import { cn } from '@/utils/cn';
import NodeContextMenu from './NodeContextMenu';
import { fetchMetadata } from '@/utils/metadata';

// Bookmark cards use a glassmorphism style with a colored accent on the left edge
const COLORS: Record<
  string,
  { accent: string; glow: string; ring: string; swatch: string }
> = {
  white: { accent: 'var(--accent-neutral)', glow: '0 0 28px rgba(148,163,184,0.4)', ring: 'var(--accent-neutral)', swatch: '#d0d6e2' },
  purple: { accent: '#a855f7', glow: '0 0 28px rgba(168,85,247,0.4)', ring: 'rgba(168,85,247,0.7)', swatch: '#a855f7' },
  blue: { accent: '#3b82f6', glow: '0 0 28px rgba(59,130,246,0.4)', ring: 'rgba(59,130,246,0.7)', swatch: '#3b82f6' },
  yellow:  { accent: '#f5d70b', glow: '0 0 28px rgba(225,175,69,0.4)', ring: 'rgba(225,175,69,0.7)', swatch: '#f5d70b' },
  green: { accent: '#32d4a1', glow: '0 0 28px rgba(16,185,129,0.4)', ring: 'rgba(16,185,129,0.7)', swatch: '#32d4a1' },
  red: { accent: '#f44355', glow: '0 0 28px rgba(244,120,120,0.4)', ring: 'rgba(244,120,120,0.7)', swatch: '#f44355' },
  amber:  { accent: '#f59e0b', glow: '0 0 28px rgba(245,158,11,0.4)', ring: 'rgba(245,158,11,0.7)', swatch: '#f59e0b' },
};

const BookmarkNode = ({ data, selected, id }: NodeProps<Node<WhiteboardNode['data']>>) => {
  const nodeRef = useRef<HTMLDivElement>(null);
  const getRect = useCallback(() => nodeRef.current?.getBoundingClientRect() ?? null, []);
  const [contextMenuPos, setContextMenuPos] = useState<boolean>(false);
  const [showColorPicker, setShowColorPicker] = React.useState(false);
  const [showTagInput, setShowTagInput] = React.useState(false);
  const [tagInput, setTagInput] = React.useState('');
  const [isEditing, setIsEditing] = React.useState(false);
  const [tempTitle, setTempTitle] = React.useState(data.title || '');
  const [tempUrl, setTempUrl] = React.useState(data.url || '');
  const [tempDescription, setTempDescription] = React.useState(data.description || '');
  const [nodeHeight, setNodeHeight] = React.useState(0);
  const [nodeWidth, setNodeWidth] = React.useState(0);
  const titleTaRef = useRef<HTMLTextAreaElement>(null);
  const urlTaRef = useRef<HTMLTextAreaElement>(null);
  const autosize = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  const deleteNode = useStore((s) => s.deleteNode);
  const ungroupNode = useStore((s) => s.ungroupNode);
  const updateNode = useStore((s) => s.updateNode);
  const editingNodeId = useStore((s) => s.editingNodeId);
  const setEditingNodeId = useStore((s) => s.setEditingNodeId);
  const autoOpenBookmarks = useStore((s) => s.autoOpenBookmarks);
  const copyNodeById = useStore((s) => s.copyNodeById);
  const cutNodeById = useStore((s) => s.cutNodeById);
  const contextMenuNodeId = useStore((s) => s.contextMenuNodeId);
  const setContextMenuNodeId = useStore((s) => s.setContextMenuNodeId);
  const setPaneContextMenu = useStore((s) => s.setPaneContextMenu);

  const contextMenu = contextMenuNodeId === id && contextMenuPos;
  const closeContextMenu = () => { setContextMenuNodeId(null); setPaneContextMenu(null); };

  React.useEffect(() => {
    if (editingNodeId === id) {
      setIsEditing(true);
      setEditingNodeId(null);
    }
  }, [editingNodeId, id, setEditingNodeId]);

  // Track node size so the title can clamp and fonts can scale with it.
  React.useEffect(() => {
    const el = nodeRef.current;
    if (!el) return;
    const update = () => { setNodeHeight(el.clientHeight); setNodeWidth(el.clientWidth); };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const currentColor = (data.color as string) || 'white';
  const style = COLORS[currentColor] ?? COLORS.white;

  // More node height → more title lines (1–6). Wider node → larger fonts (base = min).
  const titleMaxLines = Math.max(1, Math.min(6, Math.floor(nodeHeight / 110)));
  const fontScale = Math.max(1, Math.min(2.2, nodeWidth / 280));
  const titleSize = Math.round(25 * fontScale);
  const urlSize = Math.round(15 * fontScale);
  const descSize = Math.round(18 * fontScale);
  // Editing fields share one consistent, modestly-scaled size.
  const editSize = Math.round(16 * Math.max(1, Math.min(1.5, nodeWidth / 280)));

  // Grow the title/URL fields to fit their (wrapped) text and the node size.
  React.useLayoutEffect(() => {
    if (!isEditing) return;
    autosize(titleTaRef.current);
    autosize(urlTaRef.current);
  }, [isEditing, tempTitle, tempUrl, editSize, nodeWidth]);

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

  const handleSave = React.useCallback(() => {
    const urlChanged = tempUrl !== data.url;
    updateNode(id, { title: tempTitle, url: tempUrl, description: tempDescription });
    if (urlChanged && tempUrl) {
      updateNode(id, { screenshot: '', favicon: '' }, { history: false });
      fetchMetadata(tempUrl).then(metadata => updateNode(id, metadata, { history: false }));
    }
    setIsEditing(false);
  }, [id, tempTitle, tempUrl, tempDescription, data.url, updateNode]);

  const handleCancel = React.useCallback(() => {
    setTempTitle(data.title || '');
    setTempUrl(data.url || '');
    setTempDescription(data.description || '');
    setIsEditing(false);
  }, [data.title, data.url, data.description]);

  React.useEffect(() => {
    if (!isEditing) {
      setTempTitle(data.title || '');
      setTempUrl(data.url || '');
      setTempDescription(data.description || '');
    }
  }, [data.title, data.url, data.description, isEditing]);

  React.useEffect(() => {
    if (!contextMenu) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeContextMenu(); };
    const onClick = () => closeContextMenu();
    window.addEventListener('keydown', onKey);
    window.addEventListener('click', onClick);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('click', onClick); };
  }, [contextMenu]);

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

  return (
    <div
      ref={nodeRef}
      className="group relative h-full w-full"
      onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setContextMenuPos(true); setContextMenuNodeId(id); setPaneContextMenu(null); }}
      onClick={() => closeContextMenu()}
      style={{
        borderRadius: 18,
        background: 'var(--node-bg)',
        backdropFilter: 'var(--node-blur)',
        WebkitBackdropFilter: 'var(--node-blur)',
        border: selected
          ? `2px solid ${style.ring}`
          : 'var(--node-border)',
        boxShadow: selected
          ? style.glow
          : 'var(--node-shadow)',
        overflow: 'visible',
        transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
        ['--accent-color' as string]: style.swatch,
        ['--accent-glow' as string]: style.swatch + '55',
      }}
    >
      {/* Colored left accent bar */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 12,
          bottom: 12,
          width: 4,
          borderRadius: '0 4px 4px 0',
          background: style.accent,
          opacity: 0.9,
        }}
      />

      {/* 4 connection handles — visible on hover, connectable in any direction */}
      <Handle type="source" position={Position.Top}    id="top"    />
      <Handle type="source" position={Position.Bottom} id="bottom" />
      <Handle type="source" position={Position.Left}   id="left"   />
      <Handle type="source" position={Position.Right}  id="right"  />

      <NodeResizer color="var(--text-muted)" isVisible={selected} minWidth={160} minHeight={80} onResizeStart={() => useStore.getState().snapshot()} />

      {/* Card body */}
      <div
        className="w-full h-full min-h-40 rounded-[14px] overflow-hidden flex flex-col"
        onDoubleClick={() => { if (!isEditing) setIsEditing(true); }}
      >
        <div className="p-3 pl-4 flex flex-col flex-1 min-h-0">
          {isEditing ? (
            <div className="nodrag flex flex-col flex-1 min-h-0 gap-2">
              <div className="flex flex-col gap-2 flex-1 min-h-0 overflow-y-auto nowheel">
                <textarea
                  ref={titleTaRef}
                  rows={1}
                  value={tempTitle}
                  onChange={(e) => { setTempTitle(e.target.value); autosize(e.target); }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); handleSave(); }
                    if (e.key === 'Escape') { e.preventDefault(); handleCancel(); }
                  }}
                  placeholder="Title"
                  className="w-full rounded-lg px-3 py-2 font-bold text-white outline-none resize-none overflow-hidden focus:ring-2 focus:ring-white/30 flex-shrink-0"
                  style={{ background: 'var(--surface-inset-bg)', border: 'var(--border-panel)', fontSize: editSize, lineHeight: 1.3, overflowWrap: 'anywhere' }}
                  autoFocus
                />
                <textarea
                  ref={urlTaRef}
                  rows={1}
                  value={tempUrl}
                  onChange={(e) => { setTempUrl(e.target.value); autosize(e.target); }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); handleSave(); }
                    if (e.key === 'Escape') { e.preventDefault(); handleCancel(); }
                  }}
                  placeholder="URL"
                  className="w-full rounded-lg px-3 py-2 text-white/70 outline-none resize-none overflow-hidden focus:ring-2 focus:ring-white/20 flex-shrink-0"
                  style={{ background: 'var(--surface-inset-bg)', border: 'var(--border-panel)', fontSize: editSize, lineHeight: 1.3, wordBreak: 'break-all' }}
                />
                <textarea
                  value={tempDescription}
                  onChange={(e) => setTempDescription(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); handleSave(); }
                    if (e.key === 'Escape') { e.preventDefault(); handleCancel(); }
                  }}
                  placeholder="Description (optional)"
                  className="w-full rounded-lg px-3 py-2 text-white/80 outline-none resize-none focus:ring-2 focus:ring-white/20 flex-1 min-h-[72px] nowheel overflow-y-auto"
                  style={{ background: 'var(--surface-inset-bg)', border: 'var(--border-panel)', fontSize: editSize, lineHeight: 1.4 }}
                />
              </div>
              <div className="flex justify-end gap-2 flex-shrink-0">
                <button
                  onClick={handleCancel}
                  className="p-2 rounded-xl transition-colors"
                  style={{ background: 'var(--surface-inset-bg)', color: 'var(--text-primary)' }}
                >
                  <X size={15} />
                </button>
                <button
                  onClick={handleSave}
                  className="p-2 rounded-xl transition-colors"
                  style={{ background: 'var(--surface-inset-bg)', color: 'var(--text-primary)' }}
                >
                  <Check size={15} />
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Text region shrinks/clips so the preview below stays fully visible */}
              <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
              <div
                className="flex items-start gap-3 mb-2 shrink-0"
              >
                {data.favicon && (
                  <img
                    src={data.favicon as string}
                    alt=""
                    className="w-12 h-11 mt-0.5 rounded shrink-0"
                    style={{ background: 'var(--surface-inset-bg)', padding: 1 }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3
                    className="font-bold text-white leading-tight mb-0.5"
                    style={{
                      fontSize: titleSize,
                      display: '-webkit-box',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: `${titleMaxLines}`,
                      overflow: 'hidden',
                      overflowWrap: 'anywhere',
                    }}
                  >
                    {data.title || 'Untitled Bookmark 🔗'}
                  </h3>
                  <p className="text-white/35 break-all font-mono line-clamp-3" style={{ fontSize: urlSize }}>
                    {data.url as string}
                  </p>
                </div>
              </div>

              {data.description && (
                <p
                  className="text-white/65 mb-2 leading-relaxed line-clamp-2 font-medium shrink-0"
                  style={{ fontSize: descSize }}
                >
                  {data.description as string}
                </p>
              )}
              </div>

              {data.url && (
                <div
                  className="w-full aspect-video rounded-lg overflow-hidden mb-2 cursor-pointer transition-transform hover:scale-[1.02] relative shrink-0"
                  style={{ border: 'var(--border-panel)' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!data.url || isEditing) return;
                    if (autoOpenBookmarks || e.metaKey || e.ctrlKey) {
                      window.open(data.url as string, '_blank', 'noopener,noreferrer');
                    } else {
                      window.location.href = data.url as string;
                    }
                  }}
                  onAuxClick={(e) => {
                    if (e.button === 1) {
                      e.stopPropagation();
                      e.preventDefault();
                      if (!data.url || isEditing) return;
                      window.open(data.url as string, '_blank', 'noopener,noreferrer');
                    }
                  }}
                  onDoubleClick={(e) => e.stopPropagation()}
                >
                  {(data.screenshot || data.ogImage) ? (
                    <img
                      src={(data.screenshot || data.ogImage) as string}
                      alt="Preview"
                      className="w-full h-full object-cover opacity-75 group-hover:opacity-100 transition-opacity"
                      onError={(e) => {
                        const img = e.currentTarget;
                        img.style.display = 'none';
                        const fallback = img.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  {/* Fallback placeholder — shown when no image or image fails */}
                  <div
                    style={{
                      display: (data.screenshot || data.ogImage) ? 'none' : 'flex',
                      position: 'absolute', inset: 0,
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      background: 'linear-gradient(135deg, rgb(53 53 84 / 90%) 0%, rgb(154 160 190 / 75%) 100%)',
                      backdropFilter: 'blur(12px)',
                      borderRadius: '8px'
                    }}
                  >
                    {/* Liquid glow blobs */}
                    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                      <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '60%', height: '60%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(100,120,255,0.12) 0%, transparent 70%)', filter: 'blur(12px)' }} />
                      <div style={{ position: 'absolute', bottom: '-15%', right: '-5%', width: '55%', height: '55%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(180,100,255,0.10) 0%, transparent 70%)', filter: 'blur(14px)' }} />
                    </div>
                    {/* Glass icon card */}
                    <div style={{
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 7,
                      padding: '12px 16px',                      
                      WebkitBackdropFilter: 'blur(12px)',
                    }}>
                      {data.favicon ? (
                        <img src={data.favicon as string} alt="" style={{ width: 26, height: 26, borderRadius: 6, opacity: 0.85, filter: 'drop-shadow(0 0 6px rgba(150,150,255,0.3))' }} onError={(e) => {
                          const img = e.currentTarget as HTMLElement;
                          img.style.display = 'none';
                          const svg = img.nextElementSibling as HTMLElement;
                          if (svg) svg.style.display = 'block';
                        }} />
                      ) : null}
                      <svg
                        width="22" height="22" viewBox="0 0 24 24" fill="none"
                        stroke="rgba(200,210,255,0.45)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                        style={{ display: data.favicon ? 'none' : 'block', filter: 'drop-shadow(0 0 5px rgba(150,160,255,0.25))' }}
                      >
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                      </svg>
                      <span style={{ fontSize: 8.5, color: 'rgba(200,210,255,0.4)', fontWeight: 600, letterSpacing: '0.04em', maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {(() => { try { return new URL(data.url as string).hostname.replace('www.', '') || data.url; } catch { return data.url as string; } })()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

            </>
          )}

          {!isEditing && data.tags && (data.tags as string[]).length > 0 && (
            <div className="flex flex-wrap gap-1 mt-auto pt-2">
              {(data.tags as string[]).map((tag, idx) => (
                <span
                  key={idx}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-bold tracking-wider uppercase"
                  style={{
                    background: 'var(--surface-inset-bg)',
                    color: 'var(--text-muted)',
                    border: 'var(--border-panel)',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Context menu */}
      {contextMenu && (
        <NodeContextMenu
          getRect={getRect}
          items={[
            { icon: ExternalLink, label: 'Open URL', hidden: !data.url, onClick: () => { window.open(data.url as string, '_blank', 'noopener,noreferrer'); closeContextMenu(); } },
            { icon: Copy, label: 'Copy', onClick: () => { copyNodeById(id); closeContextMenu(); } },
            { icon: Scissors, label: 'Cut', onClick: () => { cutNodeById(id); closeContextMenu(); } },
            { divider: true },
            { icon: Palette, label: 'Color', onClick: () => { setShowColorPicker(true); setShowTagInput(false); closeContextMenu(); } },
            { icon: Tag, label: 'Tag', onClick: () => { setShowTagInput(true); setShowColorPicker(false); closeContextMenu(); } },
            { icon: Pencil, label: 'Edit', onClick: () => { setIsEditing(true); closeContextMenu(); } },
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
            onClick={() => setIsEditing(true)}
          >
            <Pencil size={15} />
          </button>
        )}
        {!isEditing && (
          <button
            className="p-2 hover:bg-blue-500/20 rounded-xl text-white hover:text-blue-400 transition-colors"
            onClick={(e) => { e.stopPropagation(); window.open(data.url as string, '_blank', 'noopener,noreferrer'); }}
          >
            <ExternalLink size={15} />
          </button>
        )}
        <button
          className="p-2 hover:bg-white/10 rounded-xl text-white transition-colors"
          onClick={(e) => { e.stopPropagation(); ungroupNode(id); }}
        >
          <FolderOpen size={15} />
        </button>
      </div>
    </div>
  );
};

export default memo(BookmarkNode);