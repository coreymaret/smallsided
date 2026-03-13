// src/components/ChatWidget/ChatWidget.tsx
import { useState, useEffect, useRef } from 'react';
import { X } from '../Icons/Icons';
import styles from './ChatWidget.module.scss';

interface Message {
  role: 'user' | 'assistant' | 'admin';
  content: string;
  ts: number;
}

const SESSION_KEY = 'ss_chat_session';

const getOrCreateSession = (): string => {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
};

const KNOWLEDGE_BASE = `You are the friendly virtual assistant for Small Sided, an indoor soccer facility in Tampa, Florida.
You help customers with questions about:
- Field rentals (3 fields: Camp Nou, Old Trafford, San Siro — operating hours 10am to midnight)
- Pickup games (drop-in soccer, various formats)
- Birthday parties (party packages for kids)
- Youth soccer camps
- League registrations (adult and youth)
- Personal training sessions

Keep answers concise and friendly. If you cannot answer something, offer to connect them with staff.
Always encourage customers to book online at smallsided.com or call/visit during business hours.
Do not make up prices or availability — direct them to the website for current pricing.`;

const ChatWidget = () => {
  const [isOpen, setIsOpen]                 = useState(false);
  const [messages, setMessages]             = useState<Message[]>([]);
  const [input, setInput]                   = useState('');
  const [isSending, setIsSending]           = useState(false);
  const [sessionId]                         = useState(getOrCreateSession);
  const [convId, setConvId]                 = useState<string | null>(null);
  const [hasUnread, setHasUnread]           = useState(false);
  const [email, setEmail]                   = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const bottomRef                           = useRef<HTMLDivElement>(null);
  const inputRef                            = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen) setHasUnread(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const saveConversation = async (msgs: Message[]) => {
    try {
      const { supabase } = await import('../../lib/supabase');
      if (convId) {
        await (supabase as any).from('chat_conversations').update({
          messages: msgs,
          updated_at: new Date().toISOString(),
        }).eq('id', convId);
      } else {
        const { data } = await (supabase as any).from('chat_conversations').insert({
          session_id:     sessionId,
          messages:       msgs,
          customer_email: email || null,
          status:         'bot',
        }).select('id').single();
        if (data?.id) setConvId(data.id);
      }
    } catch (err) {
      console.error('Failed to save conversation:', err);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isSending) return;

    const userMsg: Message = { role: 'user', content: input.trim(), ts: Date.now() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsSending(true);

    try {
      // Call Netlify function — API key stays server-side
      const response = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: KNOWLEDGE_BASE,
          messages: newMessages
            .filter(m => m.role !== 'admin')
            .map(m => ({
              role:    m.role === 'assistant' ? 'assistant' : 'user',
              content: m.content,
            })),
        }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      const reply = data.content?.[0]?.text
        ?? "I'm sorry, I couldn't process that. Please try again or contact us directly.";

      const assistantMsg: Message = { role: 'assistant', content: reply, ts: Date.now() };
      const finalMessages = [...newMessages, assistantMsg];
      setMessages(finalMessages);
      await saveConversation(finalMessages);

      if (!isOpen) setHasUnread(true);
    } catch (err) {
      console.error('Chat error:', err);
      const errMsg: Message = {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please call us or visit the website for immediate help.",
        ts: Date.now(),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const handleEmailSubmit = async () => {
    if (!email.trim()) return;
    setEmailSubmitted(true);
    if (convId) {
      try {
        const { supabase } = await import('../../lib/supabase');
        await (supabase as any).from('chat_conversations')
          .update({ customer_email: email, updated_at: new Date().toISOString() })
          .eq('id', convId);
      } catch (err) {
        console.error('Failed to save email:', err);
      }
    }
  };

  return (
    <>
      {/* Floating bubble */}
      <button
        className={`${styles.bubble} ${isOpen ? styles.bubbleOpen : ''}`}
        onClick={() => setIsOpen(o => !o)}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? <X size={22} /> : (
          <>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="white" />
            </svg>
            {hasUnread && <span className={styles.unreadDot} />}
          </>
        )}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className={styles.window}>
          <div className={styles.windowHeader}>
            <div className={styles.windowAvatar}>⚽</div>
            <div>
              <div className={styles.windowTitle}>Small Sided</div>
              <div className={styles.windowSub}>
                <span className={styles.onlineDot} />
                Chat with us
              </div>
            </div>
            <button className={styles.windowClose} onClick={() => setIsOpen(false)}>
              <X size={18} />
            </button>
          </div>

          <div className={styles.windowMessages}>
            {/* Greeting */}
            {messages.length === 0 && (
              <div className={styles.botMsg}>
                <div className={styles.botBubble}>
                  👋 Hi there! I'm the Small Sided assistant. Ask me anything about our fields, pickup games, camps, or birthday parties!
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={msg.role === 'user' ? styles.userMsg : styles.botMsg}>
                <div className={msg.role === 'user' ? styles.userBubble : styles.botBubble}>
                  {msg.role === 'admin' && <span className={styles.adminLabel}>Staff: </span>}
                  {msg.content}
                </div>
              </div>
            ))}

            {isSending && (
              <div className={styles.botMsg}>
                <div className={styles.typingBubble}>
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Email capture after 2 exchanges */}
          {messages.length >= 2 && !emailSubmitted && (
            <div className={styles.emailCapture}>
              <input
                type="email"
                placeholder="Your email for follow-up (optional)"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={styles.emailInput}
                onKeyDown={e => e.key === 'Enter' && handleEmailSubmit()}
              />
              <button className={styles.emailBtn} onClick={handleEmailSubmit}>Save</button>
            </div>
          )}

          <div className={styles.windowInput}>
            <input
              ref={inputRef}
              className={styles.messageInput}
              placeholder="Type a message…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              disabled={isSending}
            />
            <button
              className={styles.sendBtn}
              onClick={sendMessage}
              disabled={isSending || !input.trim()}
              aria-label="Send"
            >
              →
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
