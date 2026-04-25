import { useState, useRef } from "react"

export default function MessageInput({
  onSend,
}: {
  onSend: (msg: string, file?: File | null) => void
}) {
  const [text, setText] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSend = () => {
    if (!text.trim() && !file) return
    onSend(text, file)
    setText("")
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend()
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>

      {/* File chip — only shown when a file is selected */}
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
          {/* File icon */}
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="#3b5bdb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ flexShrink: 0 }}>
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
          </svg>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {file.name}
          </span>
          {/* Remove */}
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

      {/* Text + attach + send row */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>

        {/* Hidden file input triggered by the attach button */}
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
            width: 38,
            height: 38,
            flexShrink: 0,
            border: "1.5px solid #e5e7eb",
            borderRadius: 10,
            background: "#fafafa",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
          }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
            stroke="#6b7280" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
          </svg>
        </button>

        {/* Text input */}
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          style={{
            flex: 1,
            height: 50,
            border: "1.5px solid #e5e7eb",
            borderRadius: 0,
            padding: "0 14px",
            fontSize: 14,
            fontFamily: "inherit",
            outline: "none",
            background: "#f8f9fc",
            color: "#1f2937",
            minWidth: 0,
          }}
        />

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!text.trim() && !file}
          style={{
            width: 38,
            height: 38,
            flexShrink: 0,
            border: "none",
            borderRadius: 10,
            background: text.trim() || file ? "#1a1a2e" : "#e5e7eb",
            cursor: text.trim() || file ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            transition: "background 0.2s",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke={text.trim() || file ? "#fff" : "#9ca3af"}
            strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/>
          </svg>
        </button>

        

      </div>

      
    </div>
  )
}