'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';
import {
  Loader2, LogOut, Code, Trash2, MessageSquare,
  Copy, Check, X, ChevronRight, Bell, Settings,
} from 'lucide-react';

/* ─── types ─────────────────────────────────────────────────────────── */
type Conversation = {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  created_at: string;
  is_unread: boolean;
  metadata: any;
  user_id?: string;
  website_id?: string;
  widget_key?: string;
};

/* ─── helpers ────────────────────────────────────────────────────────── */
function generateWidgetKey() {
  return `acp_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
}
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

/* ─── component ──────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  const [conversations, setConversations]     = useState<Conversation[]>([]);
  const [embedCode, setEmbedCode]             = useState('');
  const [loadingEmbed, setLoadingEmbed]       = useState(false);
  const [showEmbedModal, setShowEmbedModal]   = useState(false);
  const [copied, setCopied]                   = useState(false);
  const [deletingId, setDeletingId]           = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [activeTab, setActiveTab]             = useState<'all' | 'unread'>('all');
  const [mobileMenuOpen, setMobileMenuOpen]   = useState(false);

  useEffect(() => {
    if (!loading && !user) { router.push('/auth/login'); return; }

    const fetchConversations = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) { console.error(error); return; }
      setConversations(data || []);
    };

    fetchConversations();

    const channel = supabase
      .channel('dashboard-conversations')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, fetchConversations)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, loading, router]);

  const handleSignOut = async () => {
    const result = await signOut();
    if (result.success) router.push('/auth/login');
  };

  const handleGetEmbedCode = async () => {
    setLoadingEmbed(true);
    const { data: { user: u } } = await supabase.auth.getUser();
    if (!u) { setLoadingEmbed(false); return; }

    const { data: existingWebsite } = await supabase
      .from('websites').select('*').eq('user_id', u.id).single();

    let widgetKey = '';
    if (existingWebsite) {
      widgetKey = existingWebsite.widget_key;
    } else {
      widgetKey = generateWidgetKey();
      const { error } = await supabase.from('websites').insert({
        name: 'My Website', domain: '', widget_key: widgetKey, user_id: u.id,
      });
      if (error) { console.error(error); setLoadingEmbed(false); return; }
    }

    const code = `<script\n  src="https://realtimechatbot-tan.vercel.app/embed.js"\n  data-widget-key="${widgetKey}">\n</script>`;
    setEmbedCode(code);
    setLoadingEmbed(false);
    setShowEmbedModal(true);
    setMobileMenuOpen(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const { error } = await supabase.from('conversations').delete().eq('id', id);
    if (!error) setConversations(prev => prev.filter(c => c.id !== id));
    setDeletingId(null);
    setShowDeleteConfirm(null);
  };

  const filtered = activeTab === 'unread'
    ? conversations.filter(c => c.is_unread)
    : conversations;

  const unreadCount = conversations.filter(c => c.is_unread).length;

  /* ── loading screen ── */
  if (loading) {
    return (
      <div className="page-loading">
        <style>{GLOBAL_STYLES}</style>
        <Loader2 size={28} className="spin" />
        <p className="loading-label">Loading</p>
      </div>
    );
  }

  return (
    <div className="dashboard-root">
      <style>{GLOBAL_STYLES}</style>

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav className="nav">
        {/* Brand */}
        <div className="nav-brand">
          <div className="nav-logo">
            <MessageSquare size={14} strokeWidth={1.5} />
          </div>
          <div>
            <div className="brand-name">ACPremiumAuto Chat</div>
            <div className="brand-sub">Admin Dashboard</div>
          </div>
        </div>

        {/* Desktop actions */}
        <div className="nav-actions-desktop">
          <div className="bell-wrap">
            <button className="action-btn" title="Notifications">
              <Bell size={15} />
            </button>
            {unreadCount > 0 && (
              <div className="bell-badge">{unreadCount}</div>
            )}
          </div>
          <button className="nav-btn nav-btn-primary" onClick={handleGetEmbedCode} disabled={loadingEmbed}>
            {loadingEmbed ? <Loader2 size={13} className="spin" /> : <Code size={13} />}
            {loadingEmbed ? 'Generating…' : 'Get Widget Code'}
          </button>
          <button className="nav-btn nav-btn-ghost" onClick={handleSignOut}>
            <LogOut size={13} />
            Sign Out
          </button>
        </div>

        {/* Mobile hamburger */}
        <button className="hamburger" onClick={() => setMobileMenuOpen(o => !o)} aria-label="Menu">
          <span className={`ham-line ${mobileMenuOpen ? 'open' : ''}`} />
          <span className={`ham-line ${mobileMenuOpen ? 'open' : ''}`} />
          <span className={`ham-line ${mobileMenuOpen ? 'open' : ''}`} />
        </button>
      </nav>

      {/* Mobile nav drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          <button className="mobile-drawer-btn" onClick={handleGetEmbedCode} disabled={loadingEmbed}>
            {loadingEmbed ? <Loader2 size={14} className="spin" /> : <Code size={14} />}
            {loadingEmbed ? 'Generating…' : 'Get Widget Code'}
          </button>
          <button className="mobile-drawer-btn ghost" onClick={handleSignOut}>
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      )}

      {/* ── MAIN ─────────────────────────────────────────────────────────── */}
      <div className="page-inner">

        {/* PAGE HEADER */}
        <div className="page-header">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line" />
              Welcome back
            </div>
            <h1 className="page-title">
              {user?.email?.split('@')[0] || 'Dashboard'}
            </h1>
            <p className="page-subtitle">{user?.email}</p>
          </div>

          <div className="status-pill">
            <div className="status-dot" />
            <span>System Live</span>
          </div>
        </div>

        {/* STATS */}
        <div className="stats-grid">
          {[
            { label: 'Total Conversations', value: conversations.length, sub: 'All time' },
            { label: 'Unread Chats', value: unreadCount, sub: 'Awaiting reply', accent: unreadCount > 0 },
            { label: 'Read Chats', value: conversations.length - unreadCount, sub: 'Handled' },
            { label: 'User ID', value: user?.id?.slice(0, 8) + '…', sub: 'Account reference', mono: true },
          ].map((s, i) => (
            <div key={i} className={`stat-cell ${s.accent ? 'stat-accent' : ''}`}>
              <div className="stat-label">{s.label}</div>
              <div className={`stat-value ${s.mono ? 'mono' : ''} ${s.accent ? 'accent-text' : ''}`}>
                {s.value}
              </div>
              <div className="stat-sub">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* CONVERSATIONS */}
        <div className="convs-section">

          {/* Section title + tabs */}
          <div className="convs-header">
            <h2 className="section-title">Conversations</h2>
            <div className="tabs">
              <button
                className={`tab-btn ${activeTab === 'all' ? 'tab-active' : 'tab-inactive'}`}
                onClick={() => setActiveTab('all')}
              >
                All ({conversations.length})
              </button>
              <button
                className={`tab-btn ${activeTab === 'unread' ? 'tab-active' : 'tab-inactive'}`}
                onClick={() => setActiveTab('unread')}
              >
                Unread ({unreadCount})
              </button>
            </div>
          </div>

          {/* Desktop table header */}
          <div className="table-head">
            {['Customer', 'Contact', 'Details', 'Date', ''].map((h, i) => (
              <div key={i} className="table-head-cell">{h}</div>
            ))}
          </div>

          {/* Rows */}
          {filtered.length === 0 ? (
            <div className="empty-state">
              <MessageSquare size={28} className="empty-icon" />
              <p className="empty-title">No conversations yet</p>
              <p className="empty-sub">New chats will appear here in real time once your widget is installed.</p>
            </div>
          ) : (
            filtered.map((conv) => (
              <div key={conv.id} className="conv-row">

                {/* ── Desktop layout (grid) ── */}
                <div className="conv-desktop">
                  {/* Customer */}
                  <div className="conv-customer">
                    <div className="conv-avatar">
                      {(conv.customer_name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="conv-name">
                        {conv.customer_name || 'Unknown'}
                        {conv.is_unread && <span className="badge-unread">New</span>}
                      </div>
                      <div className="conv-id">{conv.id.slice(0, 12)}…</div>
                    </div>
                  </div>

                  {/* Contact */}
                  <div>
                    <div className="conv-email">{conv.customer_email || '—'}</div>
                    <div className="conv-phone">{conv.customer_phone || '—'}</div>
                  </div>

                  {/* Part */}
                  <div>
                    {conv.metadata?.part
                      ? <span className="part-badge">{conv.metadata.part}</span>
                      : <span className="conv-phone">—</span>
                    }
                  </div>

                  {/* Date */}
                  <div className="conv-date">{fmtDate(conv.created_at)}</div>

                  {/* Actions */}
                  <div className="conv-actions">
                    <button className="action-btn" title="Open" onClick={() => router.push(`/chat/${conv.id}`)}>
                      <ChevronRight size={14} />
                    </button>
                    <div style={{ position: 'relative' }}>
                      <button
                        className="action-btn action-btn-danger"
                        title="Delete"
                        onClick={() => setShowDeleteConfirm(showDeleteConfirm === conv.id ? null : conv.id)}
                      >
                        {deletingId === conv.id
                          ? <Loader2 size={13} className="spin" />
                          : <Trash2 size={13} />
                        }
                      </button>
                      {showDeleteConfirm === conv.id && (
                        <div className="confirm-popup">
                          <p className="confirm-title">Delete conversation?</p>
                          <p className="confirm-sub">This cannot be undone.</p>
                          <div className="confirm-btns">
                            <button className="confirm-delete" onClick={() => handleDelete(conv.id)}>Delete</button>
                            <button className="confirm-cancel" onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── Mobile card layout ── */}
                <div className="conv-mobile" onClick={() => router.push(`/chat/${conv.id}`)}>
                  <div className="conv-avatar">{(conv.customer_name || '?').charAt(0).toUpperCase()}</div>
                  <div className="conv-mobile-body">
                    <div className="conv-mobile-top">
                      <span className="conv-name">
                        {conv.customer_name || 'Unknown'}
                        {conv.is_unread && <span className="badge-unread">New</span>}
                      </span>
                      <span className="conv-date">{fmtDate(conv.created_at)}</span>
                    </div>
                    <div className="conv-email">{conv.customer_email || '—'}</div>
                    {conv.metadata?.part && (
                      <span className="part-badge" style={{ marginTop: 4, display: 'inline-block' }}>
                        {conv.metadata.part}
                      </span>
                    )}
                  </div>
                  <div className="conv-mobile-arrow">
                    <div className="conv-actions" style={{ gap: 4 }}>
                      <button
                        className="action-btn action-btn-danger"
                        onClick={e => { e.stopPropagation(); setShowDeleteConfirm(conv.id); }}
                      >
                        {deletingId === conv.id ? <Loader2 size={13} className="spin" /> : <Trash2 size={13} />}
                      </button>
                      <ChevronRight size={16} style={{ color: 'var(--ink-lighter)' }} />
                    </div>
                  </div>
                </div>

                {/* Mobile delete confirm */}
                {showDeleteConfirm === conv.id && (
                  <div className="confirm-mobile">
                    <p className="confirm-title">Delete this conversation?</p>
                    <p className="confirm-sub">This cannot be undone.</p>
                    <div className="confirm-btns">
                      <button className="confirm-delete" onClick={() => handleDelete(conv.id)}>Delete</button>
                      <button className="confirm-cancel" onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── EMBED CODE MODAL ─────────────────────────────────────────────── */}
      {showEmbedModal && (
        <div className="modal-overlay" onClick={() => setShowEmbedModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-title">Install Widget</div>
                <p className="modal-sub">
                  Paste into your site's{' '}
                  <code className="inline-code">&lt;head&gt;</code>{' '}
                  or before{' '}
                  <code className="inline-code">&lt;/body&gt;</code>
                </p>
              </div>
              <button onClick={() => setShowEmbedModal(false)} className="modal-close">
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{ position: 'relative' }}>
                <div className="code-block">{embedCode}</div>
                <button onClick={handleCopy} className={`copy-btn ${copied ? 'copied' : ''}`}>
                  {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
                </button>
              </div>

              <div className="notice-box">
                <div className="notice-dot" />
                <p className="notice-text">
                  Your widget key is unique to your account. Do not share it publicly — it identifies your chat instance.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── styles ─────────────────────────────────────────────────────────── */
const GLOBAL_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --cream: #FAF9F6;
  --ink: #1A1917;
  --ink-light: #6B6860;
  --ink-lighter: #A8A59E;
  --gold: #C9A84C;
  --gold-light: #F5EDD6;
  --gold-dark: #8B6914;
  --border: rgba(26,25,23,0.10);
  --border-strong: rgba(26,25,23,0.18);
}

@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin 0.8s linear infinite; }

/* ── root ───────────────────────────────────────── */
.dashboard-root {
  font-family: 'DM Sans', sans-serif;
  background: var(--cream);
  min-height: 100vh;
  color: var(--ink);
}

/* ── loading ────────────────────────────────────── */
.page-loading {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: var(--cream);
  font-family: 'DM Sans', sans-serif;
}
.loading-label {
  font-size: 11px;
  color: var(--ink-lighter);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

/* ── nav ────────────────────────────────────────── */
.nav {
  border-bottom: 1px solid var(--border);
  background: var(--cream);
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  position: sticky;
  top: 0;
  z-index: 50;
}
.nav-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}
.nav-logo {
  width: 34px;
  height: 34px;
  border: 1.5px solid var(--ink);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.brand-name {
  font-family: 'DM Serif Display', serif;
  font-size: 16px;
  letter-spacing: -0.01em;
  white-space: nowrap;
}
.brand-sub {
  font-size: 9px;
  color: var(--ink-lighter);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-top: 1px;
}

.nav-actions-desktop {
  display: flex;
  align-items: center;
  gap: 8px;
}
.bell-wrap { position: relative; }
.bell-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 16px;
  height: 16px;
  background: var(--gold-dark);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  color: white;
  font-weight: 700;
}

/* nav buttons */
.nav-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  transition: all 0.15s;
  border-radius: 0;
  white-space: nowrap;
}
.nav-btn-primary {
  background: var(--ink);
  color: var(--cream);
  border: 1.5px solid var(--ink);
}
.nav-btn-primary:hover { background: var(--gold-dark); border-color: var(--gold-dark); }
.nav-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.nav-btn-ghost {
  background: none;
  color: var(--ink-light);
  border: 1px solid var(--border-strong);
}
.nav-btn-ghost:hover { border-color: var(--ink); color: var(--ink); }

/* ── mobile hamburger ───────────────────────────── */
.hamburger {
  display: none;
  flex-direction: column;
  gap: 5px;
  cursor: pointer;
  background: none;
  border: none;
  padding: 4px;
}
.ham-line {
  display: block;
  width: 22px;
  height: 1.5px;
  background: var(--ink);
  transition: all 0.2s;
}
.mobile-drawer {
  display: none;
  flex-direction: column;
  gap: 1px;
  background: var(--cream);
  border-bottom: 1px solid var(--border);
  padding: 12px 20px;
}
.mobile-drawer-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 600;
  font-family: 'DM Sans', sans-serif;
  letter-spacing: 0.04em;
  background: var(--ink);
  color: var(--cream);
  border: none;
  cursor: pointer;
  text-transform: uppercase;
  transition: background 0.15s;
}
.mobile-drawer-btn:disabled { opacity: 0.5; }
.mobile-drawer-btn:hover { background: var(--gold-dark); }
.mobile-drawer-btn.ghost {
  background: none;
  color: var(--ink-light);
  border: 1px solid var(--border-strong);
  margin-top: 6px;
}
.mobile-drawer-btn.ghost:hover { border-color: var(--ink); color: var(--ink); background: none; }

/* ── page inner ─────────────────────────────────── */
.page-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
}

/* ── page header ────────────────────────────────── */
.page-header {
  padding: 40px 0 32px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.eyebrow {
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-weight: 600;
  color: var(--gold-dark);
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.eyebrow-line {
  display: block;
  width: 20px;
  height: 1px;
  background: var(--gold);
}
.page-title {
  font-family: 'DM Serif Display', serif;
  font-size: 42px;
  letter-spacing: -0.02em;
  line-height: 1;
}
.page-subtitle {
  font-size: 13px;
  color: var(--ink-lighter);
  margin-top: 8px;
}
.status-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid rgba(34,197,94,0.3);
  background: rgba(34,197,94,0.06);
  white-space: nowrap;
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #15803D;
}
.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #22C55E;
}

/* ── stats ──────────────────────────────────────── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-bottom: 1px solid var(--border);
}
.stat-cell {
  padding: 28px 32px;
  border-right: 1px solid var(--border);
}
.stat-cell:first-child { padding-left: 0; }
.stat-cell:last-child  { border-right: none; }

.stat-label {
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink-lighter);
  font-weight: 600;
  margin-bottom: 10px;
}
.stat-value {
  font-family: 'DM Serif Display', serif;
  font-size: 36px;
  letter-spacing: -0.02em;
  line-height: 1;
  color: var(--ink);
  margin-bottom: 6px;
}
.stat-value.mono {
  font-family: monospace;
  font-size: 18px;
  letter-spacing: 0;
}
.stat-value.accent-text { color: var(--gold-dark); }
.stat-sub { font-size: 12px; color: var(--ink-lighter); }

/* ── conversations section ──────────────────────── */
.convs-section { padding-top: 40px; padding-bottom: 60px; }

.convs-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0;
  flex-wrap: wrap;
  gap: 12px;
}
.section-title {
  font-family: 'DM Serif Display', serif;
  font-size: 26px;
  letter-spacing: -0.02em;
}
.tabs { display: flex; border-bottom: 1px solid var(--border); }
.tab-btn {
  padding: 8px 20px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  border: none;
  background: none;
  transition: all 0.15s;
  white-space: nowrap;
}
.tab-active   { color: var(--ink); border-bottom: 2px solid var(--ink); }
.tab-inactive { color: var(--ink-lighter); border-bottom: 2px solid transparent; }
.tab-inactive:hover { color: var(--ink-light); }

/* ── table head (desktop only) ──────────────────── */
.table-head {
  display: grid;
  grid-template-columns: 2fr 2fr 1.5fr 1fr auto;
  gap: 16px;
  padding: 12px 24px;
  margin-top: 24px;
  background: rgba(26,25,23,0.03);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}
.table-head-cell {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink-lighter);
}

/* ── conv rows ──────────────────────────────────── */
.conv-row {
  border-bottom: 1px solid var(--border);
  position: relative;
  transition: background 0.12s;
}
.conv-row:hover { background: rgba(26,25,23,0.02); }

/* desktop grid inside row */
.conv-desktop {
  display: grid;
  grid-template-columns: 2fr 2fr 1.5fr 1fr auto;
  gap: 16px;
  padding: 18px 24px;
  align-items: center;
}
.conv-mobile { display: none; }
.confirm-mobile { display: none; }

/* customer cell */
.conv-customer { display: flex; align-items: center; gap: 12px; }
.conv-avatar {
  width: 36px;
  height: 36px;
  min-width: 36px;
  background: var(--gold-light);
  border: 1px solid rgba(201,168,76,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'DM Serif Display', serif;
  font-size: 15px;
  color: var(--gold-dark);
  flex-shrink: 0;
}
.conv-name {
  font-weight: 600;
  font-size: 14px;
  color: var(--ink);
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.conv-id    { font-size: 11px; color: var(--ink-lighter); font-family: monospace; margin-top: 2px; }
.conv-email { font-size: 13px; color: var(--ink-light); margin-bottom: 3px; }
.conv-phone { font-size: 12px; color: var(--ink-lighter); }
.conv-date  { font-size: 12px; color: var(--ink-lighter); }

.part-badge {
  font-size: 12px;
  color: var(--gold-dark);
  background: var(--gold-light);
  padding: 3px 10px;
  display: inline-block;
  border: 1px solid rgba(201,168,76,0.25);
}
.badge-unread {
  background: var(--gold-light);
  color: var(--gold-dark);
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border: 1px solid rgba(201,168,76,0.3);
}

/* ── action buttons ─────────────────────────────── */
.conv-actions {
  display: flex;
  gap: 6px;
  align-items: center;
}
.action-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
  border: 1px solid var(--border);
  background: white;
  color: var(--ink-light);
  flex-shrink: 0;
}
.action-btn:hover { border-color: var(--ink); color: var(--ink); }
.action-btn-danger:hover { border-color: #DC2626; color: #DC2626; background: #FEF2F2; }

/* delete confirm popup (desktop) */
.confirm-popup {
  position: absolute;
  right: 0;
  top: 36px;
  background: white;
  border: 1px solid var(--border-strong);
  padding: 16px;
  width: 220px;
  z-index: 20;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}
.confirm-title { font-size: 13px; font-weight: 600; color: var(--ink); margin-bottom: 6px; }
.confirm-sub   { font-size: 12px; color: var(--ink-lighter); margin-bottom: 14px; line-height: 1.5; }
.confirm-btns  { display: flex; gap: 8px; }
.confirm-delete {
  flex: 1; height: 32px;
  background: #DC2626; color: white; border: none;
  font-size: 12px; font-weight: 600; cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  transition: background 0.15s;
}
.confirm-delete:hover { background: #b91c1c; }
.confirm-cancel {
  flex: 1; height: 32px;
  background: none; color: var(--ink);
  border: 1px solid var(--border-strong);
  font-size: 12px; cursor: pointer;
  font-family: 'DM Sans', sans-serif;
}

/* ── empty state ────────────────────────────────── */
.empty-state {
  padding: 64px 24px;
  text-align: center;
  border-bottom: 1px solid var(--border);
}
.empty-icon  { color: var(--border-strong); margin: 0 auto 16px; display: block; }
.empty-title { font-size: 15px; color: var(--ink-light); margin-bottom: 6px; }
.empty-sub   { font-size: 13px; color: var(--ink-lighter); }

/* ── modal ──────────────────────────────────────── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(26,25,23,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
}
.modal {
  background: var(--cream);
  width: 100%;
  max-width: 520px;
  border: 1px solid var(--border-strong);
}
.modal-header {
  padding: 24px 28px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}
.modal-title {
  font-family: 'DM Serif Display', serif;
  font-size: 22px;
  letter-spacing: -0.01em;
  margin-bottom: 4px;
}
.modal-sub { font-size: 13px; color: var(--ink-lighter); }
.modal-close {
  background: none; border: none; cursor: pointer;
  color: var(--ink-lighter); padding: 4px;
  transition: color 0.15s;
  flex-shrink: 0;
}
.modal-close:hover { color: var(--ink); }
.modal-body { padding: 28px; }

.code-block {
  background: var(--ink);
  color: #86EFAC;
  padding: 20px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.7;
  white-space: pre;
  overflow-x: auto;
}
.copy-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(255,255,255,0.1);
  color: white;
  border: 1px solid rgba(255,255,255,0.15);
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'DM Sans', sans-serif;
  font-weight: 500;
  transition: background 0.15s;
}
.copy-btn.copied { background: #15803D; }
.copy-btn:hover:not(.copied) { background: rgba(255,255,255,0.2); }

.inline-code {
  background: rgba(26,25,23,0.06);
  padding: 1px 6px;
  font-size: 12px;
  font-family: monospace;
}
.notice-box {
  margin-top: 20px;
  padding: 14px 16px;
  background: var(--gold-light);
  border: 1px solid rgba(201,168,76,0.3);
  display: flex;
  gap: 10px;
  align-items: flex-start;
}
.notice-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--gold);
  margin-top: 5px;
  flex-shrink: 0;
}
.notice-text { font-size: 13px; color: var(--gold-dark); line-height: 1.6; }

/* ────────────────────────────────────────────────
   RESPONSIVE
   ──────────────────────────────────────────────── */

/* ── tablet ≤ 900px ─────────────────────────────── */
@media (max-width: 900px) {
  .nav { padding: 0 20px; }
  .page-inner { padding: 0 20px; }

  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .stat-cell:nth-child(2) { border-right: none; }
  .stat-cell:nth-child(3) { border-right: 1px solid var(--border); border-top: 1px solid var(--border); }
  .stat-cell:nth-child(4) { border-right: none; border-top: 1px solid var(--border); }
  .stat-cell { padding: 20px 20px; }
  .stat-cell:first-child { padding-left: 20px; }

  .page-title { font-size: 32px; }

  .table-head { display: none; }
  .conv-desktop { display: none; }
  .conv-mobile {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 16px;
    cursor: pointer;
  }
  .conv-mobile-body { flex: 1; min-width: 0; }
  .conv-mobile-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 4px;
    flex-wrap: wrap;
  }
  .conv-mobile-arrow { flex-shrink: 0; display: flex; align-items: center; }
  .confirm-mobile {
    display: block;
    padding: 14px 16px;
    background: #fff8f8;
    border-top: 1px solid rgba(220,38,38,0.1);
  }
}

/* ── mobile ≤ 600px ─────────────────────────────── */
@media (max-width: 600px) {
  .nav-actions-desktop { display: none; }
  .hamburger { display: flex; }
  .mobile-drawer { display: flex; }

  .nav { height: 56px; padding: 0 16px; }
  .brand-name { font-size: 14px; }

  .page-inner { padding: 0 16px; }
  .page-header { padding: 24px 0 20px; }
  .page-title { font-size: 28px; }
  .status-pill { padding: 6px 12px; font-size: 10px; }

  .stats-grid { grid-template-columns: repeat(2, 1fr); border-bottom: none; }
  .stat-cell { padding: 16px 12px; }
  .stat-cell:first-child { padding-left: 12px; }
  .stat-value { font-size: 28px; }
  .stat-value.mono { font-size: 14px; }

  .convs-header { gap: 8px; }
  .section-title { font-size: 20px; }
  .tab-btn { padding: 6px 14px; font-size: 11px; }

  .conv-mobile { padding: 14px 12px; }
  .modal-overlay { padding: 0; align-items: flex-end; }
  .modal { max-width: 100%; border-left: none; border-right: none; border-bottom: none; }
  .modal-header { padding: 20px 20px; }
  .modal-body { padding: 20px; }
  .code-block { font-size: 11px; padding: 16px; }
}

/* ── small phones ≤ 380px ──────────────────────── */
@media (max-width: 380px) {
  .page-title { font-size: 24px; }
  .stats-grid { grid-template-columns: 1fr; }
  .stat-cell { border-right: none !important; border-top: 1px solid var(--border); }
  .stat-cell:first-child { border-top: none; }
}
`;