'use client';

import { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Trash2 } from 'lucide-react';

type Message = { role: 'user' | 'model'; content: string };

export default function AITutorWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('nimcet_ai_tutor_chat');
    if (saved) { try { setMessages(JSON.parse(saved)); } catch {} }
  }, []);

  useEffect(() => {
    if (messages.length > 0) localStorage.setItem('nimcet_ai_tutor_chat', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const clearChat = () => { setMessages([]); localStorage.removeItem('nimcet_ai_tutor_chat'); };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      });
      if (!res.ok || !res.body) throw new Error('Failed');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false; let content = '';
      setMessages(prev => [...prev, { role: 'model', content: '' }]);
      while (!done) {
        const { value, done: d } = await reader.read();
        done = d;
        content += decoder.decode(value);
        setMessages(prev => { const u = [...prev]; u[u.length - 1].content = content; return u; });
      }
    } catch {
      setMessages(prev => [...prev, { role: 'model', content: 'Oops, something went wrong. Try again!' }]);
    } finally { setIsLoading(false); }
  };

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
      {isOpen && (
        <div style={{
          width: 360,
          height: 520,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 20,
          boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fade-up 0.2s ease both',
        }}>
          {/* Header */}
          <div style={{
            padding: '14px 16px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'var(--bg-elevated)',
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: 'var(--accent-glow)',
              border: '1px solid rgba(124,107,255,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Bot size={16} style={{ color: 'var(--accent-primary)' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>AI Tutor</div>
              <div style={{ fontSize: 11, color: 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent-success)' }} />
                Online
              </div>
            </div>
            <button onClick={clearChat} title="Clear" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, borderRadius: 6 }}>
              <Trash2 size={14} />
            </button>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, borderRadius: 6 }}>
              <X size={14} />
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', marginTop: 40 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 16,
                  background: 'var(--accent-glow)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 12px',
                }}>
                  <Bot size={24} style={{ color: 'var(--accent-primary)' }} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Hi, I'm your NIMCET Tutor!</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  Ask me about any math concept, trick or problem. I'll help you understand and master it.
                </div>

                {/* Quick prompts */}
                {['Explain permutations', 'Solve: 2x + 3 = 11', 'What is P & NP?'].map(q => (
                  <button key={q} onClick={() => { setInput(q); }}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                      borderRadius: 8, padding: '8px 12px', marginTop: 8,
                      fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-hover)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-elevated)'; }}
                  >
                    {q} →
                  </button>
                ))}
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                {m.role === 'model' && (
                  <div style={{
                    width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                    background: 'var(--accent-glow)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    alignSelf: 'flex-end',
                  }}>
                    <Bot size={13} style={{ color: 'var(--accent-primary)' }} />
                  </div>
                )}
                <div style={{
                  maxWidth: '80%',
                  padding: '9px 13px',
                  borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  background: m.role === 'user' ? 'var(--accent-primary)' : 'var(--bg-elevated)',
                  color: m.role === 'user' ? '#fff' : 'var(--text-primary)',
                  fontSize: 13,
                  lineHeight: 1.6,
                  border: m.role === 'user' ? 'none' : '1px solid var(--border-subtle)',
                }}>
                  {m.content || (
                    <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      <span style={{ width: 5, height: 5, background: 'var(--text-muted)', borderRadius: '50%', animation: 'pulse 1s ease infinite' }} />
                      <span style={{ width: 5, height: 5, background: 'var(--text-muted)', borderRadius: '50%', animation: 'pulse 1s ease 0.2s infinite' }} />
                      <span style={{ width: 5, height: 5, background: 'var(--text-muted)', borderRadius: '50%', animation: 'pulse 1s ease 0.4s infinite' }} />
                    </span>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: 8 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Ask a doubt…"
              className="input-field"
              style={{ flex: 1, padding: '9px 12px', borderRadius: 10 }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="btn-accent"
              style={{ padding: '9px 13px', borderRadius: 10, flexShrink: 0 }}
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setIsOpen(v => !v)}
        className="btn-accent"
        style={{
          width: 52, height: 52,
          borderRadius: 16,
          padding: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 0,
          boxShadow: '0 8px 24px var(--accent-glow)',
        }}
      >
        {isOpen ? <X size={20} /> : <Bot size={22} />}
      </button>

      <style>{`@keyframes pulse { 0%,100%{opacity:0.4;transform:scale(1)} 50%{opacity:1;transform:scale(1.2)} }`}</style>
    </div>
  );
}
