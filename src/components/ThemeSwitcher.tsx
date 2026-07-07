'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';

const themes = [
  { id: 'nebula', label: 'Nebula', emoji: '🌌', desc: 'Deep dark violet' },
  { id: 'aurora', label: 'Aurora', emoji: '☀️', desc: 'Clean light' },
  { id: 'forest', label: 'Forest', emoji: '🌿', desc: 'Dark green' },
  { id: 'solar',  label: 'Solar',  emoji: '🌅', desc: 'Warm amber' },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!mounted) return <div className="w-8 h-8" />;

  const current = themes.find(t => t.id === theme) ?? themes[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        title="Switch theme"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)',
          borderRadius: 10,
          padding: '6px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          cursor: 'pointer',
          transition: 'all 0.15s',
          color: 'var(--text-secondary)',
          fontSize: 13,
          fontWeight: 500,
        }}
      >
        <span style={{ fontSize: 16 }}>{current.emoji}</span>
        <span className="hidden sm:block">{current.label}</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: 'calc(100% + 8px)',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)',
          borderRadius: 14,
          padding: 6,
          minWidth: 180,
          zIndex: 999,
          boxShadow: '0 16px 48px rgba(0,0,0,0.35)',
          animation: 'fade-up 0.15s ease both',
        }}>
          <div style={{ padding: '4px 10px 8px', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Appearance
          </div>
          {themes.map(t => (
            <button
              key={t.id}
              onClick={() => { setTheme(t.id); setOpen(false); }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 10px',
                borderRadius: 10,
                border: 'none',
                background: theme === t.id ? 'var(--accent-glow)' : 'transparent',
                cursor: 'pointer',
                transition: 'background 0.15s',
                textAlign: 'left',
              }}
              onMouseEnter={e => { if (theme !== t.id) (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-hover)'; }}
              onMouseLeave={e => { if (theme !== t.id) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
            >
              <span style={{ fontSize: 18 }}>{t.emoji}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: theme === t.id ? 'var(--accent-primary)' : 'var(--text-primary)' }}>{t.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.desc}</div>
              </div>
              {theme === t.id && (
                <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-primary)' }} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
