type Props = {
  role: "customer" | "rep"
  text: string
  files?: any[]
}

export default function MessageBubble({ role, text, files }: Props) {
  const isUser = role === "customer"

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        marginBottom: 10,
      }}
    >
      <div
        style={{
          padding: "10px 14px",
          borderRadius: 12,
          background: isUser ? "#007bff" : "#eee",
          color: isUser ? "#fff" : "#000",
          maxWidth: "70%",
        }}
      >
        {text && <div>{text}</div>}

        {/* 👇 IMAGE DISPLAY */}
        {files && files.length > 0 && (
          <div style={{ marginTop: 6 }}>
            {files.map((file, i) => (
              <img
                key={i}
                src={file.file_url}
                style={{
                  width: 150,
                  borderRadius: 6,
                  marginTop: 5,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}