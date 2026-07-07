import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Database, BrainCircuit, Zap, ArrowRight, TrendingUp, Target, Map, BookOpenCheck, Flame } from 'lucide-react';

export default async function Home() {
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return <div>Please log in</div>;
  }

  const { count: questionsCount } = await supabase.from('questions').select('*', { count: 'exact', head: true });
  const { count: generatedCount } = await supabase.from('questions').select('*', { count: 'exact', head: true }).eq('source', 'generated');
  const { count: attendanceCount } = await supabase.from('daily_attendance').select('*', { count: 'exact', head: true }).eq('user_id', user.id);

  const stats = [
    { label: 'Total Questions', value: questionsCount ?? 0, icon: Database,    color: 'var(--accent-primary)',   sub: 'In database' },
    { label: 'AI Generated',    value: generatedCount ?? 0, icon: Zap,         color: 'var(--accent-secondary)', sub: 'Adaptive & fresh' },
    { label: 'Total Attendance',value: attendanceCount ?? 0,icon: Target,      color: 'var(--accent-success)',   sub: 'Days studied' },
  ];

  const quickActions = [
    { label: 'Daily Practice',   sub: "Start today's DPP test",     icon: BookOpenCheck, href: '/dpp',      accent: 'var(--accent-primary)' },
    { label: 'Study Roadmap',    sub: 'Track your progress',         icon: Map,           href: '/roadmap',  accent: 'var(--accent-success)' },
    { label: 'Mistake Notebook', sub: 'Review & reinforce',          icon: TrendingUp,    href: '/revision', accent: 'var(--accent-secondary)' },
    { label: 'AI Practice',      sub: 'Topic-based instant test',    icon: Zap,           href: '/practice', accent: 'var(--accent-primary)' },
  ];

  // Fetch recent attempts to calculate accuracy trend
  const { data: attempts } = await supabase.from('attempts')
    .select('is_correct')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(120); // Get up to last 120 questions to group into 12 bars

  let accuracyBars = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  let overallAccuracy = 0;
  
  if (attempts && attempts.length > 0) {
    const totalCorrect = attempts.filter(a => a.is_correct).length;
    overallAccuracy = Math.round((totalCorrect / attempts.length) * 100);
    
    // Group into up to 12 buckets
    const bucketSize = Math.max(1, Math.ceil(attempts.length / 12));
    const reversedAttempts = [...attempts].reverse(); // oldest first for the chart
    
    const buckets = [];
    for (let i = 0; i < reversedAttempts.length; i += bucketSize) {
      const chunk = reversedAttempts.slice(i, i + bucketSize);
      const correct = chunk.filter(a => a.is_correct).length;
      buckets.push(Math.round((correct / chunk.length) * 100));
    }
    
    // Pad with zeros at the beginning if less than 12 buckets
    while (buckets.length < 12) {
      buckets.unshift(0);
    }
    // Trim if somehow more than 12
    accuracyBars = buckets.slice(-12);
  } else {
    // Show placeholder if no data
    accuracyBars = [40, 55, 45, 62, 78, 68, 82, 87, 91, 84, 90, 95];
  }

  return (
    <div style={{ padding: 28, paddingBottom: 60, maxWidth: 1200, margin: '0 auto' }}>

      {/* Header Row */}
      <div className="animate-fade-up" style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-success)', boxShadow: '0 0 0 3px rgba(16,185,129,0.2)' }} className="pulse-ring" />
          <span style={{ fontSize: 12, color: 'var(--accent-success)', fontWeight: 600, letterSpacing: '0.05em' }}>
            NIMCET 2027 · On Track
          </span>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.03em' }}>
          Welcome back, Vishwas 👋
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '4px 0 0' }}>
          Here's your prep overview for today. Keep the momentum going!
        </p>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={`stat-card animate-fade-up animate-fade-up-delay-${i + 1}`}
          >
            {/* Glow blob */}
            <div style={{
              position: 'absolute', width: 120, height: 120,
              borderRadius: '50%',
              background: s.color,
              opacity: 0.08,
              filter: 'blur(30px)',
              top: -30, right: -30,
              pointerEvents: 'none',
            }} />

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: `${s.color}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <s.icon size={18} style={{ color: s.color }} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {s.label}
              </span>
            </div>

            <div className="stat-number">{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>

        {/* LEFT: Accuracy Chart */}
        <div className="animate-fade-up animate-fade-up-delay-2" style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 16,
          padding: 24,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Accuracy Trend</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Last 12 practice sessions</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, background: 'var(--accent-glow)', border: '1px solid rgba(124,107,255,0.2)' }}>
              <TrendingUp size={13} style={{ color: 'var(--accent-primary)' }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-primary)' }}>{attempts && attempts.length > 0 ? `${overallAccuracy}% overall` : 'Start practicing!'}</span>
            </div>
          </div>

          {/* Chart */}
          <div style={{ height: 160, display: 'flex', alignItems: 'flex-end', gap: 8, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 0 }}>
            {accuracyBars.map((h, i) => (
              <div key={i} style={{ flex: 1, position: 'relative', height: '100%', display: 'flex', alignItems: 'flex-end' }}>
                <div
                  className="chart-bar"
                  style={{
                    width: '100%',
                    height: `${h}%`,
                    borderRadius: '4px 4px 0 0',
                    background: i === accuracyBars.length - 1
                      ? 'var(--accent-primary)'
                      : `linear-gradient(to top, var(--accent-glow), color-mix(in oklch, var(--accent-primary) 60%, transparent))`,
                    opacity: i === accuracyBars.length - 1 ? 1 : 0.6,
                    transition: 'opacity 0.2s, transform 0.2s',
                  }}
                />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>
            <span>Session 1</span>
            <span>Today</span>
          </div>

          {/* Weak spots placeholder */}
          <div style={{ marginTop: 20, padding: '14px 16px', background: 'var(--bg-elevated)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Target size={14} style={{ color: 'var(--accent-secondary)' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>AI Weak Spot Analysis</span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
              Complete 5+ tests for the AI to detect your weak topics and auto-schedule reinforcement sessions.
            </p>
            <Link href="/dpp" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              marginTop: 10, fontSize: 12, fontWeight: 600,
              color: 'var(--accent-primary)', textDecoration: 'none',
            }}>
              Start first test <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        {/* RIGHT: Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Today's goal card */}
          <div className="animate-fade-up animate-fade-up-delay-2 mesh-bg" style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 16,
            padding: 20,
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Flame size={16} style={{ color: 'var(--accent-secondary)' }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Today's Goal</span>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 4 }}>
                Daily Practice
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 16px', lineHeight: 1.6 }}>
                Daily AI Practice · 15 mins · NIMCET-level
              </p>
              <Link href="/dpp" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: 'var(--accent-primary)',
                color: '#fff',
                borderRadius: 10,
                padding: '10px 16px',
                fontSize: 13, fontWeight: 600,
                textDecoration: 'none',
                boxShadow: '0 4px 16px var(--accent-glow)',
                transition: 'opacity 0.2s, transform 0.2s',
              }}>
                Start Now <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="animate-fade-up animate-fade-up-delay-3" style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 16,
            padding: '16px 16px 8px',
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
              Quick Access
            </div>
            {quickActions.slice(1).map(action => (
              <Link
                key={action.href}
                href={action.href}
                className="quick-link"
                style={{ marginBottom: 2 }}
              >
                <div style={{
                  width: 34, height: 34, borderRadius: 9,
                  background: `${action.accent}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <action.icon size={15} style={{ color: action.accent }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{action.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{action.sub}</div>
                </div>
                <ArrowRight size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
