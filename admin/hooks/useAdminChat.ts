import { useEffect, useState, useRef } from "react"
import { supabase } from "../lib/supabase"

type Message = {
  id: string
  conversation_id: string
  role: "customer" | "rep"
  body: string
  created_at: string
  files?: any[]
}

export function useChat(conversationId: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const bottomRef = useRef<HTMLDivElement | null>(null)

const fetchMessages = async () => {
  const { data: messagesData, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })

  if (error || !messagesData) {
    console.error(error)
    return
  }

  // 🔥 fetch files
  const { data: filesData } = await supabase
    .from("message_files")
    .select("*")

  // 🔗 attach files to messages
  const messagesWithFiles = messagesData.map((msg) => ({
    ...msg,
    files: filesData?.filter((f) => f.message_id === msg.id) || [],
  }))

  setMessages(messagesWithFiles)
}

 const sendMessage = async (
  text: string,
  role: "rep",
  file?: File | null
) => {
  if (!conversationId) return

  let fileData: any = null

  // 1. Upload file first
  if (file) {
    const fileName = `${Date.now()}-${file.name}`

    const { error } = await supabase.storage
      .from("chat-files")
      .upload(fileName, file)

    if (error) {
      console.error("Upload error:", error)
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

  // 2. Insert message
  const { data: messageData } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      role,
      body: text || "",
    })
    .select()
    .single()

  if (!messageData) return

  // 3. Insert file reference
  if (fileData) {
    await supabase.from("message_files").insert({
      message_id: messageData.id,
      ...fileData,
    })
  }
}

  useEffect(() => {
    fetchMessages()

    const channel = supabase
      .channel("admin-chat-" + conversationId)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
       (payload) => {
  fetchMessages() // 🔥 ALWAYS refresh full data
}
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return { messages, sendMessage, bottomRef }
}