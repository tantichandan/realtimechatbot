"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import ChatWidget from "../components/ChatWidget"

function WidgetPage() {

  const searchParams = useSearchParams()

  const widgetKey =
    searchParams.get("widget_key") || ""

  return (
    <ChatWidget widgetKey={widgetKey} />
  )
}

export default function Home() {

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WidgetPage />
    </Suspense>
  )
}