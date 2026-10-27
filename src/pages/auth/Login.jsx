import { useState, useEffect, useMemo } from "react";
import { Container, Row, Col, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import GlobalLoader from "../../components/GlobalLoader";
import authApi from "../../api/authApi";
import toast from "react-hot-toast";
import JWTService from "../../config/jwt.config";
import ConfirmModal from "../../components/ConfirmModal";

// Styles (same CSS variables as the rest of the app, so the palette is unchanged)
const injectStyle = () => {
  if (document.getElementById("seller-login-style")) return;

  const s = document.createElement("style");
  s.id = "seller-login-style";
  s.textContent = `
    body { font-family: var(--font-main, 'Nunito', sans-serif) !important; background: var(--bg-main, #f1f4ff) !important; }

    /* ── Left hero ── */
    .sl-hero {
      position: relative;
      overflow: hidden;
      background: var(--primary-gradient, linear-gradient(135deg, #2563eb, #1d4ed8));
    }
    .sl-hero::before, .sl-hero::after {
      content: ""; position: absolute; border-radius: 50%; pointer-events: none;
      background: rgba(255,255,255,.10);
    }
    .sl-hero::before { width: 460px; height: 460px; top: -160px; right: -140px; }
    .sl-hero::after  { width: 300px; height: 300px; bottom: -120px; left: -90px; background: rgba(255,255,255,.07); }
    .sl-hero-inner { position: relative; z-index: 1; max-width: 440px; width: 100%; }
    .sl-hero-logo { width: 150px; max-width: 60%; margin-bottom: 36px; }
    .sl-hero h1 { font-size: 2.4rem; font-weight: 900; line-height: 1.15; margin: 0 0 14px; }
    .sl-hero p  { font-size: 1.02rem; font-weight: 600; opacity: .92; margin: 0 0 32px; }
    .sl-feature { display: flex; align-items: center; gap: 14px; margin-bottom: 14px;
      background: rgba(255,255,255,.14); backdrop-filter: blur(6px);
      border: 1px solid rgba(255,255,255,.22); border-radius: 16px; padding: 12px 16px; }
    .sl-feature-icon { width: 40px; height: 40px; border-radius: 12px; background: rgba(255,255,255,.24);
      display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0; }
    .sl-feature b { display: block; font-size: .92rem; font-weight: 800; }
    .sl-feature span { font-size: .78rem; opacity: .88; font-weight: 600; }

    /* ── Mobile brand strip ── */
    .sl-mobile-brand {
      background: var(--primary-gradient, linear-gradient(135deg, #2563eb, #1d4ed8));
      border-radius: 0 0 28px 28px; padding: 28px 20px 70px; text-align: center; color: #fff;
    }
    .sl-mobile-brand img { width: 110px; }
    .sl-mobile-pull { margin-top: -48px; }

    /* ── Card ── */
    .sl-card {
      background: var(--bg-surface, #fff);
      border-radius: 24px; border: none;
      box-shadow: var(--shadow-lg, 0 24px 64px rgba(0,0,0,0.13));
      padding: 36px 34px;
      width: 100%; max-width: 440px;
      animation: slFade .4s ease both;
    }
    @keyframes slFade { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
    .sl-title { font-size: 1.7rem; font-weight: 900; color: var(--text-main, #1f2340); margin: 0 0 4px; }
    .sl-sub { color: var(--text-muted, #8a8fa8); font-weight: 600; font-size: .92rem; margin-bottom: 26px; }

    .sl-label { font-weight: 800; font-size: .78rem; color: var(--text-main, #444); margin-bottom: 6px; }
    .sl-field { position: relative; }
    .sl-field-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); font-size: 1rem; opacity: .55; pointer-events: none; }
    .sl-input {
      border-radius: 12px; border: 2px solid var(--border-light, #e8eaf6);
      padding: 12px 15px; font-weight: 600; background: var(--bg-main, #f8f9ff);
      transition: border-color .2s, box-shadow .2s, background .2s;
    }
    .sl-input.has-icon { padding-left: 42px; }
    .sl-input.has-eye { padding-right: 48px; }
    .sl-input:focus { border-color: var(--primary, #3b82f6); box-shadow: var(--shadow-sm); background: #fff; }
    .sl-input.is-invalid-custom { border-color: #dc3545; }
    .sl-eye {
      position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
      border: none; background: none; width: 34px; height: 34px; border-radius: 10px;
      cursor: pointer; font-size: 1rem; padding: 0;
    }
    .sl-eye:hover { background: var(--bg-hover, #eef1ff); }

    .sl-btn {
      background: var(--primary-gradient, linear-gradient(135deg, #2563eb, #1d4ed8));
      border: none; border-radius: 14px; font-weight: 800; padding: 13px; color: #fff; width: 100%;
      font-size: .98rem; cursor: pointer; transition: transform .15s, box-shadow .15s, opacity .15s;
    }
    .sl-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: var(--shadow-md, 0 10px 24px rgba(0,0,0,.18)); }
    .sl-btn:disabled { opacity: .7; cursor: not-allowed; }

    .sl-link { color: var(--primary, #3b82f6); font-weight: 800; cursor: pointer; background: none; border: none; padding: 0; font-size: inherit; }
    .sl-link:hover { text-decoration: underline; }
    .sl-link:disabled { color: var(--text-muted, #999); cursor: not-allowed; text-decoration: none; }

    .sl-divider { display: flex; align-items: center; gap: 12px; color: var(--text-muted, #999); font-size: .78rem; font-weight: 700; margin: 22px 0 16px; }
    .sl-divider::before, .sl-divider::after { content: ""; flex: 1; height: 1px; background: var(--border-light, #e8eaf6); }

    .sl-register-btn {
      width: 100%; border-radius: 14px; border: 2px solid var(--border-light, #e8eaf6);
      background: transparent; padding: 11px; font-weight: 800; color: var(--text-main, #444); cursor: pointer;
      transition: border-color .15s, color .15s, background .15s;
    }
    .sl-register-btn:hover { border-color: var(--primary, #3b82f6); color: var(--primary, #3b82f6); background: var(--bg-hover, #eef1ff); }

    /* ── Reset steps ── */
    .sl-steps { display: flex; align-items: center; margin-bottom: 24px; }
    .sl-step { display: flex; flex-direction: column; align-items: center; gap: 4px; flex: 0 0 auto; }
    .sl-step-dot {
      width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
      font-weight: 900; font-size: .8rem; border: 2px solid var(--border-light, #e8eaf6); color: var(--text-muted, #999); background: #fff;
    }
    .sl-step.done .sl-step-dot, .sl-step.now .sl-step-dot {
      background: var(--primary-gradient, linear-gradient(135deg, #2563eb, #1d4ed8)); color: #fff; border-color: transparent;
    }
    .sl-step small { font-size: .68rem; font-weight: 800; color: var(--text-muted, #999); }
    .sl-step.now small, .sl-step.done small { color: var(--primary, #3b82f6); }
    .sl-step-line { flex: 1; height: 2px; background: var(--border-light, #e8eaf6); margin: 0 6px 16px; }
    .sl-step-line.done { background: var(--primary, #3b82f6); }

    .sl-otp { text-align: center; font-size: 1.5rem; font-weight: 900; letter-spacing: .5em; padding-left: 15px !important; }
    .sl-note {
      background: var(--bg-hover, #eef1ff); border-radius: 14px; padding: 12px 14px;
      font-size: .86rem; font-weight: 600; color: var(--text-main, #444); margin-bottom: 18px; word-break: break-word;
    }

    .sl-strength { display: flex; gap: 4px; margin-top: 8px; }
    .sl-strength span { flex: 1; height: 5px; border-radius: 4px; background: var(--border-light, #e8eaf6); transition: background .2s; }
    .sl-strength-text { font-size: .74rem; font-weight: 800; margin-top: 4px; }

    .sl-check { font-weight: 700; font-size: .86rem; color: var(--text-muted, #666); }
    .sl-check .form-check-input:checked { background-color: var(--primary, #3b82f6); border-color: var(--primary, #3b82f6); }

    .sl-input:focus-visible, .sl-btn:focus-visible, .sl-register-btn:focus-visible, .sl-link:focus-visible {
      outline: 3px solid var(--primary, #3b82f6); outline-offset: 2px;
    }

    @media (max-width: 991px) {
      .sl-mobile-pull-wrap { margin-top: -48px; align-items: flex-start !important; }
    }
    @media (max-width: 575px) {
      .sl-card { padding: 28px 20px; border-radius: 22px; }
      .sl-title { font-size: 1.45rem; }
    }
    @media (prefers-reduced-motion: reduce) { .sl-card { animation: none; } }
  `;
  document.head.appendChild(s);
};
injectStyle();

const STRENGTH = [
  { label: "Too short", color: "#dc3545" },
  { label: "Weak", color: "#dc3545" },
  { label: "Fair", color: "#f59e0b" },
  { label: "Good", color: "#22c55e" },
  { label: "Strong", color: "#16a34a" },
];

const FEATURES = [
  { icon: "🔒", title: "Secure sign-in", text: "Your account is protected end to end" },
  { icon: "📦", title: "Track every order", text: "Orders, wishlist and cart in one place" },
  { icon: "🏪", title: "Built for sellers too", text: "Manage products and sales from your dashboard" },
];

const RESET_STEPS = ["Email", "Verify", "New password"];

export default function Login() {
  const [showPwd, setShowPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [show, setShow] = useState(false);

  const [resetStep, setResetStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const navigate = useNavigate();


  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: "onChange" });

  // Resend-OTP cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const strength = useMemo(() => {
    if (!newPassword) return -1;
    if (newPassword.length < 6) return 0;
    let score = 1;
    if (newPassword.length >= 8) score++;
    if (/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword)) score++;
    if (/\d/.test(newPassword) && /[^A-Za-z0-9]/.test(newPassword)) score++;
    return Math.min(score, 4);
  }, [newPassword]);

  const onSubmit = async (payload) => {
    setLoading(true);
    try {
      const res = await authApi?.userLogin(payload);
      if (res.success) {
        // Handle nested data structure if present
        const token = res.data?.token || res.token;
        localStorage.setItem("token", token);

        toast.success(res.message || "Logged In Successfully");

        const decoded = JWTService.decodeTokenDetails(token);
        const role = decoded?.role;

        if (role === "seller") {
          navigate("/seller/dashboard");
        } else {
          navigate("/");
        }
      }
    } catch (err) {
      toast.error(err?.message === "User not found" ? "Invalid Credentials" : err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const sendResetOtp = async () => {
    if (!resetEmail.trim()) {
      toast.error("Please enter email");
      return;
    }

    try {
      setResetLoading(true);

      await authApi.sendResetOtp({
        email: resetEmail,
      });

      toast.success("OTP sent to your email");
      setResetStep(2);
      setCooldown(30);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to send OTP");
    } finally {
      setResetLoading(false);
    }
  };

  const verifyResetOtp = async () => {
    if (!otp.trim()) {
      toast.error("Please enter OTP");
      return;
    }

    try {
      setResetLoading(true);

      await authApi.verifyResetOtp({
        email: resetEmail,
        otp,
      });

      toast.success("OTP verified");
      setResetStep(3);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Invalid OTP");
    } finally {
      setResetLoading(false);
    }
  };

  const resetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error("Please enter both passwords");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setResetLoading(true);

      await authApi.resetPassword({
        email: resetEmail,
        new_password: newPassword,
      });

      toast.success("Password reset successfully");
      backToLogin();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to reset password");
    } finally {
      setResetLoading(false);
    }
  };

  const backToLogin = () => {
    setForgot(false);
    setResetStep(1);
    setResetEmail("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setCooldown(0);
  };

  const logoSrc = "../../../public//Logo.png";

  return (
    <Container fluid className="p-0">
      {loading && <GlobalLoader />}

      <Row className="g-0" style={{ minHeight: "100vh" }}>
        {/* LEFT — brand panel (desktop) */}
        <Col lg={5} className="sl-hero d-none d-lg-flex flex-column justify-content-center align-items-center text-white p-5">
          <div className="sl-hero-inner">
            <h1>Welcome back to your store</h1>
            <p>Sign in to pick up right where you left off.</p>
            {FEATURES.map((f) => (
              <div key={f.title} className="sl-feature">
                <div className="sl-feature-icon">{f.icon}</div>
                <div>
                  <b>{f.title}</b>
                  <span>{f.text}</span>
                </div>
              </div>
            ))}
          </div>
        </Col>

        {/* RIGHT */}
        <Col xs={12} lg={7} className="d-flex flex-column">
          {/* Mobile brand strip */}
          <div className="sl-mobile-brand d-lg-none" >
            {/* <img src={logoSrc} alt="Logo" /> */}
          </div>

          <div className="flex-grow-1 d-flex align-items-center justify-content-center p-3 p-md-4 sl-mobile-pull-wrap">
            <div className="sl-card sl-mobile-pull-card">
              {!forgot ? (
                <>
                  <h3 className="sl-title">Welcome back 👋</h3>
                  <div className="sl-sub">Log in to continue to your account</div>

                  <Form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <Form.Group className="mb-3">
                      <Form.Label className="sl-label">Email</Form.Label>
                      <div className="sl-field">
                        <span className="sl-field-icon">✉️</span>
                        <Form.Control
                          className={`sl-input has-icon ${errors.email ? "is-invalid-custom" : ""}`}
                          {...register("email", { required: "Email is required" })}
                          placeholder="you@example.com"
                          autoComplete="username"
                        />
                      </div>
                      {errors.email && <small className="text-danger">{errors.email.message}</small>}
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className="sl-label">Password</Form.Label>
                      <div className="sl-field">
                        <span className="sl-field-icon">🔑</span>
                        <Form.Control
                          className={`sl-input has-icon has-eye ${errors.password ? "is-invalid-custom" : ""}`}
                          type={showPwd ? "text" : "password"}
                          {...register("password", { required: "Password required" })}
                          placeholder="Enter your password"
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          className="sl-eye"
                          onClick={() => setShowPwd(!showPwd)}
                          aria-label={showPwd ? "Hide password" : "Show password"}
                        >
                          {showPwd ? "🙈" : "👁️"}
                        </button>
                      </div>
                      {errors.password && <small className="text-danger">{errors.password.message}</small>}
                    </Form.Group>

                    <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                      <Form.Check className="sl-check" id="remember-me" label="Remember me" />
                      <button type="button" className="sl-link" onClick={() => setForgot(true)}>
                        Forgot password?
                      </button>
                    </div>

                    <button type="submit" className="sl-btn" disabled={loading}>
                      {loading ? "⏳ Logging in..." : "Log in"}
                    </button>
                  </Form>

                  <div className="sl-divider">New here?</div>
                  <button type="button" className="sl-register-btn" onClick={() => setShow(true)}>
                    Create an account
                  </button>
                </>
              ) : (
                <>
                  <h3 className="sl-title">Reset password</h3>
                  <div className="sl-sub">
                    {resetStep === 1 && "Enter your email and we'll send you a one-time code."}
                    {resetStep === 2 && "Enter the 6-digit code we sent you."}
                    {resetStep === 3 && "Choose a new password for your account."}
                  </div>

                  {/* Step indicator */}
                  <div className="sl-steps" aria-label={`Step ${resetStep} of 3`}>
                    {RESET_STEPS.map((label, i) => {
                      const n = i + 1;
                      const state = resetStep > n ? "done" : resetStep === n ? "now" : "";
                      return (
                        <div key={label} className="d-flex align-items-center" style={{ flex: n < 3 ? 1 : "0 0 auto" }}>
                          <div className={`sl-step ${state}`}>
                            <div className="sl-step-dot">{resetStep > n ? "✓" : n}</div>
                            <small>{label}</small>
                          </div>
                          {n < 3 && <div className={`sl-step-line ${resetStep > n ? "done" : ""}`} />}
                        </div>
                      );
                    })}
                  </div>

                  {resetStep === 1 && (
                    <>
                      <Form.Group className="mb-4">
                        <Form.Label className="sl-label">Email</Form.Label>
                        <div className="sl-field">
                          <span className="sl-field-icon">✉️</span>
                          <Form.Control
                            className="sl-input has-icon"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            placeholder="you@example.com"
                            type="email"
                          />
                        </div>
                      </Form.Group>

                      <button className="sl-btn" onClick={sendResetOtp} disabled={resetLoading}>
                        {resetLoading ? "Sending OTP..." : "Send OTP"}
                      </button>
                    </>
                  )}

                  {resetStep === 2 && (
                    <>
                      <div className="sl-note">
                        ✅ OTP sent to <b>{resetEmail}</b>
                      </div>

                      <Form.Group className="mb-4">
                        <Form.Label className="sl-label">One-time code</Form.Label>
                        <Form.Control
                          className="sl-input sl-otp"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                          placeholder="······"
                          maxLength={6}
                          inputMode="numeric"
                          autoComplete="one-time-code"
                        />
                      </Form.Group>

                      <button className="sl-btn" onClick={verifyResetOtp} disabled={resetLoading}>
                        {resetLoading ? "Verifying..." : "Verify OTP"}
                      </button>

                      <div className="text-center mt-3" style={{ fontSize: ".86rem", fontWeight: 700 }}>
                        Didn't get it?{" "}
                        <button className="sl-link" onClick={sendResetOtp} disabled={cooldown > 0 || resetLoading}>
                          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
                        </button>
                      </div>
                    </>
                  )}

                  {resetStep === 3 && (
                    <>
                      <Form.Group className="mb-3">
                        <Form.Label className="sl-label">New password</Form.Label>
                        <div className="sl-field">
                          <span className="sl-field-icon">🔑</span>
                          <Form.Control
                            className="sl-input has-icon has-eye"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="At least 6 characters"
                            type={showNewPwd ? "text" : "password"}
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            className="sl-eye"
                            onClick={() => setShowNewPwd(!showNewPwd)}
                            aria-label={showNewPwd ? "Hide password" : "Show password"}
                          >
                            {showNewPwd ? "🙈" : "👁️"}
                          </button>
                        </div>
                        {strength >= 0 && (
                          <>
                            <div className="sl-strength">
                              {[0, 1, 2, 3].map((i) => (
                                <span key={i} style={{ background: i < Math.max(strength, 1) ? STRENGTH[strength].color : undefined }} />
                              ))}
                            </div>
                            <div className="sl-strength-text" style={{ color: STRENGTH[strength].color }}>
                              {STRENGTH[strength].label}
                            </div>
                          </>
                        )}
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Label className="sl-label">Confirm password</Form.Label>
                        <div className="sl-field">
                          <span className="sl-field-icon">🔐</span>
                          <Form.Control
                            className={`sl-input has-icon ${confirmPassword && confirmPassword !== newPassword ? "is-invalid-custom" : ""}`}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter new password"
                            type={showNewPwd ? "text" : "password"}
                            autoComplete="new-password"
                          />
                        </div>
                        {confirmPassword && confirmPassword !== newPassword && (
                          <small className="text-danger">Passwords do not match</small>
                        )}
                      </Form.Group>

                      <button className="sl-btn" onClick={resetPassword} disabled={resetLoading}>
                        {resetLoading ? "Updating..." : "Reset password"}
                      </button>
                    </>
                  )}

                  <div className="text-center mt-4">
                    <button className="sl-link" onClick={backToLogin}>← Back to login</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </Col>
      </Row>

      <ConfirmModal
        show={show}
        onCancel={() => setShow(false)}
        title="Continue as?"
        message="Do you Want to Register As Customer or Seller?"
        variant="info"
        icon="👤"
        isMulti={true}
      />
    </Container>
  );
}