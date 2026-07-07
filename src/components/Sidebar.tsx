'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  Database, 
  BrainCircuit, 
  BookOpenCheck, 
  TrendingUp,
  Settings,
  Calculator,
  Sparkles,
  Zap,
  Users
} from 'lucide-react';

const navGroups = [
  {
    label: 'Main',
    items: [
      { name: 'Dashboard',        href: '/',                  icon: LayoutDashboard },
      { name: 'Daily Practice',   href: '/dpp',               icon: BookOpenCheck },
      { name: 'Mistake Notebook', href: '/revision',          icon: TrendingUp },
    ],
  },
  {
    label: 'Prepare',
    items: [
      { name: 'Study Roadmap',    href: '/roadmap',           icon: MapIcon },
      { name: 'Instant Practice', href: '/practice',          icon: Sparkles },
      { name: 'Math Shortcuts',   href: '/shortcuts',         icon: Calculator },
    ],
  },
  {
    label: 'Admin',
    items: [
      { name: 'Users',            href: '/admin/users',       icon: Users },
      { name: 'Import PYQs',      href: '/import',            icon: Database },
      { name: 'AI Auto-Tagging',  href: '/admin/tagging',     icon: BrainCircuit },
      { name: 'Syllabus Taxonomy',href: '/admin/topics',      icon: Settings },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserEmail(user.email ?? null);
        if (user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
          setIsAdmin(true);
        }
      }
    });
  }, [supabase.auth]);

  const filteredNavGroups = navGroups.filter(group => group.label !== 'Admin' || isAdmin);

  return (
    <div style={{
      width: 'var(--sidebar-width, 248px)',
      minWidth: 'var(--sidebar-width, 248px)',
      height: '100vh',
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      padding: '0',
      overflowY: 'auto',
      transition: 'background 0.4s, border-color 0.4s',
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 20px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: 'var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px var(--accent-glow)',
            flexShrink: 0,
          }}>
            <Zap size={18} color="#fff" fill="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              NIMCET
            </div>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--accent-primary)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              AI Prep
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--border-subtle)', margin: '0 12px 12px' }} />

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '0 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {filteredNavGroups.map(group => (
          <div key={group.label} style={{ marginBottom: 6 }}>
            <div className="section-label" style={{ paddingLeft: 10 }}>{group.label}</div>
            {group.items.map(item => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 9,
                    padding: '8px 10px',
                    borderRadius: 9,
                    fontSize: 13.5,
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    background: isActive ? 'var(--accent-glow)' : 'transparent',
                    border: `1px solid ${isActive ? 'rgba(124,107,255,0.15)' : 'transparent'}`,
                    textDecoration: 'none',
                    transition: 'all 0.15s',
                    position: 'relative',
                  }}
                  onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--bg-hover)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-primary)'; } }}
                  onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary)'; } }}
                >
                  {isActive && (
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 3,
                      height: 18,
                      borderRadius: 2,
                      background: 'var(--accent-primary)',
                    }} />
                  )}
                  <item.icon size={15} style={{ flexShrink: 0 }} />
                  <span style={{ flex: 1 }}>{item.name}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer / User Card */}
      <div style={{ padding: 12 }}>
        <Link href="/account" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 12,
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}>
            <div style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 700,
              color: '#fff',
              flexShrink: 0,
            }}>
              {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {userEmail ? userEmail.split('@')[0] : 'User'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>NIMCET 2027</div>
            </div>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent-success)', boxShadow: '0 0 0 2px var(--bg-elevated)' }} />
          </div>
        </Link>
      </div>
    </div>
  );
}
