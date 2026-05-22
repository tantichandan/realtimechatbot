'use client';

import Link from 'next/link';
import Script from "next/script";

export default function HomePage() {
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#FAF9F6', color: '#1A1917', minHeight: '100vh' }}>

      {/* ── Google Fonts + Global Styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --cream:         #FAF9F6;
          --ink:           #1A1917;
          --ink-light:     #6B6860;
          --ink-lighter:   #A8A59E;
          --gold:          #C9A84C;
          --gold-light:    #F5EDD6;
          --gold-dark:     #8B6914;
          --border:        rgba(26,25,23,0.10);
          --border-strong: rgba(26,25,23,0.18);

          /* Fluid type scale — clamp(min, preferred, max) */
          --text-hero:     clamp(30px, 5.5vw, 56px);
          --text-h2:       clamp(26px, 4vw,   44px);
          --text-h2-sm:    clamp(22px, 3.5vw, 38px);
          --text-eyebrow:  10px;
          --text-body:     clamp(13px, 1.6vw, 15px);
          --text-small:    clamp(11px, 1.3vw, 13px);
        }

        html { -webkit-text-size-adjust: 100%; }

        /* ── Buttons ── */
        .btn-primary {
          display: inline-flex; align-items: center; justify-content: center;
          padding: 11px 24px;
          font-size: 12px; font-weight: 600;
          color: var(--cream); background: var(--ink);
          border: 1.5px solid var(--ink);
          cursor: pointer; letter-spacing: 0.06em; text-transform: uppercase;
          font-family: 'DM Sans', sans-serif; text-decoration: none;
          transition: background 0.15s, border-color 0.15s, color 0.15s;
          white-space: nowrap; min-height: 44px; /* iOS touch target */
          -webkit-tap-highlight-color: transparent;
        }
        .btn-primary:hover { background: var(--gold-dark); border-color: var(--gold-dark); }

        .btn-outline {
          display: inline-flex; align-items: center; justify-content: center;
          padding: 11px 24px;
          font-size: 12px; font-weight: 500;
          color: var(--ink); background: none;
          border: 1.5px solid var(--border-strong);
          cursor: pointer; letter-spacing: 0.04em;
          font-family: 'DM Sans', sans-serif; text-decoration: none;
          transition: border-color 0.15s;
          white-space: nowrap; min-height: 44px;
          -webkit-tap-highlight-color: transparent;
        }
        .btn-outline:hover { border-color: var(--ink); }

        .btn-ghost {
          display: inline-flex; align-items: center; justify-content: center;
          padding: 8px 16px;
          font-size: 13px; font-weight: 500;
          color: var(--ink-light); border: none; background: none;
          cursor: pointer; letter-spacing: 0.01em; text-decoration: none;
          transition: color 0.15s; min-height: 44px;
          -webkit-tap-highlight-color: transparent;
        }
        .btn-ghost:hover { color: var(--ink); }

        /* ── Eyebrow ── */
        .eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: var(--text-eyebrow);
          letter-spacing: 0.14em; text-transform: uppercase;
          font-weight: 600; color: var(--gold-dark); margin-bottom: 24px;
        }
        .eyebrow::before {
          content: ''; display: block;
          width: 24px; height: 1px; background: var(--gold);
        }

        /* ── Layout helpers ── */
        .container { max-width: 1200px; margin: 0 auto; padding: 0 48px; }
        .divider-x { border-right: 1px solid var(--border); }

        /* ── NAVBAR ── */
        .nav-inner {
          max-width: 1200px; margin: 0 auto;
          padding: 0 48px; height: 68px;
          display: flex; align-items: center; justify-content: space-between;
        }

        /* ── HERO ── */
        .hero-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          border-bottom: 1px solid var(--border);
          min-height: 520px;
        }
        .hero-left {
          padding: 80px 64px 80px 48px;
          border-right: 1px solid var(--border);
          display: flex; flex-direction: column; justify-content: center;
        }
        .hero-right {
          background: #F3F0EA; padding: 48px;
          display: flex; align-items: center; justify-content: center;
        }
        .hero-title {
          font-family: 'DM Serif Display', serif;
          font-size: var(--text-hero);
          line-height: 1.08; letter-spacing: -0.02em;
          color: var(--ink); margin-bottom: 20px;
        }

        /* ── STATS ── */
        .stats-strip {
          display: grid; grid-template-columns: repeat(3, 1fr);
          border-bottom: 1px solid var(--border);
        }
        .stat-item {
          padding: 28px 40px;
          border-right: 1px solid var(--border);
        }
        .stat-item:last-child { border-right: none; }

        /* ── FEATURES ── */
        .features-grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
          border: 1px solid var(--border);
        }
        .feature-card {
          padding: 40px 36px;
          border-right: 1px solid var(--border);
        }
        .feature-card:last-child { border-right: none; }

        /* ── CTA ── */
        .cta-grid {
          display: grid; grid-template-columns: 1fr 1fr;
          min-height: 320px;
        }
        .cta-left {
          padding: 72px 64px 72px 48px;
          border-right: 1px solid var(--border);
          display: flex; flex-direction: column; justify-content: center;
        }
        .cta-right {
          background: var(--ink); padding: 72px 56px;
          display: flex; flex-direction: column; justify-content: center;
        }

        /* ── FOOTER ── */
        .footer-inner {
          display: flex; align-items: center; justify-content: space-between;
          padding: 24px 48px;
          gap: 16px;
        }
        .footer-links {
          display: flex; gap: 24px;
        }

        /* ═══════════════════════════════════════════
           RESPONSIVE BREAKPOINTS
           — tablet: 1024px
           — mobile: 768px
           — small:  480px
        ═══════════════════════════════════════════ */

        /* ── Tablet (≤1024px) ── */
        @media (max-width: 1024px) {
          .container, .nav-inner { padding: 0 32px; }
          .hero-left  { padding: 60px 40px 60px 32px; }
          .hero-right { padding: 32px; }
          .features-grid { grid-template-columns: 1fr 1fr; }
          .feature-card:nth-child(2) { border-right: none; }
          .feature-card:nth-child(3) {
            border-right: none;
            border-top: 1px solid var(--border);
            grid-column: 1 / -1;
          }
          .cta-left  { padding: 56px 40px 56px 32px; }
          .cta-right { padding: 56px 40px; }
          .footer-inner { padding: 20px 32px; }
        }

        /* ── Mobile (≤768px) ── */
        @media (max-width: 768px) {
          .container, .nav-inner { padding: 0 20px; }

          /* Navbar */
          .nav-inner { height: 60px; }
          .nav-logo-subtitle { display: none; }
          .nav-actions-full { display: none !important; }
          .nav-actions-mobile { display: flex !important; }

          /* Hero */
          .hero-grid {
            grid-template-columns: 1fr;
            min-height: unset;
          }
          .hero-left {
            padding: 48px 20px 40px;
            border-right: none;
            border-bottom: 1px solid var(--border);
          }
          .hero-right { display: none; }

          /* Stats */
          .stats-strip { grid-template-columns: 1fr; }
          .stat-item {
            border-right: none;
            border-bottom: 1px solid var(--border);
            padding: 22px 20px;
          }
          .stat-item:last-child { border-bottom: none; }

          /* Features section padding */
          .features-section { padding: 48px 20px !important; }
          .features-header {
            flex-direction: column !important;
            gap: 12px !important;
            margin-bottom: 32px !important;
          }
          .features-grid {
            grid-template-columns: 1fr;
            border: none;
          }
          .feature-card {
            border-right: none !important;
            border-top: none !important;
            border-bottom: 1px solid var(--border);
            padding: 32px 20px;
            grid-column: unset !important;
          }
          .feature-card:first-child {
            border-top: 1px solid var(--border);
          }

          /* CTA */
          .cta-grid { grid-template-columns: 1fr; min-height: unset; }
          .cta-left  { padding: 48px 20px 40px; border-right: none; border-bottom: 1px solid var(--border); }
          .cta-right { padding: 40px 20px 48px; }
          .cta-btn-group { flex-direction: column !important; }
          .cta-btn-group a { width: 100%; text-align: center; }

          /* Footer */
          .footer-inner {
            flex-direction: column;
            align-items: flex-start;
            padding: 24px 20px;
            gap: 16px;
          }
          .footer-links { gap: 16px; }
        }

        /* ── Small mobile (≤480px) ── */
        @media (max-width: 480px) {
          .hero-btn-group { flex-direction: column; }
          .hero-btn-group a { width: 100%; text-align: center; }
          .btn-primary, .btn-outline { width: 100%; }
        }

        /* ── Chat mockup message bubbles ── */
        .mock-bubble-agent {
          padding: 10px 14px; font-size: 13px; line-height: 1.5;
          max-width: 82%;
          background: var(--gold-light); color: var(--gold-dark);
          border: 1px solid rgba(201,168,76,0.25);
        }
        .mock-bubble-visitor {
          padding: 10px 14px; font-size: 13px; line-height: 1.5;
          max-width: 82%;
          background: var(--ink); color: var(--cream);
          margin-left: auto; text-align: right;
        }
      `}</style>

      {/* ══════════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════════ */}
      <nav style={{ borderBottom: '1px solid var(--border)', background: 'var(--cream)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="nav-inner">

          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ width: 36, height: 36, border: '1.5px solid var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 3h12v8H9l-3 2V11H2V3z"/>
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 17, color: 'var(--ink)', letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
                ACPremiumChat
              </div>
              <div className="nav-logo-subtitle" style={{ fontSize: 10, color: 'var(--ink-lighter)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 1 }}>
                Powerful Support for Modern Businesses
              </div>
            </div>
          </Link>

          {/* Desktop actions */}
          <div className="nav-actions-full" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link href="/auth/login" className="btn-ghost">Sign In</Link>
            <Link href="/auth/signup" className="btn-primary">Start Free Trial</Link>
          </div>

          {/* Mobile actions (hidden on desktop) */}
          <div className="nav-actions-mobile" style={{ display: 'none', alignItems: 'center', gap: 8 }}>
            <Link href="/auth/login" className="btn-ghost" style={{ padding: '8px 12px', fontSize: 12 }}>Sign In</Link>
            <Link href="/auth/signup" className="btn-primary" style={{ padding: '9px 16px', fontSize: 11 }}>Try Free</Link>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section className="hero-grid">

        <div className="hero-left">
          <div className="eyebrow">Live Chat Platform</div>
          <h1 className="hero-title">
            Talk to Visitors.<br/>
            <em style={{ fontStyle: 'italic', color: 'var(--gold-dark)' }}>Close More Deals.</em>
          </h1>
          <p style={{ fontSize: 'var(--text-body)', color: 'var(--ink-light)', lineHeight: 1.7, maxWidth: 400, marginBottom: 36 }}>
            Install our live chat widget on your dealership website and connect with every
            interested buyer the moment they land — no delays, no missed opportunities.
          </p>
          <div className="hero-btn-group" style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/auth/signup" className="btn-primary">Start Free Trial</Link>
            <Link href="/auth/login" className="btn-outline">Sign In to Dashboard</Link>
          </div>
        </div>

        {/* Chat mockup — hidden on mobile via CSS */}
        <div className="hero-right">
          <div style={{ width: '100%', maxWidth: 340, background: 'white', border: '1px solid var(--border)' }}>
            {/* Mockup header */}
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', flexShrink: 0 }}/>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>Sales Support</div>
                <div style={{ fontSize: 11, color: 'var(--ink-lighter)', marginTop: 1 }}>Online — typically replies instantly</div>
              </div>
            </div>
            {/* Mockup messages */}
            <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { role: 'agent',   text: "Hi there! Looking for any specific model today? Happy to help." },
                { role: 'visitor', text: "Yes — do you have any 2024 SUVs in stock?" },
                { role: 'agent',   text: "We do! Let me pull up availability for you right now." },
              ].map((msg, i) => (
                <div key={i}>
                  <div style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4, color: 'var(--ink-lighter)', textAlign: msg.role === 'visitor' ? 'right' : 'left' }}>
                    {msg.role === 'agent' ? 'Agent' : 'Visitor'}
                  </div>
                  <div className={msg.role === 'agent' ? 'mock-bubble-agent' : 'mock-bubble-visitor'}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            {/* Mockup input */}
            <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1, height: 34, border: '1px solid var(--border)', padding: '0 12px', fontSize: 12, color: 'var(--ink-lighter)', display: 'flex', alignItems: 'center' }}>
                Type a message…
              </div>
              <div style={{ width: 34, height: 34, background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="1.5">
                  <line x1="2" y1="7" x2="12" y2="7"/>
                  <polyline points="8,3 12,7 8,11"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          STATS STRIP
      ══════════════════════════════════════════ */}
      <div className="stats-strip">
        {[
          { num: '2',  unit: 'min',    label: 'Average response time' },
          { num: '3',  unit: '×',      label: 'Higher lead conversion' },
          { num: '1',  unit: '-click', label: 'Widget installation' },
        ].map((s, i) => (
          <div key={i} className="stat-item">
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(28px,4vw,38px)', color: 'var(--ink)', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 6 }}>
              {s.num}<span style={{ fontSize: 'clamp(18px,2.5vw,24px)', color: 'var(--gold-dark)' }}>{s.unit}</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--ink-lighter)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ══════════════════════════════════════════
          FEATURES
      ══════════════════════════════════════════ */}
      <section className="features-section" style={{ padding: '80px 48px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="features-header" style={{ display: 'flex', alignItems: 'baseline', gap: 24, marginBottom: 56 }}>
            <div style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-lighter)', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>
              Platform Features
            </div>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'var(--text-h2)', letterSpacing: '-0.02em', color: 'var(--ink)', lineHeight: 1.1 }}>
              Everything you need<br/>to support customers at scale
            </h2>
          </div>

          <div className="features-grid">
            {[
              {
                num: '01',
                icon: <path d="M1 3h16v9H10l-3 2.5V12H1V3z"/>,
                title: 'Real-time Messaging',
                body: 'Engage visitors the instant they need help. Your dashboard surfaces every conversation live, with no refresh needed.',
              },
              {
                num: '02',
                icon: <><rect x="2" y="2" width="14" height="14" rx="2"/><path d="M2 7h14M7 7v9"/></>,
                title: 'Secure Multi-Tenant System',
                body: 'Each client account is completely isolated with its own routing and access controls, ensuring data privacy at every layer.',
              },
              {
                num: '03',
                icon: <><circle cx="9" cy="9" r="7"/><path d="M9 2a10 7 0 0 1 0 14M9 2a10 7 0 0 0 0 14M2 9h14"/></>,
                title: 'One-line Integration',
                body: 'Paste a single script tag into your website. Your branded chat widget is live in under a minute, on any platform.',
              },
            ].map((f, i) => (
              <div key={i} className="feature-card">
                <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(36px,5vw,52px)', color: 'rgba(26,25,23,0.08)', lineHeight: 1, marginBottom: 20, letterSpacing: '-0.03em' }}>
                  {f.num}
                </div>
                <div style={{ width: 40, height: 40, border: '1.5px solid var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="var(--ink)" strokeWidth="1.5">{f.icon}</svg>
                </div>
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)', marginBottom: 10, letterSpacing: '-0.01em' }}>{f.title}</div>
                <div style={{ fontSize: 13, color: 'var(--ink-light)', lineHeight: 1.7 }}>{f.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CTA
      ══════════════════════════════════════════ */}
      <section className="cta-grid" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="cta-left">
          <div className="eyebrow">Get started today</div>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'var(--text-h2-sm)', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 16 }}>
            Launch in minutes.<br/>No setup fees.
          </h2>
          <p style={{ fontSize: 'var(--text-small)', color: 'var(--ink-light)', lineHeight: 1.7, marginBottom: 32, maxWidth: 340 }}>
            Create your account, install the widget, and start talking to customers —
            all within a single afternoon. No contracts, cancel any time.
          </p>
          <div className="cta-btn-group" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/auth/signup" className="btn-primary">Create Free Account</Link>
            <Link href="/auth/login" className="btn-outline">Sign In</Link>
          </div>
        </div>

        <div className="cta-right">
          <div style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)', marginBottom: 28, fontWeight: 600 }}>
            How it works
          </div>
          {[
            { num: '1', title: 'Create your account',       body: 'Sign up free in under 60 seconds. No credit card required.' },
            { num: '2', title: 'Install the chat widget',   body: "Copy one script tag and paste it into your website's header." },
            { num: '3', title: 'Start converting visitors', body: 'Open your dashboard and respond to incoming conversations in real time.' },
          ].map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: i < 2 ? 28 : 0 }}>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: 'var(--gold)', lineHeight: 1, width: 24, flexShrink: 0, paddingTop: 1 }}>
                {step.num}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.88)', marginBottom: 4 }}>{step.title}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.42)', lineHeight: 1.65 }}>{step.body}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer style={{ borderTop: '1px solid var(--border)' }}>
        <div className="footer-inner">
          <div style={{ fontSize: 12, color: 'var(--ink-lighter)', flexShrink: 0 }}>
            © 2025 ACPremiumAuto Chat. All rights reserved.
          </div>
          <div className="footer-links">
            {['Privacy', 'Terms', 'Support'].map(link => (
              <Link key={link} href="#" style={{ fontSize: 12, color: 'var(--ink-lighter)', textDecoration: 'none', minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>
                {link}
              </Link>
            ))}
          </div>
        </div>
      </footer>

      {/* ══════════════════════════════════════════
          CHAT WIDGET
      ══════════════════════════════════════════ */}
      <Script
        src="http://localhost:3000/embed.js"
        data-widget-key="acp_e1b782e6e95f"
        strategy="afterInteractive"
      />

    </div>
  );
}