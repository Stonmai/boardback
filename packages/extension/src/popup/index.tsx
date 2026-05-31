import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { Clock, CheckCircle2, AlertCircle, Plus, Search, ChevronRight, ChevronDown, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { APP_URL } from '../config';
import { Dossier, RoomData, WhiteboardNode } from '@whiteboard/shared/types';

type RoomInfo = { id: string; name: string; emoji?: string };

const DEFAULT_ROOMS: RoomInfo[] = [
  { id: 'personal',     name: 'Personal',     emoji: '🏠' },
  { id: 'office',       name: 'Office',        emoji: '💼' },
  { id: 'social-media', name: 'Social Media',  emoji: '📱' },
  { id: 'favorite',     name: 'Favorite',      emoji: '⭐' },
];

const Popup = () => {
  const [tabInfo, setTabInfo] = useState<{ title?: string; url?: string; favicon?: string }>({});
  const [activeTabId, setActiveTabId] = useState<number | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [theme, setTheme] = useState<'midnight' | 'roadbow'>('midnight');

  // Left column drives the popup height; the right column matches it and scrolls.
  const leftColRef = useRef<HTMLDivElement>(null);
  const [colHeight, setColHeight] = useState<number | undefined>(undefined);

  // Unified state for both panels
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [selectedDossierId, setSelectedDossierId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRooms, setExpandedRooms] = useState<Set<string>>(new Set());

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab) {
        setTabInfo({
          title: activeTab.title,
          url: activeTab.url,
          favicon: activeTab.favIconUrl,
        });
        setActiveTabId(activeTab.id ?? null);
      }
    });

    chrome.storage.local.get(['boardbackTheme', 'boardbackData'], (result: { [key: string]: any }) => {
      const boardbackTheme = result.boardbackTheme;
      const boardbackData = result.boardbackData;

      if (typeof boardbackTheme === 'string') {
        const t = boardbackTheme as 'midnight' | 'roadbow';
        setTheme(t);
        document.body.setAttribute('data-theme', t);
      }

      if (boardbackData && Array.isArray(boardbackData.dossiers)) {
        setDossiers(boardbackData.dossiers);
        const activeDossierId = boardbackData.currentDossierId || (boardbackData.dossiers[0]?.id) || '';
        setSelectedDossierId(activeDossierId);
        
        const activeDossier = boardbackData.dossiers.find((d: any) => d.id === activeDossierId);
        if (activeDossier && activeDossier.rooms?.length > 0) {
          setSelectedRoomId(activeDossier.currentRoomId || activeDossier.rooms[0].id);
        }
      }
    });

    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
      if (areaName === 'local' && changes.boardbackTheme) {
        const nextTheme = changes.boardbackTheme.newValue as 'midnight' | 'roadbow';
        setTheme(nextTheme);
        document.body.setAttribute('data-theme', nextTheme);
      }
      if (areaName === 'local' && changes.boardbackData) {
        const newData = changes.boardbackData.newValue as any;
        if (newData && Array.isArray(newData.dossiers)) {
          setDossiers(newData.dossiers);
          
          setSelectedDossierId(currentId => {
            const dossiers = newData.dossiers;
            const stillExists = dossiers.some((d: any) => d.id === currentId);
            const nextDossierId = stillExists ? currentId : (newData.currentDossierId || dossiers[0]?.id || '');
            
            // Update room selection based on the next dossier
            const nextDossier = dossiers.find((d: any) => d.id === nextDossierId);
            if (nextDossier && nextDossier.rooms?.length > 0) {
              setSelectedRoomId(currentRoomId => {
                const roomExists = nextDossier.rooms.some((r: any) => r.id === currentRoomId);
                return roomExists ? currentRoomId : (nextDossier.currentRoomId || nextDossier.rooms[0].id);
              });
            }
            return nextDossierId;
          });
        }
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, []);

  // Keep the popup height equal to the left column's natural content height.
  useEffect(() => {
    const el = leftColRef.current;
    if (!el) return;
    const update = () => setColHeight(el.offsetHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const selectedDossier = useMemo(() =>
    dossiers.find(d => d.id === selectedDossierId),
    [dossiers, selectedDossierId]
  );

  const captureRooms = useMemo(() => {
    if (!selectedDossier || !Array.isArray(selectedDossier.rooms)) return [];
    return selectedDossier.rooms.map(r => ({ id: r.id, name: r.name, emoji: r.emoji }));
  }, [selectedDossier]);

  const handleCapture = async () => {
    setStatus('loading');
    const allTags = tagInput.trim() ? [...tags, tagInput.trim()] : tags;
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'CAPTURE_TAB',
        tabId: activeTabId,
        tags: allTags,
        roomId: selectedRoomId,
      });
      if (response.success) {
        setStatus('success');
        setTimeout(() => window.close(), 1500);
      } else {
        setStatus('error');
      }
    } catch (e) {
      setStatus('error');
    }
  };

  const handleCaptureAll = async () => {
    setStatus('loading');
    const response = await chrome.runtime.sendMessage({
      type: 'CAPTURE_ALL_TABS',
      roomId: selectedRoomId,
    });
    if (response.success) setStatus('success');
    else setStatus('error');
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput) {
      if (!tags.includes(tagInput)) {
        setTags([...tags, tagInput]);
      }
      setTagInput('');
    }
  };

  const toggleRoom = (roomId: string) => {
    const next = new Set(expandedRooms);
    if (next.has(roomId)) next.delete(roomId);
    else next.add(roomId);
    setExpandedRooms(next);
  };

  const filteredTree = useMemo(() => {
    if (!selectedDossier || !Array.isArray(selectedDossier.rooms)) return [];
    const query = searchQuery.toLowerCase();

    return selectedDossier.rooms.map(room => {
      const nodes = Array.isArray(room.nodes) ? room.nodes : [];
      const bookmarks = nodes.filter((node: any) => 
        (node.type === 'bookmark' || node.type === 'tab') &&
        (node.data?.title?.toLowerCase().includes(query) || node.data?.url?.toLowerCase().includes(query))
      );
      return { ...room, bookmarks };
    }).filter(room => room.bookmarks.length > 0 || room.name.toLowerCase().includes(query));
  }, [selectedDossier, searchQuery]);

  return (
    <div className="flex w-full items-start overflow-hidden select-none">
      {/* LEFT COLUMN: Capture Area (60% - 372px) — defines the popup height */}
      <div ref={leftColRef} className="flex-shrink-0 min-w-0 p-4 flex flex-col border-r" style={{ width: 372, borderRight: 'var(--panel-border)' }}>
        {/* Header */}
        <div className="flex items-center gap-2 mb-5">
          <img src="icon-bg.png" alt="logo" className="w-8 h-8 rounded-lg" />
          <div>
            <h1 className="text-sm font-bold tracking-tight" style={{ color: 'var(--accent-bright)' }}>BoardBack</h1>
            <p className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>capture to your workspace</p>
          </div>
        </div>

        {/* Tab info */}
        <div className="rounded-xl p-3 mb-4" style={{ background: 'var(--panel-bg)', border: 'var(--panel-border)' }}>
          <div className="flex items-start gap-3">
            {tabInfo.favicon && <img src={tabInfo.favicon} alt="" className="w-4 h-4 mt-0.5 rounded flex-shrink-0" />}
            <div className="flex-1 min-w-0">
              <h2 className="text-xs font-semibold truncate leading-tight mb-1" style={{ color: 'var(--text-primary)' }}>{tabInfo.title || 'Loading...'}</h2>
              <p className="text-[10px] truncate font-mono" style={{ color: 'var(--text-dim)' }}>{tabInfo.url}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 flex-1 overflow-y-auto pr-1 custom-scrollbar">
          {/* Workspace selector */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-muted)' }}>Workspace</label>
            <div className="flex flex-wrap gap-1.5">
              {captureRooms.map(room => {
                const active = selectedRoomId === room.id;
                return (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoomId(room.id)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all"
                    style={{
                      background: active ? 'var(--accent-soft)' : 'var(--panel-bg)',
                      color: active ? 'var(--accent-text)' : 'var(--text-muted)',
                      border: active ? '2px solid var(--accent)' : 'var(--panel-border)',
                    }}
                  >
                    {room.emoji && <span style={{ fontSize: 13 }}>{room.emoji}</span>}
                    {room.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-muted)' }}>Tags</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map(t => (
                <span key={t} className="px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1" style={{ background: 'var(--accent-soft)', color: 'var(--accent-text)', border: '2px solid var(--accent)' }}>
                  {t}
                  <button onClick={() => setTags(tags.filter(tag => tag !== t))} style={{ color: 'var(--accent-text)' }}>×</button>
                </span>
              ))}
            </div>
            <input
              type="text"
              placeholder="Add tags (press Enter)..."
              className="w-full rounded-lg text-xs p-2.5 transition-all outline-none"
              style={{ background: 'var(--panel-bg)', color: 'var(--text-primary)', border: 'var(--panel-border)' }}
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={addTag}
            />
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-2 mt-auto">
            <button
              disabled={status === 'loading'}
              onClick={handleCapture}
              className="col-span-2 py-3 rounded-xl transition-all font-bold text-sm flex items-center justify-center gap-2"
              style={{ background: status === 'loading' ? 'var(--accent-soft)' : 'var(--accent-bright)', color: theme === 'roadbow' ? '#000' : '#0b0c16', border: 'var(--accent-border)' }}
            >
              {status === 'loading' ? (
                <Clock size={16} className="animate-spin" />
              ) : status === 'success' ? (
                <CheckCircle2 size={16} />
              ) : status === 'error' ? (
                <AlertCircle size={16} />
              ) : (
                <Plus size={16} />
              )}
              {status === 'success' ? 'Added!' : status === 'error' ? 'Failed' : 'Capture tab'}
            </button>

            <button
              onClick={handleCaptureAll}
              className="py-2.5 rounded-xl transition-all font-bold text-[11px] flex items-center justify-center gap-2"
              style={{ background: 'var(--panel-bg)', color: 'var(--text-muted)', border: 'var(--panel-border)' }}
            >
              Capture All
            </button>

            <button
              className="py-2.5 rounded-xl transition-all font-bold text-[11px] flex items-center justify-center gap-2"
              style={{ background: 'var(--panel-bg)', color: 'var(--text-muted)', border: 'var(--panel-border)' }}
              onClick={() => window.open(APP_URL, '_blank')}
            >
              Open App
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Library Area (40% - 248px) */}
      <div className="flex-shrink-0 min-w-0 p-4 flex flex-col" style={{ width: 248, height: colHeight, background: 'var(--bg-canvas)' }}>
        {/* Dossier Selector & Search */}
        <div className="space-y-3 mb-5">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <select 
                className="w-full rounded-lg text-xs p-2 outline-none appearance-none"
                style={{ background: 'var(--panel-bg)', color: 'var(--text-primary)', border: 'var(--panel-border)' }}
                value={selectedDossierId}
                onChange={(e) => setSelectedDossierId(e.target.value)}
              >
                {dossiers.map(d => (
                  <option key={d.id} value={d.id}>{d.emoji} {d.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="relative">
            <Search size={14} className="absolute left-3" style={{ top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text"
              placeholder="Search library..."
              className="w-full rounded-lg text-xs py-2 pl-9 pr-3 outline-none"
              style={{ background: 'var(--panel-bg)', color: 'var(--text-primary)', border: 'var(--panel-border)' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Tree Area */}
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-1">
          <label className="text-[10px] font-bold uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-muted)' }}>Workspaces</label>
          <div className="space-y-2">
            {filteredTree.length > 0 ? (
              filteredTree.map(room => {
                // While searching, force rooms open so matching results are visible.
                const isExpanded = searchQuery.trim() !== '' || expandedRooms.has(room.id);
                return (
                  <div 
                    key={room.id} 
                    className="overflow-hidden rounded-xl transition-all"
                    style={{ background: 'var(--panel-bg)', border: 'var(--panel-border)' }}
                  >
                    <button 
                      onClick={() => toggleRoom(room.id)}
                      className="w-full flex items-center gap-2 p-2.5 text-xs font-bold hover:bg-white/5 transition-colors min-w-0"
                    >
                      {isExpanded ? <ChevronDown size={14} className="flex-shrink-0" /> : <ChevronRight size={14} className="flex-shrink-0" />}
                      <span className="flex-1 text-left truncate">{room.emoji} {room.name}</span>
                      <span className="text-[10px] opacity-40 px-1.5 py-0.5 rounded-full bg-white/5 flex-shrink-0">{room.bookmarks.length}</span>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-panel divide-y divide-panel" style={{ borderColor: 'var(--surface-border)', borderTop: 'var(--panel-border)' }}>
                        {room.bookmarks.length > 0 ? (
                          room.bookmarks.map((node: any) => (
                            <a 
                              key={node.id}
                              href={node.data.url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-2 p-2.5 hover:bg-white/5 group transition-colors min-w-0"
                            >
                              {node.data.favicon ? (
                                <img src={node.data.favicon} className="w-3.5 h-3.5 rounded-sm flex-shrink-0" alt="" />
                              ) : (
                                <LinkIcon size={12} className="opacity-40 flex-shrink-0" />
                              )}
                              <span className="flex-1 text-[11px] truncate font-medium" style={{ color: 'var(--text-primary)' }}>{node.data.title || 'Untitled'}</span>
                              <ExternalLink size={10} className="opacity-0 group-hover:opacity-40 transition-opacity flex-shrink-0" />
                            </a>
                          ))
                        ) : (
                          <div className="p-4 text-center">
                            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Empty workspace</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="py-10 text-center">
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No bookmarks found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<Popup />);
