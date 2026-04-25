"use client"

import { useState } from "react"

export default function UserInfoForm({
  onSubmit,
}: {
  onSubmit: (data: any) => void
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    part: "",
  })

  const [loading, setLoading] = useState(false)

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.phone || !form.part) return

    setLoading(true)
    await onSubmit(form)
    setLoading(false)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      
      {/* Title */}
      <div style={{ textAlign: "center", marginBottom: 5 }}>
        <h3 style={{ margin: 0 }}>Get a Quick Quote</h3>
        <p style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
          Enter your details and start chatting with us
        </p>
      </div>

      {/* Name */}
      <input
        name="name"
        placeholder="Full Name"
        value={form.name}
        onChange={handleChange}
        style={inputStyle}
      />

      {/* Email */}
      <input
        name="email"
        placeholder="Email Address"
        value={form.email}
        onChange={handleChange}
        style={inputStyle}
      />

      {/* Phone */}
      <input
        name="phone"
        placeholder="Phone Number"
        value={form.phone}
        onChange={handleChange}
        style={inputStyle}
      />

      {/* Part */}
      <input
        name="part"
        placeholder="Example: 2015 BMW X5 Engine"
        value={form.part}
        onChange={handleChange}
        style={inputStyle}
      />

      {/* Button */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          padding: "10px",
          background: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
          fontWeight: "bold",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? "Starting..." : "Start Chat"}
      </button>

      {/* Small Trust Text */}
      <p style={{ fontSize: 11, color: "#888", textAlign: "center" }}>
        We typically respond within minutes 🚀
      </p>
    </div>
  )
}

const inputStyle = {
  padding: "10px",
  borderRadius: 6,
  border: "1px solid #ddd",
  fontSize: 14,
  outline: "none",
}