'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { LucideIcon } from 'lucide-react';

export interface ContextMenuItem {
  icon: LucideIcon;
  label: string;
  onClick: (e: React.MouseEvent) => void;
  danger?: boolean;
  hidden?: boolean;
}

export interface ContextMenuDivider {
  divider: true;
}

type ContextMenuEntry = ContextMenuItem | ContextMenuDivider;

interface NodeContextMenuProps {
  getRect: () => DOMRect | null;
  items: ContextMenuEntry[];
}

const isDivider = (item: ContextMenuEntry): item is ContextMenuDivider =>
  'divider' in item;

const NodeContextMenu = ({ getRect, items }: NodeContextMenuProps) => {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let rafId: number;
    const update = () => {
      const rect = getRect();
      if (rect) setPos({ x: rect.right + 8, y: rect.top });
      rafId = requestAnimationFrame(update);
    };
    rafId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafId);
  }, [getRect]);

  const menu = (
    <div
      className="nodrag glass-dark rounded-2xl shadow-2xl border border-white/20 overflow-hidden"
      style={{ position: 'fixed', top: pos.y, left: pos.x, width: 160, zIndex: 99999, transform: 'none', zoom: 1 }}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
    >
      {items.map((item, i) => {
        if (isDivider(item)) {
          return <div key={i} style={{ height: 1, background: 'var(--surface-inset-bg)', margin: '2px 0' }} />;
        }
        if (item.hidden) return null;
        const Icon = item.icon;
        return (
          <button
            key={i}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-[13px] transition-colors text-left ${
              item.danger
                ? 'text-red-400 hover:bg-red-500/20'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
            onClick={item.onClick}
          >
            <Icon size={13} /> {item.label}
          </button>
        );
      })}
    </div>
  );

  return createPortal(menu, document.body);
};

export default NodeContextMenu;
