"use client"

import { useSearchParams } from "next/navigation"
import ChatWidget from "../components/ChatWidget"

export default function Home() {

  const searchParams = useSearchParams()

  const widgetKey =
    searchParams.get("widget_key") || ""

  return (
    <ChatWidget widgetKey={widgetKey} />
  )
}