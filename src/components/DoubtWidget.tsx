'use client';

import { useState } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default function DoubtWidget({ questionContext }: { questionContext: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'ai', content: string}[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;
    
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    try {
      const res = await fetch('/api/ai/doubt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: questionContext,
          history: messages,
          message: userMsg
        })
      });
      
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'ai', content: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', content: "I'm having trouble connecting to my brain right now. Try again!" }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: 'var(--accent-primary)',
          color: 'white',
          borderRadius: '50%',
          width: '56px',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 32px var(--accent-glow)',
          border: 'none',
          cursor: 'pointer',
          zIndex: 100,
          transition: 'transform 0.2s',
        }}
        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <Sparkles size={24} />
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      width: '360px',
      height: '500px',
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-default)',
      borderRadius: '16px',
      boxShadow: '0 12px 48px rgba(0,0,0,0.3)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100,
      overflow: 'hidden',
      animation: 'fade-up 0.2s ease-out',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        background: 'var(--bg-elevated)',
        borderBottom: '1px solid var(--border-default)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ background: 'var(--accent-glow)', padding: '6px', borderRadius: '8px', color: 'var(--accent-primary)' }}>
            <Sparkles size={16} />
          </div>
          <span style={{ fontWeight: 600, fontSize: '15px' }}>AI Doubt Solver</span>
        </div>
        <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <X size={18} />
        </button>
      </div>

      {/* Chat History */}
      <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', marginTop: '20px' }}>
            <Sparkles size={24} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
            <p>Stuck on this question? Ask me for a hint, to explain a formula, or to break down the concept!</p>
          </div>
        )}
        
        {messages.map((msg, i) => (
          <div key={i} style={{
            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
            background: msg.role === 'user' ? 'var(--accent-primary)' : 'var(--bg-elevated)',
            color: msg.role === 'user' ? '#fff' : 'var(--text-primary)',
            padding: '10px 14px',
            borderRadius: '12px',
            maxWidth: '85%',
            fontSize: '14px',
            lineHeight: 1.5,
            borderBottomRightRadius: msg.role === 'user' ? '4px' : '12px',
            borderBottomLeftRadius: msg.role === 'ai' ? '4px' : '12px',
          }}>
            {msg.role === 'user' ? msg.content : (
              <div className="prose-math" style={{ color: 'inherit' }}>
                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                  {msg.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div style={{ alignSelf: 'flex-start', background: 'var(--bg-elevated)', padding: '10px 14px', borderRadius: '12px', color: 'var(--text-muted)', fontSize: '13px' }}>
            Thinking...
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ padding: '12px', borderTop: '1px solid var(--border-default)', display: 'flex', gap: '8px' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Ask a question..."
          style={{
            flex: 1,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '20px',
            padding: '8px 16px',
            fontSize: '13px',
            color: 'var(--text-primary)',
            outline: 'none',
          }}
        />
        <button 
          onClick={sendMessage}
          disabled={!input.trim() || isTyping}
          style={{
            background: 'var(--accent-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: (!input.trim() || isTyping) ? 'not-allowed' : 'pointer',
            opacity: (!input.trim() || isTyping) ? 0.5 : 1,
          }}
        >
          <Send size={16} style={{ marginLeft: '-2px' }} />
        </button>
      </div>
    </div>
  );
}
