import { useState } from "react";
import "./LoginPage.css";

function LoginPage({ onLoginSuccess }) {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = (event) => {
    event.preventDefault();
    onLoginSuccess();
  };

  return (
    <main className="login-page">

      {/* ── LEFT BRAND PANEL ──────────────────── */}
      <section className="login-brand-panel">
        {/* Decorative orbs */}
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        {/* Header */}
        <div className="brand-header">
          <div className="brand-logo-wrap">
            <img src="images/logo.png" alt="Digital Lending Logo" className="brand-logo-img" />
          </div>
          <div className="brand-header-text">
            <h1>Digital Lending</h1>
            <p>Loan Origination System</p>
          </div>
        </div>

        {/* Hero */}
        <div className="brand-hero">
          <div className="brand-eyebrow">
            <span className="eyebrow-dot" />
            Secure Digital Lending Workspace
          </div>
          <h2>Faster, smarter, more controlled loan origination.</h2>
          <p>
            Manage leads, applicants, documents, verifications, approvals, and
            loan applications through a unified workspace built for modern
            lending teams.
          </p>

          <ul className="feature-list">
            <li className="feature-item">
              <span className="feature-check">✓</span>
              <span>Role-based secure access across all business teams</span>
            </li>
            <li className="feature-item">
              <span className="feature-check">✓</span>
              <span>Unified view of leads, applications, customers, and documents</span>
            </li>
            <li className="feature-item">
              <span className="feature-check">✓</span>
              <span>Designed for sales, contact center, credit, and operations</span>
            </li>
          </ul>
        </div>

        {/* Stat cards */}
        <div className="brand-stats">
          <div className="stat-card">
            <strong>Enterprise-grade</strong>
            <span>Access, auditability &amp; workflow control</span>
          </div>
          <div className="stat-card">
            <strong>AI-ready</strong>
            <span>Prepared for intelligent lending assistance</span>
          </div>
          <div className="stat-card">
            <strong>End-to-end</strong>
            <span>Lead intake to APS generation in one platform</span>
          </div>
        </div>
      </section>

      {/* ── RIGHT FORM PANEL ──────────────────── */}
      <section className="login-form-panel">
        <div className="form-panel-bg" />

        <div className="login-card">

          {/* Card header */}
          <div className="login-card-header">
            <div className="login-badge">
              <span className="badge-dot" />
              Secure Login
            </div>
            <h2>Welcome back</h2>
            <p>Sign in to continue to your LOS workspace.</p>
          </div>

          {/* Form */}
          <form className="login-form" onSubmit={handleLogin}>

            <div className="form-group">
              <label htmlFor="username">User ID / Email</label>
              <div className="input-wrap">
                <span className="input-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </span>
                <input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Enter your user ID or email"
                  value={formData.username}
                  onChange={handleChange}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div className="label-row">
                <label htmlFor="password">Password</label>
                <button type="button" className="forgot-link">Forgot password?</button>
              </div>
              <div className="input-wrap">
                <span className="input-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="login-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <span className="secure-note">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                Protected workspace
              </span>
            </div>

            <button type="submit" className="login-button">
              Sign In to LOS
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </form>

          {/* Footer */}
          <div className="login-card-footer">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p>
              By signing in, you agree to follow your organization&apos;s
              security and data access policies.
            </p>
          </div>
        </div>

        {/* Version label */}
        <p className="version-label">Digital Lending LOS · v2.4.1</p>
      </section>
    </main>
  );
}

export default LoginPage;
