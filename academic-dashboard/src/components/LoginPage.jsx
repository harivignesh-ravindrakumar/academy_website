import { useState } from "react";
import "./LoginPage.css";
import { useNavigate } from "react-router-dom";
import bgImage from "../assets/sowthas_bg.png";
import logo from "../assets/sowthas_logo.png";
import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  sendPasswordResetEmail,
} from "firebase/auth";

const googleProvider = new GoogleAuthProvider();
const appleProvider = new OAuthProvider("apple.com");

// Turns Firebase's auth/* error codes into copy a person can act on.
function friendlyAuthError(error) {
  switch (error?.code) {
    case "auth/invalid-email":
      return "That email address doesn't look right.";
    case "auth/user-disabled":
      return "This account has been disabled. Contact support for help.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect email or password.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return null; // person just closed the popup — not a real error
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    default:
      return "Something went wrong signing you in. Please try again.";
  }
}

// Simple inline icons (no external icon library required)
const MailIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="2.5" y="4.5" width="19" height="15" rx="2.2" />
    <path d="M3.5 6.5 12 13l8.5-6.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
    <path d="M7.5 10.5V7.2a4.5 4.5 0 0 1 9 0v3.3" strokeLinecap="round" />
  </svg>
);

const EyeIcon = ({ open }) =>
  open ? (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M2 12s3.8-7 10-7 10 7 10 7-3.8 7-10 7-10-7-10-7Z" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 3l18 18" strokeLinecap="round" />
      <path d="M10.6 5.2A10.6 10.6 0 0 1 12 5c6.2 0 10 7 10 7a15.6 15.6 0 0 1-4.2 4.6M6.6 6.6C3.9 8.3 2 12 2 12s3.8 7 10 7c1.4 0 2.6-.3 3.7-.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.9 10a3 3 0 0 0 4.1 4.1" strokeLinecap="round" />
    </svg>
  );

const GoogleIcon = () => (
  <svg viewBox="0 0 48 48" width="18" height="18">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5Z" />
    <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6 29.6 4 24 4c-7.5 0-14 4.2-17.7 10.7Z" />
    <path fill="#4CAF50" d="M24 44c5.5 0 10.4-1.9 14.1-5.1l-6.5-5.5C29.6 34.9 26.9 36 24 36c-5.3 0-9.7-3.4-11.3-8.1l-6.6 5.1C9.9 39.7 16.4 44 24 44Z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4.1 5.9l6.5 5.5C41.6 36 44 30.6 44 24c0-1.3-.1-2.7-.4-3.5Z" />
  </svg>
);

const AppleIcon = () => (
  <svg viewBox="0 0 384 512" width="16" height="16" fill="currentColor">
    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-14.9 0-49.3-19.7-76.1-19.7C60.6 141.2 0 184.8 0 273.5c0 25.9 4.7 52.6 14.2 80.2 12.6 36.7 58.1 126.9 105.6 125.4 24.9-.6 42.5-17.7 74.9-17.7 31.5 0 47.8 17.7 75.6 17.7 47.9-.7 88.9-83 100.9-119.8-64.1-30.2-52.5-88.5-52.5-90.6zM255.2 65.1c27-32 24.5-61.2 23.7-71.7-23.8 1.4-51.4 16.4-67.2 34.9-17.4 19.6-27.6 43.9-25.4 71 26-2 49.7-14.9 69-34.2z" />
  </svg>
);

