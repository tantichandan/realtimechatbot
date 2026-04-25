(function () {
  if (window.ACP_CHAT_LOADED) return
  window.ACP_CHAT_LOADED = true

  const iframe = document.createElement("iframe")

  iframe.src = "http://localhost:3000/" // your deployed widget
  iframe.style.position = "fixed"
  iframe.style.bottom = "0"
  iframe.style.right = "0"
  iframe.style.width = 
  iframe.style.maxWidth = "520px"
  iframe.style.height = "100%"
  iframe.style.maxHeight = "600px"
  iframe.style.border = "none"
  iframe.style.zIndex = "999999"
  iframe.style.borderRadius = "12px"
  iframe.allow = "clipboard-write"

  // Mobile safe spacing
  iframe.style.margin = "0"
  iframe.style.padding = "0"

  document.body.appendChild(iframe)
})()