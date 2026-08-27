import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signIn } from "aws-amplify/auth";
import "./LoginPage.css";

// Generic Inline SVG Logo Replacement (replaces image imports)
function BrandLogo({ light = false }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill={light ? "#2563eb" : "#ffffff"} />
        <path
          d="M10 22V10L16 16L22 10V22"
          stroke={light ? "#ffffff" : "#0f172a"}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span
        style={{
          fontSize: "1.25rem",
          fontWeight: 700,
          letterSpacing: "0.05em",
          color: light ? "#0f172a" : "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        APEX BANK
      </span>
    </div>
  );
}

function LoginPage({ onLoginSuccess }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    const username = formData.username.trim();
    const password = formData.password;

    if (!username || !password) {
      setErrorMessage("Please enter both user ID/email and password.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");

      const result = await signIn({
        username,
        password,
      });

      if (result.isSignedIn) {
        await onLoginSuccess();
        navigate("/dashboard", { replace: true });
        return;
      }

      if (
        result.nextStep?.signInStep ===
        "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED"
      ) {
        setErrorMessage(
          "This user requires a new password setup. Set a permanent password in Cognito or implement the new-password flow."
        );
        return;
      }

      setErrorMessage(
        `Additional sign-in step required: ${
          result.nextStep?.signInStep || "Unknown step"
        }`
      );
    } catch (error) {
      console.error("Cognito login failed:", error);
      setErrorMessage(
        error.message || "Login failed. Please check your credentials."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-brand-panel" aria-labelledby="portal-title">
        <div className="brand-grid-overlay" aria-hidden="true" />
        <div className="background-orb orb-one" aria-hidden="true" />
        <div className="background-orb orb-two" aria-hidden="true" />
        <div className="background-orb orb-three" aria-hidden="true" />

        <div className="gold-visual" aria-hidden="true">
          <span className="gold-ring gold-ring-one" />
          <span className="gold-ring gold-ring-two" />
          <span className="gold-coin gold-coin-one">24K</span>
          <span className="gold-coin gold-coin-two">916</span>
          <span className="gold-spark gold-spark-one">✦</span>
          <span className="gold-spark gold-spark-two">✦</span>
        </div>

        <header className="brand-header">
          <div className="yes-bank-logo-wrap">
            <BrandLogo />
          </div>
          <div className="product-lockup">
            <span>Gold Loan</span>
            <small>Origination System</small>
          </div>
        </header>

        <div className="brand-hero">
          <span className="eyebrow">
            <span className="eyebrow-dot" />
            Branch Lending Workspace
          </span>

          <h1 id="portal-title">
            Turn the value of gold into <span>faster possibilities.</span>
          </h1>

          <p>
            Manage the complete gold loan journey—from lead conversion and CBS
            verification to jewellery appraisal, sanction, documentation, and
            disbursement—in one controlled workspace.
          </p>

          <div className="journey-pills" aria-label="Gold loan journey">
            <span>Lead</span>
            <i aria-hidden="true" />
            <span>Application</span>
            <i aria-hidden="true" />
            <span>Appraisal</span>
            <i aria-hidden="true" />
            <span>Sanction</span>
          </div>

          <div className="feature-list">
            <div className="feature-item">
              <span className="feature-icon" aria-hidden="true">
                <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
                  <path
                    d="M3 14.5h12M4.5 14.5v-7h9v7M3.5 7.5 9 3l5.5 4.5M7 10h4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <div>
                <strong>Connected customer verification</strong>
                <p>
                  CBS eligibility, existing exposure, KYC, CIC, and account
                  checks
                </p>
              </div>
            </div>

            <div className="feature-item">
              <span className="feature-icon" aria-hidden="true">
                <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
                  <path
                    d="m9 2.5 4.8 3.2L12 14H6L4.2 5.7 9 2.5Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M4.5 6h9M6.3 6 9 14l2.7-8"
                    stroke="currentColor"
                    strokeWidth="1.25"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <div>
                <strong>Policy-driven jewellery appraisal</strong>
                <p>
                  Purity, weight, deductions, photographs, and ownership
                  evidence
                </p>
              </div>
            </div>

            <div className="feature-item">
              <span className="feature-icon" aria-hidden="true">
                <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
                  <path
                    d="M9 2.5 14.5 5v4c0 3.2-2.3 5.4-5.5 6.5C5.8 14.4 3.5 12.2 3.5 9V5L9 2.5Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  <path
                    d="m6.5 9 1.6 1.6 3.4-3.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <div>
                <strong>Controlled maker–checker journey</strong>
                <p>
                  Recommendations, approvals, e-signing, and CBS disbursement
                </p>
              </div>
            </div>
          </div>
        </div>

        <footer className="brand-footer">
          <p>Empowering Financial Growth</p>
          <span>Secure • Compliant • Auditable</span>
        </footer>
      </section>

      <section className="login-form-panel" aria-label="Sign in">
        <div className="form-background-ring" aria-hidden="true" />
        <div className="form-background-ring-2" aria-hidden="true" />
        <span className="red-accent red-accent-one" aria-hidden="true" />
        <span className="red-accent red-accent-two" aria-hidden="true" />

        <div className="login-card">
          <div className="login-card-logo">
            <BrandLogo light />
          </div>

          <div className="login-card-header">
            <span className="login-badge">
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden="true"
              >
                <rect
                  x="1.5"
                  y="5"
                  width="9"
                  height="5.5"
                  rx="1"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
                <path
                  d="M4 5V3.5a2 2 0 0 1 4 0V5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
              Authorized Access
            </span>
            <h2>Welcome back</h2>
            <p>Sign in to manage your branch gold loan pipeline and tasks.</p>
          </div>

          <form className="login-form" onSubmit={handleLogin} noValidate>
            {errorMessage && (
              <div
                className="login-error-message"
                role="alert"
                aria-live="assertive"
              >
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 18 18"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    cx="9"
                    cy="9"
                    r="6.5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                  <path
                    d="M9 5.5v4M9 12.5h.01"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="username">User ID / Email</label>
              <div className="input-wrapper">
                <span className="input-icon" aria-hidden="true">
                  <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
                    <circle
                      cx="9"
                      cy="6.5"
                      r="3"
                      stroke="currentColor"
                      strokeWidth="1.4"
                    />
                    <path
                      d="M3 15c0-3.1 2.7-5.1 6-5.1s6 2 6 5.1"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Enter your employee ID or email"
                  value={formData.username}
                  onChange={handleChange}
                  autoComplete="username"
                  disabled={isSubmitting}
                  aria-invalid={Boolean(errorMessage)}
                />
              </div>
            </div>

            <div className="form-group">
              <div className="label-row">
                <label htmlFor="password">Password</label>
                <button type="button" className="link-button">
                  Forgot password?
                </button>
              </div>
              <div className="input-wrapper">
                <span className="input-icon" aria-hidden="true">
                  <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
                    <rect
                      x="3"
                      y="8"
                      width="12"
                      height="8"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.4"
                    />
                    <path
                      d="M6 8V6a3 3 0 0 1 6 0v2"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
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
                  disabled={isSubmitting}
                  aria-invalid={Boolean(errorMessage)}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={isSubmitting}
                >
                  {showPassword ? (
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 18 18"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M3 3l12 12M7.4 7.4A2.3 2.3 0 0 0 10.6 10.6M5.2 5.3C3.7 6.2 2.6 7.5 2 9c1.3 3.1 3.8 5 7 5 1.1 0 2.1-.2 3-.7M9 4c3.2 0 5.7 1.9 7 5-.4 1-1 1.8-1.7 2.5"
                        stroke="currentColor"
                        strokeWidth="1.35"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 18 18"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M2 9c1.3-3.1 3.8-5 7-5s5.7 1.9 7 5c-1.3 3.1-3.8 5-7 5s-5.7-1.9-7-5Z"
                        stroke="currentColor"
                        strokeWidth="1.35"
                        strokeLinejoin="round"
                      />
                      <circle
                        cx="9"
                        cy="9"
                        r="2.3"
                        stroke="currentColor"
                        strokeWidth="1.35"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="login-options">
              <label className="remember-me">
                <input type="checkbox" disabled={isSubmitting} />
                <span>Remember me</span>
              </label>
              <span className="secure-note">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M6 1.2 10 2.8v3C10 8.2 8.1 10.1 6 10.8 3.9 10.1 2 8.2 2 5.8v-3L6 1.2Z"
                    stroke="currentColor"
                    strokeWidth="1.1"
                    strokeLinejoin="round"
                  />
                  <path
                    d="m4.2 6 1.1 1.1 2.4-2.4"
                    stroke="currentColor"
                    strokeWidth="1.1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Protected workspace
              </span>
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="button-spinner" aria-hidden="true" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in to Gold Loan Portal
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 18 18"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M3 9h12M11 5l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>
              For authorized users only. All activity is monitored and
              recorded in line with security policies.
            </p>
          </div>
        </div>

        <p className="support-copy">
          Need help? Contact the <button type="button">IT Service Desk</button>
        </p>
      </section>
    </main>
  );
}

export default LoginPage;