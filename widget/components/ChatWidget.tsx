"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { createConversation } from "../hooks/useCreateConversation"
import { useChat } from "../hooks/useChat"
import MessageBubble from "./MessageBubble"
import MessageInput from "./MessageInput"
import UserInfoForm from "./UserInfoForm"

// ── CSS injected once ──
const GLOBAL_CSS = `
  *, *::before, *::after { box-sizing: border-box; }

  @keyframes acpFadeIn {
    from { opacity:0; transform:translateY(4px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes acpScrollPop {
    from { opacity:0; transform:translateX(-50%) translateY(6px); }
    to   { opacity:1; transform:translateX(-50%) translateY(0); }
  }
  @keyframes acpDot {
    0%,60%,100% { transform:translateY(0); opacity:.35; }
    30%          { transform:translateY(-5px); opacity:1; }
  }

  .acp-msg-area { scroll-behavior: smooth; }
  .acp-msg-area::-webkit-scrollbar { width: 0px; }

  .acp-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #999;
    animation: acpDot 1.2s ease-in-out infinite;
    display: inline-block;
  }
  .acp-dot:nth-child(2) { animation-delay: .15s; }
  .acp-dot:nth-child(3) { animation-delay: .30s; }

  .acp-chip {
    flex-shrink: 0;
    background: #fff;
    border: 1px solid #e5e5e5;
    color: #333;
    font-size: 12px;
    font-weight: 500;
    padding: 6px 12px;
    border-radius: 0;
    cursor: pointer;
    white-space: nowrap;
    font-family: inherit;
    transition: background 0.1s;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }
  .acp-chip:hover  { background: #f5f5f5; }
  .acp-chip:active { background: #ebebeb; }

  .acp-send-btn {
    width: 44px;
    height: 44px;
    background: #1a1a2e;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
    transition: background 0.15s;
  }
  .acp-send-btn:hover  { background: #22223a; }
  .acp-send-btn:active { background: #0f0f1e; }

  .acp-scroll-btn {
    animation: acpScrollPop 0.2s ease-out;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }
  .acp-scroll-btn:active { opacity: 0.85; }

  .acp-input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 13.5px;
    color: #111;
    background: transparent;
    font-family: inherit;
    padding: 0;
    line-height: 1.5;
    resize: none;
    min-height: 20px;
    max-height: 100px;
    overflow-y: auto;
  }
  .acp-input::placeholder { color: #aaa; }
`

