import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  FiMail, 
  FiLock, 
  FiUser, 
  FiEye, 
  FiEyeOff, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiLoader, 
  FiArrowRight, 
  FiCheck,
  FiX,
  FiShield,
  FiTruck,
  FiShoppingBag,
  FiKey,
  FiRefreshCw
} from "react-icons/fi";
import { RiLeafLine } from "react-icons/ri";
import "./AuthPage.css";

const AuthPage = ({ initialTab = "login" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, isAuthenticated } = useAuth();

  // Determine redirect target
  const searchParams = new URLSearchParams(location.search);
  const redirectTarget = searchParams.get("redirect") || location.state?.from || "/checkout";
  const wasCheckoutRedirect = redirectTarget.includes("checkout") || location.state?.reason === "checkout_requires_auth";

  // Tab State: "login" or "register"
  const [activeTab, setActiveTab] = useState(
    location.pathname.includes("register") ? "register" : initialTab
  );

  // If already authenticated, redirect immediately
  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTarget, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectTarget]);

  // Form states
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
    rememberMe: true
  });

  const [registerForm, setRegisterForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: true
  });

  // UI & Feedback states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });

  // Forgot Password & OTP Flow states
  const [forgotPasswordModal, setForgotPasswordModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotAlert, setForgotAlert] = useState({ show: false, type: "", message: "" });
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const switchTab = (tab) => {
    setActiveTab(tab);
    setFormErrors({});
    setAlert({ show: false, type: "", message: "" });
  };

  // Validation helpers
  const validateLogin = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!loginForm.email.trim()) {
      errors.email = "Email address is required";
    } else if (!emailRegex.test(loginForm.email.trim())) {
      errors.email = "Please enter a valid email address";
    }

    if (!loginForm.password) {
      errors.password = "Password is required";
    } else if (loginForm.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateRegister = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!registerForm.fullName.trim()) {
      errors.fullName = "Full name is required";
    } else if (registerForm.fullName.trim().length < 2) {
      errors.fullName = "Name must be at least 2 characters";
    }

    if (!registerForm.email.trim()) {
      errors.email = "Email address is required";
    } else if (!emailRegex.test(registerForm.email.trim())) {
      errors.email = "Please enter a valid email address";
    }

    if (!registerForm.password) {
      errors.password = "Password is required";
    } else if (registerForm.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (!registerForm.confirmPassword) {
      errors.confirmPassword = "Confirm password is required";
    } else if (registerForm.confirmPassword !== registerForm.password) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Login submission
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateLogin()) return;

    setLoading(true);
    setAlert({ show: false, type: "", message: "" });

    try {
      const data = await login(loginForm.email, loginForm.password);
      setAlert({
        show: true,
        type: "success",
        message: data.message || `Welcome back, ${data.user?.name || "Customer"}! Redirecting to checkout...`
      });

      setTimeout(() => {
        navigate(redirectTarget, { replace: true });
      }, 1000);
    } catch (err) {
      setAlert({
        show: true,
        type: "error",
        message: err.message || "Invalid credentials. Please verify your email and password."
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle Register submission
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateRegister()) return;

    setLoading(true);
    setAlert({ show: false, type: "", message: "" });

    try {
      const data = await register(
        registerForm.fullName,
        registerForm.email,
        registerForm.password
      );

      setAlert({
        show: true,
        type: "success",
        message: data.message || "Account created successfully! Preparing your checkout..."
      });

      setTimeout(() => {
        navigate(redirectTarget, { replace: true });
      }, 1200);
    } catch (err) {
      setAlert({
        show: true,
        type: "error",
        message: err.message || "Failed to create account. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  // Forgot password flow
  const openForgotPassword = () => {
    setForgotStep(1);
    setForgotEmail(loginForm.email || "");
    setForgotOtp(["", "", "", "", "", ""]);
    setNewPassword("");
    setConfirmNewPassword("");
    setForgotAlert({ show: false, type: "", message: "" });
    setForgotPasswordModal(true);
  };

  const handleOtpDigitChange = (val, index) => {
    const cleaned = val.replace(/[^0-9]/g, "");
    const newOtp = [...forgotOtp];
    newOtp[index] = cleaned.slice(-1);
    setForgotOtp(newOtp);

    if (cleaned && index < 5) {
      const nextInput = document.getElementById(`forgot-otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !forgotOtp[index] && index > 0) {
      const prevInput = document.getElementById(`forgot-otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!forgotEmail.trim() || !emailRegex.test(forgotEmail.trim())) {
      setForgotAlert({
        show: true,
        type: "error",
        message: "Please enter a valid registered email address."
      });
      return;
    }

    setForgotLoading(true);
    setForgotAlert({ show: false, type: "", message: "" });

    try {
      const response = await fetch("https://grocery-backend-1-hf2l.onrender.com/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.trim() })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to send verification code.");

      setForgotAlert({
        show: true,
        type: "success",
        message: data.message || `Verification code sent to ${forgotEmail}.`
      });
      setResendTimer(60);
      setForgotStep(2);
      setTimeout(() => {
        const firstOtp = document.getElementById("forgot-otp-0");
        if (firstOtp) firstOtp.focus();
      }, 100);
    } catch (err) {
      setForgotAlert({
        show: true,
        type: "error",
        message: err.message || "Unable to send verification code."
      });
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const code = forgotOtp.join("");
    if (code.length < 6) {
      setForgotAlert({
        show: true,
        type: "error",
        message: "Please enter the complete 6-digit code."
      });
      return;
    }

    setForgotLoading(true);
    setForgotAlert({ show: false, type: "", message: "" });

    try {
      const response = await fetch("https://grocery-backend-1-hf2l.onrender.com/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.trim(), otp: code })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Invalid or expired code.");

      setForgotAlert({
        show: true,
        type: "success",
        message: "Code verified! Set your new password."
      });
      setForgotStep(3);
    } catch (err) {
      setForgotAlert({
        show: true,
        type: "error",
        message: err.message || "Verification failed."
      });
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setForgotAlert({
        show: true,
        type: "error",
        message: "Password must be at least 6 characters."
      });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setForgotAlert({
        show: true,
        type: "error",
        message: "Passwords do not match."
      });
      return;
    }

    setForgotLoading(true);
    setForgotAlert({ show: false, type: "", message: "" });

    try {
      const response = await fetch("https://grocery-backend-1-hf2l.onrender.com/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotEmail.trim(),
          otp: forgotOtp.join(""),
          newPassword
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to reset password.");

      setForgotStep(4);
      setLoginForm((prev) => ({ ...prev, email: forgotEmail.trim(), password: "" }));
    } catch (err) {
      setForgotAlert({
        show: true,
        type: "error",
        message: err.message || "Server error while resetting password."
      });
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="auth-page-root">
      {/* Top Simple Brand Header */}
      <header className="auth-page-header">
        <div className="auth-header-container">
          <Link to="/" className="auth-logo-link" aria-label="FreshRoot Home">
            <div className="auth-logo-leaf">
              <RiLeafLine />
            </div>
            <span className="auth-logo-text">
              FRESH<span className="auth-logo-accent">ROOT</span>
            </span>
          </Link>

          <div className="auth-header-badge">
            <FiShield className="shield-icon" />
            <span>256-Bit SSL Secure Checkout Protection</span>
          </div>

          <Link to="/" className="back-to-shop-link">
            ← Return to Store
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="auth-page-main">
        <div className="auth-page-card-wrapper">

          {/* Checkout Redirection Notice Banner */}
          {wasCheckoutRedirect && (
            <div className="checkout-redirect-notice" role="alert">
              <div className="notice-icon-box">
                <FiShoppingBag />
              </div>
              <div className="notice-text">
                <strong>Sign in or create an account to proceed to checkout</strong>
                <p>Your basket items, delivery preferences, and prices are fully preserved.</p>
              </div>
            </div>
          )}

          {/* Two-Column Card Box */}
          <div className="auth-page-card">
            
            {/* LEFT / TOP: Authentication Form Content */}
            <div className="auth-card-form-side">
              
              {/* Brand Welcoming Header */}
              <div className="auth-form-brand-header">
                <div className="brand-leaf-pill">
                  <RiLeafLine className="pill-leaf" />
                  <span>ORGANIC HARVEST STORE</span>
                </div>
                <h1 className="auth-main-heading">Welcome to FreshRoot!</h1>
                <p className="auth-main-subheading">
                  {activeTab === "login" 
                    ? "Sign in to access your harvest basket and complete your order." 
                    : "Create an account to unlock fast checkout, saved addresses and farm deals."}
                </p>
              </div>

              {/* TABS / TOGGLE SWITCH */}
              <div className="auth-tabs-toggle" role="tablist" aria-label="Authentication Options">
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "login"}
                  className={`tab-toggle-btn ${activeTab === "login" ? "active" : ""}`}
                  onClick={() => switchTab("login")}
                >
                  <span>Login</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "register"}
                  className={`tab-toggle-btn ${activeTab === "register" ? "active" : ""}`}
                  onClick={() => switchTab("register")}
                >
                  <span>Create Account</span>
                </button>
              </div>

              {/* Alert Feedback Banner */}
              {alert.show && (
                <div className={`auth-alert-box ${alert.type}`} role="alert">
                  {alert.type === "success" ? <FiCheckCircle className="alert-icon" /> : <FiAlertCircle className="alert-icon" />}
                  <span>{alert.message}</span>
                </div>
              )}

              {/* TAB 1: LOGIN FORM */}
              {activeTab === "login" && (
                <form className="auth-active-form" onSubmit={handleLogin} noValidate>
                  {/* Email */}
                  <div className={`form-field-group ${formErrors.email ? "has-error" : ""}`}>
                    <label htmlFor="auth-login-email">Email Address</label>
                    <div className="input-icon-wrapper">
                      <FiMail className="field-prefix-icon" />
                      <input
                        id="auth-login-email"
                        type="email"
                        placeholder="you@example.com"
                        value={loginForm.email}
                        onChange={(e) => {
                          setLoginForm({ ...loginForm, email: e.target.value });
                          if (formErrors.email) setFormErrors({ ...formErrors, email: "" });
                        }}
                        autoComplete="email"
                      />
                    </div>
                    {formErrors.email && <span className="field-error-msg">{formErrors.email}</span>}
                  </div>

                  {/* Password */}
                  <div className={`form-field-group ${formErrors.password ? "has-error" : ""}`}>
                    <div className="label-with-link">
                      <label htmlFor="auth-login-pass">Password</label>
                      <button 
                        type="button" 
                        className="forgot-password-btn" 
                        onClick={openForgotPassword}
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="input-icon-wrapper">
                      <FiLock className="field-prefix-icon" />
                      <input
                        id="auth-login-pass"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={loginForm.password}
                        onChange={(e) => {
                          setLoginForm({ ...loginForm, password: e.target.value });
                          if (formErrors.password) setFormErrors({ ...formErrors, password: "" });
                        }}
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        className="field-toggle-visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                    {formErrors.password && <span className="field-error-msg">{formErrors.password}</span>}
                  </div>

                  {/* Remember Me */}
                  <div className="form-checkbox-row">
                    <label className="auth-checkbox-label">
                      <input
                        type="checkbox"
                        checked={loginForm.rememberMe}
                        onChange={(e) => setLoginForm({ ...loginForm, rememberMe: e.target.checked })}
                      />
                      <span className="auth-checkmark-box">
                        {loginForm.rememberMe && <FiCheck className="checkmark-icon" />}
                      </span>
                      <span>Stay signed in on this device</span>
                    </label>
                  </div>

                  {/* Login Button */}
                  <button
                    type="submit"
                    className="auth-primary-btn"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <FiLoader className="btn-spin" />
                        <span>Signing In Securely...</span>
                      </>
                    ) : (
                      <>
                        <span>Login to Continue</span>
                        <FiArrowRight />
                      </>
                    )}
                  </button>

                  {/* Bottom Toggle Link */}
                  <div className="auth-switch-link-footer">
                    <span>New here?</span>
                    <button
                      type="button"
                      className="tab-switch-action"
                      onClick={() => switchTab("register")}
                    >
                      Create an account
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 2: CREATE ACCOUNT FORM */}
              {activeTab === "register" && (
                <form className="auth-active-form" onSubmit={handleRegister} noValidate>
                  {/* Full Name */}
                  <div className={`form-field-group ${formErrors.fullName ? "has-error" : ""}`}>
                    <label htmlFor="auth-reg-name">Full Name</label>
                    <div className="input-icon-wrapper">
                      <FiUser className="field-prefix-icon" />
                      <input
                        id="auth-reg-name"
                        type="text"
                        placeholder="e.g. Jane Doe"
                        value={registerForm.fullName}
                        onChange={(e) => {
                          setRegisterForm({ ...registerForm, fullName: e.target.value });
                          if (formErrors.fullName) setFormErrors({ ...formErrors, fullName: "" });
                        }}
                        autoComplete="name"
                      />
                    </div>
                    {formErrors.fullName && <span className="field-error-msg">{formErrors.fullName}</span>}
                  </div>

                  {/* Email */}
                  <div className={`form-field-group ${formErrors.email ? "has-error" : ""}`}>
                    <label htmlFor="auth-reg-email">Email Address</label>
                    <div className="input-icon-wrapper">
                      <FiMail className="field-prefix-icon" />
                      <input
                        id="auth-reg-email"
                        type="email"
                        placeholder="you@example.com"
                        value={registerForm.email}
                        onChange={(e) => {
                          setRegisterForm({ ...registerForm, email: e.target.value });
                          if (formErrors.email) setFormErrors({ ...formErrors, email: "" });
                        }}
                        autoComplete="email"
                      />
                    </div>
                    {formErrors.email && <span className="field-error-msg">{formErrors.email}</span>}
                  </div>

                  {/* Password */}
                  <div className={`form-field-group ${formErrors.password ? "has-error" : ""}`}>
                    <label htmlFor="auth-reg-pass">Password</label>
                    <div className="input-icon-wrapper">
                      <FiLock className="field-prefix-icon" />
                      <input
                        id="auth-reg-pass"
                        type={showPassword ? "text" : "password"}
                        placeholder="At least 6 characters"
                        value={registerForm.password}
                        onChange={(e) => {
                          setRegisterForm({ ...registerForm, password: e.target.value });
                          if (formErrors.password) setFormErrors({ ...formErrors, password: "" });
                        }}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="field-toggle-visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                    {formErrors.password && <span className="field-error-msg">{formErrors.password}</span>}
                  </div>

                  {/* Confirm Password */}
                  <div className={`form-field-group ${formErrors.confirmPassword ? "has-error" : ""}`}>
                    <label htmlFor="auth-reg-confirm">Confirm Password</label>
                    <div className="input-icon-wrapper">
                      <FiLock className="field-prefix-icon" />
                      <input
                        id="auth-reg-confirm"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Re-enter password"
                        value={registerForm.confirmPassword}
                        onChange={(e) => {
                          setRegisterForm({ ...registerForm, confirmPassword: e.target.value });
                          if (formErrors.confirmPassword) setFormErrors({ ...formErrors, confirmPassword: "" });
                        }}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="field-toggle-visibility"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                      >
                        {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                    {formErrors.confirmPassword && <span className="field-error-msg">{formErrors.confirmPassword}</span>}
                  </div>

                  {/* Terms */}
                  <div className="form-checkbox-row">
                    <label className="auth-checkbox-label">
                      <input
                        type="checkbox"
                        checked={registerForm.acceptTerms}
                        onChange={(e) => setRegisterForm({ ...registerForm, acceptTerms: e.target.checked })}
                      />
                      <span className="auth-checkmark-box">
                        {registerForm.acceptTerms && <FiCheck className="checkmark-icon" />}
                      </span>
                      <span>I agree to FreshRoot Terms of Service and Privacy Policy</span>
                    </label>
                  </div>

                  {/* Create Account Button */}
                  <button
                    type="submit"
                    className="auth-primary-btn"
                    disabled={loading || !registerForm.acceptTerms}
                  >
                    {loading ? (
                      <>
                        <FiLoader className="btn-spin" />
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      <>
                        <span>Create Account</span>
                        <FiArrowRight />
                      </>
                    )}
                  </button>

                  {/* Bottom Toggle Link */}
                  <div className="auth-switch-link-footer">
                    <span>Already have an account?</span>
                    <button
                      type="button"
                      className="tab-switch-action"
                      onClick={() => switchTab("login")}
                    >
                      Login
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* RIGHT: Visual Showcase & Brand Value Side */}
            <div className="auth-card-visual-side">
              <div className="visual-gradient-glow" />
              
              <div className="visual-top-info">
                <span className="visual-nature-pill">🌿 Farm-Direct Freshness</span>
                <h3 className="visual-title">Crisp, Organic Produce Straight From Earth to Door.</h3>
                <p className="visual-sub">Certified pesticide-free harvest delivered across the city within 30-45 minutes.</p>
              </div>

              <div className="visual-perks-stack">
                <div className="perk-card">
                  <div className="perk-icon">
                    <FiTruck />
                  </div>
                  <div>
                    <h4>30-Min Fast Express</h4>
                    <p>Climate-chilled delivery preserves raw freshness.</p>
                  </div>
                </div>

                <div className="perk-card">
                  <div className="perk-icon">
                    <FiShield />
                  </div>
                  <div>
                    <h4>100% Organic & Non-GMO</h4>
                    <p>Strictly inspected by certified agricultural partners.</p>
                  </div>
                </div>

                <div className="perk-card">
                  <div className="perk-icon">
                    <FiShoppingBag />
                  </div>
                  <div>
                    <h4>Seamless Protected Checkout</h4>
                    <p>Encrypted multi-channel payments (COD, UPI, Card, NetBanking).</p>
                  </div>
                </div>
              </div>

              <div className="visual-trust-badge">
                <span>⭐ Rated 4.9/5 by 50,000+ happy households</span>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Forgot Password Modal */}
      {forgotPasswordModal && (
        <div className="auth-forgot-overlay" onClick={() => setForgotPasswordModal(false)}>
          <div className="auth-forgot-box" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="forgot-close-icon"
              onClick={() => setForgotPasswordModal(false)}
            >
              <FiX />
            </button>

            {forgotAlert.show && (
              <div className={`auth-alert-box ${forgotAlert.type}`} style={{ marginBottom: "16px" }}>
                {forgotAlert.type === "success" ? <FiCheckCircle /> : <FiAlertCircle />}
                <span>{forgotAlert.message}</span>
              </div>
            )}

            {forgotStep === 1 && (
              <div className="forgot-modal-step">
                <div className="step-icon-wrap">
                  <FiMail />
                </div>
                <h3>Reset Password</h3>
                <p>Enter your registered email to receive a 6-digit OTP verification code.</p>
                <form onSubmit={handleSendOtp}>
                  <div className="form-field-group">
                    <label>Registered Email</label>
                    <div className="input-icon-wrapper">
                      <FiMail className="field-prefix-icon" />
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        required
                        autoFocus
                      />
                    </div>
                  </div>
                  <button type="submit" className="auth-primary-btn" disabled={forgotLoading}>
                    {forgotLoading ? <FiLoader className="btn-spin" /> : <span>Send OTP Code</span>}
                  </button>
                </form>
              </div>
            )}

            {forgotStep === 2 && (
              <div className="forgot-modal-step">
                <div className="step-icon-wrap">
                  <FiKey />
                </div>
                <h3>Enter 6-Digit OTP</h3>
                <p>We sent a code to <strong>{forgotEmail}</strong>.</p>
                <form onSubmit={handleVerifyOtp}>
                  <div className="otp-digit-inputs">
                    {forgotOtp.map((val, idx) => (
                      <input
                        key={idx}
                        id={`forgot-otp-${idx}`}
                        type="text"
                        maxLength="1"
                        value={val}
                        onChange={(e) => handleOtpDigitChange(e.target.value, idx)}
                        onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                        className="otp-box"
                      />
                    ))}
                  </div>

                  <div className="otp-resend-controls">
                    {resendTimer > 0 ? (
                      <span>Resend in {resendTimer}s</span>
                    ) : (
                      <button type="button" onClick={handleSendOtp} disabled={forgotLoading}>
                        <FiRefreshCw /> Resend OTP
                      </button>
                    )}
                  </div>

                  <button type="submit" className="auth-primary-btn" disabled={forgotLoading || forgotOtp.join("").length < 6}>
                    {forgotLoading ? <FiLoader className="btn-spin" /> : <span>Verify OTP</span>}
                  </button>
                </form>
              </div>
            )}

            {forgotStep === 3 && (
              <div className="forgot-modal-step">
                <div className="step-icon-wrap">
                  <FiLock />
                </div>
                <h3>Create New Password</h3>
                <form onSubmit={handleResetPassword}>
                  <div className="form-field-group">
                    <label>New Password</label>
                    <div className="input-icon-wrapper">
                      <FiLock className="field-prefix-icon" />
                      <input
                        type={showForgotNewPassword ? "text" : "password"}
                        placeholder="Min 6 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="field-toggle-visibility"
                        onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                      >
                        {showForgotNewPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>

                  <div className="form-field-group">
                    <label>Confirm New Password</label>
                    <div className="input-icon-wrapper">
                      <FiLock className="field-prefix-icon" />
                      <input
                        type={showForgotConfirmPassword ? "text" : "password"}
                        placeholder="Re-enter password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="field-toggle-visibility"
                        onClick={() => setShowForgotConfirmPassword(!showForgotConfirmPassword)}
                      >
                        {showForgotConfirmPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="auth-primary-btn" disabled={forgotLoading}>
                    {forgotLoading ? <FiLoader className="btn-spin" /> : <span>Update Password</span>}
                  </button>
                </form>
              </div>
            )}

            {forgotStep === 4 && (
              <div className="forgot-modal-step success-step">
                <div className="step-icon-wrap success">
                  <FiCheck />
                </div>
                <h3>Password Reset Successful!</h3>
                <p>You can now sign in with your updated credentials.</p>
                <button
                  type="button"
                  className="auth-primary-btn"
                  onClick={() => {
                    setForgotPasswordModal(false);
                    switchTab("login");
                  }}
                >
                  Proceed to Login
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthPage;