export default function LoginPage({ onAuthSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null); // "google" | "apple" | null

  const validate = () => {
    const next = {};
    if (!email.trim()) next.email = "Enter your email to continue.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid email address.";
    if (!password) next.password = "Enter your password to continue.";
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    setResetMessage("");
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    try {
      await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
      const credential = await signInWithEmailAndPassword(auth, email, password);
      onAuthSuccess?.(credential.user);
    } catch (error) {
      const message = friendlyAuthError(error);
      if (message) setAuthError(message);
    } finally {
      setSubmitting(false);
    }
  };
const navigate = useNavigate();
  // const handleSocialSignIn = async (provider, name) => {
  //   setAuthError("");
  //   setResetMessage("");
  //   setSocialLoading(name);
  //   try {
  //     await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
  //     const credential = await signInWithPopup(auth, provider);
  //     onAuthSuccess?.(credential.user);
  //   } catch (error) {
  //     const message = friendlyAuthError(error);
  //     if (message) setAuthError(message);
  //   } finally {
  //     setSocialLoading(null);
  //   }
  // };

const handleSocialSignIn = async (provider, name) => {
  setAuthError("");
  setResetMessage("");
  setSocialLoading(name);

  try {
    console.log("Opening popup...");

    await setPersistence(
      auth,
      remember ? browserLocalPersistence : browserSessionPersistence
    );

    const credential = await signInWithPopup(auth, provider);

console.log("SUCCESS");
console.log(credential.user);

//onAuthSuccess?.(credential.user);
navigate("/dashboard");

  } catch (error) {
    console.log("Firebase Error");
    console.log(error);
    console.log("Code:", error.code);
    console.log("Message:", error.message);

    const message = friendlyAuthError(error);
    if (message) setAuthError(message);

  } finally {
    setSocialLoading(null);
  }
};

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setAuthError("");
    setResetMessage("");
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors((prev) => ({ ...prev, email: "Enter your email above first, then click \u201cForgot password?\u201d again." }));
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setResetMessage("Password reset email sent — check your inbox.");
    } catch (error) {
      const message = friendlyAuthError(error);
      if (message) setAuthError(message);
    }
  };

  return (
    <div className="sowthas-page" style={{ backgroundImage: `url(${bgImage})` }}>
      {/* The stage locks to the background artwork's exact aspect ratio, so
          the artwork is always shown whole (no crop/stretch/zoom) and the
          card always sits at the same relative spot on the artwork,
          regardless of screen size. Below 720px the stage steps aside (see
          LoginPage.css) and this same image shows through via `contain`
          on .sowthas-page instead, still fully uncropped. */}
      <div className="sowthas-stage" style={{ backgroundImage: `url(${bgImage})` }}>
        <div className="sowthas-card" role="main">
          <div className="sowthas-card-inner">
          <img src={logo} alt="SOWTHAS Boutique Academy" className="sowthas-logo" />

          <h1 className="sowthas-title">Welcome Back</h1>
          <p className="sowthas-subtitle">
            Sign in to continue to
            <br />
            SOWTHAS Boutique Academy
          </p>

          {authError && (
            <p className="sowthas-banner sowthas-banner-error" role="alert">
              {authError}
            </p>
          )}
          {resetMessage && (
            <p className="sowthas-banner sowthas-banner-success" role="status">
              {resetMessage}
            </p>
          )}

          <form className="sowthas-form" onSubmit={handleSubmit} noValidate>
            <label className="sowthas-label" htmlFor="email">
              Email
            </label>
            <div className={`sowthas-input-wrap ${errors.email ? "has-error" : ""}`}>
              <span className="sowthas-input-icon">
                <MailIcon />
              </span>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
            </div>
            {errors.email && (
              <p className="sowthas-field-error" id="email-error">
                {errors.email}
              </p>
            )}

            <label className="sowthas-label" htmlFor="password">
              Password
            </label>
            <div className={`sowthas-input-wrap ${errors.password ? "has-error" : ""}`}>
              <span className="sowthas-input-icon">
                <LockIcon />
              </span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? "password-error" : undefined}
              />
              <button
                type="button"
                className="sowthas-eye-btn"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
            {errors.password && (
              <p className="sowthas-field-error" id="password-error">
                {errors.password}
              </p>
            )}

            <div className="sowthas-row">
              <label className="sowthas-checkbox">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <a href="#forgot-password" className="sowthas-link" onClick={handleForgotPassword}>
                Forgot password?
              </a>
            </div>

            <button type="submit" className="sowthas-login-btn" disabled={submitting || socialLoading !== null}>
              {submitting ? "Signing in…" : "Login"}
            </button>
          </form>

          <div className="sowthas-divider">
            <span>OR</span>
          </div>

          <div className="sowthas-social-row">
            <button
              type="button"
              className="sowthas-social-btn"
              onClick={() => handleSocialSignIn(googleProvider, "google")}
              disabled={socialLoading !== null || submitting}
            >
              <GoogleIcon />
              {socialLoading === "google" ? "Connecting…" : "Google"}
            </button>
            <button
              type="button"
              className="sowthas-social-btn"
              onClick={() => handleSocialSignIn(appleProvider, "apple")}
              disabled={socialLoading !== null || submitting}
            >
              <AppleIcon />
              {socialLoading === "apple" ? "Connecting…" : "Apple"}
            </button>
          </div>

          <p className="sowthas-signup">
            New here?{" "}
            <a href="#create-account" className="sowthas-link sowthas-link-strong">
              Create account
            </a>
          </p>
          </div>
        </div>
      </div>
    </div>
  );
}
