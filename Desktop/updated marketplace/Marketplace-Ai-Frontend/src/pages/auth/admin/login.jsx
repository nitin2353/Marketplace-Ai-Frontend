import { useState } from "react";
import { Container, Row, Col, Card, Form, Button, InputGroup, Alert } from "react-bootstrap";
import { useForm } from "react-hook-form";
import authApi from "../../../api/authApi";
import toast from "react-hot-toast";

// Inject same styles
const injectStyle = () => {
  if (document.getElementById("admin-login-style")) return;

  const s = document.createElement("style");
  s.id = "admin-login-style";
  s.textContent = `
    body { font-family: 'Nunito', sans-serif !important; background: #f1f4ff !important; }
    .al-hero { background: linear-gradient(145deg, #1e293b 0%, #0f172a 100%); }
    .al-card { border-radius: 24px; border: none; box-shadow: 0 24px 64px rgba(0,0,0,0.13); }
    .al-input { border-radius: 12px; border: 2px solid #e8eaf6; padding: 11px 15px; }
    .al-input:focus { border-color: #0f172a; box-shadow: 0 0 0 3px rgba(15,23,42,0.15); }
    .al-btn { background: linear-gradient(135deg, #0f172a, #1e293b); border: none; border-radius: 14px; font-weight: 800; padding: 12px; }
  `;
  document.head.appendChild(s);
};
injectStyle();

export default function AdminLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [forgot, setForgot] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: {}, mode: "onChange" });



  const onSubmit = async (payload) => {
    setLoading(true);
    try {
      const res = await authApi?.userLogin(payload)
      if (res.success) {
        localStorage.setItem('token', res.token)
        localStorage.setItem('role', res.token.role)
        toast.success(res.message || "You Are Successfully LoggedIn");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error(err.error || "Something went wrong!!");
    }
    finally {
      setLoading(false);
    }
  };;

  return (
    <Container fluid className="p-0">
      <Form className="g-0 d-flex" style={{ minHeight: "100vh" }} onSubmit={handleSubmit(onSubmit)}>

        {/* LEFT */}
        <Col lg={4} className="al-hero d-none d-lg-flex align-items-center justify-content-center text-white">
          <div>
            <h2>🛡️ Admin Panel</h2>
            <p>Restricted Access Only</p>
          </div>
        </Col>

        {/* RIGHT */}
        <Col lg={8} className="d-flex align-items-center justify-content-center p-4">
          <Card className="sl-card p-4" style={{ width: "100%", maxWidth: 420 }}>

            {!forgot ? (
              <>
                <h3 className="mb-3 d-flex justify-content-center">Admin Login</h3>

                {error && <Alert variant="danger">{error}</Alert>}

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    className="sl-input"
                    name="email"
                    {...register("email", { required: "Required" })}
                    placeholder="Enter email"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <InputGroup>
                    <Form.Control
                      className="sl-input"
                      type={showPwd ? "text" : "password"}
                      name="password"
                      {...register("password", { required: "Required" })}
                      placeholder="Enter password"
                    />
                    <Button variant="outline-secondary" onClick={() => setShowPwd(!showPwd)}>
                      {showPwd ? "🙈" : "👁️"}
                    </Button>
                  </InputGroup>
                </Form.Group>

                <div className="d-flex justify-content-between mb-3">
                  <Form.Check label="Remember me" />
                  <span style={{ cursor: "pointer", color: "#2a48cc" }} onClick={() => setForgot(true)}>
                    Forgot Password?
                  </span>
                </div>

                <Button
                  type="submit"
                  className="al-hero-btn-main w-100 text-white mb-3"
                  disabled={loading}
                >
                  {loading ? "⏳ Logging in..." : "Login"}
                </Button>

                <div className="text-center mt-3 text-muted">
                  Don't have an account? <span style={{ color: "#2a48cc", cursor: "pointer" }} onClick={() => handleNewUser()}>Register</span>
                </div>
              </>
            ) : (
              <>
                <h3 className="mb-3">Reset Password</h3>

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
                  <span style={{ cursor: "pointer", color: "#2a48cc" }} onClick={() => {
                    setForgot(false);
                    setSent(false);
                  }}>
                    ← Back to Login
                  </span>
                </div>
              </>
            )}

          </Card>
        </Col>
      </Form>
    </Container>
  );
}
