import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { Clock, CheckCircle2, AlertCircle, Plus } from 'lucide-react';
import { APP_URL } from '../config';

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
  const [rooms, setRooms] = useState<RoomInfo[]>(DEFAULT_ROOMS);
  const [selectedRoomId, setSelectedRoomId] = useState<string>(DEFAULT_ROOMS[0].id);
  const [theme, setTheme] = useState<'midnight' | 'roadbow'>('midnight');

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

    chrome.storage.local.get(['boardbackRooms', 'boardbackTheme'], (result) => {
      const boardbackRooms = result.boardbackRooms;
      const boardbackTheme = result.boardbackTheme;

      if (Array.isArray(boardbackRooms) && boardbackRooms.length > 0) {
        setRooms(boardbackRooms);
        setSelectedRoomId(boardbackRooms[0].id);
      }
      if (typeof boardbackTheme === 'string') {
        const t = boardbackTheme as 'midnight' | 'roadbow';
        setTheme(t);
        document.body.setAttribute('data-theme', t);
      }
    });

    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
      if (areaName === 'local' && changes.boardbackTheme) {
        const nextTheme = changes.boardbackTheme.newValue as 'midnight' | 'roadbow';
        setTheme(nextTheme);
        document.body.setAttribute('data-theme', nextTheme);
      }
      if (areaName === 'local' && changes.boardbackRooms) {
        setRooms((changes.boardbackRooms.newValue as RoomInfo[]) || []);
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, []);

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

  return (
    <div className="p-4 select-none">
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
          {tabInfo.favicon && <img src={tabInfo.favicon} alt="" className="w-4 h-4 mt-0.5 rounded" />}
          <div className="flex-1 min-w-0">
            <h2 className="text-xs font-semibold truncate leading-tight mb-1" style={{ color: 'var(--text-primary)' }}>{tabInfo.title || 'Loading...'}</h2>
            <p className="text-[10px] truncate font-mono" style={{ color: 'var(--text-dim)' }}>{tabInfo.url}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Workspace selector */}
        {(
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-muted)' }}>Workspace</label>
            <div className="flex flex-wrap gap-1.5">
              {rooms.map(room => {
                const active = selectedRoomId === room.id;
                return (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoomId(room.id)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all"
                    style={{
                      background: active ? 'var(--accent-soft)' : 'var(--panel-bg)',
                      color: active ? 'var(--text-primary)' : 'var(--text-muted)',
                      border: active ? 'var(--accent-border)' : 'var(--panel-border)',
                    }}
                  >
                    {room.emoji && <span style={{ fontSize: 13 }}>{room.emoji}</span>}
                    {room.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tags */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-muted)' }}>Tags</label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {tags.map(t => (
              <span key={t} className="px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1" style={{ background: 'var(--accent-soft)', color: 'var(--text-primary)', border: 'var(--accent-border)' }}>
                {t}
                <button onClick={() => setTags(tags.filter(tag => tag !== t))} style={{ color: 'var(--text-primary)' }}>×</button>
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
        <div className="grid grid-cols-2 gap-2">
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
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<Popup />);
