import { useState, useRef } from "react"

export default function MessageInput({
  onSend,
}: {
  onSend: (msg: string, file?: File | null) => void
}) {
  const [text, setText] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    if (!text.trim() && !file) return
    onSend(text, file)
    setText("")
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
    if (textareaRef.current) textareaRef.current.style.height = "44px"
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "44px"
    el.style.height = Math.min(el.scrollHeight, 120) + "px"
  }

  const hasContent = text.trim().length > 0 || !!file

  return (
    <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 8 }}>

      {/* File chip */}
      {file && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "#f0f4ff",
          border: "1px solid #c7d4f8",
          borderRadius: 8,
          padding: "5px 8px",
          fontSize: 12,
          color: "#1a1a2e",
          fontWeight: 500,
          alignSelf: "flex-start",
          maxWidth: "100%",
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="#3b5bdb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ flexShrink: 0 }}>
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
          </svg>
          <span style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: 160,
          }}>
            {file.name}
          </span>
          <button
            onClick={() => {
              setFile(null)
              if (fileInputRef.current) fileInputRef.current.value = ""
            }}
            style={{
              border: "none",
              background: "rgba(59,91,219,0.12)",
              borderRadius: 4,
              width: 16,
              height: 16,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
              flexShrink: 0,
              color: "#3b5bdb",
            }}
          >
            <svg width="8" height="8" viewBox="0 0 10 10" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M1 1l8 8M9 1L1 9"/>
            </svg>
          </button>
        </div>
      )}

      {/* Input row */}
      <div style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 8,
      }}>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          style={{ display: "none" }}
        />

        {/* Attach button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          title="Attach file"
          style={{
            width: 44,
            height: 44,
            flexShrink: 0,
            border: "1.5px solid #e5e7eb",
            borderRadius: 12,
            background: "#fafafa",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            marginBottom: 0,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="#6b7280" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
          </svg>
        </button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => { setText(e.target.value); handleInput() }}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          style={{
            flex: 1,
            height: 44,
            minHeight: 44,
            maxHeight: 120,
            border: "1.5px solid #e5e7eb",
            borderRadius: 12,
            padding: "11px 14px",
            fontSize: 14,
            fontFamily: "inherit",
            lineHeight: 1.5,
            outline: "none",
            background: "#f8f9fc",
            color: "#111827",
            minWidth: 0,
            resize: "none",
            overflowY: "auto",
            display: "block",
            transition: "border-color 0.15s, background 0.15s",
            WebkitAppearance: "none",
            boxSizing: "border-box",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#1a1a2e"
            e.currentTarget.style.background = "#fff"
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#e5e7eb"
            e.currentTarget.style.background = "#f8f9fc"
          }}
        />

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!hasContent}
          style={{
            width: 44,
            height: 44,
            flexShrink: 0,
            border: "none",
            borderRadius: 12,
            background: hasContent ? "#1a1a2e" : "#e5e7eb",
            cursor: hasContent ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            transition: "background 0.2s",
          }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
            stroke={hasContent ? "#fff" : "#9ca3af"}
            strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/>
          </svg>
        </button>

      </div>

      {/* Hint */}
      <div style={{
        fontSize: 11,
        color: "#c4c9d4",
        textAlign: "center",
        lineHeight: 1,
      }}>
        Enter to send · Shift+Enter for new line
      </div>

    </div>
  )
}