import { useState } from "react";
import { Container, Row, Col, Card, Form, Button, InputGroup, Alert } from "react-bootstrap";

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
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const login = async () => {
    if (!form.email || !form.password) {
      setError("All fields are required");
      return;
    }
    setError("");
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    alert("Login Successful 🚀");
  };

  const sendReset = async () => {
    if (!resetEmail) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setSent(true);
  };

  return (
    <Container fluid className="p-0">
      <Row className="g-0" style={{ minHeight: "100vh" }}>

        {/* LEFT */}
        <Col lg={4} className="sl-hero d-none d-lg-flex align-items-center justify-content-center text-white">
          <div>
            <h2>🛍️ ShopEase</h2>
            <p>Welcome back seller 👋</p>
          </div>
        </Col>

        {/* RIGHT */}
        <Col lg={8} className="d-flex align-items-center justify-content-center p-4">
          <Card className="sl-card p-4" style={{ width: "100%", maxWidth: 420 }}>

            {!forgot ? (
              <>
                <h3 className="mb-3">Seller Login</h3>

                {error && <Alert variant="danger">{error}</Alert>}

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    className="sl-input"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
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
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Enter password"
                    />
                    <Button variant="outline-secondary" onClick={() => setShowPwd(!showPwd)}>
                      {showPwd ? "🙈" : "👁️"}
                    </Button>
                  </InputGroup>
                </Form.Group>

                <div className="d-flex justify-content-between mb-3">
                  <Form.Check label="Remember me" />
                  <span style={{ cursor: "pointer", color: "#ff6b35" }} onClick={() => setForgot(true)}>
                    Forgot Password?
                  </span>
                </div>

                <Button className="sl-btn w-100 text-white" onClick={login} disabled={loading}>
                  {loading ? "⏳ Logging in..." : "Login"}
                </Button>

                <div className="text-center mt-3 text-muted">
                  Don't have an account? <span style={{ color: "#ff6b35", cursor: "pointer" }}>Register</span>
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
                  <span style={{ cursor: "pointer", color: "#ff6b35" }} onClick={() => {
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
      </Row>
    </Container>
  );
}
