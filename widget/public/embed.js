(function () {

  if (window.ACP_CHAT_LOADED) return;
  window.ACP_CHAT_LOADED = true;

  function createWidget(scriptTag) {

    const widgetKey = scriptTag.getAttribute("data-widget-key");
    if (!widgetKey) {
      console.error("ACP Chat: No widget key found");
      return;
    }

    const MOBILE_BP = 560;
    const isMob = () => window.innerWidth <= MOBILE_BP;

    // ====================================
    // STYLES
    // ====================================
    const style = document.createElement("style");
    style.textContent = `
      *, *::before, *::after { box-sizing: border-box; }

      /* ── Keyframes ── */
      @keyframes acp-pulse {
        0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.55); }
        50%      { box-shadow: 0 0 0 9px rgba(239,68,68,0); }
      }
      @keyframes acp-fab-bounce {
        0%   { transform: scale(1); }
        40%  { transform: scale(0.88); }
        70%  { transform: scale(1.12); }
        100% { transform: scale(1); }
      }
      @keyframes acp-pill-in {
        from { opacity:0; transform:translateY(8px); }
        to   { opacity:1; transform:translateY(0); }
      }

      /* ── FAB ── */
      #acp-fab {
        position: fixed;
        bottom: 22px;
        right: 20px;
        width: 60px;
        height: 60px;
        border: none;
        border-radius: 50%;
        background: #1a1a2e;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3), 0 1px 4px rgba(0,0,0,0.15);
        z-index: 2147483647;
        padding: 0;
        -webkit-tap-highlight-color: transparent;
        touch-action: manipulation;
        transition: transform 0.18s ease, box-shadow 0.18s ease,
                    opacity 0.22s ease;
        will-change: transform, opacity;
      }
      #acp-fab:hover  { transform: scale(1.07); box-shadow: 0 8px 28px rgba(0,0,0,0.34); }
      #acp-fab:active { transform: scale(0.93); }
      #acp-fab.acp-fab-out {
        opacity: 0;
        transform: scale(0.72) translateY(12px);
        pointer-events: none;
      }
      @media (max-width: 560px) {
        #acp-fab {
          bottom: max(20px, env(safe-area-inset-bottom, 20px));
          right: 18px;
          width: 58px;
          height: 58px;
        }
      }

      #acp-fab-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1),
                    opacity 0.18s ease;
      }

      /* badge */
      #acp-badge {
        position: absolute;
        top: -4px; right: -4px;
        min-width: 20px; height: 20px;
        background: #ef4444;
        border-radius: 10px;
        border: 2.5px solid #fff;
        display: none;
        align-items: center; justify-content: center;
        font-size: 10px; font-weight: 700; color: #fff;
        padding: 0 4px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        animation: acp-pulse 1.8s ease-in-out infinite;
        pointer-events: none;
        z-index: 1;
      }
      /* online dot */
      #acp-online-dot {
        position: absolute;
        bottom: 3px; right: 3px;
        width: 13px; height: 13px;
        background: #22c55e;
        border-radius: 50%;
        border: 2.5px solid #1a1a2e;
        pointer-events: none;
        transition: opacity 0.2s;
      }

      /* ── Backdrop ── */
      #acp-backdrop {
        position: fixed; inset: 0;
        background: rgba(0,0,0,0);
        z-index: 2147483644;
        display: none;
        transition: background 0.32s ease;
        -webkit-tap-highlight-color: transparent;
      }
      #acp-backdrop.acp-bd-in { background: rgba(0,0,0,0.45); }
      @media (min-width: 561px) { #acp-backdrop { display: none !important; } }

      /* ── Container — desktop ── */
      #acp-container {
        position: fixed;
        z-index: 2147483646;
        display: none;
        flex-direction: column;
        overflow: hidden;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        background: #fff;

        /* desktop sizing */
        bottom: 92px; right: 20px;
        width: 375px; height: 590px;
        border-radius: 20px;
        box-shadow: 0 12px 48px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.08);
        opacity: 0;
        transform: translateY(18px) scale(0.97);
        transition: opacity 0.24s ease, transform 0.24s cubic-bezier(0.34,1.3,0.64,1);
      }
      #acp-container.acp-open {
        opacity: 1;
        transform: translateY(0) scale(1);
      }

      /* ── Container — mobile bottom sheet ── */
      @media (max-width: 560px) {
        #acp-container {
          /* full-width sheet anchored to bottom */
          bottom: 0; left: 0; right: 0;
          width: 100%;
          /* height set dynamically via JS using dvh */
          height: 92dvh;
          max-height: 92dvh;
          border-radius: 24px 24px 0 0;
          box-shadow: 0 -6px 40px rgba(0,0,0,0.22);
          transform: translateY(100%);
          opacity: 1; /* don't fade on mobile, just slide */
          transition: transform 0.38s cubic-bezier(0.32,0.72,0,1);
          will-change: transform;
        }
        #acp-container.acp-open {
          transform: translateY(0);
          opacity: 1;
        }
      }

      /* ── Header ── */
      #acp-header {
        background: #1a1a2e;
        padding: 13px 15px;
        display: flex;
        align-items: center;
        gap: 10px;
        flex-shrink: 0;
        user-select: none;
        -webkit-user-select: none;
      }
      @media (max-width: 560px) {
        #acp-header {
          flex-direction: column;
          align-items: stretch;
          gap: 0;
          padding: 0 16px 13px;
          /* extra top padding for safe area */
          padding-top: max(10px, env(safe-area-inset-top, 10px));
          cursor: grab;
        }
        #acp-header:active { cursor: grabbing; }
      }

      /* drag pill — mobile only */
      #acp-drag-pill {
        display: none;
      }
      @media (max-width: 560px) {
        #acp-drag-pill {
          display: block;
          width: 40px; height: 4px;
          background: rgba(255,255,255,0.28);
          border-radius: 2px;
          margin: 10px auto 12px;
          flex-shrink: 0;
        }
      }

      #acp-header-row {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
      }

      /* ── Header avatar ── */
      #acp-avatar {
        position: relative;
        width: 40px; height: 40px;
        border-radius: 50%;
        background: rgba(255,255,255,0.08);
        border: 1.5px solid rgba(255,255,255,0.15);
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
      }
      @media (max-width: 560px) {
        #acp-avatar { width: 38px; height: 38px; }
      }

      /* ── Header buttons ── */
      .acp-hbtn {
        background: rgba(255,255,255,0.08);
        border: none;
        color: rgba(255,255,255,0.72);
        width: 32px; height: 32px;
        border-radius: 8px;
        cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        transition: background 0.14s, color 0.14s;
        flex-shrink: 0;
        -webkit-tap-highlight-color: transparent;
        touch-action: manipulation;
        padding: 0;
      }
      .acp-hbtn:hover  { background: rgba(255,255,255,0.17); }
      .acp-hbtn:active { background: rgba(255,255,255,0.26); }
      .acp-hbtn.acp-muted {
        background: rgba(239,68,68,0.22) !important;
        color: #fca5a5 !important;
      }
      @media (max-width: 560px) {
        .acp-hbtn { width: 38px; height: 38px; border-radius: 10px; }
      }

      /* Hide minimize on mobile — swipe-down replaces it */
      @media (max-width: 560px) {
        #acp-min-btn { display: none !important; }
      }

      /* ── iframe ── */
      #acp-iframe {
        width: 100%; flex: 1;
        border: none; background: transparent;
        display: block; min-height: 0;
        /* iOS Safari needs this to allow the inner page to scroll */
        -webkit-overflow-scrolling: touch;
      }
      @media (max-width: 560px) {
        #acp-iframe {
          /* push up above the bottom safe area */
          padding-bottom: env(safe-area-inset-bottom, 0px);
        }
      }

      /* ── Minimised pill ── */
      #acp-pill {
        position: fixed;
        bottom: 92px; right: 20px;
        background: #1a1a2e; color: #fff;
        border-radius: 30px;
        padding: 10px 14px 10px 10px;
        display: none; align-items: center; gap: 8px;
        box-shadow: 0 6px 22px rgba(26,26,46,0.38);
        z-index: 2147483645;
        cursor: pointer;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        animation: acp-pill-in 0.22s ease-out;
        -webkit-tap-highlight-color: transparent;
        touch-action: manipulation;
        max-width: calc(100vw - 40px);
        transition: background 0.14s;
      }
      #acp-pill:hover  { background: #22223a; }
      #acp-pill:active { background: #2d2d4e; }

      @media (max-width: 560px) {
        #acp-pill {
          /* sit just above the FAB */
          bottom: max(88px, calc(58px + env(safe-area-inset-bottom, 0px) + 14px));
          left: 18px; right: 18px;
          border-radius: 18px;
          justify-content: space-between;
          padding: 12px 14px 12px 12px;
        }
      }
    `;
    document.head.appendChild(style);

    // ====================================
    // BACKDROP
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

    // ── Header ──────────────────────────────────────
    const header = document.createElement("div");
    header.id = "acp-header";

    // drag pill (mobile)
    const dragPill = document.createElement("div");
    dragPill.id = "acp-drag-pill";
    header.appendChild(dragPill);

    // header content row
    const headerRow = document.createElement("div");
    headerRow.id = "acp-header-row";

    // avatar
    const avatar = document.createElement("div");
    avatar.id = "acp-avatar";
    avatar.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
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
      <span style="position:absolute;bottom:1px;right:1px;
        width:10px;height:10px;background:#22c55e;border-radius:50%;
        border:2px solid #1a1a2e;"></span>
    `;

    // title
    const titleBlock = document.createElement("div");
    titleBlock.style.cssText = "flex:1;min-width:0;";
    titleBlock.innerHTML = `
      <div style="color:#fff;font-size:13.5px;font-weight:600;letter-spacing:0.01em;
        white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
        ACPremiumAuto Support
      </div>
      <div style="display:flex;align-items:center;gap:5px;margin-top:3px;">
        <span style="width:6px;height:6px;background:#22c55e;border-radius:50%;flex-shrink:0;"></span>
        <span style="color:rgba(255,255,255,0.5);font-size:11px;white-space:nowrap;">
          Online · replies in minutes
        </span>
      </div>
    `;

    // controls
    const controls = document.createElement("div");
    controls.style.cssText = "display:flex;align-items:center;gap:5px;flex-shrink:0;";

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
      soundBtn.title = soundEnabled ? "Mute" : "Unmute";
      iframe.contentWindow?.postMessage({ type: "acp:sound", enabled: soundEnabled }, "*");
    };

    const minBtn = document.createElement("button");
    minBtn.className = "acp-hbtn";
    minBtn.id = "acp-min-btn";
    minBtn.title = "Minimize";
    minBtn.setAttribute("aria-label", "Minimize");
    minBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
        <path d="M5 12h14"/>
      </svg>`;
    minBtn.onclick = () => minimize();

    const closeBtn = document.createElement("button");
    closeBtn.className = "acp-hbtn";
    closeBtn.title = "Close";
    closeBtn.setAttribute("aria-label", "Close chat");
    closeBtn.innerHTML = `
      <svg width="13" height="13" viewBox="0 0 14 14" fill="none"
        stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
        <path d="M1 1l12 12M13 1L1 13"/>
      </svg>`;
    closeBtn.onclick = () => closeChat();

    controls.appendChild(soundBtn);
    controls.appendChild(minBtn);
    controls.appendChild(closeBtn);

    headerRow.appendChild(avatar);
    headerRow.appendChild(titleBlock);
    headerRow.appendChild(controls);
    header.appendChild(headerRow);

    // ── iframe ──────────────────────────────────────
    const iframe = document.createElement("iframe");
    iframe.id = "acp-iframe";
    iframe.src = `https://realtimechatbot-tan.vercel.app/?widget_key=${widgetKey}`;
    iframe.setAttribute("scrolling", "no");
    iframe.setAttribute("title", "ACPremiumAuto chat");
    iframe.setAttribute("allow", "same-origin");

    container.appendChild(header);
    container.appendChild(iframe);

    // ====================================
    // MINIMISED PILL
    // ====================================
    const pill = document.createElement("div");
    pill.id = "acp-pill";
    pill.setAttribute("role", "button");
    pill.setAttribute("aria-label", "Reopen chat");
    pill.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;flex:1;min-width:0;">
        <div style="width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,0.1);
          display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="rgba(255,255,255,0.85)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
        </div>
        <div style="min-width:0;">
          <div style="font-size:12.5px;font-weight:600;line-height:1.2;white-space:nowrap;
            overflow:hidden;text-overflow:ellipsis;">ACPremiumAuto</div>
          <div id="acp-pill-sub" style="font-size:11px;color:rgba(255,255,255,0.55);
            margin-top:1px;display:none;"></div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
          stroke="rgba(255,255,255,0.45)" stroke-width="2.5" stroke-linecap="round">
          <path d="M18 15l-6-6-6 6"/>
        </svg>
        <button id="acp-pill-close" style="
          background:rgba(255,255,255,0.12);border:none;color:#fff;
          min-width:28px;min-height:28px;border-radius:50%;cursor:pointer;
          display:flex;align-items:center;justify-content:center;padding:0;
          -webkit-tap-highlight-color:transparent;touch-action:manipulation;
        " aria-label="Dismiss">
          <svg width="9" height="9" viewBox="0 0 10 10" fill="none"
            stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <path d="M1 1l8 8M9 1L1 9"/>
          </svg>
        </button>
      </div>
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

    const fabIcon = document.createElement("div");
    fabIcon.id = "acp-fab-icon";
    fabIcon.innerHTML = svgChat();

    const badge = document.createElement("div");
    badge.id = "acp-badge";

    const onlineDot = document.createElement("span");
    onlineDot.id = "acp-online-dot";

    fab.appendChild(fabIcon);
    fab.appendChild(badge);
    fab.appendChild(onlineDot);

    // ====================================
    // STATE
    // ====================================
    let isOpen      = false;
    let isMinimized = false;
    let unreadCount = 0;
    let audioCtx    = null;

    // ====================================
    // OPEN / CLOSE / MINIMIZE
    // ====================================
    function openChat() {
      isOpen = true; isMinimized = false;
      pill.style.display = "none";

      container.style.display = "flex";

      if (isMob()) {
        // Mobile: hide FAB, show backdrop
        fab.classList.add("acp-fab-out");
        backdrop.style.display = "block";
        requestAnimationFrame(() => backdrop.classList.add("acp-bd-in"));
      }

      // Trigger CSS transition (double rAF ensures display:flex is painted first)
      requestAnimationFrame(() =>
        requestAnimationFrame(() => container.classList.add("acp-open"))
      );

      clearBadge();
    }

    function closeChat() {
      isOpen = false; isMinimized = false;

      container.classList.remove("acp-open");
      backdrop.classList.remove("acp-bd-in");
      fab.classList.remove("acp-fab-out");
      pill.style.display = "none";

      const delay = isMob() ? 380 : 240;
      setTimeout(() => {
        container.style.display = "none";
        if (isMob()) backdrop.style.display = "none";
      }, delay);
    }

    function minimize() {
      isMinimized = true;

      container.classList.remove("acp-open");
      backdrop.classList.remove("acp-bd-in");
      fab.classList.remove("acp-fab-out");

      const delay = isMob() ? 380 : 240;
      setTimeout(() => {
        container.style.display = "none";
        if (isMob()) backdrop.style.display = "none";
      }, delay);

      pill.style.display = "flex";
    }

    function restoreFromMinimize() {
      isMinimized = false;
      openChat();
    }

    // ====================================
    // BADGE HELPERS
    // ====================================
    function clearBadge() {
      unreadCount = 0;
      badge.style.display = "none";
      onlineDot.style.opacity = "1";
      const ps = document.getElementById("acp-pill-sub");
      if (ps) ps.style.display = "none";
    }

    function showBadge(count) {
      unreadCount = count;
      if (isOpen && !isMinimized) { clearBadge(); return; }
      if (count <= 0) { clearBadge(); return; }
      badge.textContent = count > 9 ? "9+" : String(count);
      badge.style.display = "flex";
      onlineDot.style.opacity = "0";
      const ps = document.getElementById("acp-pill-sub");
      if (ps && isMinimized) {
        ps.textContent = `${count} new message${count !== 1 ? "s" : ""}`;
        ps.style.display = "block";
      }
    }

    // ====================================
    // SOUND
    // ====================================
    function playBeep() {
      if (!soundEnabled) return;
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.09, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.25);
      } catch (_) {}
    }

    // ====================================
    // DRAG-TO-DISMISS  (mobile sheet)
    // Only fires on the header drag area
    // ====================================
    let dragStartY   = 0;
    let dragCurrent  = 0;
    let dragging     = false;

    header.addEventListener("touchstart", (e) => {
      dragStartY = e.touches[0].clientY;
      dragCurrent = 0;
      dragging = true;
      container.style.transition = "none"; // disable CSS transition while dragging
    }, { passive: true });

    header.addEventListener("touchmove", (e) => {
      if (!dragging) return;
      const delta = e.touches[0].clientY - dragStartY;
      if (delta < 0) return; // don't allow dragging up
      dragCurrent = delta;
      container.style.transform = `translateY(${delta}px)`;
    }, { passive: true });

    header.addEventListener("touchend", () => {
      if (!dragging) return;
      dragging = false;
      // Re-enable transition
      container.style.transition = "";

      if (dragCurrent > 80) {
        // Dragged far enough — minimize
        container.style.transform = "";
        minimize();
      } else {
        // Snap back
        container.style.transform = "";
        container.classList.add("acp-open");
      }
    }, { passive: true });

    // ====================================
    // FAB CLICK
    // ====================================
    fab.onclick = () => {
      if (isMinimized) { restoreFromMinimize(); return; }
      isOpen ? closeChat() : openChat();
    };

    // ====================================
    // postMessage from iframe
    // ====================================
    window.addEventListener("message", (e) => {
      const d = e.data;
      if (!d) return;
      if (d.type === "acp:unread") { if (d.count > 0) playBeep(); showBadge(d.count); }
      if (d === "acp:close"     || d.type === "acp:close")     closeChat();
      if (d === "acp:minimized" || d.type === "acp:minimized") minimize();
    });

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
      document.readyState === "complete"
        ? createWidget(script)
        : window.addEventListener("load", () => createWidget(script));
      break;
    }
  }

})();