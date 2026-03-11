'use client';

import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

const OfflineBanner = () => {
  const [isOffline, setIsOffline] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleOffline = () => {
      setIsOffline(true);
      setVisible(true);
    };
    const handleOnline = () => {
      // Keep the banner visible briefly so the user sees it went back online
      setIsOffline(false);
      setTimeout(() => setVisible(false), 2000);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 18px',
        borderRadius: 14,
        background: isOffline ? 'rgba(30, 20, 10, 0.92)' : 'rgba(10, 30, 10, 0.92)',
        border: isOffline
          ? '1px solid rgba(245, 158, 11, 0.4)'
          : '1px solid rgba(50, 212, 161, 0.4)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: isOffline
          ? '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(245,158,11,0.1)'
          : '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(50,212,161,0.1)',
        transition: 'all 0.3s ease',
        pointerEvents: 'none',
      }}
    >
      <WifiOff
        size={14}
        style={{ color: isOffline ? '#f59e0b' : '#32d4a1', flexShrink: 0 }}
      />
      <span
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: isOffline ? '#f59e0b' : '#32d4a1',
          letterSpacing: '0.01em',
          whiteSpace: 'nowrap',
        }}
      >
        {isOffline ? 'You\'re offline — changes are saved locally' : 'Back online'}
      </span>
    </div>
  );
};

export default OfflineBanner;