export default function ChatWidget({ widgetKey }: { widgetKey: string }) {
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [unreadCount, setUnreadCount]       = useState(0)
  const [autoGreeted, setAutoGreeted]       = useState(false)
  const [showTyping, setShowTyping]         = useState(false)
  const [autoMessage, setAutoMessage]       = useState<string | null>(null)
  const [showScrollBtn, setShowScrollBtn]   = useState(false)

  const msgAreaRef = useRef<HTMLDivElement>(null)
  const { messages, sendMessage, bottomRef } = useChat(conversationId || undefined)

  // ── Inject CSS once ──
  useEffect(() => {
    if (document.getElementById("acp-widget-styles")) return
    const tag = document.createElement("style")
    tag.id = "acp-widget-styles"
    tag.textContent = GLOBAL_CSS
    document.head.appendChild(tag)
  }, [])

  // ── Persist conversation ──
  useEffect(() => {
    const savedId = localStorage.getItem("chat_conversation_id")
    if (savedId) setConversationId(savedId)
  }, [])

  // ── Unread count ──
  useEffect(() => {
    if (messages.length === 0) return
    const last = messages[messages.length - 1]
    if (last?.role === "rep") setUnreadCount((p) => p + 1)
  }, [messages])

  // ── Auto-greeting ──
  useEffect(() => {
    if (!conversationId || autoGreeted) return
    setAutoGreeted(true)
    setShowTyping(true)
    const t = setTimeout(() => {
      setShowTyping(false)
      setAutoMessage("👋 You're now connected with a live parts expert. How can we help?")
    }, 1800)
    return () => clearTimeout(t)
  }, [conversationId])

  // ── Scroll tracking ──
  const handleMsgScroll = useCallback(() => {
    const el = msgAreaRef.current
    if (!el) return
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 100)
  }, [])

  const scrollToBottom = () => {
    msgAreaRef.current?.scrollTo({ top: msgAreaRef.current.scrollHeight, behavior: "smooth" })
    setUnreadCount(0)
  }

  const handleStartChat = async (data: any) => {
    const res = await createConversation({
      name: data.name,
      email: data.email,
      phone: data.phone,
      metadata: { part: data.part },
      widget_key: widgetKey,
    })
    if (res) {
      setConversationId(res.id)
      localStorage.setItem("chat_conversation_id", res.id)
    }
  }

  const fmtTime = (ts?: string | number) =>
    new Date(ts || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────
  return (
    <div style={{
      position: "fixed",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      background: "#fff",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      WebkitFontSmoothing: "antialiased",
      overflow: "hidden",
    }}>

      {/* ════════════════
          BODY
      ════════════════ */}
      {!conversationId ? (

        // ── Onboarding form ──
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "24px 16px",
          background: "#f9f9f9",
          paddingBottom: "max(24px, env(safe-area-inset-bottom, 24px))",
        }}>
          {/* Welcome block */}
          <div style={{
            background: "#1a1a2e",
            padding: "20px 18px 18px",
            marginBottom: 20,
          }}>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
              Sales Support
            </div>
            <div style={{ color: "#fff", fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
              Hi there! Looking for any specific model today?
            </div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>
              Fill in your details and we'll connect you right away.
            </div>
          </div>

          <UserInfoForm onSubmit={handleStartChat} />
        </div>

      ) : (

        <>
          {/* ── Messages ── */}
          <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>
            <div
              ref={msgAreaRef}
              className="acp-msg-area"
              onScroll={handleMsgScroll}
              style={{
                height: "100%",
                overflowY: "auto",
                padding: "16px 12px 8px",
                background: "#f9f9f9",
                display: "flex",
                flexDirection: "column",
                gap: 0,
              }}
            >
              {/* Typing indicator */}
              {showTyping && <TypingBubble />}

              {/* Auto-welcome */}
              {autoMessage && (
                <div style={{ animation: "acpFadeIn 0.3s ease-out", marginBottom: 10 }}>
                  <RoleLabel>AGENT</RoleLabel>
                  <AgentBubble>{autoMessage}</AgentBubble>
                  <Time value={Date.now()} align="left" />
                </div>
              )}

              {/* Messages */}
              {messages.map((msg, i) => {
                const isCustomer     = msg.role === "customer"
                const prevMsg        = i > 0 ? messages[i - 1] : null
                const isFirstInGroup = !prevMsg || prevMsg.role !== msg.role
                const isLast         = i === messages.length - 1

                return (
                  <div key={msg.id} style={{
                    display: "flex",
                    flexDirection: "column",
                    marginTop: isFirstInGroup && i !== 0 ? 14 : 3,
                  }}>
                    {isFirstInGroup && (
                      <RoleLabel align={isCustomer ? "right" : "left"}>
                        {isCustomer ? "VISITOR" : "AGENT"}
                      </RoleLabel>
                    )}

                    {isCustomer ? (
                      <VisitorBubble>{msg.body}</VisitorBubble>
                    ) : (
                      <AgentBubble>{msg.body}</AgentBubble>
                    )}

                    <div style={{
                      display: "flex",
                      justifyContent: isCustomer ? "flex-end" : "flex-start",
                      alignItems: "center",
                      gap: 4,
                      marginTop: 4,
                      marginBottom: 2,
                    }}>
                      <Time value={msg.created_at} align={isCustomer ? "right" : "left"} />
                      {isCustomer && (
                        <svg width="16" height="9" viewBox="0 0 16 9" fill="none"
                          stroke={isLast ? "#3b82f6" : "#ccc"}
                          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 4.5l2.5 2.5 4-5"/>
                          <path d="M6 4.5l2.5 2.5 4-5"/>
                        </svg>
                      )}
                    </div>
                  </div>
                )
              })}

              <div ref={bottomRef} style={{ height: 4 }} />
            </div>

            {/* Scroll-to-bottom */}
            {showScrollBtn && (
              <button
                className="acp-scroll-btn"
                onClick={scrollToBottom}
                style={{
                  position: "absolute",
                  bottom: 10,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "#1a1a2e",
                  border: "none",
                  color: "#fff",
                  fontSize: 11.5,
                  fontWeight: 600,
                  padding: "6px 14px 6px 10px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  zIndex: 10,
                  whiteSpace: "nowrap",
                }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M12 5v14M5 12l7 7 7-7"/>
                </svg>
                {unreadCount > 0
                  ? `${unreadCount} new message${unreadCount > 1 ? "s" : ""}`
                  : "Latest messages"}
              </button>
            )}
          </div>

          {/* ── Input area ── */}
          <div style={{
            borderTop: "1px solid #e8e8e8",
            background: "#fff",
            flexShrink: 0,
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
          }}>
            {/* Quick-reply chips */}
            {messages.length === 0 && (
              <div style={{
                display: "flex",
                gap: 6,
                padding: "10px 12px 4px",
                overflowX: "auto",
                scrollbarWidth: "none",
              }}>
                {["Part availability?", "Track my order", "Return a part", "Price check"].map((chip) => (
                  <button key={chip} className="acp-chip" onClick={() => sendMessage(chip)}>
                    {chip}
                  </button>
                ))}
              </div>
            )}

            {/* Input row */}
            <InputRow onSend={sendMessage} />

            {/* Footer */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              paddingBottom: 10,
              paddingTop: 2,
            }}>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none"
                stroke="#ccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span style={{ fontSize: 10, color: "#ccc" }}>
                Powered by <strong style={{ color: "#aaa", fontWeight: 600 }}>ACPremiumAuto</strong>
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ─────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────

function RoleLabel({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return (
    <div style={{
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "0.08em",
      color: "#aaa",
      marginBottom: 5,
      textAlign: align,
    }}>
      {children}
    </div>
  )
}

function AgentBubble({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: "#f5f0e8",   // cream/beige — matches screenshot
      padding: "11px 14px",
      fontSize: 13.5,
      color: "#1a1a1a",
      lineHeight: 1.55,
      maxWidth: "82%",
      alignSelf: "flex-start",
      wordBreak: "break-word",
    }}>
      {children}
    </div>
  )
}

function VisitorBubble({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: "#1a1a2e",   // dark brand — matches screenshot
      padding: "11px 14px",
      fontSize: 13.5,
      color: "#fff",
      lineHeight: 1.55,
      maxWidth: "82%",
      alignSelf: "flex-end",
      wordBreak: "break-word",
      marginLeft: "auto",
    }}>
      {children}
    </div>
  )
}

function Time({ value, align }: { value?: string | number; align: "left" | "right" }) {
  const t = new Date(value || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  return (
    <span style={{
      fontSize: 10,
      color: "#bbb",
      display: "block",
      textAlign: align,
    }}>
      {t}
    </span>
  )
}

function TypingBubble() {
  return (
    <div style={{ marginBottom: 10, animation: "acpFadeIn 0.25s ease-out" }}>
      <RoleLabel>AGENT</RoleLabel>
      <div style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        background: "#f5f0e8",
        padding: "12px 16px",
      }}>
        <span className="acp-dot"/>
        <span className="acp-dot"/>
        <span className="acp-dot"/>
      </div>
    </div>
  )
}

// Inline input row (replaces <MessageInput> for full style control)
function InputRow({ onSend }: { onSend: (msg: string) => void }) {
  const [value, setValue] = useState("")
  const ref = useRef<HTMLTextAreaElement>(null)

  const submit = () => {
    const trimmed = value.trim()
    if (!trimmed) return
    onSend(trimmed)
    setValue("")
    if (ref.current) ref.current.style.height = "auto"
  }

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const onInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value)
    const el = e.target
    el.style.height = "auto"
    el.style.height = el.scrollHeight + "px"
  }

  return (
    <div style={{
      display: "flex",
      alignItems: "flex-end",
      gap: 0,
      padding: "10px 12px 10px",
      borderTop: "1px solid #f0f0f0",
    }}>
      <textarea
        ref={ref}
        className="acp-input"
        rows={1}
        value={value}
        onChange={onInput}
        onKeyDown={onKey}
        placeholder="Type a message..."
        style={{ flex: 1, marginRight: 10 }}
      />
      <button className="acp-send-btn" onClick={submit} aria-label="Send message">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
          stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 2L11 13"/>
          <path d="M22 2L15 22l-4-9-9-4 20-7z"/>
        </svg>
      </button>
    </div>
  )
}