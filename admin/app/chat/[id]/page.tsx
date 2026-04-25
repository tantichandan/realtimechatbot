"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from "../../../lib/supabase"
import { useChat } from "../../../hooks/useAdminChat"
import MessageBubble from "../../../components/MessageBubble"
import MessageInput from "../../../components/MessageInput"

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const conversationId = params.id as string

  const { messages, sendMessage, bottomRef } = useChat(conversationId)

  const [agentName, setAgentName] = useState("")
  const [assignedTo, setAssignedTo] = useState<string | null>(null)
  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [assigning, setAssigning] = useState(false)
  const [assigned, setAssigned] = useState(false)

  useEffect(() => {
    if (!conversationId) return
    const markAsRead = async () => {
      await supabase
        .from("conversations")
        .update({ is_unread: false })
        .eq("id", conversationId)
    }
    markAsRead()
  }, [conversationId])

  useEffect(() => {
    const fetchConversation = async () => {
      const { data } = await supabase
        .from("conversations")
        .select("assigned_to, customer_name, customer_email")
        .eq("id", conversationId)
        .single()

      if (data) {
        setAssignedTo(data.assigned_to)
        setCustomerName(data.customer_name || "Customer")
        setCustomerEmail(data.customer_email || "")
      }
    }
    fetchConversation()
  }, [conversationId])

  const handleAssign = async () => {
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
  }

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100dvh",
      background: "#f5f6fa",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      overflow: "hidden",
    }}>

      {/* ── Header ── */}
      <div style={{
        background: "#fff",
        borderBottom: "1px solid #ebebeb",
        padding: "0 16px",
        height: 60,
        display: "flex",
        alignItems: "center",
        gap: 12,
        flexShrink: 0,
        zIndex: 10,
      }}>
        {/* Back button */}
        <button
          onClick={() => router.back()}
          style={{
            width: 36,
            height: 36,
            border: "1px solid #ebebeb",
            borderRadius: 10,
            background: "#fafafa",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            flexShrink: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>

        {/* Avatar */}
        <div style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: "#e8f0fe",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          fontSize: 12,
          fontWeight: 700,
          color: "#3b5bdb",
        }}>
          {getInitials(customerName)}
        </div>

        {/* Name + email */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            color: "#111827",
            fontWeight: 600,
            fontSize: 14,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {customerName}
          </div>
          <div style={{
            color: "#9ca3af",
            fontSize: 11,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {customerEmail}
          </div>
        </div>

        {/* Assigned badge */}
        {assignedTo && (
          <div style={{
            background: "#f0faf4",
            border: "1px solid #bbf7d0",
            borderRadius: 20,
            padding: "3px 10px",
            fontSize: 11,
            color: "#15803d",
            fontWeight: 500,
            whiteSpace: "nowrap",
            flexShrink: 0,
            maxWidth: 100,
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}>
            {assignedTo}
          </div>
        )}
      </div>

      {/* ── Agent assign bar ── */}
      <div style={{
        background: "#fff",
        borderBottom: "1px solid #f0f0f0",
        padding: "10px 16px",
        display: "flex",
        alignItems: "center",
        gap: 8,
        flexShrink: 0,
      }}>
        <div style={{
          width: 28,
          height: 28,
          background: "#f5f6fa",
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
          </svg>
        </div>

        <input
          placeholder="Your name to assign..."
          value={agentName}
          onChange={(e) => setAgentName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleAssign() }}
          style={{
            flex: 1,
            height: 34,
            border: "1.5px solid #e5e7eb",
            borderRadius: 8,
            padding: "0 10px",
            fontSize: 13,
            fontFamily: "inherit",
            outline: "none",
            background: "#f8f9fc",
            color: "#111827",
            minWidth: 0,
          }}
        />

        <button
          onClick={handleAssign}
          disabled={!agentName.trim() || assigning}
          style={{
            height: 34,
            padding: "0 14px",
            border: "none",
            borderRadius: 8,
            background: assigned ? "#f0faf4" : "#1a1a2e",
            color: assigned ? "#15803d" : "#fff",
            fontSize: 12,
            fontWeight: 600,
            cursor: agentName.trim() ? "pointer" : "not-allowed",
            opacity: !agentName.trim() ? 0.45 : 1,
            transition: "background 0.2s, color 0.2s",
            flexShrink: 0,
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          {assigning ? (
            <>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                style={{ animation: "spin 0.8s linear infinite" }}>
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              Assigning
            </>
          ) : assigned ? (
            <>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              Assigned
            </>
          ) : (
            "Assign"
          )}
        </button>
      </div>

      {/* ── Messages ── */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        WebkitOverflowScrolling: "touch",
      }}>
        {messages.length === 0 && (
          <div style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#d1d5db",
            paddingTop: 40,
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"
              style={{ marginBottom: 10 }}>
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
            <p style={{ fontSize: 13, margin: 0 }}>No messages yet</p>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            role={msg.role}
            text={msg.body}
            files={msg.files}
          />
        ))}

        <div ref={bottomRef} />
      </div>

      {/* ── Input ── */}
      <div style={{
        background: "#fff",
        borderTop: "1px solid #ebebeb",
        flexShrink: 0,
        paddingBottom: "env(safe-area-inset-bottom)",
      }}>
        <MessageInput onSend={(text, file) => sendMessage(text, "rep", file)} />
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg) }
          to   { transform: rotate(360deg) }
        }
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        input:focus {
          border-color: #1a1a2e !important;
          background: #fff !important;
        }
      `}</style>
    </div>
  )
}