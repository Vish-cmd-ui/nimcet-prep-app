'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Calendar, Play, CheckCircle2, Flame, ArrowRight } from 'lucide-react';

export default function DPPPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [attendance, setAttendance] = useState<any[]>([]);
  const [todayRecord, setTodayRecord] = useState<any>(null);
  const todayDate = new Date().toISOString().split('T')[0];

  useEffect(() => {
    async function loadAttendance() {
      const supabase = createClient();
      const { data } = await supabase
        .from('daily_attendance')
        .select('*')
        .order('date', { ascending: false })
        .limit(30);
      if (data) {
        setAttendance(data);
        setTodayRecord(data.find(r => r.date === todayDate));
      }
    }
    loadAttendance();
  }, [todayDate]);

  const handleStart = async () => {
    setIsLoading(true);
    setStatus('Curating your questions…');
    try {
      const res = await fetch('/api/generate-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'dpp' }),
      });
      const data = await res.json();
      if (!res.ok) { setStatus(`Error: ${data.error}`); setIsLoading(false); }
      else router.push(`/dpp/take/${data.testId}`);
    } catch (err: any) {
      setStatus(`Error: ${err.message}`);
      setIsLoading(false);
    }
  };

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  // Calculate current streak
  const streak = attendance.filter((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return attendance.some(a => a.date === d.toISOString().split('T')[0]);
  }).length;

  return (
    <div style={{ padding: 28, paddingBottom: 60, maxWidth: 900, margin: '0 auto' }}>

      {/* Hero Header */}
      <div className="animate-fade-up" style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Calendar size={14} style={{ color: 'var(--accent-primary)' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-primary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Daily Practice
            </span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.03em' }}>
            Stay Consistent, Ace NIMCET
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '4px 0 0', lineHeight: 1.6 }}>
            Minimum 20 adaptive questions · No time limits · AI-powered feedback
          </p>
        </div>

        {/* Streak Counter */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 16,
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexShrink: 0,
        }}>
          <div style={{
            width: 40, height: 40,
            borderRadius: 12,
            background: `${attendance.length > 0 ? 'var(--accent-secondary)' : 'var(--bg-elevated)'}25`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Flame size={20} style={{ color: attendance.length > 0 ? 'var(--accent-secondary)' : 'var(--text-muted)' }} />
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.04em', lineHeight: 1 }}>
              {attendance.length}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Day Streak
            </div>
          </div>
        </div>
      </div>

      {/* 7-Day Calendar */}
      <div className="animate-fade-up animate-fade-up-delay-1" style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 16,
        padding: 24,
        marginBottom: 20,
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>
          This Week's Attendance
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10 }}>
          {last7Days.map(dateStr => {
            const done = attendance.some(a => a.date === dateStr);
            const isToday = dateStr === todayDate;
            const day = new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' });
            const num = new Date(dateStr + 'T00:00:00').getDate();

            return (
              <div key={dateStr} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 6, padding: '12px 6px', borderRadius: 12,
                background: done
                  ? 'rgba(16,185,129,0.08)'
                  : isToday ? 'var(--accent-glow)' : 'var(--bg-elevated)',
                border: `1px solid ${done ? 'rgba(16,185,129,0.2)' : isToday ? 'rgba(124,107,255,0.25)' : 'var(--border-subtle)'}`,
                transition: 'all 0.2s',
              }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{day}</span>
                <span style={{
                  fontSize: 18, fontWeight: 800, letterSpacing: '-0.04em',
                  color: done ? 'var(--accent-success)' : isToday ? 'var(--accent-primary)' : 'var(--text-muted)',
                }}>{num}</span>
                {done
                  ? <CheckCircle2 size={16} style={{ color: 'var(--accent-success)' }} />
                  : isToday
                    ? <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px dashed var(--accent-primary)', animation: 'spin 4s linear infinite' }} />
                    : <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--border-default)' }} />
                }
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA / Completion Card */}
      <div className="animate-fade-up animate-fade-up-delay-2">
        {todayRecord ? (
          /* Already done today */
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid rgba(16,185,129,0.25)',
            borderRadius: 16,
            padding: 32,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}>
            <div style={{
              width: 60, height: 60, borderRadius: 18,
              background: 'rgba(16,185,129,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 14,
            }}>
              <CheckCircle2 size={28} style={{ color: 'var(--accent-success)' }} />
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 6 }}>
              Today's practice complete! 🎉
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 16px', lineHeight: 1.6, maxWidth: 400 }}>
              You scored <strong style={{ color: 'var(--text-primary)' }}>{todayRecord.score} / {todayRecord.max_score}</strong>. 
              Come back tomorrow to keep your streak alive.
            </p>
            <button
              onClick={() => router.push('/revision')}
              className="btn-ghost"
            >
              Review Mistakes <ArrowRight size={14} />
            </button>
          </div>
        ) : (
          /* Ready to start */
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 16,
            padding: 32,
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}>
            {/* Background glow */}
            <div style={{
              position: 'absolute', top: -60, left: '50%',
              transform: 'translateX(-50%)',
              width: 400, height: 200,
              borderRadius: '50%',
              background: 'var(--accent-glow)',
              filter: 'blur(60px)',
              pointerEvents: 'none',
              opacity: 0.6,
            }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{
                width: 60, height: 60, borderRadius: 18,
                background: 'var(--accent-glow)',
                border: '1px solid rgba(124,107,255,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 14px',
              }}>
                <Play size={24} style={{ color: 'var(--accent-primary)' }} fill="var(--accent-primary)" />
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 6 }}>
                Ready to practice?
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 20px', lineHeight: 1.6, maxWidth: 380 }}>
                The AI will curate 20 fresh NIMCET-style questions. No time limits, practice at your own pace.
              </p>
              <button
                onClick={handleStart}
                disabled={isLoading}
                className="btn-accent"
                style={{ fontSize: 15, padding: '13px 28px' }}
              >
                {isLoading ? (
                  <>
                    <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                    {status}
                  </>
                ) : (
                  <>
                    <Play size={17} fill="currentColor" />
                    Start Today's Test
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
