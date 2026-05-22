(function () {

  if (window.ACP_CHAT_LOADED) return;
  window.ACP_CHAT_LOADED = true;

  function createWidget(scriptTag) {

    const widgetKey = scriptTag.getAttribute("data-widget-key");
    if (!widgetKey) {
      console.error("ACP Chat: No widget key found");
      return;
    }

    // ── Responsive breakpoint ──
    const MOBILE_BP = 520;
    let isMobile = window.innerWidth <= MOBILE_BP;

    // ====================================
    // STYLES
    // ====================================
    const style = document.createElement("style");
    style.textContent = `
      *, *::before, *::after { box-sizing: border-box; }

      @keyframes acp-pulse {
        0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.5); }
        50%      { box-shadow: 0 0 0 8px rgba(239,68,68,0); }
      }
      @keyframes acp-slidein-desktop {
        from { opacity:0; transform:translateY(20px) scale(0.96); }
        to   { opacity:1; transform:translateY(0) scale(1); }
      }
      @keyframes acp-slidein-mobile {
        from { opacity:0; transform:translateY(100%); }
        to   { opacity:1; transform:translateY(0); }
      }
      @keyframes acp-dot {
        0%,60%,100% { transform:translateY(0); opacity:.35; }
        30%          { transform:translateY(-4px); opacity:1; }
      }

      #acp-badge {
        position: absolute;
        top: -5px; right: -5px;
        min-width: 20px; height: 20px;
        background: #ef4444;
        border-radius: 10px;
        border: 2.5px solid #fff;
        display: none;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        font-weight: 700;
        color: #fff;
        padding: 0 4px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        animation: acp-pulse 1.8s ease-in-out infinite;
        pointer-events: none;
        z-index: 1;
      }
      #acp-online-dot {
        position: absolute;
        bottom: 4px; right: 4px;
        width: 12px; height: 12px;
        background: #22c55e;
        border-radius: 50%;
        border: 2.5px solid #1a1a2e;
        pointer-events: none;
      }

      #acp-fab {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        border: none;
        border-radius: 9999px;
        background: #1a1a2e;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 6px 24px rgba(0,0,0,0.28);
        z-index: 2147483647;
        padding: 0;
        -webkit-tap-highlight-color: transparent;
        touch-action: manipulation;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      #acp-fab:hover {
        transform: scale(1.08);
        box-shadow: 0 10px 36px rgba(0,0,0,0.32);
      }
      #acp-fab:active {
        transform: scale(0.94);
      }

      /* FAB safe area on mobile */
      @media (max-width: 520px) {
        #acp-fab {
          bottom: max(16px, env(safe-area-inset-bottom, 16px));
          right: 16px;
          width: 56px;
          height: 56px;
        }
      }

      .acp-hbtn {
        background: rgba(255,255,255,0.08);
        border: none;
        color: rgba(255,255,255,0.7);
        width: 32px; height: 32px;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.15s, color 0.15s;
        flex-shrink: 0;
        -webkit-tap-highlight-color: transparent;
        touch-action: manipulation;
        padding: 0;
      }
      .acp-hbtn:hover { background: rgba(255,255,255,0.18); }
      .acp-hbtn:active { background: rgba(255,255,255,0.25); }
      .acp-hbtn.acp-muted {
        background: rgba(239,68,68,0.22) !important;
        color: #fca5a5 !important;
      }
      @media (max-width: 520px) {
        .acp-hbtn { width: 36px; height: 36px; border-radius: 10px; }
      }

      /* ── Widget container ── */
      #acp-container {
        position: fixed;
        z-index: 2147483646;
        flex-direction: column;
        overflow: hidden;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

        /* Desktop */
        bottom: 90px;
        right: 20px;
        width: 380px;
        height: 600px;
        border-radius: 0;
        box-shadow: 0 8px 40px rgba(0,0,0,0.22);
        background: #fff;
        opacity: 0;
        transform: translateY(20px) scale(0.96);
        transition: opacity 0.25s ease, transform 0.25s ease;
      }
      #acp-container.acp-open {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
      /* Mobile: slide up full screen */
      @media (max-width: 520px) {
        #acp-container {
          bottom: 0;
          right: 0;
          left: 0;
          width: 100%;
          height: 100%;
          max-height: 100dvh;
          border-radius: 24px 24px 0 0;
          transform: translateY(100%);
          transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
          box-shadow: 0 -8px 32px rgba(0,0,0,0.18);
        }
        #acp-container.acp-open {
          transform: translateY(0);
          opacity: 1;
        }
      }

      /* ── Header ── */
      #acp-header {
        background: #1a1a2e;
        padding: 14px 16px;
        display: flex;
        align-items: center;
        gap: 10px;
        flex-shrink: 0;
        /* Mobile: add top safe area + drag handle space */
      }
      @media (max-width: 520px) {
        #acp-header {
          padding: 8px 16px 14px;
          padding-top: max(8px, env(safe-area-inset-top, 8px));
        }
      }

      /* Drag handle for mobile */
      #acp-drag-handle {
        display: none;
      }
      @media (max-width: 520px) {
        #acp-drag-handle {
          display: block;
          width: 36px;
          height: 4px;
          background: rgba(255,255,255,0.25);
          border-radius: 2px;
          margin: 0 auto 8px;
        }
      }

      /* ── iframe ── */
      #acp-iframe {
        width: 100%;
        flex: 1;
        border: none;
        background: transparent;
        display: block;
        min-height: 0;
        overflow: hidden;
      }

      /* ── Minimized pill ── */
      #acp-pill {
        position: fixed;
        bottom: 90px;
        right: 20px;
        background: #1a1a2e;
        color: #fff;
        border-radius: 28px;
        padding: 10px 14px 10px 10px;
        display: none;
        align-items: center;
        gap: 8px;
        box-shadow: 0 6px 20px rgba(26,26,46,0.35);
        z-index: 2147483646;
        cursor: pointer;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        animation: acp-slidein-desktop 0.22s ease-out;
        -webkit-tap-highlight-color: transparent;
        touch-action: manipulation;
        max-width: calc(100vw - 40px);
      }
      #acp-pill:hover { background: #22223a; }
      #acp-pill:active { background: #2d2d4e; }

      @media (max-width: 520px) {
        #acp-pill {
          bottom: max(90px, calc(56px + env(safe-area-inset-bottom, 0px) + 14px));
          right: 16px;
          left: 16px;
          right: auto;
          justify-content: space-between;
        }
      }

      /* ── Overlay backdrop (mobile only) ── */
      #acp-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.4);
        z-index: 2147483645;
        display: none;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      #acp-backdrop.acp-visible {
        opacity: 1;
      }
      @media (min-width: 521px) {
        #acp-backdrop { display: none !important; }
      }
    `;
    document.head.appendChild(style);

    // ====================================
    // BACKDROP (mobile dim)
    // ====================================
    const backdrop = document.createElement("div");
    backdrop.id = "acp-backdrop";
    backdrop.onclick = () => closeChat();
    document.body.appendChild(backdrop);

    // ====================================
    // CONTAINER
    // ====================================
    const container = document.createElement("div");
    container.id = "acp-container";
    container.style.display = "none"; // hidden by default; openChat() sets "flex"

    // ── Header ──
    const header = document.createElement("div");
    header.id = "acp-header";

    // Drag handle (mobile only, sits inside header at top)
    const dragHandleWrap = document.createElement("div");
    dragHandleWrap.style.cssText = "width:100%; display:flex; flex-direction:column; align-items:center;";
    const dragHandle = document.createElement("div");
    dragHandle.id = "acp-drag-handle";
    dragHandleWrap.appendChild(dragHandle);

    // Avatar
    const avatar = document.createElement("div");
    avatar.style.cssText = `
      position: relative;
      width: 40px; height: 40px;
      border-radius: 50%;
      background: rgba(255,255,255,0.08);
      border: 1.5px solid rgba(255,255,255,0.15);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    `;
    avatar.innerHTML = `
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none"
        stroke="rgba(255,255,255,0.85)" stroke-width="1.8" stroke-linecap="round">
        <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806
          3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806
          3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946
          3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946
          3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806
          3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806
          3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946
          3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946
          3.42 3.42 0 013.138-3.138z"/>
      </svg>
      <span style="
        position:absolute; bottom:1px; right:1px;
        width:10px; height:10px;
        background:#22c55e; border-radius:50%;
        border:2px solid #1a1a2e;
      "></span>
    `;

    // Title block
    const titleBlock = document.createElement("div");
    titleBlock.style.cssText = "flex:1; min-width:0;";
    titleBlock.innerHTML = `
      <div style="color:#fff; font-size:13.5px; font-weight:600; letter-spacing:0.01em; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
        ACPremiumAuto Support
      </div>
      <div style="display:flex; align-items:center; gap:5px; margin-top:3px;">
        <span style="width:6px;height:6px;background:#22c55e;border-radius:50%;flex-shrink:0;"></span>
        <span style="color:rgba(255,255,255,0.5); font-size:11px; white-space:nowrap;">
          Online · replies in minutes
        </span>
      </div>
    `;

    // Controls
    const controls = document.createElement("div");
    controls.style.cssText = "display:flex; align-items:center; gap:6px; flex-shrink:0;";

    // Sound toggle
    let soundEnabled = true;
    const soundBtn = document.createElement("button");
    soundBtn.className = "acp-hbtn";
    soundBtn.title = "Mute notifications";
    soundBtn.setAttribute("aria-label", "Mute notifications");
    soundBtn.innerHTML = svgSpeakerOn();
    soundBtn.onclick = () => {
      soundEnabled = !soundEnabled;
      soundBtn.innerHTML = soundEnabled ? svgSpeakerOn() : svgSpeakerOff();
      soundBtn.classList.toggle("acp-muted", !soundEnabled);
      soundBtn.title = soundEnabled ? "Mute notifications" : "Unmute notifications";
      soundBtn.setAttribute("aria-label", soundBtn.title);
      iframe.contentWindow?.postMessage({ type: "acp:sound", enabled: soundEnabled }, "*");
    };

    // Minimize (hide on mobile — swipe down or close)
    const minBtn = document.createElement("button");
    minBtn.className = "acp-hbtn";
    minBtn.id = "acp-min-btn";
    minBtn.title = "Minimize";
    minBtn.setAttribute("aria-label", "Minimize chat");
    minBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
        <path d="M5 12h14"/>
      </svg>
    `;
    minBtn.onclick = () => minimize();

    // Close
    const closeBtn = document.createElement("button");
    closeBtn.className = "acp-hbtn";
    closeBtn.title = "Close chat";
    closeBtn.setAttribute("aria-label", "Close chat");
    closeBtn.innerHTML = `
      <svg width="13" height="13" viewBox="0 0 14 14" fill="none"
        stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
        <path d="M1 1l12 12M13 1L1 13"/>
      </svg>
    `;
    closeBtn.onclick = () => closeChat();

    controls.appendChild(soundBtn);
    controls.appendChild(minBtn);
    controls.appendChild(closeBtn);

    // Assemble header: drag handle row + content row
    const headerContent = document.createElement("div");
    headerContent.style.cssText = "display:flex; align-items:center; gap:10px; width:100%;";
    headerContent.appendChild(avatar);
    headerContent.appendChild(titleBlock);
    headerContent.appendChild(controls);

    header.appendChild(dragHandleWrap);
    header.appendChild(headerContent);

    // ── Iframe ──
    const iframe = document.createElement("iframe");
    iframe.id = "acp-iframe";
    iframe.src = `https://realtimechatbot-tan.vercel.app/?widget_key=${widgetKey}`;
    iframe.setAttribute("scrolling", "no");
    iframe.setAttribute("title", "ACPremiumAuto chat");
    iframe.setAttribute("allow", "same-origin");
    iframe.style.overflow = "hidden";

    container.appendChild(header);
    container.appendChild(iframe);

    // ====================================
    // MINIMIZED PILL
    // ====================================
    const pill = document.createElement("div");
    pill.id = "acp-pill";
    pill.setAttribute("role", "button");
    pill.setAttribute("aria-label", "Reopen chat");
    pill.innerHTML = `
      <div style="
        width:28px;height:28px;border-radius:50%;
        background:rgba(255,255,255,0.1);
        display:flex;align-items:center;justify-content:center;flex-shrink:0;
      ">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
          stroke="rgba(255,255,255,0.8)" stroke-width="1.8"
          stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
        </svg>
      </div>
      <div style="flex:1; min-width:0;">
        <div style="font-size:12px;font-weight:600;line-height:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
          ACPremiumAuto
        </div>
        <div id="acp-pill-sub" style="font-size:10.5px;color:rgba(255,255,255,0.55);margin-top:2px;display:none;white-space:nowrap;">
          0 new messages
        </div>
      </div>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
        stroke="rgba(255,255,255,0.5)" stroke-width="2.5" stroke-linecap="round">
        <path d="M18 15l-6-6-6 6"/>
      </svg>
      <button id="acp-pill-close" style="
        background:rgba(255,255,255,0.12);border:none;color:#fff;
        min-width:28px;min-height:28px;border-radius:50%;cursor:pointer;
        display:flex;align-items:center;justify-content:center;
        padding:0;margin-left:2px;flex-shrink:0;
        -webkit-tap-highlight-color:transparent;touch-action:manipulation;
      " aria-label="Dismiss chat">
        <svg width="9" height="9" viewBox="0 0 10 10" fill="none"
          stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <path d="M1 1l8 8M9 1L1 9"/>
        </svg>
      </button>
    `;
    pill.onclick = () => restoreFromMinimize();
    pill.querySelector("#acp-pill-close").onclick = (e) => {
      e.stopPropagation();
      closeChat();
    };

    // ====================================
    // FAB
    // ====================================
    const fab = document.createElement("button");
    fab.id = "acp-fab";
    fab.setAttribute("aria-label", "Open chat");

    const fabIconWrap = document.createElement("div");
    fabIconWrap.style.cssText = "transition: transform 0.28s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s; display:flex;";
    fabIconWrap.innerHTML = svgChat();
    fab.appendChild(fabIconWrap);

    const badge = document.createElement("div");
    badge.id = "acp-badge";
    fab.appendChild(badge);

    const onlineDot = document.createElement("span");
    onlineDot.id = "acp-online-dot";
    fab.appendChild(onlineDot);

    // ====================================
    // STATE
    // ====================================
    let isOpen      = false;
    let isMinimized = false;
    let unreadCount = 0;

    function openChat() {
      isOpen      = true;
      isMinimized = false;
      pill.style.display = "none";
      container.style.display = "flex";

      // show backdrop on mobile
      if (window.innerWidth <= MOBILE_BP) {
        backdrop.style.display = "block";
        requestAnimationFrame(() => backdrop.classList.add("acp-visible"));
        minBtn.style.display = "none";
      } else {
        minBtn.style.display = "flex";
      }

      // Double rAF: first frame registers display:flex in layout,
      // second frame triggers the CSS transition from the initial opacity/transform.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => container.classList.add("acp-open"));
      });

      fabIconWrap.style.transform = "rotate(90deg)";
      fabIconWrap.innerHTML = svgClose();
      fab.setAttribute("aria-label", "Close chat");
      clearBadge();
    }

    function closeChat() {
      isOpen      = false;
      isMinimized = false;
      pill.style.display = "none";
      container.classList.remove("acp-open");
      backdrop.classList.remove("acp-visible");
      setTimeout(() => {
        container.style.display = "none";
        backdrop.style.display  = "none";
      }, 300);
      fabIconWrap.style.transform = "rotate(0deg)";
      fabIconWrap.innerHTML = svgChat();
      fab.setAttribute("aria-label", "Open chat");
    }

    function minimize() {
      isMinimized = true;
      container.classList.remove("acp-open");
      backdrop.classList.remove("acp-visible");
      setTimeout(() => {
        container.style.display = "none";
        backdrop.style.display  = "none";
      }, 300);
      fabIconWrap.style.transform = "rotate(0deg)";
      fabIconWrap.innerHTML = svgChat();
      pill.style.display = "flex";
    }

    function restoreFromMinimize() {
      isMinimized = false;
      openChat();
    }

    function clearBadge() {
      unreadCount = 0;
      badge.style.display = "none";
      onlineDot.style.display = "";
      const pillSub = document.getElementById("acp-pill-sub");
      if (pillSub) pillSub.style.display = "none";
    }

    function showBadge(count) {
      unreadCount = count;
      if (isOpen && !isMinimized) { clearBadge(); return; }
      if (count === 0) { clearBadge(); return; }
      badge.textContent = count > 9 ? "9+" : String(count);
      badge.style.display = "flex";
      onlineDot.style.display = "none";
      const pillSub = document.getElementById("acp-pill-sub");
      if (pillSub && isMinimized) {
        pillSub.textContent = `${count} new message${count > 1 ? "s" : ""}`;
        pillSub.style.display = "block";
      }
    }

    // ── Audio beep ──
    let audioCtx = null;
    function playBeep() {
      if (!soundEnabled) return;
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc  = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.25);
      } catch (_) {}
    }

    // ── Touch-to-dismiss on mobile (swipe down) ──
    let touchStartY = 0;
    header.addEventListener("touchstart", (e) => {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    header.addEventListener("touchend", (e) => {
      const delta = e.changedTouches[0].clientY - touchStartY;
      if (delta > 60) minimize();
    }, { passive: true });

    // ====================================
    // FAB CLICK
    // ====================================
    fab.onclick = () => {
      if (isMinimized) { restoreFromMinimize(); return; }
      isOpen ? closeChat() : openChat();
    };

    // ====================================
    // postMessage
    // ====================================
    window.addEventListener("message", (e) => {
      const d = e.data;
      if (!d) return;
      if (d.type === "acp:unread") {
        if (d.count > 0) playBeep();
        showBadge(d.count);
      }
      if (d === "acp:close"    || d.type === "acp:close")    closeChat();
      if (d === "acp:minimized"|| d.type === "acp:minimized") minimize();
    });

    // ── Recheck mobile on resize ──
    window.addEventListener("resize", () => {
      isMobile = window.innerWidth <= MOBILE_BP;
      if (!isMobile) minBtn.style.display = "";
    }, { passive: true });

    // ====================================
    // MOUNT
    // ====================================
    document.body.appendChild(container);
    document.body.appendChild(pill);
    document.body.appendChild(fab);
  }

  // ====================================
  // SVG HELPERS
  // ====================================
  function svgChat() {
    return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>`;
  }
  function svgClose() {
    return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="white" stroke-width="2.5" stroke-linecap="round">
      <path d="M18 6L6 18M6 6l12 12"/>
    </svg>`;
  }
  function svgSpeakerOn() {
    return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
      <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/>
    </svg>`;
  }
  function svgSpeakerOff() {
    return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
      <line x1="23" y1="9" x2="17" y2="15"/>
      <line x1="17" y1="9" x2="23" y2="15"/>
    </svg>`;
  }

  // ====================================
  // BOOT
  // ====================================
  const scripts = document.getElementsByTagName("script");
  for (const script of scripts) {
    if (script.src.includes("embed.js")) {
      if (document.readyState === "complete") {
        createWidget(script);
      } else {
        window.addEventListener("load", () => createWidget(script));
      }
      break;
    }
  }

})();