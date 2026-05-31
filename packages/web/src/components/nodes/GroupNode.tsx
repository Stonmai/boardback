'use client';

import React, { memo, useState, useRef, useCallback } from 'react';
import { NodeProps, NodeResizer, Node } from '@xyflow/react';
import { FolderX, Pencil, Check, X, ExternalLink, Tag, Copy, Scissors } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { cn } from '@/utils/cn';
import type { WhiteboardNode } from '@whiteboard/shared/types';
import NodeContextMenu from './NodeContextMenu';

const GroupNode = ({ id, data, selected }: NodeProps<Node<WhiteboardNode['data']>>) => {
  const removeGroup = useStore(s => s.removeGroup);
  const updateNode = useStore(s => s.updateNode);
  const updateGroupSize = useStore(s => s.updateGroupSize);
  const editingNodeId = useStore(s => s.editingNodeId);
  const setEditingNodeId = useStore(s => s.setEditingNodeId);
  const copyNodeById = useStore(s => s.copyNodeById);
  const cutNodeById = useStore(s => s.cutNodeById);
  const isDropTarget = !!(data as any).__dropTarget;
  const getParentId = (n: any) => n.parentId || n.parentNode;

  const [isEditingName, setIsEditingName] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);
  const getRect = useCallback(() => nodeRef.current?.getBoundingClientRect() ?? null, []);
  const [contextMenuPos, setContextMenuPos] = useState<boolean>(false);
  const [nameInput, setNameInput] = useState(data.title || '');
  const [showTagInput, setShowTagInput] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const contextMenuNodeId = useStore(s => s.contextMenuNodeId);
  const setContextMenuNodeId = useStore(s => s.setContextMenuNodeId);
  const setPaneContextMenu = useStore(s => s.setPaneContextMenu);
  const contextMenu = contextMenuNodeId === id && contextMenuPos;
  const closeContextMenu = () => { setContextMenuNodeId(null); setPaneContextMenu(null); };

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

  React.useEffect(() => {
    if (!contextMenu) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeContextMenu(); };
    const onClick = () => closeContextMenu();
    window.addEventListener('keydown', onKey);
    window.addEventListener('click', onClick);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('click', onClick); };
  }, [contextMenu]);

  const handleStartEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNameInput(data.title || '');
    setIsEditingName(true);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const handleSaveName = useCallback(() => {
    const trimmed = nameInput.trim() || 'New Group 📦';
    if (trimmed) updateNode(id, { title: trimmed} as any);
    setIsEditingName(false);
  }, [id, nameInput, updateNode]);

  const handleCancelName = useCallback(() => {
    setNameInput(data.title || 'New Group 📦');
    setIsEditingName(false);
  }, [data.title]);

  React.useEffect(() => {
    if (!isEditingName) return;
    const onPointerDown = (e: PointerEvent) => {
      if (nodeRef.current && !nodeRef.current.contains(e.target as unknown as globalThis.Node)) {
        handleSaveName();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [isEditingName, handleSaveName]);

  React.useEffect(() => {
    if (!showTagInput) return;
    const onPointerDown = (e: PointerEvent) => {
      if (nodeRef.current && !nodeRef.current.contains(e.target as unknown as globalThis.Node)) {
        setShowTagInput(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [showTagInput]);

  const handleOpenAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    const allNodes = useStore.getState().nodes;
    const children = allNodes.filter(n => getParentId(n) === id);
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
      ref={nodeRef}
      className="group w-full h-full relative"
      onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setContextMenuPos(true); setContextMenuNodeId(id); setPaneContextMenu(null); }}
      onClick={() => closeContextMenu()}
      style={{
        borderRadius: 20,
        border: isDropTarget
          ? '2px dashed var(--accent)'
          : selected
          ? '2px solid var(--text-muted)'
          : '2px dashed var(--dot-grid)',
        background: isDropTarget
          ? 'var(--accent-soft)'
          : 'var(--surface-inset-bg)',
        backdropFilter: 'blur(4px)',
        transition: 'border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease',
        boxShadow: isDropTarget
          ? '0 0 0 2px var(--accent-soft), inset 0 0 40px var(--accent-soft)'
          : selected
          ? '0 0 0 2px var(--surface-inset-bg)'
          : 'none',
      }}
    >
      <NodeResizer
        color="var(--text-muted)"
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
              className="rounded-lg px-2 py-0.5 text-[25px] font-bold tracking-widest uppercase text-white outline-none placeholder:text-white/30"
              style={{
                background: 'var(--surface-inset-bg)',
                border: 'var(--border-panel)',
                width: 240,
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
          <span
            onDoubleClick={handleStartEdit}
            style={{
              padding: '3px 10px',
              borderRadius: 8,
              fontSize: 25,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              background: isDropTarget ? 'var(--accent-soft)' : 'var(--surface-inset-bg)',
              color: isDropTarget ? 'var(--accent)' : 'var(--text-muted)',
              border: isDropTarget ? '1px solid rgba(var(--accent-rgb),0.35)' : 'var(--border-panel)',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.15s ease',
              cursor: 'text',
            }}
          >
            {data.title || 'New Group 📦'}
          </span>
        )}
      </div>

      {/* Context menu */}
      {contextMenu && (
        <NodeContextMenu
          getRect={getRect}
          items={[
            { icon: ExternalLink, label: 'Open All', onClick: (e) => { handleOpenAll(e); closeContextMenu(); } },
            { icon: Copy, label: 'Copy', onClick: () => { copyNodeById(id); closeContextMenu(); } },
            { icon: Scissors, label: 'Cut', onClick: () => { cutNodeById(id); closeContextMenu(); } },
            { divider: true },
            { icon: Pencil, label: 'Rename', onClick: (e) => { handleStartEdit(e); closeContextMenu(); } },
            { icon: Tag, label: 'Tag', onClick: () => { setShowTagInput(true); closeContextMenu(); } },
            { icon: FolderX, label: 'Ungroup', onClick: () => { removeGroup(id); closeContextMenu(); } },
          ]}
        />
      )}

      {/* Floating action bar */}
      <div
        className={cn(
          'nodrag absolute -bottom-14 left-1/2 -translate-x-1/2 flex items-center gap-1 glass p-1 rounded-xl shadow-xl transition-all duration-200',
          selected
            ? 'opacity-100 translate-y-0 z-9999'
            : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 z-50'
        )}
        onPointerDown={e => e.stopPropagation()}
        onClick={e => e.stopPropagation()}
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
        {(data as any).count !== undefined && (
          <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, padding: '0 6px' }}>
            {(data as any).count} items
          </span>
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
          <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(var(--accent-rgb),0.6)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Drop to add
          </span>
        </div>
      )}

      {/* Tags display */}
      {(data.tags as string[] | undefined) && (data.tags as string[]).length > 0 && (
        <div style={{ position: 'absolute', bottom: 10, left: 12, display: 'flex', flexWrap: 'wrap', gap: 4, pointerEvents: 'none' }}>
          {(data.tags as string[]).map((tag, idx) => (
            <span key={idx} style={{ padding: '2px 8px', borderRadius: 20, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', background: 'var(--surface-inset-bg)', color: 'var(--text-muted)', border: 'var(--border-panel)' }}>
              {tag}
            </span>
          ))}
        </div>
      )}

    </div>
  );
};

export default memo(GroupNode);