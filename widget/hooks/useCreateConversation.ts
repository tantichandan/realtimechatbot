import { supabase } from "@/libs/supabase"

export async function createConversation(data: {
  name: string
  email: string
  phone: string
  metadata?: any
  widget_key: string
}) {

  // Find website using widget key
  const { data: website, error: websiteError } = await supabase
    .from("websites")
    .select("*")
    .eq("widget_key", data.widget_key)
    .single()

  if (websiteError || !website) {
    console.error("Website not found:", websiteError)
    return null
  }

  // Create conversation
  const { data: conversation, error } = await supabase
    .from("conversations")
    .insert({
      customer_name: data.name,
      customer_email: data.email,
      customer_phone: data.phone,
      metadata: data.metadata || {},

      // Ownership mapping
      website_id: website.id,
      user_id: website.user_id,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating conversation:", error)
    return null
  }

  return conversation
}