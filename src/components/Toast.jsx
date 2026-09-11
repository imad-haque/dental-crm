import { useState, useEffect, useCallback } from 'react';
import { IconX } from './Icons';

// ── Toast context & hook ──────────────────────
import { createContext, useContext } from 'react';

const ToastContext = createContext(null);

export function useToast() {
  return useContext(ToastContext);
}

let _id = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((message, type = 'success', duration = 3500) => {
    const id = ++_id;
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), duration);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts(t => t.filter(x => x.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          zIndex: 999,
          pointerEvents: 'none',
        }}
        aria-live="polite"
        aria-label="Notifications"
      >
        {toasts.map(t => (
          <div
            key={t.id}
            style={{
              pointerEvents: 'all',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: t.type === 'error' ? '#171717' : t.type === 'warning' ? '#f5a623' : '#171717',
              color: '#ffffff',
              padding: '10px 14px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              fontFamily: 'var(--font-sans)',
              boxShadow: '0px 4px 16px rgba(0,0,0,0.18)',
              minWidth: 240,
              maxWidth: 360,
              animation: 'slideUp 0.2s ease',
            }}
          >
            <span style={{ flex: 1 }}>
              {t.type === 'success' && '✓  '}
              {t.type === 'error' && '✕  '}
              {t.type === 'info' && 'ℹ  '}
              {t.message}
            </span>
            <button
              onClick={() => dismiss(t.id)}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
              aria-label="Dismiss"
            >
              <IconX size={12} />
            </button>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}
