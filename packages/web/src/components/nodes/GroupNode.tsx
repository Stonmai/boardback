'use client';

import React, { memo, useState, useRef } from 'react';
import { NodeProps, NodeResizer, Node } from '@xyflow/react';
import { FolderX, Pencil, Check, X, ExternalLink, Tag } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { cn } from '@/utils/cn';
import type { WhiteboardNode } from '@whiteboard/shared/types';

const GroupNode = ({ id, data, selected }: NodeProps<Node<WhiteboardNode['data']>>) => {
  const removeGroup = useStore(s => s.removeGroup);
  const updateNode = useStore(s => s.updateNode);
  const updateGroupSize = useStore(s => s.updateGroupSize);
  const editingNodeId = useStore(s => s.editingNodeId);
  const setEditingNodeId = useStore(s => s.setEditingNodeId);
  const isDropTarget = !!(data as any).__dropTarget;
  const nodes = useStore(s => s.nodes);
  const getParentId = (n: any) => n.parentId || n.parentNode;

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(data.title || '');
  const [showTagInput, setShowTagInput] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAddTag = (tag: string) => {
    const trimmed = tag.trim().toLowerCase();
    if (!trimmed) return;
    const existing = (data.tags as string[]) || [];
    if (!existing.includes(trimmed)) updateNode(id, { tags: [...existing, trimmed] } as any);
    setTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    const existing = (data.tags as string[]) || [];
    updateNode(id, { tags: existing.filter((t: string) => t !== tag) } as any);
  };

  React.useEffect(() => {
    if (editingNodeId === id) {
      setNameInput(data.title || '');
      setIsEditingName(true);
      setEditingNodeId(null);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [editingNodeId, id, setEditingNodeId]);

  const handleStartEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNameInput(data.title || '');
    setIsEditingName(true);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const handleSaveName = () => {
    const trimmed = nameInput.trim() || 'New Group 📦';
    if (trimmed) updateNode(id, { title: trimmed} as any);
    setIsEditingName(false);
  };

  const handleCancelName = () => {
    setNameInput(data.title || 'New Group 📦');
    setIsEditingName(false);
  };
  
  const handleOpenAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    const children = nodes.filter(n => getParentId(n) === id);
    const bookmarks = children.filter(n => n.type === 'bookmark' || n.type === 'tab');
    
    bookmarks.forEach(bm => {
      const url = bm.data.url;
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    });
  };

  return (
    <div
      className="group w-full h-full relative"
      style={{
        borderRadius: 20,
        border: isDropTarget
          ? '2px dashed rgba(200, 241, 53, 0.85)'
          : selected
          ? '2px solid rgba(255,255,255,0.35)'
          : '2px dashed rgba(255,255,255,0.15)',
        background: isDropTarget
          ? 'rgba(200, 241, 53, 0.06)'
          : selected
          ? 'rgba(255,255,255,0.04)'
          : 'rgba(255,255,255,0.025)',
        backdropFilter: 'blur(4px)',
        transition: 'border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease',
        boxShadow: isDropTarget
          ? '0 0 0 2px rgba(200,241,53,0.2), inset 0 0 40px rgba(200,241,53,0.04)'
          : selected
          ? '0 0 0 2px rgba(255,255,255,0.1)'
          : 'none',
      }}
    >
      <NodeResizer
        color="rgba(255,255,255,0.4)"
        isVisible={selected}
        minWidth={200}
        minHeight={150}
        onResize={(_, { x, y, width, height }) => updateGroupSize(id, x, y, width, height)}
        onResizeEnd={(_, { x, y, width, height }) => updateGroupSize(id, x, y, width, height)}
      />

      {/* Group label */}
      <div
        style={{ position: 'absolute', top: -65, left: 0, display: 'flex', alignItems: 'center', gap: 8 }}
      >
        {isEditingName ? (
          <div className="flex items-center gap-1">
            <input
              ref={inputRef}
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveName();
                if (e.key === 'Escape') handleCancelName();
              }}
              placeholder="NEW GROUP"
              className="rounded-lg px-2 py-0.5 text-[11px] font-bold tracking-widest uppercase text-white outline-none placeholder:text-white/30"
              style={{
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.25)',
                width: 120,
              }}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
            <button
              className="p-1 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              onClick={handleSaveName}
            >
              <Check size={11} />
            </button>
            <button
              className="p-1 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              onClick={handleCancelName}
            >
              <X size={11} />
            </button>
          </div>
        ) : (
          <>
            <span
              style={{
                padding: '3px 10px',
                borderRadius: 8,
                fontSize: 25,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                background: isDropTarget ? 'rgba(200,241,53,0.18)' : 'rgba(255,255,255,0.08)',
                color: isDropTarget ? '#c8f135' : 'rgba(255,255,255,0.55)',
                border: isDropTarget ? '1px solid rgba(200,241,53,0.35)' : '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.15s ease',
              }}
            >
              {data.title || 'New Group 📦'}
            </span>
            {(data as any).count !== undefined && (
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>
                {(data as any).count} items
              </span>
            )}
          </>
        )}
      </div>

      {/* Drop hint */}
      {isDropTarget && (
        <div
          style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(200,241,53,0.6)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Drop to add
          </span>
        </div>
      )}

      {/* Tags display */}
      {(data.tags as string[] | undefined) && (data.tags as string[]).length > 0 && (
        <div style={{ position: 'absolute', bottom: 10, left: 12, display: 'flex', flexWrap: 'wrap', gap: 4, pointerEvents: 'none' }}>
          {(data.tags as string[]).map((tag, idx) => (
            <span key={idx} style={{ padding: '2px 8px', borderRadius: 20, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.1)' }}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Floating action bar */}
      <div
        className={cn(
          'nodrag absolute -bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-1 glass p-1 rounded-xl shadow-xl transition-all duration-200 z-50',
          selected
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'
        )}
      >
        <button
          className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
          title="Rename"
          onClick={handleStartEdit}
        >
          <Pencil size={15} />
        </button>
        <div className="relative">
          <button
            className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
            title="Tags"
            onClick={(e) => { e.stopPropagation(); setShowTagInput(v => !v); }}
          >
            <Tag size={15} />
          </button>
          {showTagInput && (
            <div className="absolute bottom-full left-0 mb-3 p-2.5 glass-dark rounded-2xl shadow-2xl border border-white/20" style={{ width: 180, zIndex: 100 }} onClick={e => e.stopPropagation()}>
              {(data.tags as string[] || []).length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {(data.tags as string[]).map((tag) => (
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
        <button
          className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
          title="Open all bookmarks"
          onClick={handleOpenAll}
        >
          <ExternalLink size={15} />
        </button>
        <button
          className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
          title="Ungroup"
          onClick={(e) => { e.stopPropagation(); removeGroup(id); }}
        >
          <FolderX size={15} />
        </button>
      </div>
    </div>
  );
};

export default memo(GroupNode);