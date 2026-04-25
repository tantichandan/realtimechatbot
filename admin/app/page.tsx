"use client"

import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import { useNewChatSound } from "@/hooks/useNewChatSound"

type Conversation = {
  id: string
  customer_name: string
  customer_email: string
  created_at: string
  is_unread: boolean
  metadata: any
}

export default function AdminHome() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const playNewChat = useNewChatSound()
  const [chats, setChats] = useState([])

  const fetchConversations = async () => {
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .order("created_at", { ascending: false })
    if (!error && data) setConversations(data)
    else console.error("Error fetching conversations:", error)
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (!confirm("Delete this conversation?")) return
    setDeletingId(id)
    await supabase.from("conversations").delete().eq("id", id)
    setConversations((prev) => prev.filter((c) => c.id !== id))
    setDeletingId(null)
  }

  useEffect(() => {
    fetchConversations()
    const channel = supabase
      .channel("conversations")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "conversations" },
        () => { fetchConversations() })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const unreadCount = conversations.filter((c) => c.is_unread).length

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMins = Math.floor((now.getTime() - date.getTime()) / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)
    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return "Yesterday"
    return date.toLocaleDateString([], { day: "numeric", month: "short" })
  }

  const avatarColors = [
    { bg: "#e8f0fe", color: "#3b5bdb" },
    { bg: "#fce8f3", color: "#c2185b" },
    { bg: "#e8f8f1", color: "#1a7f52" },
    { bg: "#fff4e0", color: "#b45309" },
    { bg: "#f0ebff", color: "#6d28d9" },
    { bg: "#fef0e8", color: "#c2410c" },
  ]

  const getAvatarColor = (name: string) =>
    avatarColors[name.charCodeAt(0) % avatarColors.length]

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f5f6fa",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      <style>{`
        @keyframes spin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:translateY(0) } }
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        .conv-row { transition: box-shadow 0.15s, border-color 0.15s; }
        .conv-row:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.07) !important; }
        .del-btn:hover { background: #fee2e2 !important; border-color: #fca5a5 !important; }
        .logout-btn:hover { background: #dc2626 !important; }
        @media (max-width: 600px) {
          .stat-label { display: none; }
          .page-pad { padding: 20px 16px !important; }
          .navbar-pad { padding: 0 16px !important; }
          .part-tag { display: none !important; }
          .email-text { max-width: 130px; }
        }
      `}</style>

      {/* ── Navbar ── */}
      <div className="navbar-pad" style={{
        background: "#fff",
        borderBottom: "1px solid #ebebeb",
        padding: "0 24px",
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}>
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 30, height: 30,
            background: "#1a1a2e",
            borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
          </div>
          <span style={{ color: "#1a1a2e", fontWeight: 700, fontSize: 14 }}>
            ACPremiumAuto
          </span>
          <span style={{ color: "#d1d5db", fontSize: 13 }}>/</span>
          <span style={{ color: "#9ca3af", fontSize: 12 }}>Support</span>
        </div>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 5,
            background: "#f0faf4", border: "1px solid #bbf7d0",
            borderRadius: 20, padding: "4px 10px",
          }}>
            <span style={{
              width: 7, height: 7, background: "#22c55e",
              borderRadius: "50%", display: "inline-block",
            }}/>
            <span style={{ color: "#15803d", fontSize: 11.5, fontWeight: 500 }}>Live</span>
          </div>

          <button
            className="logout-btn"
            onClick={() => {
              sessionStorage.removeItem("admin_auth")
              sessionStorage.removeItem("admin_auth_time")
              window.location.reload()
            }}
            style={{
              padding: "5px 12px",
              background: "#ef4444",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 12,
              cursor: "pointer",
              fontWeight: 600,
              height: 30,
              transition: "background 0.15s",
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* ── Page content ── */}
      <div className="page-pad" style={{ padding: "28px 24px", maxWidth: 760, margin: "0 auto" }}>

        {/* Header */}
        <div style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 24,
          gap: 10,
          flexWrap: "wrap",
        }}>
          <div>
            <h1 style={{
              color: "#111827", fontSize: 20, fontWeight: 700,
              margin: 0, letterSpacing: "-0.02em",
            }}>
              Conversations
            </h1>
            <p style={{ color: "#9ca3af", fontSize: 12.5, margin: "4px 0 0" }}>
              {conversations.length} total{unreadCount > 0 && ` · ${unreadCount} unread`}
            </p>
          </div>

          {unreadCount > 0 && (
            <div style={{
              background: "#fef2f2", border: "1px solid #fecaca",
              borderRadius: 20, padding: "4px 12px",
              display: "flex", alignItems: "center", gap: 5,
              animation: "fadeIn 0.2s ease-out",
            }}>
              <span style={{
                width: 7, height: 7, background: "#ef4444",
                borderRadius: "50%", display: "inline-block",
              }}/>
              <span style={{ color: "#dc2626", fontSize: 12, fontWeight: 600 }}>
                {unreadCount} new message{unreadCount > 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 10,
          marginBottom: 24,
        }}>
          {[
            {
              label: "Total", value: conversations.length,
              icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
              color: "#3b5bdb", bg: "#eef2ff",
            },
            {
              label: "Unread", value: unreadCount,
              icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
              color: "#dc2626", bg: "#fef2f2",
            },
            {
              label: "Today",
              value: conversations.filter(c =>
                new Date(c.created_at).toDateString() === new Date().toDateString()
              ).length,
              icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
              color: "#059669", bg: "#ecfdf5",
            },
          ].map((stat) => (
            <div key={stat.label} style={{
              background: "#fff",
              border: "1px solid #f0f0f0",
              borderRadius: 14,
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}>
              <div style={{
                width: 36, height: 36,
                background: stat.bg,
                borderRadius: 10,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke={stat.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={stat.icon}/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#111827", lineHeight: 1 }}>
                  {stat.value}
                </div>
                <div className="stat-label" style={{ fontSize: 11.5, color: "#9ca3af", marginTop: 3 }}>
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {conversations.length === 0 && (
          <div style={{
            background: "#fff",
            border: "1px solid #f0f0f0",
            borderRadius: 16,
            padding: "56px 24px",
            textAlign: "center",
            animation: "fadeIn 0.3s ease-out",
          }}>
            <div style={{
              width: 50, height: 50,
              background: "#f5f6fa", borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 12px",
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="#c4c9d4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
              </svg>
            </div>
            <p style={{ color: "#9ca3af", fontSize: 14, margin: 0, fontWeight: 500 }}>
              No conversations yet
            </p>
            <p style={{ color: "#c4c9d4", fontSize: 12, margin: "5px 0 0" }}>
              New chats will appear here in real time
            </p>
          </div>
        )}

        {/* Conversation list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {conversations.map((conv) => {
            const avatar = getAvatarColor(conv.customer_name || "A")
            return (
              <div
                key={conv.id}
                className="conv-row"
                onClick={() => { window.location.href = `/chat/${conv.id}` }}
                style={{
                  background: "#fff",
                  border: `1px solid ${conv.is_unread ? "#bfdbfe" : "#f0f0f0"}`,
                  borderRadius: 14,
                  padding: "13px 14px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  position: "relative",
                  animation: "fadeIn 0.2s ease-out",
                }}
              >
                {/* Unread bar */}
                {conv.is_unread && (
                  <div style={{
                    position: "absolute",
                    left: 0, top: 10, bottom: 10,
                    width: 3,
                    background: "#3b5bdb",
                    borderRadius: "0 3px 3px 0",
                  }}/>
                )}

                {/* Avatar */}
                <div style={{
                  width: 42, height: 42,
                  borderRadius: "50%",
                  background: avatar.bg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                  fontSize: 12,
                  fontWeight: 700,
                  color: avatar.color,
                  letterSpacing: "0.02em",
                }}>
                  {getInitials(conv.customer_name || "?")}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Name row */}
                  <div style={{
                    display: "flex", alignItems: "center",
                    gap: 7, marginBottom: 3,
                  }}>
                    <span style={{
                      color: "#111827",
                      fontSize: 13.5,
                      fontWeight: conv.is_unread ? 700 : 500,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>
                      {conv.customer_name}
                    </span>
                    {conv.is_unread && (
                      <span style={{
                        background: "#3b5bdb", color: "#fff",
                        fontSize: 9, fontWeight: 700,
                        padding: "2px 6px", borderRadius: 20,
                        letterSpacing: "0.05em", flexShrink: 0,
                      }}>
                        NEW
                      </span>
                    )}
                  </div>

                  {/* Email + part */}
                  <div style={{
                    display: "flex", alignItems: "center",
                    gap: 5, flexWrap: "nowrap",
                  }}>
                    <span className="email-text" style={{
                      color: "#9ca3af", fontSize: 12,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {conv.customer_email}
                    </span>
                    {conv.metadata?.part && (
                      <span className="part-tag" style={{
                        background: "#f5f6fa", border: "1px solid #ebebeb",
                        borderRadius: 6, padding: "1px 6px",
                        fontSize: 11, color: "#6b7280", whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}>
                        {conv.metadata.part}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: time + actions */}
                <div style={{
                  display: "flex", flexDirection: "column",
                  alignItems: "flex-end", gap: 7, flexShrink: 0,
                }}>
                  <span style={{ color: "#c4c9d4", fontSize: 11, whiteSpace: "nowrap" }}>
                    {formatTime(conv.created_at)}
                  </span>

                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    {/* Delete */}
                    <button
                      className="del-btn"
                      onClick={(e) => handleDelete(e, conv.id)}
                      disabled={deletingId === conv.id}
                      title="Delete"
                      style={{
                        width: 28, height: 28,
                        border: "1px solid #fecaca",
                        borderRadius: 7,
                        background: "#fff5f5",
                        cursor: deletingId === conv.id ? "not-allowed" : "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        padding: 0,
                        opacity: deletingId === conv.id ? 0.5 : 1,
                        transition: "background 0.15s, border-color 0.15s",
                        flexShrink: 0,
                      }}
                    >
                      {deletingId === conv.id ? (
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                          stroke="#ef4444" strokeWidth="2" strokeLinecap="round"
                          style={{ animation: "spin 0.8s linear infinite" }}>
                          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                        </svg>
                      ) : (
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                          stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                          <path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                        </svg>
                      )}
                    </button>

                    {/* Chevron */}
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                      stroke="#d1d5db" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom spacing for mobile */}
        <div style={{ height: 32 }}/>
      </div>
    </div>
  )
}