'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUri = searchParams.get('redirect_uri') || '/dashboard';
  const { signInWithEmail, signInWithGoogle, loading: authLoading, error } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const result = await signInWithEmail(email, password);
    setIsLoading(false);
    if (result.success) {
      router.push(redirectUri);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    await signInWithGoogle();
    setIsLoading(false);
  };

  const busy = isLoading || authLoading;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#FAF9F6', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
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
          --red-bg: #FEF2F2;
          --red-border: rgba(220,38,38,0.2);
          --red-text: #991B1B;
        }
        .login-input {
          width: 100%;
          height: 42px;
          border: 1px solid var(--border-strong);
          background: white;
          padding: 0 14px;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          color: var(--ink);
          outline: none;
          transition: border-color 0.15s;
          -webkit-appearance: none;
        }
        .login-input::placeholder { color: var(--ink-lighter); }
        .login-input:focus { border-color: var(--ink); }
        .login-input:disabled { background: #F5F4F1; color: var(--ink-lighter); cursor: not-allowed; }
        .btn-primary {
          width: 100%;
          height: 44px;
          background: var(--ink);
          color: var(--cream);
          border: 1.5px solid var(--ink);
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background 0.15s, border-color 0.15s;
        }
        .btn-primary:hover:not(:disabled) { background: var(--gold-dark); border-color: var(--gold-dark); }
        .btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }
        .btn-google {
          width: 100%;
          height: 44px;
          background: white;
          color: var(--ink);
          border: 1px solid var(--border-strong);
          font-size: 13px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: border-color 0.15s, background 0.15s;
        }
        .btn-google:hover:not(:disabled) { border-color: var(--ink); background: #F5F4F1; }
        .btn-google:disabled { opacity: 0.55; cursor: not-allowed; }
        .field-label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--ink-light);
          margin-bottom: 8px;
        }
        .divider {
          display: flex;
          align-items: center;
          gap: 14px;
          margin: 4px 0;
        }
        .divider-line { flex: 1; height: 1px; background: var(--border); }
        .divider-text { font-size: 11px; color: var(--ink-lighter); letter-spacing: 0.08em; text-transform: uppercase; white-space: nowrap; }
        .info-banner {
          background: var(--gold-light);
          border: 1px solid rgba(201,168,76,0.3);
          padding: 12px 16px;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 13px;
          color: var(--gold-dark);
          line-height: 1.5;
        }
        .error-banner {
          background: var(--red-bg);
          border: 1px solid var(--red-border);
          padding: 12px 16px;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 13px;
          color: var(--red-text);
          line-height: 1.5;
        }
        .text-link {
          color: var(--gold-dark);
          font-weight: 600;
          text-decoration: none;
          font-size: 13px;
        }
        .text-link:hover { text-decoration: underline; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; }
      `}</style>

      {/* NAV */}
      <nav style={{ borderBottom: '1px solid var(--border)', background: 'var(--cream)', height: 64, display: 'flex', alignItems: 'center', padding: '0 48px' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <div style={{ width: 34, height: 34, border: '1.5px solid var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 3h12v8H9l-3 2V11H2V3z" />
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 16, color: 'var(--ink)', letterSpacing: '-0.01em' }}>
              ACPremiumAuto Chat
            </div>
            <div style={{ fontSize: 9, color: 'var(--ink-lighter)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 1 }}>
              Real-time Customer Messaging
            </div>
          </div>
        </Link>
      </nav>

      {/* MAIN */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 'calc(100vh - 64px)' }}>

        {/* LEFT — decorative panel */}
        <div style={{ background: 'var(--ink)', padding: '80px 64px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 44, color: 'white', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 24 }}>
              Welcome<br /><em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>back.</em>
            </div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.8, maxWidth: 320 }}>
              Sign in to your dashboard to manage customer conversations and grow your business in real time.
            </p>
          </div>

          {/* Fake stat cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { label: 'Active conversations', value: '24', trend: '+3 today' },
              { label: 'Avg. response time', value: '1m 42s', trend: 'Faster than yesterday' },
              { label: 'Leads captured', value: '189', trend: 'This month' },
            ].map((s, i) => (
              <div key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 16, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{s.label}</div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: 'white', lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--gold)', marginTop: 2 }}>{s.trend}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — form */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 48px', background: 'var(--cream)' }}>
          <div style={{ width: '100%', maxWidth: 400 }}>

            {/* Header */}
            <div style={{ marginBottom: 40 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600, color: 'var(--gold-dark)', marginBottom: 16 }}>
                <span style={{ display: 'block', width: 20, height: 1, background: 'var(--gold)' }} />
                Admin Dashboard
              </div>
              <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 34, color: 'var(--ink)', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 8 }}>
                Sign In
              </h1>
              <p style={{ fontSize: 14, color: 'var(--ink-lighter)', lineHeight: 1.6 }}>
                Don&apos;t have an account?{' '}
                <Link href="/auth/signup" className="text-link">Create one free</Link>
              </p>
            </div>

            {/* Info banner */}
            <div style={{ marginBottom: 24 }}>
              <div className="info-banner">
                <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>Use the email and password you used when creating your account.</span>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ marginBottom: 24 }}>
                <div className="error-banner">
                  <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                  <div>
                    {error === 'Email not confirmed' ? (
                      <>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>Email verification required</div>
                        <div>Check your inbox for a verification link, then try signing in again.</div>
                      </>
                    ) : (
                      <span>{error}</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleEmailLogin}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 24 }}>
                <div>
                  <label htmlFor="email" className="field-label">Email address</label>
                  <input
                    id="email"
                    type="email"
                    className="login-input"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={busy}
                  />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
                    <label htmlFor="password" className="field-label" style={{ marginBottom: 0 }}>Password</label>
                    <Link href="/auth/forgot-password" className="text-link" style={{ fontSize: 12 }}>
                      Forgot password?
                    </Link>
                  </div>
                  <input
                    id="password"
                    type="password"
                    className="login-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={busy}
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={busy}>
                {busy ? (
                  <>
                    <Loader2 size={15} className="spin" />
                    Signing in…
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="divider" style={{ margin: '24px 0' }}>
              <div className="divider-line" />
              <span className="divider-text">or continue with</span>
              <div className="divider-line" />
            </div>

            {/* Google */}
            <button className="btn-google" onClick={handleGoogleLogin} disabled={busy} type="button">
              {busy ? (
                <>
                  <Loader2 size={15} className="spin" />
                  Connecting…
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </>
              )}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}