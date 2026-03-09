import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

const Options = () => {
  const [newTabEnabled, setNewTabEnabled] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    chrome.storage.local.get('boardbackNewTab', ({ boardbackNewTab }) => {
      setNewTabEnabled(!!boardbackNewTab);
    });
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
        <img src="icon.png" alt="logo" style={{ width: 36, height: 36, borderRadius: 10 }} />
        <div>
          <h1 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#c8f135' }}>BoardBack</h1>
          <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Extension settings</p>
        </div>
      </div>

      <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>New Tab</p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: 14, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#fff' }}>Open BoardBack on new tab</p>
          <p style={{ margin: '3px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Replace the new tab page with your workspace</p>
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
            background: newTabEnabled ? '#c8f135' : 'rgba(255,255,255,0.15)',
            transition: 'background 0.2s',
          }}
        >
          <span style={{
            position: 'absolute',
            top: 3,
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: newTabEnabled ? '#0b0c16' : 'rgba(255,255,255,0.65)',
            left: newTabEnabled ? 21 : 3,
            transition: 'left 0.15s',
          }} />
        </button>
      </div>

      {saved && (
        <p style={{ marginTop: 12, fontSize: 11, color: '#c8f135', textAlign: 'right' }}>Saved</p>
      )}
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<Options />);
