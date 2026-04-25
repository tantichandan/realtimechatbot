import { supabase } from "@/libs/supabase"


export async function createConversation(data: {
  name: string
  email: string
  phone: string
  metadata?: any
}) {
  const { data: conversation, error } = await supabase
    .from("conversations")
    .insert({
      customer_name: data.name,
      customer_email: data.email,
      customer_phone: data.phone,
      metadata: data.metadata || {},
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating conversation:", error)
    return null
  }

  return conversation
}