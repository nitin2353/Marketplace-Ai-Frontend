import { useState } from "react";
import { Container, Row, Col, Card, Form, Button, InputGroup, Alert } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import GlobalLoader from "../../components/GlobalLoader";
import authApi from "../../api/authApi";
import toast from "react-hot-toast";
import JWTService from "../../config/jwt.config";

// Inject same styles
const injectStyle = () => {
  if (document.getElementById("seller-login-style")) return;

  const s = document.createElement("style");
  s.id = "seller-login-style";
  s.textContent = `
    body { font-family: 'Nunito', sans-serif !important; background: #f1f4ff !important; }
    .sl-hero { background: linear-gradient(145deg, #ff6b35 0%, #f7931e 55%, #ffcd3c 100%); }
    .sl-card { border-radius: 24px; border: none; box-shadow: 0 24px 64px rgba(0,0,0,0.13); }
    .sl-input { border-radius: 12px; border: 2px solid #e8eaf6; padding: 11px 15px; }
    .sl-input:focus { border-color: #ff6b35; box-shadow: 0 0 0 3px rgba(255,107,53,0.15); }
    .sl-btn { background: linear-gradient(135deg, #ff6b35, #f7931e); border: none; border-radius: 14px; font-weight: 800; padding: 12px; }
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
        localStorage.setItem("token", res?.data?.token);
        toast.success(res.message || "Logged In Successfully");
        let { role } = JWTService.decodeTokenDetails(res?.token)
        if (role == 'seller') {
          navigate('/seller/products')
        } else {
          navigate('/dashboard')
        }
      }
    } catch (err) {
      toast.error((err?.message == "User not found") ? "Invalid Credentials" : "Login failed");
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

  return (
    <Container fluid className="p-0">
      {loading && <GlobalLoader />}

      <Row className="g-0" style={{ minHeight: "100vh" }}>

        {/* LEFT */}
        <Col
          lg={5}
          className="sl-hero d-none d-lg-flex flex-column justify-content-center align-items-center text-white p-5"
        >
          <h1 className="fw-bold">🛍️ ShopEase</h1>
          <p className="text-center">Welcome back 👋<br />Login to continue</p>
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
                    <span style={{ cursor: "pointer", color: "#ff6b35" }} onClick={() => setForgot(true)}>
                      Forgot Password?
                    </span>
                  </div>

                  <Button type="submit" className="sl-btn w-100 text-white" disabled={loading}>
                    {loading ? "⏳ Logging in..." : "Login"}
                  </Button>
                </Form>

                <div className="text-center mt-3 text-muted">
                  Don&apos;t have an account?{" "}
                  <span style={{ color: "#ff6b35", cursor: "pointer" }} onClick={handleNewUser}>
                    Register
                  </span>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-center mb-3">Reset Password</h3>

                {sent ? (
                  <Alert variant="success">Reset link sent to your email ✅</Alert>
                ) : (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        className="sl-input"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="Enter your email"
                      />
                    </Form.Group>

                    <Button className="sl-btn w-100 text-white" onClick={sendReset}>
                      Send Reset Link
                    </Button>
                  </>
                )}

                <div className="text-center mt-3">
                  <span
                    style={{ cursor: "pointer", color: "#ff6b35" }}
                    onClick={() => {
                      setForgot(false);
                      setSent(false);
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
    </Container>
  );
}