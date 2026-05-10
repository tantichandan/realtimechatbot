'use client';

import Link from 'next/link';
import Script from "next/script"

export default function HomePage() {
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#FAF9F6', color: '#1A1917', minHeight: '100vh' }}>

      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --cream: #FAF9F6;
          --ink: #1A1917;
          --ink-light: #6B6860;
          --ink-lighter: #A8A59E;
          --gold: #C9A84C;
          --gold-light: #F5EDD6;
          --gold-dark: #8B6914;
          --border: rgba(26,25,23,0.1);
          --border-strong: rgba(26,25,23,0.18);
        }
        .btn-primary {
          display: inline-block;
          padding: 9px 22px;
          font-size: 13px;
          font-weight: 600;
          color: var(--cream);
          background: var(--ink);
          border: 1.5px solid var(--ink);
          cursor: pointer;
          letter-spacing: 0.03em;
          text-transform: uppercase;
          font-family: 'DM Sans', sans-serif;
          text-decoration: none;
          transition: background 0.15s, border-color 0.15s;
        }
        .btn-primary:hover { background: var(--gold-dark); border-color: var(--gold-dark); color: white; }
        .btn-outline {
          display: inline-block;
          padding: 9px 22px;
          font-size: 13px;
          font-weight: 500;
          color: var(--ink);
          background: none;
          border: 1.5px solid var(--border-strong);
          cursor: pointer;
          letter-spacing: 0.02em;
          font-family: 'DM Sans', sans-serif;
          text-decoration: none;
          transition: border-color 0.15s;
        }
        .btn-outline:hover { border-color: var(--ink); }
        .btn-ghost {
          display: inline-block;
          padding: 8px 18px;
          font-size: 13px;
          font-weight: 500;
          color: var(--ink-light);
          border: none;
          background: none;
          cursor: pointer;
          letter-spacing: 0.01em;
          text-decoration: none;
          transition: color 0.15s;
        }
        .btn-ghost:hover { color: var(--ink); }
        .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          font-weight: 600;
          color: var(--gold-dark);
          margin-bottom: 32px;
        }
        .eyebrow::before {
          content: '';
          display: block;
          width: 24px;
          height: 1px;
          background: var(--gold);
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          border: 1px solid var(--border);
        }
        .feature-card {
          padding: 40px 36px;
          border-right: 1px solid var(--border);
        }
        .feature-card:last-child { border-right: none; }
        .stats-strip {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          border-bottom: 1px solid var(--border);
        }
        .stat-item {
          padding: 28px 40px;
          border-right: 1px solid var(--border);
        }
        .stat-item:last-child { border-right: none; }
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .cta-grid { grid-template-columns: 1fr !important; }
          .features-grid { grid-template-columns: 1fr !important; }
          .feature-card { border-right: none !important; border-bottom: 1px solid var(--border); }
          .stats-strip { grid-template-columns: 1fr !important; }
          .stat-item { border-right: none !important; border-bottom: 1px solid var(--border); }
          .hero-left { padding: 48px 24px !important; border-right: none !important; }
          .hero-right { display: none !important; }
          .hero-title { font-size: 36px !important; }
          .cta-left { padding: 48px 24px !important; border-right: none !important; }
          .cta-right { padding: 48px 24px !important; }
          nav-inner { padding: 0 24px !important; }
        }
      `}</style>

      {/* NAVBAR */}
      <nav style={{ borderBottom: '1px solid var(--border)', background: 'var(--cream)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 48px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <div style={{ width: 36, height: 36, border: '1.5px solid var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 3h12v8H9l-3 2V11H2V3z" />
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 17, color: 'var(--ink)', letterSpacing: '-0.01em' }}>
                ACPremiumChat
              </div>
              <div style={{ fontSize: 10, color: 'var(--ink-lighter)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 1 }}>
                Powerful Support for Modern Businesses
              </div>
            </div>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link href="/auth/login" className="btn-ghost">Sign In</Link>
            <Link href="/auth/signup" className="btn-primary">Start Free Trial</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid var(--border)', minHeight: 520 }}>
        <div className="hero-left" style={{ padding: '80px 64px 80px 48px', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="eyebrow">Live Chat Platform</div>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 52, lineHeight: 1.08, letterSpacing: '-0.02em', color: 'var(--ink)', marginBottom: 24 }}>
            Talk to Visitors.<br />
            <em style={{ fontStyle: 'italic', color: 'var(--gold-dark)' }}>Close More Deals.</em>
          </h1>
          <p style={{ fontSize: 15, color: 'var(--ink-light)', lineHeight: 1.7, maxWidth: 380, marginBottom: 40 }}>
            Install our live chat widget on your dealership website and connect with every
            interested buyer the moment they land — no delays, no missed opportunities.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link href="/auth/signup" className="btn-primary">Start Free Trial</Link>
            <Link href="/auth/login" className="btn-outline">Sign In to Dashboard</Link>
          </div>
        </div>

        {/* Chat mockup */}
        <div className="hero-right" style={{ background: '#F3F0EA', padding: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: 340, background: 'white', border: '1px solid var(--border)', boxShadow: '0 8px 40px rgba(0,0,0,0.08)' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>Sales Support</div>
                <div style={{ fontSize: 11, color: 'var(--ink-lighter)', marginTop: 1 }}>Online — typically replies instantly</div>
              </div>
            </div>
            <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { role: 'agent', text: "Hi there! Looking for any specific model today? Happy to help." },
                { role: 'visitor', text: "Yes — do you have any 2024 SUVs in stock?" },
                { role: 'agent', text: "We do! Let me pull up availability for you right now." },
              ].map((msg, i) => (
                <div key={i}>
                  <div style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4, color: 'var(--ink-lighter)', textAlign: msg.role === 'visitor' ? 'right' : 'left' }}>
                    {msg.role === 'agent' ? 'Agent' : 'Visitor'}
                  </div>
                  <div style={{
                    padding: '10px 14px',
                    fontSize: 13,
                    lineHeight: 1.5,
                    maxWidth: '82%',
                    ...(msg.role === 'agent'
                      ? { background: 'var(--gold-light)', color: 'var(--gold-dark)', border: '1px solid rgba(201,168,76,0.25)', alignSelf: 'flex-start' }
                      : { background: 'var(--ink)', color: 'var(--cream)', marginLeft: 'auto', textAlign: 'right' }
                    ),
                  }}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1, height: 34, border: '1px solid var(--border)', padding: '0 12px', fontSize: 12, color: 'var(--ink-lighter)', display: 'flex', alignItems: 'center' }}>
                Type a message…
              </div>
              <div style={{ width: 34, height: 34, background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="1.5">
                  <line x1="2" y1="7" x2="12" y2="7" />
                  <polyline points="8,3 12,7 8,11" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <div className="stats-strip">
        {[
          { num: '2', unit: 'min', label: 'Average response time' },
          { num: '3', unit: '×', label: 'Higher lead conversion' },
          { num: '1', unit: '-click', label: 'Widget installation' },
        ].map((s, i) => (
          <div key={i} className="stat-item">
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 36, color: 'var(--ink)', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 6 }}>
              {s.num}<span style={{ fontSize: 22, color: 'var(--gold-dark)' }}>{s.unit}</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-lighter)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* FEATURES */}
      <section style={{ padding: '80px 48px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 24, marginBottom: 56 }}>
            <div style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-lighter)', fontWeight: 600, whiteSpace: 'nowrap' }}>
              Platform Features
            </div>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 38, letterSpacing: '-0.02em', color: 'var(--ink)', lineHeight: 1.1 }}>
              Everything you need<br />to support customers at scale
            </h2>
          </div>

          <div className="features-grid">
            {[
              {
                num: '01',
                icon: <path d="M1 3h16v9H10l-3 2.5V12H1V3z" />,
                title: 'Real-time Messaging',
                body: 'Engage visitors the instant they need help. Your dashboard surfaces every conversation live, with no refresh needed.',
              },
              {
                num: '02',
                icon: <><rect x="2" y="2" width="14" height="14" rx="2" /><path d="M2 7h14M7 7v9" /></>,
                title: 'Secure Multi-Tenant System',
                body: 'Each client account is completely isolated with its own routing and access controls, ensuring data privacy at every layer.',
              },
              {
                num: '03',
                icon: <><circle cx="9" cy="9" r="7" /><path d="M9 2a10 7 0 0 1 0 14M9 2a10 7 0 0 0 0 14M2 9h14" /></>,
                title: 'One-line Integration',
                body: 'Paste a single script tag into your website. Your branded chat widget is live in under a minute, on any platform.',
              },
            ].map((f, i) => (
              <div key={i} className="feature-card">
                <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 48, color: 'rgba(26,25,23,0.1)', lineHeight: 1, marginBottom: 24, letterSpacing: '-0.03em' }}>
                  {f.num}
                </div>
                <div style={{ width: 40, height: 40, border: '1.5px solid var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="var(--ink)" strokeWidth="1.5">{f.icon}</svg>
                </div>
                <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--ink)', marginBottom: 10, letterSpacing: '-0.01em' }}>{f.title}</div>
                <div style={{ fontSize: 13, color: 'var(--ink-light)', lineHeight: 1.7 }}>{f.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 320 }}>
        <div className="cta-left" style={{ padding: '72px 64px 72px 48px', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="eyebrow">Get started today</div>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 42, letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 16 }}>
            Launch in minutes.<br />No setup fees.
          </h2>
          <p style={{ fontSize: 14, color: 'var(--ink-light)', lineHeight: 1.7, marginBottom: 36, maxWidth: 340 }}>
            Create your account, install the widget, and start talking to customers —
            all within a single afternoon. No contracts, cancel any time.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link href="/auth/signup" className="btn-primary">Create Free Account</Link>
            <Link href="/auth/login" className="btn-outline">Sign In</Link>
          </div>
        </div>

        <div className="cta-right" style={{ background: 'var(--ink)', padding: '72px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 24, fontWeight: 600 }}>
            How it works
          </div>
          {[
            { num: '1', title: 'Create your account', body: 'Sign up free in under 60 seconds. No credit card required.' },
            { num: '2', title: 'Install the chat widget', body: "Copy one script tag and paste it into your website's header." },
            { num: '3', title: 'Start converting visitors', body: 'Open your dashboard and respond to incoming conversations in real time.' },
          ].map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: i < 2 ? 28 : 0 }}>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: 'var(--gold)', lineHeight: 1, width: 24, flexShrink: 0, paddingTop: 1 }}>
                {step.num}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.9)', marginBottom: 3 }}>{step.title}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>{step.body}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '24px 48px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 12, color: 'var(--ink-lighter)' }}>© 2025 ACPremiumAuto Chat. All rights reserved.</div>
        <div style={{ display: 'flex', gap: 24 }}>
          {['Privacy', 'Terms', 'Support'].map(link => (
            <Link key={link} href="#" style={{ fontSize: 12, color: 'var(--ink-lighter)', textDecoration: 'none' }}>{link}</Link>
          ))}
        </div>


        <Script
  src="https://realtimechatbot-tan.vercel.app/embed.js"
  data-widget-key="acp_e1b782e6e95f"
  strategy="afterInteractive"
/>


      </footer>

    </div>
  );
}