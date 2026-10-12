import { useState, useEffect } from "react";
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
  FiTag,
  FiKey,
  FiRefreshCw
} from "react-icons/fi";
import { RiLeafLine } from "react-icons/ri";
import "./User.css";

const User = ({ isOpen = true, onClose, onAuthSuccess, initialMode = "login" }) => {
  // Mode state: true = Login, false = Register
  const [isLogin, setIsLogin] = useState(initialMode !== "register");

  useEffect(() => {
    if (isOpen) {
      setIsLogin(initialMode !== "register");
      setAlert({ show: false, type: "", message: "" });
      setFormErrors({});
    }
  }, [isOpen, initialMode]);

  // Form states
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
    rememberMe: false
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
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP, 3: New Password, 4: Success
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotAlert, setForgotAlert] = useState({ show: false, type: "", message: "" });
  const [resendTimer, setResendTimer] = useState(0);

  // Countdown timer for OTP Resend
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Reset errors and alerts on mode switch
  const switchMode = (loginMode) => {
    setIsLogin(loginMode);
    setFormErrors({});
    setAlert({ show: false, type: "", message: "" });
  };

  // Helper for field validation
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
      const response = await fetch("https://grocery-backend-1-hf2l.onrender.com/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: loginForm.email.trim(),
          password: loginForm.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to sign in. Please check your credentials.");
      }

      setAlert({
        show: true,
        type: "success",
        message: data.message || "Signed in successfully! Welcome back to FreshRoot."
      });

      if (onAuthSuccess) {
        onAuthSuccess(data.user || { email: loginForm.email });
      }

      setTimeout(() => {
        if (onClose) onClose();
      }, 1500);

    } catch (err) {
      setAlert({
        show: true,
        type: "error",
        message: err.message || "Unable to reach server. Please ensure backend is running."
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
      const response = await fetch("https://grocery-backend-1-hf2l.onrender.com/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fullName: registerForm.fullName.trim(),
          name: registerForm.fullName.trim(),
          email: registerForm.email.trim(),
          password: registerForm.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed. Please try again.");
      }

      setAlert({
        show: true,
        type: "success",
        message: data.message || "Account created successfully! Switching to login..."
      });

      if (onAuthSuccess) {
        onAuthSuccess(data.user || { name: registerForm.fullName, email: registerForm.email });
      }

      setTimeout(() => {
        setIsLogin(true);
        setLoginForm((prev) => ({
          ...prev,
          email: registerForm.email,
          password: registerForm.password
        }));
      }, 1500);

    } catch (err) {
      setAlert({
        show: true,
        type: "error",
        message: err.message || "Unable to reach server. Please ensure backend is running."
      });
    } finally {
      setLoading(false);
    }
  };

  // Open Forgot Password Modal
  const openForgotPasswordModal = () => {
    setForgotStep(1);
    setForgotEmail(loginForm.email || "");
    setForgotOtp(["", "", "", "", "", ""]);
    setNewPassword("");
    setConfirmNewPassword("");
    setForgotAlert({ show: false, type: "", message: "" });
    setForgotPasswordModal(true);
  };

  // Close Forgot Password Modal
  const closeForgotPasswordModal = () => {
    setForgotPasswordModal(false);
    setForgotAlert({ show: false, type: "", message: "" });
  };

  // OTP Input Change handler
  const handleOtpDigitChange = (val, index) => {
    const cleaned = val.replace(/[^0-9]/g, "");
    const newOtp = [...forgotOtp];
    newOtp[index] = cleaned.slice(-1);
    setForgotOtp(newOtp);

    // Auto-advance to next input field
    if (cleaned && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  // OTP Keydown (Backspace support)
  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !forgotOtp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  // OTP Paste handler
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
    if (paste) {
      const digits = paste.split("");
      const newOtp = ["", "", "", "", "", ""];
      digits.forEach((d, i) => {
        if (i < 6) newOtp[i] = d;
      });
      setForgotOtp(newOtp);
      const focusIndex = Math.min(digits.length, 5);
      const targetInput = document.getElementById(`otp-input-${focusIndex}`);
      if (targetInput) targetInput.focus();
    }
  };

  // Step 1: Request OTP to Registered Email
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

      if (!response.ok) {
        throw new Error(data.message || "Failed to send verification code.");
      }

      setForgotAlert({
        show: true,
        type: "success",
        message: data.message || `Verification code sent to ${forgotEmail}.`
      });

      setResendTimer(60);
      setForgotStep(2);
      // Focus first OTP field after step transition
      setTimeout(() => {
        const firstOtp = document.getElementById("otp-input-0");
        if (firstOtp) firstOtp.focus();
      }, 100);

    } catch (err) {
      setForgotAlert({
        show: true,
        type: "error",
        message: err.message || "Unable to send verification code. Please check your backend connection."
      });
    } finally {
      setForgotLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const code = forgotOtp.join("");
    if (code.length < 6) {
      setForgotAlert({
        show: true,
        type: "error",
        message: "Please enter the complete 6-digit verification code."
      });
      return;
    }

    setForgotLoading(true);
    setForgotAlert({ show: false, type: "", message: "" });

    try {
      const response = await fetch("https://grocery-backend-1-hf2l.onrender.com/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotEmail.trim(),
          otp: code
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid or expired verification code.");
      }

      setForgotAlert({
        show: true,
        type: "success",
        message: "Code verified successfully! Please set your new password."
      });

      setForgotStep(3);

    } catch (err) {
      setForgotAlert({
        show: true,
        type: "error",
        message: err.message || "Verification failed. Please try again."
      });
    } finally {
      setForgotLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setForgotAlert({
        show: true,
        type: "error",
        message: "Password must be at least 6 characters long."
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
          newPassword: newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password. Please try again.");
      }

      setForgotStep(4);
      setLoginForm((prev) => ({
        ...prev,
        email: forgotEmail.trim(),
        password: ""
      }));

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

  // Resend OTP trigger
  const handleResendOtp = () => {
    if (resendTimer > 0 || forgotLoading) return;
    handleSendOtp();
  };

  if (!isOpen) return null;

  return (
    <div className="auth-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="User Authentication">
      <div className="auth-wrapper" onClick={(e) => e.stopPropagation()}>
        {/* Close Modal Button */}
        {onClose && (
          <button 
            type="button" 
            className="auth-modal-close-btn" 
            onClick={onClose}
            aria-label="Close authentication window"
          >
            <FiX />
          </button>
        )}

        {/* Main Dual Card Container with Sliding Animation */}
        <div className={`auth-card-container ${!isLogin ? "register-active" : ""}`}>
          
          {/* ====================================================
              1. LEFT PANEL: LOGIN FORM
             ==================================================== */}
          <div className={`auth-panel form-panel login-panel ${isLogin ? "panel-visible" : "panel-hidden"}`}>
            <div className="panel-inner">
              <div className="auth-brand-badge">
                <RiLeafLine className="leaf-badge-icon" />
                <span>FRESHROOT ORGANICS</span>
              </div>

              <div className="form-header">
                <h2 className="form-title">Welcome Back</h2>
                <p className="form-subtitle">
                  Sign in to access your farm-fresh basket, saved harvest, and personalized deals.
                </p>
              </div>

              {/* Alert Message Banner */}
              {alert.show && isLogin && (
                <div className={`auth-alert-banner ${alert.type}`} role="alert">
                  {alert.type === "success" ? <FiCheckCircle className="alert-icon" /> : <FiAlertCircle className="alert-icon" />}
                  <span>{alert.message}</span>
                </div>
              )}

              {/* Login Form */}
              <form className="auth-form" onSubmit={handleLogin} noValidate>
                {/* Email Field */}
                <div className={`form-group ${formErrors.email ? "has-error" : ""}`}>
                  <label htmlFor="login-email" className="input-label">Email Address</label>
                  <div className="input-wrapper">
                    <FiMail className="input-prefix-icon" aria-hidden="true" />
                    <input
                      id="login-email"
                      type="email"
                      placeholder="name@example.com"
                      value={loginForm.email}
                      onChange={(e) => {
                        setLoginForm({ ...loginForm, email: e.target.value });
                        if (formErrors.email) setFormErrors({ ...formErrors, email: "" });
                      }}
                      className="auth-input"
                      autoComplete="email"
                    />
                  </div>
                  {formErrors.email && <span className="field-error">{formErrors.email}</span>}
                </div>

                {/* Password Field */}
                <div className={`form-group ${formErrors.password ? "has-error" : ""}`}>
                  <div className="label-row">
                    <label htmlFor="login-password" className="input-label">Password</label>
                    <button
                      type="button"
                      className="forgot-pass-link"
                      onClick={openForgotPasswordModal}
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="input-wrapper">
                    <FiLock className="input-prefix-icon" aria-hidden="true" />
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={loginForm.password}
                      onChange={(e) => {
                        setLoginForm({ ...loginForm, password: e.target.value });
                        if (formErrors.password) setFormErrors({ ...formErrors, password: "" });
                      }}
                      className="auth-input"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  {formErrors.password && <span className="field-error">{formErrors.password}</span>}
                </div>

                {/* Remember Me Checkbox */}
                <div className="form-options-row">
                  <label className="checkbox-container">
                    <input
                      type="checkbox"
                      checked={loginForm.rememberMe}
                      onChange={(e) => setLoginForm({ ...loginForm, rememberMe: e.target.checked })}
                    />
                    <span className="custom-checkmark">
                      {loginForm.rememberMe && <FiCheck className="check-icon" />}
                    </span>
                    <span className="checkbox-label">Keep me signed in</span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="auth-submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <FiLoader className="btn-spinner-icon" />
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <FiArrowRight className="btn-arrow-icon" />
                    </>
                  )}
                </button>
              </form>

              {/* Switch to Register footer for mobile/inline */}
              <div className="switch-mode-footer">
                <span>New to FreshRoot?</span>
                <button
                  type="button"
                  className="switch-link-btn"
                  onClick={() => switchMode(false)}
                >
                  Create an account
                </button>
              </div>
            </div>
          </div>

          {/* ====================================================
              2. RIGHT PANEL: REGISTER FORM
             ==================================================== */}
          <div className={`auth-panel form-panel register-panel ${!isLogin ? "panel-visible" : "panel-hidden"}`}>
            <div className="panel-inner">
              <div className="auth-brand-badge">
                <RiLeafLine className="leaf-badge-icon" />
                <span>FRESHROOT ORGANICS</span>
              </div>

              <div className="form-header">
                <h2 className="form-title">Create Account</h2>
                <p className="form-subtitle">
                  Join 50,000+ happy homes enjoying certified fresh harvest delivered in 30 mins.
                </p>
              </div>

              {/* Alert Message Banner */}
              {alert.show && !isLogin && (
                <div className={`auth-alert-banner ${alert.type}`} role="alert">
                  {alert.type === "success" ? <FiCheckCircle className="alert-icon" /> : <FiAlertCircle className="alert-icon" />}
                  <span>{alert.message}</span>
                </div>
              )}

              {/* Registration Form */}
              <form className="auth-form" onSubmit={handleRegister} noValidate>
                {/* Full Name Field */}
                <div className={`form-group ${formErrors.fullName ? "has-error" : ""}`}>
                  <label htmlFor="reg-name" className="input-label">Full Name</label>
                  <div className="input-wrapper">
                    <FiUser className="input-prefix-icon" aria-hidden="true" />
                    <input
                      id="reg-name"
                      type="text"
                      placeholder="Jane Doe"
                      value={registerForm.fullName}
                      onChange={(e) => {
                        setRegisterForm({ ...registerForm, fullName: e.target.value });
                        if (formErrors.fullName) setFormErrors({ ...formErrors, fullName: "" });
                      }}
                      className="auth-input"
                      autoComplete="name"
                    />
                  </div>
                  {formErrors.fullName && <span className="field-error">{formErrors.fullName}</span>}
                </div>

                {/* Email Field */}
                <div className={`form-group ${formErrors.email ? "has-error" : ""}`}>
                  <label htmlFor="reg-email" className="input-label">Email Address</label>
                  <div className="input-wrapper">
                    <FiMail className="input-prefix-icon" aria-hidden="true" />
                    <input
                      id="reg-email"
                      type="email"
                      placeholder="name@example.com"
                      value={registerForm.email}
                      onChange={(e) => {
                        setRegisterForm({ ...registerForm, email: e.target.value });
                        if (formErrors.email) setFormErrors({ ...formErrors, email: "" });
                      }}
                      className="auth-input"
                      autoComplete="email"
                    />
                  </div>
                  {formErrors.email && <span className="field-error">{formErrors.email}</span>}
                </div>

                {/* Password Field */}
                <div className={`form-group ${formErrors.password ? "has-error" : ""}`}>
                  <label htmlFor="reg-password" className="input-label">Password</label>
                  <div className="input-wrapper">
                    <FiLock className="input-prefix-icon" aria-hidden="true" />
                    <input
                      id="reg-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create secure password (min. 6 chars)"
                      value={registerForm.password}
                      onChange={(e) => {
                        setRegisterForm({ ...registerForm, password: e.target.value });
                        if (formErrors.password) setFormErrors({ ...formErrors, password: "" });
                      }}
                      className="auth-input"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  {formErrors.password && <span className="field-error">{formErrors.password}</span>}
                </div>

                {/* Confirm Password Field */}
                <div className={`form-group ${formErrors.confirmPassword ? "has-error" : ""}`}>
                  <label htmlFor="reg-confirm" className="input-label">Confirm Password</label>
                  <div className="input-wrapper">
                    <FiLock className="input-prefix-icon" aria-hidden="true" />
                    <input
                      id="reg-confirm"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter your password"
                      value={registerForm.confirmPassword}
                      onChange={(e) => {
                        setRegisterForm({ ...registerForm, confirmPassword: e.target.value });
                        if (formErrors.confirmPassword) setFormErrors({ ...formErrors, confirmPassword: "" });
                      }}
                      className="auth-input"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    >
                      {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  {formErrors.confirmPassword && <span className="field-error">{formErrors.confirmPassword}</span>}
                </div>

                {/* Terms Agreement */}
                <div className="form-options-row">
                  <label className="checkbox-container">
                    <input
                      type="checkbox"
                      checked={registerForm.acceptTerms}
                      onChange={(e) => setRegisterForm({ ...registerForm, acceptTerms: e.target.checked })}
                    />
                    <span className="custom-checkmark">
                      {registerForm.acceptTerms && <FiCheck className="check-icon" />}
                    </span>
                    <span className="checkbox-label terms-text">
                      I agree to the <span className="highlight-text">FreshRoot Terms</span> and <span className="highlight-text">Privacy Policy</span>.
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="auth-submit-btn"
                  disabled={loading || !registerForm.acceptTerms}
                >
                  {loading ? (
                    <>
                      <FiLoader className="btn-spinner-icon" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create FreshRoot Account</span>
                      <FiArrowRight className="btn-arrow-icon" />
                    </>
                  )}
                </button>
              </form>

              {/* Switch to Login footer for mobile/inline */}
              <div className="switch-mode-footer">
                <span>Already have an account?</span>
                <button
                  type="button"
                  className="switch-link-btn"
                  onClick={() => switchMode(true)}
                >
                  Login here
                </button>
              </div>
            </div>
          </div>

          {/* ====================================================
              3. SLIDING VISUAL OVERLAY / BRAND SHOWCASE PANEL
             ==================================================== */}
          <div className="auth-visual-panel">
            <div className="visual-background-overlay"></div>
            
            {/* Visual Header */}
            <div className="visual-top">
              <div className="visual-brand-tag">
                <RiLeafLine className="visual-leaf" />
                <span>NATURE'S FINEST</span>
              </div>
              <span className="visual-pill">100% Organic</span>
            </div>

            {/* Visual Dynamic Content */}
            <div className="visual-center">
              <div className="visual-badge-wrap">
                <span className="visual-mini-title">
                  {isLogin ? "🌱 Farm-To-Table Excellence" : "🎉 Exclusive Welcome Gift"}
                </span>
                <h3 className="visual-headline">
                  {isLogin 
                    ? "Wholesome Goodness Delivered Right To Your Doorstep" 
                    : "Join Our Green Community & Enjoy 20% Off First Order"}
                </h3>
              </div>

              {/* Value Perks Cards */}
              <div className="visual-perks-list">
                <div className="visual-perk-item">
                  <div className="perk-icon-circle">
                    <FiTruck />
                  </div>
                  <div>
                    <h5 className="perk-title">30-Min Fast Delivery</h5>
                    <p className="perk-desc">Direct from climate-controlled local farms</p>
                  </div>
                </div>

                <div className="visual-perk-item">
                  <div className="perk-icon-circle">
                    <FiShield />
                  </div>
                  <div>
                    <h5 className="perk-title">Zero Pesticides Certified</h5>
                    <p className="perk-desc">Strictly verified non-GMO daily harvest</p>
                  </div>
                </div>

                <div className="visual-perk-item">
                  <div className="perk-icon-circle">
                    <FiTag />
                  </div>
                  <div>
                    <h5 className="perk-title">Daily Member Discounts</h5>
                    <p className="perk-desc">Special savings on fruits, bakery & dairy</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Switch Trigger on the Visual Panel */}
            <div className="visual-bottom">
              <div className="visual-switch-box">
                <p className="visual-switch-prompt">
                  {isLogin ? "Don't have an account yet?" : "Already part of our harvest?"}
                </p>
                <button
                  type="button"
                  className="visual-switch-btn"
                  onClick={() => switchMode(!isLogin)}
                  aria-label={isLogin ? "Switch to Register form" : "Switch to Login form"}
                >
                  <span>{isLogin ? "Create Account" : "Sign In Now"}</span>
                  <FiArrowRight className="switch-arrow" />
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Forgot Password Modal with OTP Flow */}
        {forgotPasswordModal && (
          <div className="forgot-modal-overlay" onClick={closeForgotPasswordModal}>
            <div className="forgot-modal-box" onClick={(e) => e.stopPropagation()}>
              <button 
                type="button" 
                className="forgot-modal-close" 
                onClick={closeForgotPasswordModal}
                aria-label="Close modal"
              >
                <FiX />
              </button>

              {/* Step Progress Indicators */}
              {forgotStep < 4 && (
                <div className="forgot-steps-bar">
                  <div className={`step-dot ${forgotStep >= 1 ? "active" : ""}`}>1</div>
                  <div className={`step-line ${forgotStep >= 2 ? "active" : ""}`}></div>
                  <div className={`step-dot ${forgotStep >= 2 ? "active" : ""}`}>2</div>
                  <div className={`step-line ${forgotStep >= 3 ? "active" : ""}`}></div>
                  <div className={`step-dot ${forgotStep >= 3 ? "active" : ""}`}>3</div>
                </div>
              )}

              {/* Alert banner in Forgot Modal */}
              {forgotAlert.show && (
                <div className={`auth-alert-banner ${forgotAlert.type}`} style={{ marginBottom: "16px" }}>
                  {forgotAlert.type === "success" ? <FiCheckCircle className="alert-icon" /> : <FiAlertCircle className="alert-icon" />}
                  <span>{forgotAlert.message}</span>
                </div>
              )}

              {/* STEP 1: Enter registered email to receive OTP */}
              {forgotStep === 1 && (
                <div className="forgot-step-content">
                  <div className="forgot-icon-wrap">
                    <FiMail />
                  </div>
                  <h3 className="forgot-title">Forgot Password?</h3>
                  <p className="forgot-desc">
                    Enter your registered email address and we will send a 6-digit verification code (OTP) to your inbox.
                  </p>
                  <form onSubmit={handleSendOtp}>
                    <div className="form-group">
                      <label className="input-label" htmlFor="forgot-email-input">Registered Email</label>
                      <div className="input-wrapper">
                        <FiMail className="input-prefix-icon" />
                        <input
                          id="forgot-email-input"
                          type="email"
                          placeholder="name@example.com"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          className="auth-input"
                          autoFocus
                          required
                        />
                      </div>
                    </div>
                    <button 
                      type="submit" 
                      className="auth-submit-btn forgot-submit"
                      disabled={forgotLoading}
                    >
                      {forgotLoading ? (
                        <>
                          <FiLoader className="btn-spinner-icon" />
                          <span>Sending Code...</span>
                        </>
                      ) : (
                        <>
                          <span>Send Verification OTP</span>
                          <FiArrowRight className="btn-arrow-icon" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* STEP 2: Enter 6-digit OTP code */}
              {forgotStep === 2 && (
                <div className="forgot-step-content">
                  <div className="forgot-icon-wrap otp-icon">
                    <FiKey />
                  </div>
                  <h3 className="forgot-title">Enter Verification Code</h3>
                  <p className="forgot-desc">
                    We sent a 6-digit verification code to <span className="highlight-email">{forgotEmail}</span>.
                  </p>

                  <form onSubmit={handleVerifyOtp}>
                    {/* 6 Digit OTP Inputs */}
                    <div className="otp-inputs-grid" onPaste={handleOtpPaste}>
                      {forgotOtp.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`otp-input-${idx}`}
                          type="text"
                          inputMode="numeric"
                          maxLength="1"
                          value={digit}
                          onChange={(e) => handleOtpDigitChange(e.target.value, idx)}
                          onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                          className={`otp-digit-box ${digit ? "filled" : ""}`}
                          autoComplete="off"
                        />
                      ))}
                    </div>

                    <div className="otp-resend-row">
                      {resendTimer > 0 ? (
                        <span className="otp-countdown-text">
                          Resend code in <strong>00:{resendTimer < 10 ? `0${resendTimer}` : resendTimer}</strong>
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="resend-code-btn"
                          onClick={handleResendOtp}
                          disabled={forgotLoading}
                        >
                          <FiRefreshCw className="resend-icon" />
                          <span>Resend OTP Code</span>
                        </button>
                      )}
                      <button
                        type="button"
                        className="change-email-btn"
                        onClick={() => {
                          setForgotStep(1);
                          setForgotAlert({ show: false, type: "", message: "" });
                        }}
                      >
                        Change Email
                      </button>
                    </div>

                    <button 
                      type="submit" 
                      className="auth-submit-btn forgot-submit"
                      disabled={forgotLoading || forgotOtp.join("").length < 6}
                    >
                      {forgotLoading ? (
                        <>
                          <FiLoader className="btn-spinner-icon" />
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <>
                          <span>Verify & Continue</span>
                          <FiArrowRight className="btn-arrow-icon" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* STEP 3: Create New Password */}
              {forgotStep === 3 && (
                <div className="forgot-step-content">
                  <div className="forgot-icon-wrap">
                    <FiLock />
                  </div>
                  <h3 className="forgot-title">Reset Your Password</h3>
                  <p className="forgot-desc">
                    Create a new, secure password (minimum 6 characters) for your account.
                  </p>

                  <form onSubmit={handleResetPassword}>
                    {/* New Password */}
                    <div className="form-group" style={{ marginBottom: "14px" }}>
                      <label className="input-label" htmlFor="reset-new-pass">New Password</label>
                      <div className="input-wrapper">
                        <FiLock className="input-prefix-icon" />
                        <input
                          id="reset-new-pass"
                          type={showForgotNewPassword ? "text" : "password"}
                          placeholder="Min. 6 characters"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="auth-input"
                          autoFocus
                          required
                        />
                        <button
                          type="button"
                          className="password-toggle-btn"
                          onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                          aria-label="Toggle password visibility"
                        >
                          {showForgotNewPassword ? <FiEyeOff /> : <FiEye />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm New Password */}
                    <div className="form-group" style={{ marginBottom: "18px" }}>
                      <label className="input-label" htmlFor="reset-confirm-pass">Confirm Password</label>
                      <div className="input-wrapper">
                        <FiLock className="input-prefix-icon" />
                        <input
                          id="reset-confirm-pass"
                          type={showForgotConfirmPassword ? "text" : "password"}
                          placeholder="Re-enter new password"
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          className="auth-input"
                          required
                        />
                        <button
                          type="button"
                          className="password-toggle-btn"
                          onClick={() => setShowForgotConfirmPassword(!showForgotConfirmPassword)}
                          aria-label="Toggle password visibility"
                        >
                          {showForgotConfirmPassword ? <FiEyeOff /> : <FiEye />}
                        </button>
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      className="auth-submit-btn forgot-submit"
                      disabled={forgotLoading || !newPassword || !confirmNewPassword}
                    >
                      {forgotLoading ? (
                        <>
                          <FiLoader className="btn-spinner-icon" />
                          <span>Resetting Password...</span>
                        </>
                      ) : (
                        <>
                          <span>Save New Password</span>
                          <FiCheck className="btn-arrow-icon" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* STEP 4: Success confirmation */}
              {forgotStep === 4 && (
                <div className="forgot-step-content success-step">
                  <div className="forgot-icon-wrap success-badge">
                    <FiCheck />
                  </div>
                  <h3 className="forgot-title">Password Reset Complete!</h3>
                  <p className="forgot-desc">
                    Your password has been successfully updated. You can now sign in with your new password.
                  </p>
                  <button
                    type="button"
                    className="auth-submit-btn forgot-submit"
                    onClick={() => {
                      closeForgotPasswordModal();
                      setIsLogin(true);
                    }}
                  >
                    <span>Back to Sign In</span>
                    <FiArrowRight className="btn-arrow-icon" />
                  </button>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default User;