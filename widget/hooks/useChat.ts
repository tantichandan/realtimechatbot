import { supabase } from "@/libs/supabase"
import { useEffect, useState, useRef } from "react"


type Message = {
  id: string
  conversation_id: string
  role: "customer" | "rep"
  body: string
  created_at: string
  files?: any[]
}

export function useChat(conversationId?: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const bottomRef = useRef<HTMLDivElement | null>(null)

  // 📥 Fetch messages
 const fetchMessages = async (convId: string) => {
  const { data: messagesData, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", convId)
    .order("created_at", { ascending: true })

  if (error || !messagesData) {
    console.error("Fetch error:", error)
    return
  }

  // 👉 fetch files
  const { data: filesData } = await supabase
    .from("message_files")
    .select("*")

  // 👉 attach files to each message
  const messagesWithFiles = messagesData.map((msg) => ({
    ...msg,
    files: filesData?.filter((f) => f.message_id === msg.id) || [],
  }))

  setMessages(messagesWithFiles)
}

  // ✉️ Send message + optional image
const sendMessage = async (text: string, file?: File | null) => {
  if (!conversationId) return

  let fileData: any = null

  // ✅ 1. Upload file FIRST
  if (file) {
    const fileName = `${Date.now()}-${file.name}`

    const { error: uploadError } = await supabase.storage
      .from("chat-files")
      .upload(fileName, file)

    if (uploadError) {
      console.error("Upload error:", uploadError)
      return
    }

    const { data: publicUrl } = supabase.storage
      .from("chat-files")
      .getPublicUrl(fileName)

    fileData = {
      file_url: publicUrl.publicUrl,
      file_type: "image",
    }
  }

  // ✅ 2. Insert message AFTER upload
  const { data: messageData } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      role: "customer",
      body: text || "",
    })
    .select()
    .single()

  if (!messageData) return

  // ✅ 3. Insert file AFTER message exists
  if (fileData) {
    await supabase.from("message_files").insert({
      message_id: messageData.id,
      ...fileData,
    })
  }

  // ✅ 4. Mark unread
  await supabase
    .from("conversations")
    .update({ is_unread: true })
    .eq("id", conversationId)
}

  // ⚡ Realtime subscription
  useEffect(() => {
    if (!conversationId) return

    fetchMessages(conversationId)

    const channel = supabase
      .channel(`chat-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
(payload) => {
  fetchMessages(conversationId) // 🔥 always fetch fresh with files
}
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId])

  // 🔽 Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return {
    messages,
    sendMessage,
    bottomRef,
  }
}