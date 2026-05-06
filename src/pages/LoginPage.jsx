import { useState } from "react";
import "./LoginPage.css";

const ShieldIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const EyeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

function LoginPage({ onLoginSuccess }) {
  const [formData,     setFormData]     = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    onLoginSuccess();
  };

  return (
    <main className="login-page">

      {/* ── LEFT PANEL ───────────────────────── */}
      <section className="login-brand-panel">
        <div className="lbp-orb lbp-orb-1" />
        <div className="lbp-orb lbp-orb-2" />
        <div className="lbp-orb lbp-orb-3" />

        {/* Header */}
        <header className="lbp-header">
          <div className="lbp-logo">LOS</div>
          <div>
            <h1>Digital Lending</h1>
            <p>Loan Origination System</p>
          </div>
        </header>

        {/* Hero */}
        <div className="lbp-hero">
          <div className="lbp-eyebrow">
            <span className="lbp-eyebrow-dot" />
            Secure Digital Lending Workspace
          </div>

          <h2>Faster, smarter, more controlled loan origination.</h2>

          <p>
            Manage leads, applicants, documents, verifications, approvals, and
            loan applications — unified in one workspace built for modern
            lending teams.
          </p>

          <ul className="lbp-features">
            <li>
              <span className="lbp-check">✓</span>
              Role-based secure access across all business teams
            </li>
            <li>
              <span className="lbp-check">✓</span>
              Unified view of leads, applications, customers, and documents
            </li>
            <li>
              <span className="lbp-check">✓</span>
              Designed for sales, contact center, credit, and operations
            </li>
          </ul>
        </div>

        {/* Stat strip */}
        <div className="lbp-stats">
          <div className="lbp-stat">
            <strong>Enterprise-grade</strong>
            <span>Access, auditability &amp; workflow control</span>
          </div>
          <div className="lbp-stat">
            <strong>AI-ready</strong>
            <span>Prepared for intelligent lending assistance</span>
          </div>
          <div className="lbp-stat">
            <strong>End-to-end</strong>
            <span>Lead intake through APS generation</span>
          </div>
        </div>
      </section>

      {/* ── RIGHT PANEL ──────────────────────── */}
      <section className="login-form-panel">
        <div className="lfp-radial" />

        <div className="login-card">

          {/* Card header */}
          <div className="lc-header">
            <div className="lc-badge">
              <span className="lc-badge-dot" />
              Secure Login
            </div>
            <h2>Welcome back</h2>
            <p>Sign in to continue to your LOS workspace.</p>
          </div>

          {/* Form */}
          <form className="lc-form" onSubmit={handleLogin}>

            {/* User ID */}
            <div className="lc-field">
              <label htmlFor="username">User ID / Email</label>
              <div className="lc-input-wrap">
                <svg className="lc-input-icon" width="15" height="15" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <input
                  id="username" name="username" type="text"
                  placeholder="Enter your user ID or email"
                  value={formData.username}
                  onChange={handleChange}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="lc-field">
              <div className="lc-label-row">
                <label htmlFor="password">Password</label>
                <button type="button" className="lc-forgot">Forgot password?</button>
              </div>
              <div className="lc-input-wrap">
                <svg className="lc-input-icon" width="15" height="15" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  id="password" name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="lc-eye-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Options row */}
            <div className="lc-options">
              <label className="lc-remember">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <span className="lc-secure">
                <ShieldIcon />
                Protected workspace
              </span>
            </div>

            <button type="submit" className="lc-submit">
              Sign In to LOS
              <ArrowRightIcon />
            </button>
          </form>

          {/* Disclaimer */}
          <div className="lc-footer">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p>
              By signing in, you agree to your organisation&apos;s security
              and data access policies.
            </p>
          </div>
        </div>

        <p className="lfp-version">Digital Lending LOS · v2.4.1</p>
      </section>
    </main>
  );
}

export default LoginPage;
