import { useState } from "react";
import { Container, Row, Col, Card, Form, Button, InputGroup, Alert } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import GlobalLoader from "../../components/GlobalLoader";
import authApi from "../../api/authApi";
import toast from "react-hot-toast";
import JWTService from "../../config/jwt.config";
import ConfirmModal from "../../components/ConfirmModal";

// Inject same styles
const injectStyle = () => {
  if (document.getElementById("seller-login-style")) return;

  const s = document.createElement("style");
  s.id = "seller-login-style";
  s.textContent = `
    body { font-family: var(--font-main, 'Nunito', sans-serif) !important; background: var(--bg-main, #f1f4ff) !important; }
    .sl-hero { background: var(--primary-gradient, linear-gradient(135deg, #2563eb, #1d4ed8)); }
    .sl-card { border-radius: 24px; border: none; box-shadow: var(--shadow-lg, 0 24px 64px rgba(0,0,0,0.13)); }
    .sl-input { border-radius: 12px; border: 2px solid var(--border-light, #e8eaf6); padding: 11px 15px; }
    .sl-input:focus { border-color: var(--primary, #3b82f6); box-shadow: var(--shadow-sm); }
    .sl-btn { background: var(--primary-gradient, linear-gradient(135deg, #2563eb, #1d4ed8)); border: none; border-radius: 14px; font-weight: 800; padding: 12px; }
  `;
  document.head.appendChild(s);
};
injectStyle();

export default function Login() {
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [show, setShow] = useState(false);

  const [resetStep, setResetStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: "onChange" });

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

        if (role === 'seller') {
          navigate('/seller/dashboard');
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      toast.error((err?.message === "User not found") ? "Invalid Credentials" : (err?.message || "Login failed"));
    } finally {
      setLoading(false);
    }
  };

  const sendReset = async () => {
    if (!resetEmail) return toast.error("Email required");
    setLoading(true);
    try {
      // call API here
      await new Promise((r) => setTimeout(r, 1000));
      setSent(true);
    } catch (err) {
      toast.error("Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  const handleNewUser = () => {
    if (location.pathname.includes("customer")) {
      navigate("/customer/register");
    } else {
      navigate("/seller/register");
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

      setForgot(false);
      setResetStep(1);
      setResetEmail("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to reset password");
    } finally {
      setResetLoading(false);
    }
  };



  return (
    <Container fluid className="p-0">
      {loading && <GlobalLoader />}

      <Row className="g-0" style={{ minHeight: "100vh" }}>

        {/* LEFT */}
        <Col
          lg={5}
          className="sl-hero d-none d-lg-flex flex-column justify-content-center align-items-center text-white p-5"
        >
          <img src="../../src/assets/logo.png" width="50%" alt="" />
        </Col>

        {/* RIGHT */}
        <Col
          xs={12}
          lg={7}
          className="d-flex align-items-center justify-content-center p-3 p-md-4"
        >
          <Card className="sl-card p-4 w-100" style={{ maxWidth: 420 }}>

            {!forgot ? (
              <>
                <h3 className="text-center mb-3">Login</h3>

                <Form onSubmit={handleSubmit(onSubmit)}>

                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      className="sl-input"
                      {...register("email", { required: "Email is required" })}
                      placeholder="Enter email"
                    />
                    {errors.email && <small className="text-danger">{errors.email.message}</small>}
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <InputGroup>
                      <Form.Control
                        className="sl-input"
                        type={showPwd ? "text" : "password"}
                        {...register("password", { required: "Password required" })}
                        placeholder="Enter password"
                      />
                      <Button variant="outline-secondary" onClick={() => setShowPwd(!showPwd)}>
                        {showPwd ? "🙈" : "👁️"}
                      </Button>
                    </InputGroup>
                    {errors.password && <small className="text-danger">{errors.password.message}</small>}
                  </Form.Group>

                  <div className="d-flex justify-content-between mb-3 flex-wrap gap-2">
                    <Form.Check label="Remember me" />
                    <span style={{ cursor: "pointer", color: "var(--primary, #3b82f6)" }} onClick={() => setForgot(true)}>
                      Forgot Password?
                    </span>
                  </div>

                  <Button type="submit" className="sl-btn w-100 text-white" disabled={loading}>
                    {loading ? "⏳ Logging in..." : "Login"}
                  </Button>
                </Form>

                <div className="text-center mt-3 text-muted">
                  Don't have an account?{" "}
                  <span style={{ color: "var(--primary, #3b82f6)", cursor: "pointer" }} onClick={() => setShow(true)}>
                    Register
                  </span>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-center mb-3">Reset Password</h3>

                {resetStep === 1 && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        className="sl-input"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="Enter your email"
                        type="email"
                      />
                    </Form.Group>

                    <Button
                      className="sl-btn w-100 text-white"
                      onClick={sendResetOtp}
                      disabled={resetLoading}
                    >
                      {resetLoading ? "Sending OTP..." : "Send OTP"}
                    </Button>
                  </>
                )}

                {resetStep === 2 && (
                  <>
                    <Alert variant="success">
                      OTP sent to <b>{resetEmail}</b>
                    </Alert>

                    <Form.Group className="mb-3">
                      <Form.Label>Enter OTP</Form.Label>
                      <Form.Control
                        className="sl-input text-center"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter 6 digit OTP"
                        maxLength={6}
                      />
                    </Form.Group>

                    <Button
                      className="sl-btn w-100 text-white"
                      onClick={verifyResetOtp}
                      disabled={resetLoading}
                    >
                      {resetLoading ? "Verifying..." : "Verify OTP"}
                    </Button>

                    <div className="text-center mt-3">
                      <span
                        style={{ cursor: "pointer", color: "var(--primary, #3b82f6)" }}
                        onClick={sendResetOtp}
                      >
                        Resend OTP
                      </span>
                    </div>
                  </>
                )}

                {resetStep === 3 && (
                  <>
                    <Alert variant="success">OTP verified ✅ Set your new password</Alert>

                    <Form.Group className="mb-3">
                      <Form.Label>New Password</Form.Label>
                      <Form.Control
                        className="sl-input"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        type="password"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Confirm Password</Form.Label>
                      <Form.Control
                        className="sl-input"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        type="password"
                      />
                    </Form.Group>

                    <Button
                      className="sl-btn w-100 text-white"
                      onClick={resetPassword}
                      disabled={resetLoading}
                    >
                      {resetLoading ? "Updating..." : "Reset Password"}
                    </Button>
                  </>
                )}

                <div className="text-center mt-3">
                  <span
                    style={{ cursor: "pointer", color: "var(--primary, #3b82f6)" }}
                    onClick={() => {
                      setForgot(false);
                      setSent(false);
                      setResetStep(1);
                      setResetEmail("");
                      setOtp("");
                      setNewPassword("");
                      setConfirmPassword("");
                    }}
                  >
                    ← Back to Login
                  </span>
                </div>
              </>
            )}

          </Card>
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