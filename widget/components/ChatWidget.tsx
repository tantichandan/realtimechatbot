"use client"

import { useState, useEffect } from "react"
import { createConversation } from "../hooks/useCreateConversation"
import { useChat } from "../hooks/useChat"
import MessageBubble from "./MessageBubble"
import MessageInput from "./MessageInput"
import UserInfoForm from "./UserInfoForm"

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const { messages, sendMessage, bottomRef } = useChat(conversationId || undefined)

  useEffect(() => {
    const savedId = localStorage.getItem("chat_conversation_id")
    if (savedId) setConversationId(savedId)
  }, [])

  useEffect(() => {
    if (open && !minimized) {
      setUnreadCount(0)
      return
    }
    if (messages.length === 0) return
    const last = messages[messages.length - 1]
    if (last?.role === "rep") {
      setUnreadCount((prev) => prev + 1)
    }
  }, [messages])

  const handleStartChat = async (data: any) => {
    const res = await createConversation({
      name: data.name,
      email: data.email,
      phone: data.phone,
      metadata: { part: data.part },
    })
    if (res) {
      setConversationId(res.id)
      localStorage.setItem("chat_conversation_id", res.id)
    }
  }

  return (
    <>
      <style>{`
        @keyframes acpSlideUp {
          from { opacity:0; transform:translateY(24px) scale(0.95); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes acpFadeIn {
          from { opacity:0; transform:translateY(5px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes acpPulse {
          0%,100% { box-shadow:0 0 0 0 rgba(239,68,68,0.5); }
          50%      { box-shadow:0 0 0 6px rgba(239,68,68,0); }
        }
        @keyframes pillSlide {
          from { opacity:0; transform:translateX(12px); }
          to   { opacity:1; transform:translateX(0); }
        }
        .acp-fab { transition:transform 0.2s, box-shadow 0.2s; }
        .acp-fab:hover { transform:scale(1.1) !important; box-shadow:0 8px 28px rgba(26,26,46,0.55) !important; }
        .acp-fab:active { transform:scale(0.94) !important; }
        .acp-hbtn { transition:background 0.15s; }
        .acp-hbtn:hover { background:rgba(255,255,255,0.18) !important; }
        .acp-msg-area::-webkit-scrollbar { width:3px; }
        .acp-msg-area::-webkit-scrollbar-thumb { background:#d1d5db; border-radius:4px; }
        .acp-msg-area::-webkit-scrollbar-track { background:transparent; }
      `}</style>

      {/* ── FAB ── */}
      <button
        className="acp-fab"
        onClick={() => { setOpen(!open); setMinimized(false); setUnreadCount(0) }}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          borderRadius: "50%",
          width: 58,
          height: 58,
          background: "#1a1a2e",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 4px 20px rgba(26,26,46,0.4)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{
          transition: "transform 0.3s, opacity 0.2s",
          transform: open ? "rotate(90deg) scale(0.9)" : "rotate(0deg) scale(1)",
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

        {/* Unread badge */}
        {unreadCount > 0 && !open && (
          <div style={{
            position: "absolute", top: -3, right: -3,
            minWidth: 20, height: 20,
            background: "#ef4444",
            borderRadius: 10,
            border: "2.5px solid #fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 10, fontWeight: 700, color: "#fff",
            padding: "0 4px",
            animation: "acpPulse 1.8s ease-in-out infinite",
          }}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </div>
        )}

        {/* Online dot */}
        {!open && unreadCount === 0 && (
          <span style={{
            position: "absolute", bottom: 3, right: 3,
            width: 12, height: 12,
            background: "#22c55e", borderRadius: "50%",
            border: "2.5px solid #1a1a2e",
          }}/>
        )}
      </button>

      {/* ── Minimized pill ── */}
      {open && minimized && (
        <div
          onClick={() => { setMinimized(false); setUnreadCount(0) }}
          style={{
            position: "fixed",
            bottom: 96,
            right: 24,
            background: "#1a1a2e",
            color: "#fff",
            borderRadius: 28,
            padding: "9px 14px 9px 10px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "0 6px 20px rgba(26,26,46,0.35)",
            zIndex: 9998,
            cursor: "pointer",
            animation: "pillSlide 0.2s ease-out",
          }}
        >
          <div style={{
            width: 28, height: 28,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
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
            onClick={(e) => { e.stopPropagation(); setOpen(false); setMinimized(false) }}
            style={{
              background: "rgba(255,255,255,0.12)",
              border: "none", color: "#fff",
              width: 22, height: 22,
              borderRadius: "50%", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
              marginLeft: 2,
            }}
          >
            <svg width="8" height="8" viewBox="0 0 10 10" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M1 1l8 8M9 1L1 9"/>
            </svg>
          </button>
        </div>
      )}

      {/* ── Chat Box ── */}
      {open && !minimized && (
        <div style={{
          position: "fixed",
          bottom: 96,
          right: 24,
          width: "min(368px, calc(100vw - 32px))",
          height: "min(560px, calc(100svh - 120px))",
          background: "#fff",
          borderRadius: 22,
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 24px 64px rgba(0,0,0,0.14), 0 4px 16px rgba(0,0,0,0.07)",
          border: "1px solid rgba(0,0,0,0.06)",
          overflow: "hidden",
          zIndex: 9998,
          animation: "acpSlideUp 0.28s cubic-bezier(0.34,1.46,0.64,1)",
        }}>

          {/* ── Header ── */}
          <div style={{
            background: "#1a1a2e",
            padding: "15px 16px",
            display: "flex",
            alignItems: "center",
            gap: 11,
            flexShrink: 0,
          }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{
                width: 40, height: 40,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.08)",
                border: "1.5px solid rgba(255,255,255,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none"
                  stroke="rgba(255,255,255,0.85)" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                </svg>
              </div>
              <span style={{
                position: "absolute", bottom: 1, right: 1,
                width: 10, height: 10,
                background: "#22c55e", borderRadius: "50%",
                border: "2px solid #1a1a2e",
              }}/>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                color: "#fff", fontSize: 13.5, fontWeight: 600,
                letterSpacing: "0.01em",
              }}>
                ACPremiumAuto Support
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3 }}>
                <span style={{
                  width: 6, height: 6,
                  background: "#22c55e", borderRadius: "50%", flexShrink: 0,
                }}/>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>
                  Online · typically replies in minutes
                </span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <button
                className="acp-hbtn"
                onClick={() => setMinimized(true)}
                title="Minimize"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "none",
                  color: "rgba(255,255,255,0.65)",
                  width: 30, height: 30,
                  borderRadius: 8, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M5 12h14"/>
                </svg>
              </button>
              <button
                className="acp-hbtn"
                onClick={() => { setOpen(false); setMinimized(false) }}
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "none",
                  color: "rgba(255,255,255,0.65)",
                  width: 30, height: 30,
                  borderRadius: 8, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none"
                  stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M1 1l12 12M13 1L1 13"/>
                </svg>
              </button>
            </div>
          </div>

          {/* ── Body ── */}
          {!conversationId ? (
            <div style={{
              flex: 1, overflowY: "auto",
              padding: "20px 18px", background: "#f8f9fc",
            }}>
              <div style={{
                background: "#1a1a2e",
                borderRadius: 14,
                padding: "16px 16px 14px",
                marginBottom: 20,
                textAlign: "center",
              }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>👋</div>
                <div style={{ color: "#fff", fontSize: 13.5, fontWeight: 600, marginBottom: 4 }}>
                  Hi there! How can we help?
                </div>
                <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11.5 }}>
                  Fill in your details and we'll connect you right away.
                </div>
              </div>
              <UserInfoForm onSubmit={handleStartChat}/>
            </div>
          ) : (
            <>
              <div
                className="acp-msg-area"
                style={{
                  flex: 1, overflowY: "auto",
                  padding: "14px 12px",
                  background: "#f7f8fc",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                {messages.length === 0 && (
                  <div style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "40px 20px",
                    textAlign: "center",
                    animation: "acpFadeIn 0.3s ease-out",
                  }}>
                    <div style={{
                      width: 52, height: 52,
                      borderRadius: "50%",
                      background: "#eef0f7",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      marginBottom: 12,
                    }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                        stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                      </svg>
                    </div>
                    <p style={{ color: "#6b7280", fontSize: 13, fontWeight: 500, margin: "0 0 4px" }}>
                      No messages yet
                    </p>
                    <p style={{ color: "#c4c9d4", fontSize: 11.5, margin: 0 }}>
                      Send us a message to get started
                    </p>
                  </div>
                )}

                {messages.map((msg, i) => {
                  const isLast = i === messages.length - 1
                  const isCustomer = msg.role === "customer"
                  const prevMsg = i > 0 ? messages[i - 1] : null
                  const isFirstInGroup = !prevMsg || prevMsg.role !== msg.role

                  return (
                    <div key={msg.id} style={{
                      display: "flex",
                      flexDirection: "column",
                      marginTop: isFirstInGroup && i !== 0 ? 8 : 0,
                    }}>
                      {!isCustomer && isFirstInGroup && (
                        <div style={{
                          fontSize: 10.5,
                          color: "#9ca3af",
                          fontWeight: 500,
                          paddingLeft: 4,
                          marginBottom: 3,
                          animation: "acpFadeIn 0.2s ease-out",
                        }}>
                          Support Agent
                        </div>
                      )}

                      <MessageBubble
                        role={msg.role}
                        text={msg.body}
                        files={msg.files}
                      />

                      {isCustomer && (
                        <div style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          alignItems: "center",
                          gap: 3,
                          marginTop: 3,
                          paddingRight: 2,
                          marginBottom: 2,
                        }}>
                          <span style={{ fontSize: 10, color: "#c4c9d4" }}>
                            {new Date(msg.created_at || Date.now()).toLocaleTimeString([], {
                              hour: "2-digit", minute: "2-digit"
                            })}
                          </span>
                          <svg width="16" height="9" viewBox="0 0 16 9" fill="none"
                            stroke={isLast ? "#3b82f6" : "#c4c9d4"}
                            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 4.5l2.5 2.5 4-5"/>
                            <path d="M6 4.5l2.5 2.5 4-5"/>
                          </svg>
                        </div>
                      )}

                      {!isCustomer && (
                        <div style={{ paddingLeft: 4, marginTop: 3, marginBottom: 2 }}>
                          <span style={{ fontSize: 10, color: "#c4c9d4" }}>
                            {new Date(msg.created_at || Date.now()).toLocaleTimeString([], {
                              hour: "2-digit", minute: "2-digit"
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}

                <div ref={bottomRef}/>
              </div>

              <div style={{
                borderTop: "1px solid #eef0f5",
                background: "#fff",
                flexShrink: 0,
              }}>
                <MessageInput onSend={sendMessage}/>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  paddingBottom: 10,
                  paddingTop: 2,
                }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                    stroke="#c4c9d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  <span style={{ fontSize: 10.5, color: "#c4c9d4" }}>
                    Powered by <b style={{ color: "#9ca3af", fontWeight: 600 }}>ACPremiumAuto</b>
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}