import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Bot, User, Loader2 } from 'lucide-react';

const AiAssistant = ({ data }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi there! I am the Datawiser AI Assistant. I have analyzed your spreadsheet layout. What would you like to know about your data?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    try {
      const payload = {
        messages: newMessages,
        context: {
          stats: data.stats,
          columns: data.columns,
          preview: data.preview
        }
      };

      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok) {
        setMessages([...newMessages, { role: 'assistant', content: result.reply }]);
      } else {
        setMessages([...newMessages, { role: 'assistant', content: `🚨 Error: ${result.error}` }]);
      }
    } catch (error) {
      setMessages([...newMessages, { role: 'assistant', content: `🚨 Connection failed: ${error.message}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="table-wrapper" style={{ display: 'flex', flexDirection: 'column', height: '600px' }}>
      <div className="table-header">
        <div>
          <h3>Datawiser AI Assistant</h3>
          <p style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>Ask natural language questions to analyze and explore your spreadsheet.</p>
        </div>
      </div>

      <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--bg-color)' }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ 
            display: 'flex', 
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            gap: '0.75rem' 
          }}>
            {msg.role === 'assistant' && (
              <div style={{ background: 'var(--bg-surface-hover)', padding: '0.5rem', borderRadius: '50%', height: '36px', width: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={18} color="var(--accent-secondary)" />
              </div>
            )}
            
            <div style={{
              maxWidth: '75%',
              padding: '1rem 1.25rem',
              borderRadius: '16px',
              backgroundColor: msg.role === 'user' ? 'var(--accent-primary)' : 'var(--bg-surface)',
              color: msg.role === 'user' ? '#fff' : 'var(--text-main)',
              boxShadow: 'var(--shadow-sm)',
              border: msg.role === 'user' ? 'none' : '1px solid var(--border-color)',
              lineHeight: '1.6'
            }}>
              {msg.role === 'user' ? (
                <div style={{whiteSpace: 'pre-wrap'}}>{msg.content}</div>
              ) : (
                <div className="markdown-body">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div style={{ background: 'var(--bg-surface-hover)', padding: '0.5rem', borderRadius: '50%', height: '36px', width: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={18} color="var(--text-muted)" />
              </div>
            )}
          </div>
        ))}
        
        {isTyping && (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ background: 'var(--bg-surface-hover)', padding: '0.5rem', borderRadius: '50%', height: '36px', width: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={18} color="var(--accent-secondary)" />
            </div>
            <div style={{
              padding: '1rem 1.25rem',
              borderRadius: '16px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--text-muted)'
            }}>
              <Loader2 className="spinner" style={{width: '16px', height: '16px', border: 'none', margin: 0, color: 'var(--accent-secondary)'}} />
              Analyzing your data...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', background: 'var(--bg-surface)', display: 'flex', gap: '0.5rem' }}>
        <textarea
          style={{
            flex: 1,
            background: 'var(--bg-color)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '0.75rem 1rem',
            color: 'var(--text-main)',
            fontFamily: 'inherit',
            fontSize: '0.95rem',
            resize: 'none',
            outline: 'none'
          }}
          rows={1}
          placeholder="Ask a question about this spreadsheet..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button 
          className="btn-primary" 
          style={{ padding: '0 1.25rem', height: '100%', alignSelf: 'stretch', borderRadius: '12px' }}
          onClick={handleSend}
          disabled={!input.trim() || isTyping}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default AiAssistant;
