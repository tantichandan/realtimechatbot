"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState, useRef, useCallback } from "react"
import { supabase } from "../../../lib/supabase"
import { useChat } from "../../../hooks/useAdminChat"
import MessageBubble from "../../../components/MessageBubble"
import MessageInput from "../../../components/MessageInput"

/* ─── types ──────────────────────────────────────────────────────────── */
type ConversationStatus = "open" | "resolved" | "pending"

/* ─── helpers ────────────────────────────────────────────────────────── */
const initials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

const avatar = (name: string) => {
  const colours = ["#6366f1", "#8b5cf6", "#ec4899", "#14b8a6", "#f59e0b", "#10b981"]
  const idx = name.charCodeAt(0) % colours.length
  return colours[idx]
}

const fmt = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

/* ─── component ──────────────────────────────────────────────────────── */
export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const conversationId = params.id as string

  const { messages, sendMessage, bottomRef } = useChat(conversationId)

  /* state */
  const [agentName, setAgentName]         = useState("")
  const [assignedTo, setAssignedTo]       = useState<string | null>(null)
  const [customerName, setCustomerName]   = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [status, setStatus]               = useState<ConversationStatus>("open")
  const [assigning, setAssigning]         = useState(false)
  const [assigned, setAssigned]           = useState(false)
  const [copied, setCopied]               = useState(false)
  const [infoOpen, setInfoOpen]           = useState(false)
  const [resolving, setResolving]         = useState(false)

  /* mark read + fetch meta */
