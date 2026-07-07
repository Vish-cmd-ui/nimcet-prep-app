'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Bell, Search } from 'lucide-react';
import { ThemeSwitcher } from './ThemeSwitcher';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const title = pathname === '/'
    ? 'Dashboard'
    : pathname.split('/').filter(Boolean).pop()
        ?.replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase())
      || 'NIMCET Prep';

  const breadcrumbs = pathname.split('/').filter(Boolean);

  return (
    <header style={{
      height: 56,
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 20px',
      gap: 16,
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      {/* Breadcrumb / Title */}
      <div style={{ flex: 1 }}>
        {breadcrumbs.length > 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
            <span>Home</span>
            {breadcrumbs.map((crumb, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ opacity: 0.4 }}>/</span>
                <span style={{
                  color: i === breadcrumbs.length - 1 ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontWeight: i === breadcrumbs.length - 1 ? 600 : 400,
                  textTransform: 'capitalize',
                }}>
                  {crumb.replace(/-/g, ' ')}
                </span>
              </span>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Overview</div>
        )}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <Search size={14} style={{ position: 'absolute', left: 10, color: 'var(--text-muted)', pointerEvents: 'none' }} />
        <input
          placeholder="Search topics, questions…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearch}
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 8,
            padding: '6px 12px 6px 30px',
            fontSize: 13,
            color: 'var(--text-primary)',
            outline: 'none',
            width: 220,
            fontFamily: 'inherit',
          }}
          onFocus={e => { e.target.style.borderColor = 'var(--accent-primary)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-glow)'; }}
          onBlur={e => { e.target.style.borderColor = 'var(--border-default)'; e.target.style.boxShadow = 'none'; }}
        />
        <kbd style={{
          position: 'absolute', right: 8,
          fontSize: 10, color: 'var(--text-muted)',
          background: 'var(--bg-hover)',
          border: '1px solid var(--border-default)',
          borderRadius: 4,
          padding: '2px 5px',
          fontFamily: 'inherit',
        }}>
          ⌘K
        </kbd>
      </div>

      {/* Theme Switcher */}
      <ThemeSwitcher />

      {/* Notifications */}
      <button style={{
        position: 'relative',
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-default)',
        borderRadius: 8,
        padding: 7,
        cursor: 'pointer',
        color: 'var(--text-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.15s',
      }}>
        <Bell size={15} />
        <div style={{
          position: 'absolute',
          top: 6,
          right: 6,
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: 'var(--accent-danger)',
          border: '1.5px solid var(--bg-surface)',
        }} />
      </button>
    </header>
  );
}
