// src/components/admin/AdminChat.tsx
import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAdmin } from '../../contexts/AdminContext';
import { X, User, Check } from '../../components/Icons/Icons';
import ToastContainer from '../Toast/ToastContainer';
import { useToast } from '../../hooks/useToast';
import styles from './AdminChat.module.scss';

// ─── Types ────────────────────────────────────────────────────────────────────

type ConvStatus = 'bot' | 'human' | 'closed';

interface Message {
  role: 'user' | 'assistant' | 'admin';
  content: string;
  ts: number;
}

interface Conversation {
  id: string;
  session_id: string;
  messages: Message[];
  customer_email: string | null;
  status: ConvStatus;
  taken_over_by: string | null;
  taken_over_at: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtTime = (ts: number) =>
  new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

const STATUS_CONFIG: Record<ConvStatus, { label: string; bg: string; color: string }> = {
  bot:    { label: 'Bot',    bg: '#eff6ff', color: '#1d4ed8' },
  human:  { label: 'Human', bg: '#f0fdf4', color: '#166534' },
  closed: { label: 'Closed', bg: '#f3f4f6', color: '#6b7280' },
};

// ─── Conversation detail panel ────────────────────────────────────────────────

interface ConvPanelProps {
  conv: Conversation;
  adminName: string;
  adminId: string;
  onUpdate: () => void;
  showToast: (msg: string, type?: any) => void;
}

const ConvPanel = ({ conv, adminName, adminId, onUpdate, showToast }: ConvPanelProps) => {
  const [reply, setReply]       = useState('');
  const [isSending, setIsSending] = useState(false);
  const bottomRef               = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conv.messages]);

  const handleTakeOver = async () => {
    const { error } = await (supabase as any).from('chat_conversations').update({
      status: 'human',
      taken_over_by: adminId,
      taken_over_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq('id', conv.id);
    if (error) { showToast('Failed to take over.', 'error'); return; }
    showToast('You are now handling this conversation.', 'success');
    onUpdate();
  };

  const handleClose = async () => {
    const { error } = await (supabase as any).from('chat_conversations').update({
      status: 'closed', updated_at: new Date().toISOString(),
    }).eq('id', conv.id);
    if (error) { showToast('Failed to close.', 'error'); return; }
    showToast('Conversation closed.', 'success');
    onUpdate();
  };

  const handleReopen = async () => {
    const { error } = await (supabase as any).from('chat_conversations').update({
      status: 'human', updated_at: new Date().toISOString(),
    }).eq('id', conv.id);
    if (!error) { onUpdate(); showToast('Conversation reopened.', 'success'); }
  };

  const handleSendReply = async () => {
    if (!reply.trim() || isSending) return;
    setIsSending(true);
    const newMsg: Message = { role: 'admin', content: reply.trim(), ts: Date.now() };
    const updatedMessages = [...conv.messages, newMsg];
    const { error } = await (supabase as any).from('chat_conversations').update({
      messages: updatedMessages,
      status: 'human',
      updated_at: new Date().toISOString(),
    }).eq('id', conv.id);
    setIsSending(false);
    if (error) { showToast('Failed to send.', 'error'); return; }
    setReply('');
    onUpdate();
  };

  const cfg = STATUS_CONFIG[conv.status];

  return (
    <div className={styles.convPanel}>
      {/* Panel header */}
      <div className={styles.convHeader}>
        <div>
          <div className={styles.convTitle}>
            {conv.customer_email ?? 'Anonymous'}
            <span className={styles.convStatusBadge} style={{ background: cfg.bg, color: cfg.color }}>
              {cfg.label}
            </span>
          </div>
          <div className={styles.convSubtitle}>{fmtDate(conv.created_at)}</div>
        </div>
        <div className={styles.convActions}>
          {conv.status === 'bot' && (
            <button className={styles.takeoverBtn} onClick={handleTakeOver}>
              <User size={14} /> Take Over
            </button>
          )}
          {conv.status === 'human' && (
            <button className={styles.closeConvBtn} onClick={handleClose}>
              <Check size={14} /> Close
            </button>
          )}
          {conv.status === 'closed' && (
            <button className={styles.reopenBtn} onClick={handleReopen}>Reopen</button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className={styles.messages}>
        {conv.messages.map((msg, i) => (
          <div key={i} className={`${styles.msg} ${
            msg.role === 'user'      ? styles.msgUser :
            msg.role === 'admin'     ? styles.msgAdmin :
            styles.msgBot
          }`}>
            <div className={styles.msgBubble}>
              {msg.role === 'admin' && <span className={styles.msgAdminLabel}>{adminName}</span>}
              {msg.content}
              <span className={styles.msgTime}>{fmtTime(msg.ts)}</span>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Reply box */}
      {conv.status !== 'closed' && (
        <div className={styles.replyBox}>
          {conv.status === 'bot' && (
            <div className={styles.replyHint}>
              Take over the conversation to reply directly to the customer.
            </div>
          )}
          {conv.status === 'human' && (
            <>
              <textarea
                className={styles.replyInput}
                placeholder="Type a reply…"
                value={reply}
                onChange={e => setReply(e.target.value)}
                rows={3}
                onKeyDown={e => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSendReply();
                }}
              />
              <div className={styles.replyFooter}>
                <span className={styles.replyHint}>Cmd+Enter to send</span>
                <button
                  className={styles.sendBtn}
                  onClick={handleSendReply}
                  disabled={isSending || !reply.trim()}
                >
                  {isSending ? 'Sending…' : 'Send'}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────

const AdminChat = () => {
  const { admin }                           = useAdmin();
  const { toasts, showToast, removeToast } = useToast();
  const [conversations, setConversations]   = useState<Conversation[]>([]);
  const [isLoading, setIsLoading]           = useState(true);
  const [selected, setSelected]             = useState<Conversation | null>(null);
  const [filterStatus, setFilterStatus]     = useState<ConvStatus | 'all'>('bot');

  useEffect(() => {
    fetchConversations();
    // Poll every 15 seconds for new conversations
    const interval = setInterval(fetchConversations, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchConversations = async () => {
    const { data, error } = await (supabase as any)
      .from('chat_conversations')
      .select('*')
      .order('updated_at', { ascending: false });
    if (!error) {
      setConversations(data ?? []);
      // Update selected conversation if it's open
      if (selected) {
        const updated = (data ?? []).find((c: Conversation) => c.id === selected.id);
        if (updated) setSelected(updated);
      }
    }
    setIsLoading(false);
  };

  const handleUpdate = useCallback(() => {
    fetchConversations();
  }, [selected]);

  const filtered = conversations.filter(c =>
    filterStatus === 'all' || c.status === filterStatus
  );

  const botCount    = conversations.filter(c => c.status === 'bot').length;
  const humanCount  = conversations.filter(c => c.status === 'human').length;

  return (
    <div className={styles.page}>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className={styles.layout}>
        {/* Sidebar */}
        <div className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h1>Chat Inbox</h1>
            <p>
              {botCount > 0 && <span className={styles.botBadge}>{botCount} bot</span>}
              {humanCount > 0 && <span className={styles.humanBadge}>{humanCount} active</span>}
            </p>
          </div>

          <div className={styles.statusFilter}>
            {(['bot', 'human', 'closed', 'all'] as const).map(s => {
              const cfg = s === 'all' ? null : STATUS_CONFIG[s];
              return (
                <button key={s}
                  className={`${styles.statusFilterBtn} ${filterStatus === s ? styles.statusFilterBtnActive : ''}`}
                  onClick={() => setFilterStatus(s)}>
                  {s === 'all' ? 'All' : cfg!.label}
                </button>
              );
            })}
          </div>

          {isLoading ? (
            <div className={styles.sidebarLoading}>Loading…</div>
          ) : filtered.length === 0 ? (
            <div className={styles.sidebarEmpty}>No {filterStatus === 'all' ? '' : filterStatus} conversations.</div>
          ) : (
            <div className={styles.convList}>
              {filtered.map(c => {
                const lastMsg = c.messages[c.messages.length - 1];
                const cfg = STATUS_CONFIG[c.status];
                return (
                  <button
                    key={c.id}
                    className={`${styles.convItem} ${selected?.id === c.id ? styles.convItemActive : ''}`}
                    onClick={() => setSelected(c)}
                  >
                    <div className={styles.convItemTop}>
                      <span className={styles.convEmail}>{c.customer_email ?? 'Anonymous'}</span>
                      <span className={styles.convStatusDot} style={{ background: cfg.color }} />
                    </div>
                    {lastMsg && (
                      <div className={styles.convPreview}>
                        {lastMsg.role === 'admin' ? 'You: ' : ''}
                        {lastMsg.content.slice(0, 60)}{lastMsg.content.length > 60 ? '…' : ''}
                      </div>
                    )}
                    <div className={styles.convTime}>{fmtDate(c.updated_at)}</div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Main panel */}
        <div className={styles.main}>
          {selected ? (
            <ConvPanel
              conv={selected}
              adminName={admin?.full_name ?? 'Staff'}
              adminId={admin?.id ?? ''}
              onUpdate={handleUpdate}
              showToast={showToast}
            />
          ) : (
            <div className={styles.emptyPanel}>
              <div className={styles.emptyPanelIcon}>💬</div>
              <p>Select a conversation to view it</p>
              <p className={styles.emptyPanelSub}>
                Bot conversations appear automatically when customers use the chat widget on the site.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminChat;