useEffect(() => {

  if (!conversationId) return

  const markAsRead = async () => {

    const { error } = await supabase
      .from("conversations")
      .update({
        is_unread: false
      })
      .eq("id", conversationId)

    if (error) {
      console.error(
        "Failed to mark read:",
        error
      )
    }
  }

  markAsRead()

}, [conversationId])
  /* assign */
  const handleAssign = useCallback(async () => {
    if (!agentName.trim()) return
    setAssigning(true)
    await supabase
      .from("conversations")
      .update({ assigned_to: agentName })
      .eq("id", conversationId)
    setAssignedTo(agentName)
    setAssigning(false)
    setAssigned(true)
    setTimeout(() => setAssigned(false), 2000)
  }, [agentName, conversationId])

  /* resolve / reopen */
  const handleStatusToggle = useCallback(async () => {
    setResolving(true)
    const next: ConversationStatus = status === "resolved" ? "open" : "resolved"
    await supabase
      .from("conversations")
      .update({ status: next })
      .eq("id", conversationId)
    setStatus(next)
    setResolving(false)
  }, [status, conversationId])

  /* copy conversation link */
  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [])

  const color = avatar(customerName)
  const isResolved = status === "resolved"

  return (
    <div className="chat-root">

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <header className="chat-header">
        <button className="icon-btn" onClick={() => router.back()} aria-label="Go back">
          <Arrow />
        </button>

        <div className="avatar" style={{ background: color }}>
          {initials(customerName)}
        </div>

        <div className="header-meta">
          <span className="header-name">{customerName}</span>
          <span className="header-email">{customerEmail}</span>
        </div>

        {/* status chip */}
        <StatusChip status={status} />

        {/* info toggle */}
        <button
          className="icon-btn"
          onClick={() => setInfoOpen((o) => !o)}
          aria-label="Toggle info panel"
          style={{ marginLeft: "auto" }}
        >
          <InfoIcon />
        </button>

        {/* copy link */}
        <button className="icon-btn" onClick={handleCopyLink} aria-label="Copy conversation link">
          {copied ? <CheckIcon /> : <LinkIcon />}
        </button>
      </header>

      {/* ── ASSIGN BAR ─────────────────────────────────────────────────── */}
      <div className="assign-bar">
        <AgentIcon />
        <input
          className="assign-input"
          placeholder={assignedTo ? `Assigned to ${assignedTo}` : "Assign to agent…"}
          value={agentName}
          onChange={(e) => setAgentName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAssign()}
        />
        <button
          className={`assign-btn ${assigned ? "assigned" : ""}`}
          onClick={handleAssign}
          disabled={!agentName.trim() || assigning}
        >
          {assigning ? "…" : assigned ? "✓ Assigned" : "Assign"}
        </button>
        <button
          className={`resolve-btn ${isResolved ? "reopen" : ""}`}
          onClick={handleStatusToggle}
          disabled={resolving}
        >
          {resolving ? "…" : isResolved ? "Reopen" : "Resolve"}
        </button>
      </div>

      {/* ── BODY (messages + optional info panel) ──────────────────────── */}
      <div className="body">

        {/* messages */}
        <div className="messages-scroll">
          {messages.length === 0 ? (
            <div className="empty-state">
              <BubbleIcon />
              <p>No messages yet</p>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => {
                const showTime =
                  i === 0 ||
                  new Date(msg.created_at).getTime() -
                    new Date(messages[i - 1]?.created_at).getTime() >
                    300_000
                return (
                  <div key={msg.id}>
                    {showTime && msg.created_at && (
                      <div className="time-divider">{fmt(msg.created_at)}</div>
                    )}
                    <MessageBubble role={msg.role} text={msg.body} files={msg.files} />
                  </div>
                )
              })}
            </>
          )}
          <div ref={bottomRef} />
        </div>

        {/* info panel */}
        {infoOpen && (
          <aside className="info-panel">
            <div className="info-header">
              <span>Conversation info</span>
              <button
                className="icon-btn"
                onClick={() => setInfoOpen(false)}
                aria-label="Close info"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="info-avatar" style={{ background: color }}>
              {initials(customerName)}
            </div>
            <p className="info-name">{customerName}</p>
            {customerEmail && <p className="info-email">{customerEmail}</p>}

            <div className="info-rows">
              <InfoRow label="Status" value={<StatusChip status={status} />} />
              <InfoRow label="Assigned" value={assignedTo ?? <em>Unassigned</em>} />
              <InfoRow label="Conversation ID" value={<code className="id-code">{conversationId}</code>} />
              <InfoRow label="Messages" value={String(messages.length)} />
            </div>

            <button className="copy-link-btn" onClick={handleCopyLink}>
              {copied ? "Link copied!" : "Copy conversation link"}
            </button>
          </aside>
        )}
      </div>

      {/* ── INPUT ──────────────────────────────────────────────────────── */}
      <div className={`input-wrap ${isResolved ? "resolved-overlay" : ""}`}>
        {isResolved ? (
          <div className="resolved-notice">
            Conversation resolved —{" "}
            <button onClick={handleStatusToggle} className="reopen-inline">
              reopen to reply
            </button>
          </div>
        ) : (
          <MessageInput onSend={(text, file) => sendMessage(text, "rep", file)} />
        )}
      </div>

      <style>{`
        /* ── reset ──────────────────────────────────── */
        *, *::before, *::after { box-sizing: border-box; -webkit-tap-highlight-color: transparent; margin: 0; padding: 0; }

        /* ── layout ─────────────────────────────────── */
        .chat-root {
          display: flex;
          flex-direction: column;
          height: 100dvh;
          background: #f4f5f9;
          font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 14px;
          color: #111827;
          overflow: hidden;
        }

        /* ── header ─────────────────────────────────── */
        .chat-header {
          background: #fff;
          border-bottom: 1px solid #ebebeb;
          height: 56px;
          padding: 0 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
          position: sticky;
          top: 0;
          z-index: 20;
        }

        .avatar {
          width: 32px;
          height: 32px;
          min-width: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          color: #fff;
          letter-spacing: 0.02em;
        }

        .header-meta {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-width: 0;
        }
        .header-name {
          font-size: 13px;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: #111827;
        }
        .header-email {
          font-size: 11px;
          color: #9ca3af;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* ── status chip ─────────────────────────────── */
        .status-chip {
          font-size: 11px;
          font-weight: 600;
          padding: 3px 9px;
          border-radius: 20px;
          white-space: nowrap;
          flex-shrink: 0;
          text-transform: capitalize;
          letter-spacing: 0.01em;
        }
        .status-chip.open     { background: #eff6ff; color: #1d4ed8; }
        .status-chip.resolved { background: #f0fdf4; color: #15803d; }
        .status-chip.pending  { background: #fffbeb; color: #b45309; }

        /* ── icon buttons ───────────────────────────── */
        .icon-btn {
          width: 32px;
          height: 32px;
          min-width: 32px;
          border: 1px solid #ebebeb;
          border-radius: 8px;
          background: #fafafa;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
          transition: background 0.15s, border-color 0.15s;
          flex-shrink: 0;
        }
        .icon-btn:hover { background: #f3f4f6; border-color: #d1d5db; }
        .icon-btn:active { background: #e5e7eb; }

        /* ── assign bar ─────────────────────────────── */
        .assign-bar {
          background: #fff;
          border-bottom: 1px solid #f0f0f0;
          padding: 8px 12px;
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }
        .assign-bar svg { flex-shrink: 0; color: #9ca3af; }

        .assign-input {
          flex: 1;
          min-width: 0;
          height: 32px;
          border: 1.5px solid #e5e7eb;
          border-radius: 8px;
          padding: 0 10px;
          font-size: 12.5px;
          font-family: inherit;
          outline: none;
          background: #f8f9fc;
          color: #111827;
          transition: border-color 0.15s, background 0.15s;
        }
        .assign-input:focus { border-color: #6366f1; background: #fff; }
        .assign-input::placeholder { color: #c0c4cc; }

        .assign-btn {
          height: 32px;
          padding: 0 12px;
          border: none;
          border-radius: 8px;
          background: #111827;
          color: #fff;
          font-size: 12px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          white-space: nowrap;
          flex-shrink: 0;
          transition: background 0.15s, color 0.15s, opacity 0.15s;
        }
        .assign-btn:disabled { opacity: 0.4; cursor: default; }
        .assign-btn.assigned { background: #f0fdf4; color: #15803d; }
        .assign-btn:not(:disabled):hover:not(.assigned) { background: #374151; }

        .resolve-btn {
          height: 32px;
          padding: 0 12px;
          border: 1.5px solid #e5e7eb;
          border-radius: 8px;
          background: #fff;
          color: #374151;
          font-size: 12px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          white-space: nowrap;
          flex-shrink: 0;
          transition: all 0.15s;
        }
        .resolve-btn:hover { border-color: #15803d; color: #15803d; background: #f0fdf4; }
        .resolve-btn.reopen { border-color: #fca5a5; color: #dc2626; background: #fff1f1; }
        .resolve-btn.reopen:hover { background: #fee2e2; }

        /* ── body ───────────────────────────────────── */
        .body {
          flex: 1;
          display: flex;
          overflow: hidden;
          position: relative;
        }

        /* ── messages ───────────────────────────────── */
        .messages-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 16px 12px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          -webkit-overflow-scrolling: touch;
          scroll-behavior: smooth;
        }

        .time-divider {
          text-align: center;
          font-size: 11px;
          color: #c0c4cc;
          margin: 8px 0 4px;
          letter-spacing: 0.02em;
        }

        .empty-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #d1d5db;
          gap: 8px;
          padding-top: 40px;
        }
        .empty-state p { font-size: 13px; }

        /* ── info panel ─────────────────────────────── */
        .info-panel {
          width: 240px;
          min-width: 240px;
          background: #fff;
          border-left: 1px solid #ebebeb;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 16px;
          gap: 8px;
          overflow-y: auto;
          animation: slideIn 0.18s ease;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(12px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .info-header {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 8px;
        }

        .info-avatar {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: 700;
          color: #fff;
          margin: 4px 0;
        }

        .info-name { font-size: 14px; font-weight: 600; text-align: center; }
        .info-email { font-size: 12px; color: #9ca3af; text-align: center; word-break: break-all; }

        .info-rows {
          width: 100%;
          border: 1px solid #f0f0f0;
          border-radius: 10px;
          overflow: hidden;
          margin-top: 8px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 9px 12px;
          border-bottom: 1px solid #f0f0f0;
          gap: 8px;
        }
        .info-row:last-child { border-bottom: none; }
        .info-row-label {
          font-size: 11.5px;
          color: #9ca3af;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .info-row-value {
          font-size: 12px;
          font-weight: 500;
          color: #374151;
          text-align: right;
          word-break: break-all;
        }
        .id-code {
          font-family: 'SF Mono', ui-monospace, monospace;
          font-size: 10px;
          background: #f4f5f9;
          padding: 2px 5px;
          border-radius: 4px;
          color: #6b7280;
          display: inline-block;
          max-width: 100px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .copy-link-btn {
          width: 100%;
          margin-top: 4px;
          padding: 8px;
          border: 1.5px solid #e5e7eb;
          border-radius: 8px;
          background: #fff;
          font-size: 12px;
          font-weight: 500;
          font-family: inherit;
          color: #374151;
          cursor: pointer;
          transition: all 0.15s;
          text-align: center;
        }
        .copy-link-btn:hover { border-color: #6366f1; color: #6366f1; }

        /* ── input bar ──────────────────────────────── */
        .input-wrap {
          background: #fff;
          border-top: 1px solid #ebebeb;
          flex-shrink: 0;
          padding-bottom: env(safe-area-inset-bottom, 0px);
        }
        .resolved-notice {
          padding: 12px 16px;
          text-align: center;
          font-size: 13px;
          color: #9ca3af;
        }
        .reopen-inline {
          background: none;
          border: none;
          font-family: inherit;
          font-size: 13px;
          color: #6366f1;
          cursor: pointer;
          font-weight: 500;
          padding: 0;
        }
        .reopen-inline:hover { text-decoration: underline; }

        /* ── mobile ─────────────────────────────────── */
        @media (max-width: 600px) {
          .info-panel {
            position: absolute;
            inset: 0;
            width: 100%;
            z-index: 30;
            animation: fadeUp 0.2s ease;
          }
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(8px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .resolve-btn { display: none; }
          .assign-bar  { flex-wrap: wrap; }
        }
        @media (max-width: 400px) {
          .header-email { display: none; }
        }
      `}</style>
    </div>
  )
}

/* ─── sub-components ──────────────────────────────────────────────────── */

function StatusChip({ status }: { status: ConversationStatus }) {
  return <span className={`status-chip ${status}`}>{status}</span>
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="info-row">
      <span className="info-row-label">{label}</span>
      <span className="info-row-value">{value}</span>
    </div>
  )
}

/* ─── icons (inline SVG, no deps) ────────────────────────────────────── */
const Arrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 5l-7 7 7 7" />
  </svg>
)
const AgentIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
  </svg>
)
const InfoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
)
const LinkIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
  </svg>
)
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
)
const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)
const BubbleIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
)