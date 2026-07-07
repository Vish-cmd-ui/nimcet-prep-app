import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { ArrowLeft, Search, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams?.q || '';
  const supabase = await createClient();

  let questions = [];
  
  if (query.trim()) {
    // Basic text search on the 'text' column
    const { data } = await supabase
      .from('questions')
      .select('id, text, options, correct_option, source, topics(name)')
      .ilike('text', `%${query}%`)
      .limit(20);
      
    if (data) questions = data;
  }

  return (
    <div style={{ padding: '28px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <Link href="/" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
          <ArrowLeft size={20} />
        </Link>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          Search Results
        </h1>
      </div>

      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
          <Search size={16} />
          <span style={{ fontSize: '15px' }}>
            Showing results for <strong>"{query}"</strong>
          </span>
        </div>
      </div>

      {query && questions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <FileText size={48} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
          <p>No questions found matching your search.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {questions.map((q) => (
            <div key={q.id} style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <div style={{ 
                display: 'flex', 
                gap: '8px', 
                marginBottom: '12px',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--accent-primary)'
              }}>
                <span style={{ background: 'var(--accent-glow)', padding: '4px 10px', borderRadius: '12px' }}>
                  {q.topics?.name || 'Uncategorized'}
                </span>
                <span style={{ background: 'var(--bg-elevated)', padding: '4px 10px', borderRadius: '12px', color: 'var(--text-secondary)' }}>
                  {q.source}
                </span>
              </div>
              
              <div className="prose-math" style={{ color: 'var(--text-primary)', fontSize: '15px', lineHeight: 1.6, marginBottom: '16px' }}>
                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                  {q.text}
                </ReactMarkdown>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {(q.options as string[]).map((opt, i) => (
                  <div key={i} style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    background: i === q.correct_option ? 'var(--accent-glow)' : 'var(--bg-elevated)',
                    borderColor: i === q.correct_option ? 'var(--accent-primary)' : 'var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                  }}>
                    <span style={{ 
                      fontSize: '12px', 
                      fontWeight: 600, 
                      color: i === q.correct_option ? 'var(--accent-primary)' : 'var(--text-muted)' 
                    }}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <div className="prose-math" style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                        {opt}
                      </ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
