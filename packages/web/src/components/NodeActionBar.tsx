'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Copy, ExternalLink, FolderX, Palette, Pencil, Scissors, Tag, Trash2, X } from 'lucide-react';
import { useStore } from '@/store/useStore';

const BOOKMARK_SWATCHES: Record<string, string> = {
  white: '#d0d6e2', purple: '#a855f7', blue: '#3b82f6',
  yellow: '#f5d70b', green: '#32d4a1', red: '#f44355', amber: '#f59e0b',
};

const NOTE_SWATCHES: Record<string, string> = {
  purple: '#a855f7', teal: '#14b8a6', yellow: '#eab308',
  pink: '#ec4899', blue: '#3b82f6', lime: '#84cc16', orange: '#f97316', slate: '#64748b',
};

const pillStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  border: '1px solid rgba(255,255,255,0.10)',
};

const panelStyle: React.CSSProperties = {
  background: 'rgba(8, 8, 20, 0.6)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.08)',
};

export const NodeActionBar = () => {
  const selectedNodes = useStore(s => s.selectedNodes);
  const nodes = useStore(s => s.nodes);
  const deleteNode = useStore(s => s.deleteNode);
  const updateNode = useStore(s => s.updateNode);
  const setEditingNodeId = useStore(s => s.setEditingNodeId);
  const copyNodeById = useStore(s => s.copyNodeById);
  const cutNodeById = useStore(s => s.cutNodeById);
  const copyNodes = useStore(s => s.copyNodes);
  const cutNodes = useStore(s => s.cutNodes);
  const removeGroup = useStore(s => s.removeGroup);

  const [openPanel, setOpenPanel] = useState<'color' | 'tag' | null>(null);
  const [tagInput, setTagInput] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpenPanel(null);
    setTagInput('');
  }, [selectedNodes]);

  useEffect(() => {
    if (!openPanel) return;
    const onPointerDown = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as globalThis.Node)) {
        setOpenPanel(null);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [openPanel]);

  if (selectedNodes.length === 0) return null;

  const isMulti = selectedNodes.length > 1;
  const node = !isMulti ? nodes.find(n => n.id === selectedNodes[0]) : null;
  const isBookmark = node?.type === 'bookmark' || node?.type === 'tab';
  const isNote = node?.type === 'note';
  const isGroup = node?.type === 'group';
  const swatches = isBookmark ? BOOKMARK_SWATCHES : isNote ? NOTE_SWATCHES : null;
  const currentColor = (node?.data.color as string) || (isBookmark ? 'white' : 'purple');

  const toggle = (p: 'color' | 'tag') => setOpenPanel(prev => prev === p ? null : p);

  const btn = (active = false) =>
    `p-2 rounded-xl transition-colors text-white/70 hover:text-white ${active ? 'bg-white/10 text-white' : 'hover:bg-white/10'}`;

  return (
    <div
      ref={containerRef}
      className="absolute left-5 top-2/3 -translate-y-1/2 z-50 flex items-center gap-2 pointer-events-auto"
      onPointerDown={e => e.stopPropagation()}
    >
      {/* Vertical pill */}
      <div className="flex flex-col items-center gap-0.5 p-1.5 rounded-2xl shadow-xl" style={pillStyle}>
        {!isMulti && (
          <button
            className={btn()}
            title="Edit"
            onClick={() => { if (node) { setEditingNodeId(node.id); setOpenPanel(null); } }}
          >
            <Pencil size={15} />
          </button>
        )}

        {!isMulti && swatches && (
          <button className={btn(openPanel === 'color')} title="Color" onClick={() => toggle('color')}>
            <Palette size={15} />
          </button>
        )}

        {!isMulti && (
          <button className={btn(openPanel === 'tag')} title="Tags" onClick={() => toggle('tag')}>
            <Tag size={15} />
          </button>
        )}

        {!isMulti && isBookmark && node?.data.url && (
          <button
            className="p-2 rounded-xl transition-colors text-white/70 hover:text-blue-400 hover:bg-blue-500/15"
            title="Open URL"
            onClick={() => window.open(node.data.url as string, '_blank', 'noopener,noreferrer')}
          >
            <ExternalLink size={15} />
          </button>
        )}

        <div className="w-5 h-px bg-white/10 my-0.5" />

        <button
          className={btn()}
          title="Copy"
          onClick={() => isMulti ? copyNodes() : copyNodeById(selectedNodes[0])}
        >
          <Copy size={15} />
        </button>

        <button
          className={btn()}
          title="Cut"
          onClick={() => isMulti ? cutNodes() : cutNodeById(selectedNodes[0])}
        >
          <Scissors size={15} />
        </button>

        {isGroup ? (
          <button
            className="p-2 rounded-xl transition-colors text-white/70 hover:text-white hover:bg-white/10"
            title="Ungroup"
            onClick={() => { removeGroup(node!.id); setOpenPanel(null); }}
          >
            <FolderX size={15} />
          </button>
        ) : (
          <button
            className="p-2 rounded-xl transition-colors text-white/70 hover:text-red-400 hover:bg-red-500/15"
            title="Delete"
            onClick={() => { selectedNodes.forEach(id => deleteNode(id)); setOpenPanel(null); }}
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>

      {/* Color picker */}
      {openPanel === 'color' && swatches && (
        <div className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl" style={panelStyle}>
          {Object.entries(swatches).map(([key, swatch]) => (
            <button
              key={key}
              title={key}
              onClick={() => { if (node) updateNode(node.id, { color: key }); setOpenPanel(null); }}
              style={{
                width: 20, height: 20, borderRadius: '50%', cursor: 'pointer',
                background: swatch,
                border: key === currentColor ? '2px solid #fff' : '2px solid rgba(255,255,255,0.15)',
                transition: 'transform 0.1s',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.25)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            />
          ))}
        </div>
      )}

      {/* Tag panel */}
      {openPanel === 'tag' && node && (
        <div className="p-3 rounded-2xl" style={{ ...panelStyle, width: 180 }}>
          {((node.data.tags as string[]) || []).length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {(node.data.tags as string[]).map(tag => (
                <span
                  key={tag}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase cursor-pointer hover:bg-red-500/20 hover:text-red-400 transition-colors"
                  style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}
                  onClick={() => {
                    const existing = (node.data.tags as string[]) || [];
                    updateNode(node.id, { tags: existing.filter(t => t !== tag) });
                  }}
                >
                  {tag} <X size={8} />
                </span>
              ))}
            </div>
          )}
          <input
            type="text"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const trimmed = tagInput.trim().toLowerCase();
                if (trimmed) {
                  const existing = (node.data.tags as string[]) || [];
                  if (!existing.includes(trimmed)) updateNode(node.id, { tags: [...existing, trimmed] });
                  setTagInput('');
                }
              }
              if (e.key === 'Escape') setOpenPanel(null);
            }}
            placeholder="Add tag & press Enter"
            autoFocus
            className="w-full rounded-lg px-2.5 py-1.5 text-[11px] text-white outline-none placeholder:text-white/30"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
          />
        </div>
      )}
    </div>
  );
};
