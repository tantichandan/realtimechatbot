"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { createConversation } from "../hooks/useCreateConversation"
import { useChat } from "../hooks/useChat"
import MessageBubble from "./MessageBubble"
import MessageInput from "./MessageInput"
import UserInfoForm from "./UserInfoForm"

export default function ChatWidget({ widgetKey }: { widgetKey: string }) {
  const [open, setOpen]               = useState(false)
  const [minimized, setMinimized]     = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [autoGreeted, setAutoGreeted] = useState(false)
  const [showTyping, setShowTyping]   = useState(false)
  const [autoMessage, setAutoMessage] = useState<string | null>(null)

  // ── Feature state ──
  const [soundEnabled, setSoundEnabled]   = useState(true)
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const [copied, setCopied]               = useState(false)          // feature: copy last msg
  const [chatRating, setChatRating]       = useState<0|1|2|3|4|5>(0) // feature: end-of-chat rating
  const [showRating, setShowRating]       = useState(false)
  const msgAreaRef  = useRef<HTMLDivElement>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)

  const { messages, sendMessage, bottomRef } = useChat(conversationId || undefined)

  // ── Persist conversation ──
  useEffect(() => {
    const savedId = localStorage.getItem("chat_conversation_id")
    if (savedId) setConversationId(savedId)
  }, [])

  // ── Unread badge + sound ──
  useEffect(() => {
    if (open && !minimized) { setUnreadCount(0); return }
    if (!messages.length) return
    const last = messages[messages.length - 1]
    if (last?.role === "rep") {
      setUnreadCount(p => p + 1)
      if (soundEnabled) playNotificationSound()
    }
  }, [messages])

  // ── Auto-greeting ──
  useEffect(() => {
    if (!conversationId || autoGreeted) return
    setAutoGreeted(true)
    setShowTyping(true)
    const t = setTimeout(() => {
      setShowTyping(false)
      setAutoMessage("👋 You are now connected with a Live Part Expert")
    }, 1800)
    return () => clearTimeout(t)
  }, [conversationId])

  // ── Scroll tracking ──
  const handleMsgScroll = useCallback(() => {
    const el = msgAreaRef.current
    if (!el) return
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 120)
  }, [])

  const scrollToBottom = () =>
    msgAreaRef.current?.scrollTo({ top: msgAreaRef.current.scrollHeight, behavior: "smooth" })

  // ── Notification beep ──
  const playNotificationSound = () => {
    try {
      if (!audioCtxRef.current)
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      const ctx = audioCtxRef.current
      const osc = ctx.createOscillator(), gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.frequency.setValueAtTime(880, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.15)
      gain.gain.setValueAtTime(0.1, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25)
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.25)
    } catch (_) {}
  }

  // ── Feature: Copy last agent message ──
  const copyLastAgentMsg = () => {
    const last = [...messages].reverse().find(m => m.role === "rep")
    if (!last) return
    navigator.clipboard?.writeText(last.body).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleStartChat = async (data: any) => {
    const res = await createConversation({
      name: data.name, email: data.email, phone: data.phone,
      metadata: { part: data.part }, widget_key: widgetKey,
    })
    if (res) {
      setConversationId(res.id)
      localStorage.setItem("chat_conversation_id", res.id)
    }
  }

  // ── Safe area bottom (iPhone notch/home bar) ──
  // env(safe-area-inset-bottom) handled via CSS variable fallback
  const BOTTOM_BASE = 20   // px above safe area
  const FAB_SIZE    = 58
  const CHAT_GAP    = 12   // gap between FAB top and chat box bottom

  return (
    <>
      <style>{`
        /*
         * ── SAFARI / iPHONE FIX ──
         * Each interactive element is position:fixed on its own.
         * NO full-screen wrapper div → zero invisible iframe surface → zero
         * ghost-touch area on WebKit/Safari (iPhone XR, SE, 12 mini, etc.)
         *
         * We also set -webkit-tap-highlight-color:transparent and
         * touch-action:manipulation on every button to eliminate the
         * 300 ms click delay on iOS Safari without needing FastClick.
         */

        :root {
          --acp-safe-bottom: env(safe-area-inset-bottom, 0px);
        }

        /* Shared button resets for iOS */
        .acp-btn {
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          -webkit-appearance: none;
          appearance: none;
          cursor: pointer;
          border: none;
          padding: 0;
          margin: 0;
          background: none;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* FAB */
        .acp-fab {
          position: fixed;
          bottom: calc(var(--acp-safe-bottom) + ${BOTTOM_BASE}px);
          right: 16px;
          width: ${FAB_SIZE}px;
          height: ${FAB_SIZE}px;
          border-radius: 50%;
          background: #1a1a2e;
          box-shadow: 0 4px 20px rgba(26,26,46,0.4);
          z-index: 2147483647;          /* max safe z-index across all browsers */
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }
        .acp-fab:hover  { transform: scale(1.08); box-shadow: 0 8px 28px rgba(26,26,46,0.55); }
        .acp-fab:active { transform: scale(0.93); }

        /* Chat box */
        .acp-chatbox {
          position: fixed;
          right: 16px;
          bottom: calc(var(--acp-safe-bottom) + ${BOTTOM_BASE + FAB_SIZE + CHAT_GAP}px);
          width: min(368px, calc(100vw - 32px));
          height: min(560px, calc(100svh - ${BOTTOM_BASE + FAB_SIZE + CHAT_GAP + 16}px));
          background: #fff;
          border-radius: 0;
          border: 1px solid rgba(0,0,0,0.08);
          box-shadow: none;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          z-index: 2147483646;
          animation: acpSlideUp 0.22s cubic-bezier(0.16,1,0.3,1);
        }

        /* Minimized pill */
        .acp-pill {
          position: fixed;
          right: 16px;
          bottom: calc(var(--acp-safe-bottom) + ${BOTTOM_BASE + FAB_SIZE + CHAT_GAP}px);
          background: #1a1a2e;
          color: #fff;
          border-radius: 28px;
          padding: 9px 14px 9px 10px;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 16px rgba(26,26,46,0.3);
          z-index: 2147483646;
          animation: pillSlide 0.2s ease-out;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          cursor: pointer;
        }

        /* Header buttons */
        .acp-hbtn {
          width: 28px; height: 28px;
          border-radius: 2px;
          transition: background 0.12s;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          -webkit-appearance: none;
          appearance: none;
          cursor: pointer;
          border: none;
          display: flex; align-items: center; justify-content: center;
        }
        .acp-hbtn:hover  { background: rgba(255,255,255,0.18) !important; }
        .acp-hbtn:active { opacity: 0.7; }

        /* Scrollbar */
        .acp-msg-area::-webkit-scrollbar       { width: 3px; }
        .acp-msg-area::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 2px; }
        .acp-msg-area::-webkit-scrollbar-track { background: transparent; }

        /* Typing dots */
        .acp-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #9ca3af;
          animation: acpDot 1.2s ease-in-out infinite;
          display: inline-block;
        }
        .acp-dot:nth-child(2) { animation-delay: .15s; }
        .acp-dot:nth-child(3) { animation-delay: .30s; }

        /* Quick-reply chips */
        .acp-chip {
          flex-shrink: 0;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          color: #374151;
          font-size: 11px; font-weight: 500;
          padding: 5px 10px;
          border-radius: 2px;
          cursor: pointer;
          white-space: nowrap;
          font-family: inherit;
          transition: background 0.12s, border-color 0.12s;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          -webkit-appearance: none;
          appearance: none;
        }
        .acp-chip:hover  { background: #e2e8f0; border-color: #cbd5e1; }
        .acp-chip:active { background: #dde3ea; }

        /* Scroll-to-bottom */
        .acp-scroll-btn {
          position: absolute;
          bottom: 10px; left: 50%;
          transform: translateX(-50%);
          background: #1a1a2e;
          color: #fff;
          border: none;
          border-radius: 20px;
          font-size: 11px; font-weight: 600;
          padding: 5px 12px 5px 9px;
          display: flex; align-items: center; gap: 5px;
          z-index: 10; white-space: nowrap;
          cursor: pointer;
          animation: acpScrollPop 0.18s ease-out;
          transition: background 0.12s, transform 0.12s;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          -webkit-appearance: none;
          appearance: none;
        }
        .acp-scroll-btn:hover  { background: #0f172a; transform: translateX(-50%) translateY(-2px); }
        .acp-scroll-btn:active { background: #0f172a; }

        /* Star rating */
        .acp-star {
          cursor: pointer;
          transition: transform 0.1s;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          font-size: 20px;
          line-height: 1;
        }
        .acp-star:active { transform: scale(0.88); }

        /* Animations */
        @keyframes acpSlideUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes acpFadeIn {
          from { opacity:0; transform:translateY(4px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes acpPulse {
          0%,100% { box-shadow:0 0 0 0 rgba(239,68,68,0.5); }
          50%      { box-shadow:0 0 0 6px rgba(239,68,68,0); }
        }
        @keyframes pillSlide {
          from { opacity:0; transform:translateX(10px); }
          to   { opacity:1; transform:translateX(0); }
        }
        @keyframes acpDot {
          0%,60%,100% { transform:translateY(0); opacity:.35; }
          30%          { transform:translateY(-4px); opacity:1; }
        }
        @keyframes acpScrollPop {
          from { opacity:0; transform:translateX(-50%) translateY(5px); }
          to   { opacity:1; transform:translateX(-50%) translateY(0); }
        }
      `}</style>

      {/* ═══════════════════════════════════════════════
          FAB — position:fixed independently, z-index max
          No wrapper div = no ghost touch surface in iframe
          ═══════════════════════════════════════════════ */}
      <button
        className="acp-btn acp-fab"
        onClick={() => { setOpen(o => !o); setMinimized(false); setUnreadCount(0) }}
        aria-label={open ? "Close chat" : "Open chat"}
      >
        <div style={{
          transition: "transform 0.25s cubic-bezier(0.4,0,0.2,1)",
          transform: open ? "rotate(90deg) scale(0.88)" : "rotate(0deg) scale(1)",
        }}>
          {open ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
          )}
        </div>

        {unreadCount > 0 && !open && (
          <div style={{
            position: "absolute", top: -3, right: -3,
            minWidth: 20, height: 20, background: "#ef4444",
            borderRadius: 10, border: "2.5px solid #fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 10, fontWeight: 700, color: "#fff", padding: "0 4px",
            animation: "acpPulse 1.8s ease-in-out infinite",
          }}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </div>
        )}

        {!open && unreadCount === 0 && (
          <span style={{
            position: "absolute", bottom: 3, right: 3,
            width: 12, height: 12, background: "#22c55e",
            borderRadius: "50%", border: "2.5px solid #1a1a2e",
          }}/>
        )}
      </button>

      {/* ═══════════════════════════════
          MINIMIZED PILL — position:fixed
          ═══════════════════════════════ */}
      {open && minimized && (
        <div
          className="acp-pill"
          onClick={() => { setMinimized(false); setUnreadCount(0) }}
          role="button"
          aria-label="Expand chat"
        >
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "rgba(255,255,255,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="rgba(255,255,255,0.8)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1 }}>ACPremiumAuto</div>
            {unreadCount > 0 && (
              <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>
                {unreadCount} new message{unreadCount > 1 ? "s" : ""}
              </div>
            )}
          </div>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 15l-6-6-6 6"/>
          </svg>
          <button
            className="acp-btn"
            onClick={e => { e.stopPropagation(); setOpen(false); setMinimized(false) }}
            style={{
              width: 22, height: 22, borderRadius: "50%",
              background: "rgba(255,255,255,0.12)", color: "#fff", marginLeft: 2,
            }}
            aria-label="Close chat"
          >
            <svg width="8" height="8" viewBox="0 0 10 10" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M1 1l8 8M9 1L1 9"/>
            </svg>
          </button>
        </div>
      )}

      {/* ═══════════════════════════════════════════
          CHAT BOX — position:fixed independently
          ═══════════════════════════════════════════ */}
      {open && !minimized && (
        <div className="acp-chatbox">

          {/* Header */}
          <div style={{
            background: "#1a1a2e", padding: "13px 14px",
            display: "flex", alignItems: "center", gap: 10, flexShrink: 0,
          }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 0,
                background: "rgba(255,255,255,0.08)",
                border: "1.5px solid rgba(255,255,255,0.14)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="rgba(255,255,255,0.85)" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                </svg>
              </div>
              <span style={{
                position: "absolute", bottom: 1, right: 1,
                width: 9, height: 9, background: "#22c55e",
                borderRadius: "50%", border: "2px solid #1a1a2e",
              }}/>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: "#fff", fontSize: 13, fontWeight: 600, letterSpacing: "0.01em" }}>
                Realtime Support
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                <span style={{ width: 6, height: 6, background: "#22c55e", borderRadius: "50%", flexShrink: 0 }}/>
                <span style={{ color: "rgba(255,255,255,0.48)", fontSize: 11 }}>
                  Online · typically replies in minutes
                </span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>

              {/* Feature: Copy last agent message */}
              {messages.some(m => m.role === "rep") && (
                <button
                  className="acp-hbtn"
                  onClick={copyLastAgentMsg}
                  title={copied ? "Copied!" : "Copy last reply"}
                  style={{
                    background: copied ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.08)",
                    color: copied ? "#86efac" : "rgba(255,255,255,0.65)",
                    transition: "background 0.2s, color 0.2s",
                  }}
                >
                  {copied ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="0" ry="0"/>
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                    </svg>
                  )}
                </button>
              )}

              {/* Sound toggle */}
              <button
                className="acp-hbtn"
                onClick={() => setSoundEnabled(v => !v)}
                title={soundEnabled ? "Mute" : "Unmute"}
                style={{
                  background: soundEnabled ? "rgba(255,255,255,0.08)" : "rgba(239,68,68,0.22)",
                  color: soundEnabled ? "rgba(255,255,255,0.65)" : "#fca5a5",
                  transition: "background 0.15s, color 0.15s",
                }}
              >
                {soundEnabled ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                    <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/>
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                    <line x1="23" y1="9" x2="17" y2="15"/>
                    <line x1="17" y1="9" x2="23" y2="15"/>
                  </svg>
                )}
              </button>

              {/* Minimize */}
              <button
                className="acp-hbtn"
                onClick={() => setMinimized(true)}
                title="Minimize"
                style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.65)" }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M5 12h14"/>
                </svg>
              </button>

              {/* Close */}
              <button
                className="acp-hbtn"
                onClick={() => { setOpen(false); setMinimized(false) }}
                style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.65)" }}
                aria-label="Close"
              >
                <svg width="11" height="11" viewBox="0 0 14 14" fill="none"
                  stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M1 1l12 12M13 1L1 13"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Body */}
          {!conversationId ? (
            <div style={{ flex: 1, overflowY: "auto", padding: "18px 16px", background: "#f8f9fc" }}>
              <div style={{
                background: "#1a1a2e", borderRadius: 0,
                padding: "14px 14px 12px", marginBottom: 18, textAlign: "center",
              }}>
                <div style={{ fontSize: 20, marginBottom: 5 }}>👋</div>
                <div style={{ color: "#fff", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                  Hi there! How can we help?
                </div>
                <div style={{ color: "rgba(255,255,255,0.42)", fontSize: 11.5 }}>
                  Fill in your details and we'll connect you right away.
                </div>
              </div>
              <UserInfoForm onSubmit={handleStartChat}/>
            </div>
          ) : (
            <>
              <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>
                <div
                  ref={msgAreaRef}
                  className="acp-msg-area"
                  onScroll={handleMsgScroll}
                  style={{
                    height: "100%", overflowY: "auto",
                    padding: "12px 11px", background: "#f7f8fc",
                    display: "flex", flexDirection: "column", gap: 2,
                  }}
                >
                  {/* Typing indicator */}
                  {showTyping && (
                    <div style={{ animation: "acpFadeIn 0.22s ease-out", marginBottom: 2 }}>
                      <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 500, paddingLeft: 3, marginBottom: 3 }}>
                        Support Agent
                      </div>
                      <div style={{
                        display: "inline-flex", alignItems: "center", gap: 4,
                        background: "#fff", border: "1px solid #eef0f5",
                        borderRadius: 0, padding: "9px 13px",
                      }}>
                        <span className="acp-dot"/><span className="acp-dot"/><span className="acp-dot"/>
                      </div>
                    </div>
                  )}

                  {/* Auto welcome */}
                  {autoMessage && (
                    <div style={{ animation: "acpFadeIn 0.28s ease-out", marginBottom: 4 }}>
                      <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 500, paddingLeft: 3, marginBottom: 3 }}>
                        Support Agent
                      </div>
                      <div style={{
                        background: "#fff", border: "1px solid #eef0f5",
                        borderRadius: 0, padding: "9px 13px",
                        fontSize: 13, color: "#111827", lineHeight: 1.5, maxWidth: "88%",
                      }}>
                        {autoMessage}
                      </div>
                      <div style={{ paddingLeft: 3, marginTop: 3 }}>
                        <span style={{ fontSize: 9.5, color: "#c4c9d4" }}>
                          {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                  )}

                  {messages.map((msg, i) => {
                    const isLast     = i === messages.length - 1
                    const isCustomer = msg.role === "customer"
                    const prevMsg    = i > 0 ? messages[i - 1] : null
                    const isFirstInGroup = !prevMsg || prevMsg.role !== msg.role

                    return (
                      <div key={msg.id} style={{
                        display: "flex", flexDirection: "column",
                        marginTop: isFirstInGroup && i !== 0 ? 8 : 0,
                      }}>
                        {!isCustomer && isFirstInGroup && (
                          <div style={{
                            fontSize: 10, color: "#9ca3af", fontWeight: 500,
                            paddingLeft: 3, marginBottom: 3,
                            animation: "acpFadeIn 0.2s ease-out",
                          }}>
                            Support Agent
                          </div>
                        )}

                        <MessageBubble role={msg.role} text={msg.body} files={msg.files}/>

                        {isCustomer && (
                          <div style={{
                            display: "flex", justifyContent: "flex-end",
                            alignItems: "center", gap: 3,
                            marginTop: 3, paddingRight: 2, marginBottom: 2,
                          }}>
                            <span style={{ fontSize: 9.5, color: "#c4c9d4" }}>
                              {new Date(msg.created_at || Date.now()).toLocaleTimeString([], {
                                hour: "2-digit", minute: "2-digit"
                              })}
                            </span>
                            <svg width="15" height="9" viewBox="0 0 16 9" fill="none"
                              stroke={isLast ? "#3b82f6" : "#c4c9d4"}
                              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 4.5l2.5 2.5 4-5"/><path d="M6 4.5l2.5 2.5 4-5"/>
                            </svg>
                          </div>
                        )}

                        {!isCustomer && (
                          <div style={{ paddingLeft: 3, marginTop: 3, marginBottom: 2 }}>
                            <span style={{ fontSize: 9.5, color: "#c4c9d4" }}>
                              {new Date(msg.created_at || Date.now()).toLocaleTimeString([], {
                                hour: "2-digit", minute: "2-digit"
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {/* Feature: End-of-chat rating prompt */}
                  {showRating && (
                    <div style={{
                      animation: "acpFadeIn 0.3s ease-out",
                      background: "#fff", border: "1px solid #eef0f5",
                      borderRadius: 0, padding: "12px 14px", marginTop: 8,
                      textAlign: "center",
                    }}>
                      <div style={{ fontSize: 11.5, color: "#374151", fontWeight: 600, marginBottom: 8 }}>
                        How was your experience?
                      </div>
                      <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
                        {[1,2,3,4,5].map(star => (
                          <span
                            key={star}
                            className="acp-star"
                            onClick={() => { setChatRating(star as any); setShowRating(false) }}
                            style={{ color: chatRating >= star ? "#f59e0b" : "#d1d5db" }}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <button
                        className="acp-btn"
                        onClick={() => setShowRating(false)}
                        style={{
                          marginTop: 8, fontSize: 10, color: "#9ca3af",
                          textDecoration: "underline", cursor: "pointer",
                        }}
                      >
                        Skip
                      </button>
                    </div>
                  )}

                  {chatRating > 0 && (
                    <div style={{
                      animation: "acpFadeIn 0.25s ease-out",
                      textAlign: "center", fontSize: 11, color: "#6b7280",
                      padding: "6px 0",
                    }}>
                      Thanks for your feedback! {["","😞","😕","😐","😊","🤩"][chatRating]}
                    </div>
                  )}

                  <div ref={bottomRef}/>
                </div>

                {showScrollBtn && (
                  <button className="acp-scroll-btn" onClick={scrollToBottom}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M12 5v14M5 12l7 7 7-7"/>
                    </svg>
                    {unreadCount > 0
                      ? `${unreadCount} new message${unreadCount > 1 ? "s" : ""}`
                      : "Latest messages"
                    }
                  </button>
                )}
              </div>

              {/* Input + footer */}
              <div style={{ borderTop: "1px solid #eef0f5", background: "#fff", flexShrink: 0 }}>

                {/* Quick-reply chips */}
                {messages.length === 0 && (
                  <div style={{
                    display: "flex", gap: 6,
                    padding: "9px 11px 3px",
                    overflowX: "auto", scrollbarWidth: "none",
                  }}>
                    {["Part availability?", "Track my order", "Return a part", "Price check"].map(chip => (
                      <button key={chip} className="acp-chip" onClick={() => sendMessage(chip)}>
                        {chip}
                      </button>
                    ))}
                  </div>
                )}

                <MessageInput onSend={sendMessage}/>

                {/* Feature: Rate chat + footer */}
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  paddingBottom: 9, paddingTop: 1, paddingLeft: 12, paddingRight: 12,
                }}>
                  <button
                    className="acp-btn"
                    onClick={() => { setShowRating(true); scrollToBottom() }}
                    title="Rate this chat"
                    style={{
                      fontSize: 10, color: "#9ca3af", gap: 3,
                      display: "flex", alignItems: "center",
                      cursor: "pointer",
                      WebkitTapHighlightColor: "transparent",
                    }}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                    Rate chat
                  </button>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none"
                      stroke="#c4c9d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                    <span style={{ fontSize: 10, color: "#c4c9d4" }}>
                      Powered by <b style={{ color: "#9ca3af", fontWeight: 600 }}>ACPremiumAuto</b>
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}