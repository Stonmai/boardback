import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

const Options = () => {
  const [newTabEnabled, setNewTabEnabled] = useState(false);
  const [saved, setSaved] = useState(false);
  const [theme, setTheme] = useState<'midnight' | 'roadbow'>('midnight');

  useEffect(() => {
    chrome.storage.local.get(['boardbackNewTab', 'boardbackTheme'], (result) => {
      setNewTabEnabled(!!result.boardbackNewTab);
      const themeValue = result.boardbackTheme;
      if (typeof themeValue === 'string') {
        const t = themeValue as 'midnight' | 'roadbow';
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
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, []);

  const handleToggle = () => {
    const next = !newTabEnabled;
    setNewTabEnabled(next);
    chrome.storage.local.set({ boardbackNewTab: next }, () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    });
  };

  return (
    <div style={{ maxWidth: 480, margin: '40px auto', padding: '0 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <img src="icon-bg.png" alt="logo" style={{ width: 36, height: 36, borderRadius: 10 }} />
        <div>
          <h1 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--accent-bright)' }}>BoardBack</h1>
          <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>Extension settings</p>
        </div>
      </div>

      <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', marginBottom: 8 }}>New Tab</p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: 14, background: 'var(--surface-bg)', border: '1px solid var(--surface-border)' }}>
        <div>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Set as default new tab</p>
          <p style={{ margin: '3px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>Replace the new tab page with your workspace</p>
        </div>
        <button
          onClick={handleToggle}
          style={{
            position: 'relative',
            flexShrink: 0,
            width: 40,
            height: 22,
            borderRadius: 999,
            border: 'none',
            cursor: 'pointer',
            background: newTabEnabled ? 'var(--accent-bright)' : 'var(--toggle-inactive)',
            transition: 'background 0.2s',
          }}
        >
          <span style={{
            position: 'absolute',
            top: 3,
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: newTabEnabled ? 'var(--toggle-knob-active)' : 'var(--toggle-knob-inactive)',
            left: newTabEnabled ? 21 : 3,
            transition: 'left 0.15s',
          }} />
        </button>
      </div>

      {saved && (
        <p style={{ marginTop: 12, fontSize: 11, color: 'var(--accent-bright)', textAlign: 'right' }}>Saved</p>
      )}
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<Options />);
