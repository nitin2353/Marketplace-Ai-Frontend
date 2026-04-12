import { useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import InputGroup from "react-bootstrap/InputGroup";
import Badge from "react-bootstrap/Badge";
import Alert from "react-bootstrap/Alert";
import Stack from "react-bootstrap/Stack";
import ProgressBar from "react-bootstrap/ProgressBar";
import { useForm } from "react-hook-form";
import authApi from "../../../api/authApi";
import toast from "react-hot-toast";
import GlobalLoader from "../../../components/GlobalLoader";

// ── Font + Style Injection ──────────────────────────────────────────────────
const injectStyle = () => {
  if (document.getElementById("seller-reg-style")) return;

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap";
  document.head.appendChild(link);

  const s = document.createElement("style");
  s.id = "seller-reg-style";
  s.textContent = `
    body { font-family: 'Nunito', sans-serif !important; background: #f1f4ff !important; }
    .sr-hero { background: linear-gradient(145deg, #ff6b35 0%, #f7931e 55%, #ffcd3c 100%) !important; }
    .sr-card { border-radius: 24px !important; border: none !important; box-shadow: 0 24px 64px rgba(0,0,0,0.13) !important; }
    .sr-input { border-radius: 12px !important; border: 2px solid #e8eaf6 !important; padding: 11px 15px !important; font-size: 0.93rem !important; transition: border-color 0.2s, box-shadow 0.2s !important; font-family: 'Nunito', sans-serif !important; }
    .sr-input:focus { border-color: #ff6b35 !important; box-shadow: 0 0 0 3px rgba(255,107,53,0.15) !important; outline: none !important; }
    .sr-input.is-invalid { border-color: #dc3545 !important; }
    .sr-btn-main { background: linear-gradient(135deg, #ff6b35, #f7931e) !important; border: none !important; border-radius: 14px !important; font-weight: 800 !important; font-size: 1rem !important; padding: 13px 28px !important; letter-spacing: 0.4px !important; font-family: 'Nunito', sans-serif !important; transition: transform 0.15s, box-shadow 0.15s !important; }
    .sr-btn-main:hover:not(:disabled) { transform: translateY(-2px) !important; box-shadow: 0 10px 28px rgba(255,107,53,0.4) !important; }
    .sr-btn-main:disabled { opacity: 0.65 !important; }
    .sr-btn-back { border-radius: 14px !important; font-weight: 700 !important; font-size: 1rem !important; padding: 12px 28px !important; border: 2px solid #e8eaf6 !important; background: #fff !important; color: #555 !important; font-family: 'Nunito', sans-serif !important; transition: border-color 0.2s, color 0.2s !important; }
    .sr-btn-back:hover { border-color: #ff6b35 !important; color: #ff6b35 !important; background: #fff7f4 !important; }
    .sr-step-bubble { width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.88rem; transition: background 0.3s, color 0.3s, box-shadow 0.3s; }
    .sr-step-bubble.done { background: linear-gradient(135deg, #ff6b35, #f7931e); color: #fff; box-shadow: 0 4px 12px rgba(255,107,53,0.35); }
    .sr-step-bubble.active { background: linear-gradient(135deg, #ff6b35, #f7931e); color: #fff; box-shadow: 0 4px 16px rgba(255,107,53,0.45); }
    .sr-step-bubble.pending { background: #f0f4ff; color: #aab; border: 2px solid #e0e4f0; }
    .sr-connector { flex: 1; height: 3px; border-radius: 4px; background: #e0e4f0; transition: background 0.4s; }
    .sr-connector.done { background: linear-gradient(90deg, #ff6b35, #f7931e); }
    .sr-feature-card { background: rgba(255,255,255,0.2) !important; border-radius: 14px !important; border: 1px solid rgba(255,255,255,0.3) !important; }
    .sr-label { font-weight: 800 !important; color: #555 !important; font-size: 0.77rem !important; text-transform: uppercase !important; letter-spacing: 0.06em !important; margin-bottom: 6px !important; }
    .sr-success-ring { width: 84px; height: 84px; border-radius: 50%; background: linear-gradient(135deg,#ff6b35,#ffcd3c); display:flex; align-items:center; justify-content:center; font-size:2.2rem; margin: 0 auto 16px; }
    .sr-section-title { font-weight: 900; color: #1a1a2e; font-size: 1.3rem; margin-bottom: 4px; }
    .sr-section-sub { font-size: 0.85rem; color: #888; margin-bottom: 20px; }
    .sr-strength-bar { height: 6px !important; border-radius: 8px !important; }
    .sr-sensitive { letter-spacing: 0.08em !important; }
  `;
  document.head.appendChild(s);
};
injectStyle();

// ── Constants ────────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Basic Info", icon: "👤" },
  { id: 2, label: "Business", icon: "🏪" },
  { id: 3, label: "Address", icon: "📍" },
  { id: 4, label: "Payment", icon: "💳" },
];

const CATEGORIES = [
  "Electronics", "Fashion & Apparel", "Home & Living", "Beauty & Personal Care",
  "Sports & Fitness", "Books & Stationery", "Grocery & Food", "Toys & Games",
  "Automotive", "Health & Wellness", "Jewellery", "Art & Crafts", "Other",
];

const COUNTRIES = ["India", "USA", "UK", "Canada", "Australia", "UAE", "Singapore"];
const INDIA_STATES = [
  "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Odisha", "Punjab", "Rajasthan", "Tamil Nadu",
  "Telangana", "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

const LEFT_FEATURES = [
  { icon: "📦", title: "List Unlimited Products", desc: "No cap on your inventory" },
  { icon: "💰", title: "Fast Payouts", desc: "Weekly settlements to your account" },
  { icon: "📊", title: "Seller Dashboard", desc: "Real-time analytics & insights" },
  { icon: "🛡️", title: "Seller Protection", desc: "Dispute resolution support" },
];

// ── Password strength ────────────────────────────────────────────────────────
const passwordStrength = (pwd) => {
  if (!pwd) return null;
  let s = 0;
  if (pwd.length >= 6) s++;
  if (pwd.length >= 10) s++;
  if (/[A-Z]/.test(pwd)) s++;
  if (/[0-9]/.test(pwd)) s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  if (s <= 1) return { now: 25, variant: "danger", label: "Weak 🔴" };
  if (s <= 3) return { now: 60, variant: "warning", label: "Medium 🟡" };
  return { now: 100, variant: "success", label: "Strong 🟢" };
};

// ── Step field names (used for per-step trigger) ─────────────────────────────
const STEP_FIELDS = {
  1: ["name", "email", "password", "phone"],
  2: ["business_name", "business_type", "category", "experience", "description"],
  3: ["country", "state", "city", "pincode", "full_address"],
  4: ["account_number", "ifsc_code", "account_holder_name", "upi_id", "pan_number", "aadhaar_number"],
};

// ── Step Indicator ───────────────────────────────────────────────────────────
function StepIndicator({ current }) {
  return (
    <div className="d-flex align-items-center mb-4 px-1">
      {STEPS.map((step, idx) => (
        <div key={step.id} className="d-flex align-items-center" style={{ flex: idx < STEPS.length - 1 ? 1 : "unset" }}>
          <div className="d-flex flex-column align-items-center">
            <div className={`sr-step-bubble ${current > step.id ? "done" : current === step.id ? "active" : "pending"}`}>
              {current > step.id ? "✓" : step.icon}
            </div>
            <div className="mt-1 text-center" style={{ fontSize: "0.67rem", color: current >= step.id ? "#ff6b35" : "#aab", whiteSpace: "nowrap", fontWeight: 700 }}>
              {step.label}
            </div>
          </div>
          {idx < STEPS.length - 1 && (
            <div className={`sr-connector mx-2 mb-3 ${current > step.id ? "done" : ""}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Label helper ─────────────────────────────────────────────────────────────
function SrLabel({ children }) {
  return <Form.Label className="sr-label">{children}</Form.Label>;
}

// ── Error message helper ──────────────────────────────────────────────────────
function ErrMsg({ error }) {
  if (!error) return null;
  return <div className="text-danger mt-1" style={{ fontSize: "0.8rem" }}>{error.message}</div>;
}

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
export default function SellerRegister() {
  const [step, setStep] = useState(1);
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [submittedData, setSubmittedData] = useState(null);

  // ── useForm with all required fields ──────────────────────────────────────
  const {
    register,
    trigger,
    watch,
    getValues,
    handleSubmit,                   // ✅ properly destructured
    formState: { errors },
  } = useForm({
    defaultValues: {                // ✅ fixed: was "formResetData"
      // Step 1
      name: "",
      email: "",
      password: "",
      phone: "",
      // Step 2
      business_name: "",
      business_type: "",
      category: "",
      experience: "",
      description: "",
      // Step 3
      country: "India",
      state: "",
      city: "",
      pincode: "",
      full_address: "",
      // Step 4
      account_number: "",
      ifsc_code: "",
      account_holder_name: "",
      upi_id: "",
      pan_number: "",
      aadhaar_number: "",
    },
    mode: "onTouched",
  });

  const watchedPwd = watch("password");
  const watchedCountry = watch("country");
  const strength = passwordStrength(watchedPwd);
  const progress = ((step - 1) / STEPS.length) * 100;

  // ── Step navigation ────────────────────────────────────────────────────────
  const next = async () => {
    const valid = await trigger(STEP_FIELDS[step]);
    if (!valid) return;
    setStep(s => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const back = () => {
    setStep(s => s - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Form submit handler (called by handleSubmit) ───────────────────────────
  const onSubmit = async (payload) => {
    setLoading(true);
    try {
      const res = await authApi?.signupSeller(payload)
      
      if (res.success) {
        toast.success(res.message || "Your Account successfully Created");
        localStorage.setItem('token', res.token)
      }
    } catch (err) {
      console.error("Registration error:", err);
      toast.error(err.message || "Something went wrong!!");
    } finally{
      setLoading(false);
    }
  };

  // ── SUCCESS SCREEN ────────────────────────────────────────────────────────
  if (done) {
    const v = submittedData || getValues();
    return (
      <Container fluid className="sr-hero d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
        <Card className="sr-card text-center p-5" style={{ maxWidth: 460 }}>
          <div className="sr-success-ring">🎊</div>
          <h2 className="fw-black mb-2" style={{ fontFamily: "Nunito", fontSize: "1.85rem" }}>Seller Account Created!</h2>
          <p className="text-muted mb-3">
            Welcome, <strong style={{ color: "#ff6b35" }}>{v.name}</strong>! Your application is under review.
            We'll notify you at <strong>{v.email}</strong> within 24–48 hours.
          </p>
          <Alert variant="warning" className="rounded-4 border-0 fw-bold py-2 mb-3" style={{ background: "#fff8e6" }}>
            🎁 First 3 months — Zero commission on all sales!
          </Alert>
          <div className="d-flex gap-2 flex-wrap justify-content-center mb-4">
            {["📦 List Products", "📊 View Dashboard", "💬 Seller Support"].map(b => (
              <Badge key={b} bg="light" text="dark" className="px-3 py-2 fw-semibold rounded-pill" style={{ fontSize: "0.8rem" }}>{b}</Badge>
            ))}
          </div>
          <Button className="sr-btn-main w-100 text-white">Go to Seller Dashboard →</Button>
        </Card>
      </Container>
    );
  }

  // ── MAIN LAYOUT ───────────────────────────────────────────────────────────
  return (
    <Container fluid className="p-0" style={{ minHeight: "100vh", background: "#f1f4ff" }}>
       {loading && <GlobalLoader />}
      {/* ✅ handleSubmit properly wired to onSubmit */}
      <Form className="g-0 d-flex" style={{ minHeight: "100vh" }} onSubmit={handleSubmit(onSubmit)}>

        {/* ── LEFT HERO ── */}
        <Col lg={4} xl={4} className="sr-hero d-none d-lg-flex flex-column justify-content-between p-5">
          <div>
            <div className="text-white fw-black mb-1" style={{ fontFamily: "Nunito", fontSize: "2.2rem", fontWeight: 900 }}>
              🛍️ ShopEase
            </div>
            <div className="text-white fw-semibold mb-1" style={{ fontSize: "1rem", opacity: 0.9 }}>Seller Registration</div>
            <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.87rem", marginBottom: 28 }}>
              Join 5 lakh+ sellers already growing with us
            </div>
            <div className="mb-4">
              {STEPS.map(s => (
                <div key={s.id} className="d-flex align-items-center gap-3 mb-3">
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                    background: step >= s.id ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1rem", boxShadow: step >= s.id ? "0 4px 12px rgba(0,0,0,0.15)" : "none",
                    transition: "all 0.3s",
                  }}>
                    {step > s.id ? "✅" : s.icon}
                  </div>
                  <div>
                    <div className="fw-bold" style={{ color: step >= s.id ? "#fff" : "rgba(255,255,255,0.5)", fontSize: "0.88rem", lineHeight: 1.2 }}>
                      Step {s.id}: {s.label}
                    </div>
                    <div style={{ fontSize: "0.73rem", color: step >= s.id ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.4)" }}>
                      {step > s.id ? "Completed" : step === s.id ? "In progress..." : "Pending"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Stack gap={2}>
            {LEFT_FEATURES.map(({ icon, title, desc }) => (
              <div key={title} className="sr-feature-card d-flex align-items-center gap-3 p-3">
                <span style={{ fontSize: "1.5rem" }}>{icon}</span>
                <div className="text-white">
                  <div className="fw-bold" style={{ fontSize: "0.88rem" }}>{title}</div>
                  <div style={{ fontSize: "0.76rem", opacity: 0.75 }}>{desc}</div>
                </div>
              </div>
            ))}
          </Stack>

          <div className="mt-4 text-white" style={{ opacity: 0.65, fontSize: "0.8rem" }}>
            ⭐ Rated #1 Seller Platform in India — 2024
          </div>
        </Col>

        {/* ── RIGHT FORM PANEL ── */}
        <Col lg={8} xl={8} className="d-flex align-items-start justify-content-center p-3 p-md-4 p-lg-5" style={{ minHeight: "100vh" }}>
          <div style={{ width: "100%", maxWidth: 620 }}>

            {/* Mobile logo */}
            <div className="d-lg-none text-center mb-4">
              <div className="fw-black" style={{ fontFamily: "Nunito", fontSize: "1.9rem", color: "#ff6b35", fontWeight: 900 }}>🛍️ ShopEase Seller</div>
            </div>

            <Card className="sr-card p-4 p-md-5">

              {/* Overall Progress */}
              <div className="mb-1 d-flex justify-content-between align-items-center">
                <span className="fw-bold text-muted" style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Registration Progress
                </span>
                <span className="fw-bold" style={{ fontSize: "0.82rem", color: "#ff6b35" }}>{step} / {STEPS.length} Steps</span>
              </div>
              <ProgressBar
                now={progress + 25}
                style={{ height: 7, borderRadius: 8, marginBottom: 28 }}
                variant="warning"
              />

              <StepIndicator current={step} />

              {/* ── API Error Alert ── */}
              {apiError && (
                <Alert variant="danger" className="rounded-4 border-0 mb-3" onClose={() => setApiError(null)} dismissible>
                  ❌ {apiError}
                </Alert>
              )}

              {/* ══════════════════════════════════════════════════
                  STEP 1 — BASIC INFO
              ══════════════════════════════════════════════════ */}
              {step === 1 && (
                <>
                  <div className="sr-section-title">👤 Basic Information</div>
                  <div className="sr-section-sub">Let's start with your personal details</div>

                  {/* Full Name */}
                  <Form.Group className="mb-3">
                    <SrLabel>Full Name *</SrLabel>
                    <InputGroup>
                      <InputGroup.Text style={{ border: "2px solid #e8eaf6", borderRight: "none", borderRadius: "12px 0 0 12px", background: "#f8f9ff" }}>🙍</InputGroup.Text>
                      <Form.Control
                        className={`sr-input ${errors.name ? "is-invalid" : ""}`}
                        style={{ borderRadius: "0 12px 12px 0", borderLeft: "none" }}
                        placeholder="Rahul Sharma"
                        {...register("name", { required: "Full name is required" })}
                      />
                    </InputGroup>
                    <ErrMsg error={errors.name} />
                  </Form.Group>

                  {/* Email */}
                  <Form.Group className="mb-3">
                    <SrLabel>Email Address *</SrLabel>
                    <InputGroup>
                      <InputGroup.Text style={{ border: "2px solid #e8eaf6", borderRight: "none", borderRadius: "12px 0 0 12px", background: "#f8f9ff" }}>✉️</InputGroup.Text>
                      <Form.Control
                        type="email"
                        className={`sr-input ${errors.email ? "is-invalid" : ""}`}
                        style={{ borderRadius: "0 12px 12px 0", borderLeft: "none" }}
                        placeholder="rahul@example.com"
                        {...register("email", {
                          required: "Email is required",
                          pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email" },
                        })}
                      />
                    </InputGroup>
                    <ErrMsg error={errors.email} />
                  </Form.Group>

                  {/* Password */}
                  <Form.Group className="mb-1">
                    <SrLabel>Password *</SrLabel>
                    <InputGroup>
                      <InputGroup.Text style={{ border: "2px solid #e8eaf6", borderRight: "none", borderRadius: "12px 0 0 12px", background: "#f8f9ff" }}>🔒</InputGroup.Text>
                      <Form.Control
                        className={`sr-input ${errors.password ? "is-invalid" : ""}`}
                        style={{ borderRadius: "0 0 0 0", borderLeft: "none", borderRight: "none" }}
                        type={showPwd ? "text" : "password"}
                        placeholder="Min. 6 characters"
                        {...register("password", {
                          required: "Password is required",
                          minLength: { value: 6, message: "Minimum 6 characters" },
                        })}
                      />
                      <Button
                        variant="outline-secondary"
                        style={{ borderRadius: "0 12px 12px 0", border: "2px solid #e8eaf6", borderLeft: "none" }}
                        onClick={() => setShowPwd(v => !v)}
                        type="button"
                      >
                        {showPwd ? "🙈" : "👁️"}
                      </Button>
                    </InputGroup>
                    <ErrMsg error={errors.password} />
                  </Form.Group>

                  {strength && (
                    <div className="mb-3 mt-2">
                      <ProgressBar now={strength.now} variant={strength.variant} style={{ height: 5, borderRadius: 8 }} />
                      <div className="mt-1 fw-bold" style={{ fontSize: "0.76rem", color: strength.variant === "danger" ? "#dc3545" : strength.variant === "warning" ? "#f7931e" : "#22c55e" }}>
                        Strength: {strength.label}
                      </div>
                    </div>
                  )}

                  {/* Phone */}
                  <Form.Group className="mb-4">
                    <SrLabel>Phone Number *</SrLabel>
                    <InputGroup>
                      <InputGroup.Text style={{ border: "2px solid #e8eaf6", borderRight: "none", borderRadius: "12px 0 0 12px", background: "#f8f9ff", fontSize: "0.85rem" }}>🇮🇳 +91</InputGroup.Text>
                      <Form.Control
                        type="tel"
                        className={`sr-input ${errors.phone ? "is-invalid" : ""}`}
                        style={{ borderRadius: "0 12px 12px 0", borderLeft: "none" }}
                        placeholder="xxxxxxxxxx"
                        maxLength={10}
                        {...register("phone", {
                          required: "Phone number is required",
                          pattern: { value: /^\d{10}$/, message: "Enter valid 10-digit number" },
                        })}
                      />
                    </InputGroup>
                    <ErrMsg error={errors.phone} />
                  </Form.Group>

                  <Alert variant="warning" className="rounded-4 border-0 py-2 px-3 mb-4" style={{ background: "#fff8e6" }}>
                    <span className="fw-bold" style={{ fontSize: "0.85rem", color: "#92400e" }}>
                      🎁 Register now &amp; sell commission-free for 3 months!
                    </span>
                  </Alert>
                </>
              )}

              {/* ══════════════════════════════════════════════════
                  STEP 2 — BUSINESS INFO
              ══════════════════════════════════════════════════ */}
              {step === 2 && (
                <>
                  <div className="sr-section-title">🏪 Business Information</div>
                  <div className="sr-section-sub">Tell us about your business</div>

                  {/* Business Name */}
                  <Form.Group className="mb-3">
                    <SrLabel>Business Name *</SrLabel>
                    <InputGroup>
                      <InputGroup.Text style={{ border: "2px solid #e8eaf6", borderRight: "none", borderRadius: "12px 0 0 12px", background: "#f8f9ff" }}>🏢</InputGroup.Text>
                      <Form.Control
                        className={`sr-input ${errors.business_name ? "is-invalid" : ""}`}
                        style={{ borderRadius: "0 12px 12px 0", borderLeft: "none" }}
                        placeholder="Rahul Enterprises"
                        {...register("business_name", { required: "Business name is required" })}
                      />
                    </InputGroup>
                    <ErrMsg error={errors.business_name} />
                  </Form.Group>

                  <Row className="g-3 mb-3">
                    {/* Business Type */}
                    <Col sm={6}>
                      <Form.Group>
                        <SrLabel>Business Type *</SrLabel>
                        <Form.Select
                          className={`sr-input ${errors.business_type ? "is-invalid" : ""}`}
                          {...register("business_type", { required: "Select business type" })}
                        >
                          <option value="">Select type...</option>
                          {["Individual", "Company", "Freelancer", "Partnership", "LLP"].map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </Form.Select>
                        <ErrMsg error={errors.business_type} />
                      </Form.Group>
                    </Col>

                    {/* Category */}
                    <Col sm={6}>
                      <Form.Group>
                        <SrLabel>Product Category *</SrLabel>
                        <Form.Select
                          className={`sr-input ${errors.category ? "is-invalid" : ""}`}
                          {...register("category", { required: "Select a category" })}
                        >
                          <option value="">Select category...</option>
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </Form.Select>
                        <ErrMsg error={errors.category} />
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Experience */}
                  <Form.Group className="mb-3">
                    <SrLabel>Years of Experience *</SrLabel>
                    <InputGroup>
                      <InputGroup.Text style={{ border: "2px solid #e8eaf6", borderRight: "none", borderRadius: "12px 0 0 12px", background: "#f8f9ff" }}>📅</InputGroup.Text>
                      <Form.Control
                        type="number"
                        className={`sr-input ${errors.experience ? "is-invalid" : ""}`}
                        style={{ borderRadius: "0 12px 12px 0", borderLeft: "none" }}
                        placeholder="e.g. 3"
                        min={0} max={60}
                        {...register("experience", {
                          required: "Experience is required",
                          min: { value: 0, message: "Cannot be negative" },
                        })}
                      />
                    </InputGroup>
                    <ErrMsg error={errors.experience} />
                  </Form.Group>

                  {/* Description */}
                  <Form.Group className="mb-4">
                    <SrLabel>Business Description *</SrLabel>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      className={`sr-input ${errors.description ? "is-invalid" : ""}`}
                      placeholder="Describe your business, products you sell, your strengths..."
                      maxLength={500}
                      {...register("description", {
                        required: "Description is required",
                        maxLength: { value: 500, message: "Max 500 characters" },
                      })}
                    />
                    <ErrMsg error={errors.description} />
                    <div className="text-end text-muted mt-1" style={{ fontSize: "0.75rem" }}>
                      {(watch("description") || "").length} / 500
                    </div>
                  </Form.Group>
                </>
              )}

              {/* ══════════════════════════════════════════════════
                  STEP 3 — ADDRESS
              ══════════════════════════════════════════════════ */}
              {step === 3 && (
                <>
                  <div className="sr-section-title">📍 Business Address</div>
                  <div className="sr-section-sub">Where is your business located?</div>

                  <Row className="g-3 mb-3">
                    {/* Country */}
                    <Col sm={6}>
                      <Form.Group>
                        <SrLabel>Country *</SrLabel>
                        <Form.Select
                          className={`sr-input ${errors.country ? "is-invalid" : ""}`}
                          {...register("country", { required: "Select country" })}
                        >
                          <option value="">Select country...</option>
                          {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </Form.Select>
                        <ErrMsg error={errors.country} />
                      </Form.Group>
                    </Col>

                    {/* State */}
                    <Col sm={6}>
                      <Form.Group>
                        <SrLabel>State *</SrLabel>
                        {watchedCountry === "India" ? (
                          <Form.Select
                            className={`sr-input ${errors.state ? "is-invalid" : ""}`}
                            {...register("state", { required: "State is required" })}
                          >
                            <option value="">Select state...</option>
                            {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                          </Form.Select>
                        ) : (
                          <Form.Control
                            className={`sr-input ${errors.state ? "is-invalid" : ""}`}
                            placeholder="Enter your state"
                            {...register("state", { required: "State is required" })}
                          />
                        )}
                        <ErrMsg error={errors.state} />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="g-3 mb-3">
                    {/* City */}
                    <Col sm={6}>
                      <Form.Group>
                        <SrLabel>City *</SrLabel>
                        <InputGroup>
                          <InputGroup.Text style={{ border: "2px solid #e8eaf6", borderRight: "none", borderRadius: "12px 0 0 12px", background: "#f8f9ff" }}>🏙️</InputGroup.Text>
                          <Form.Control
                            className={`sr-input ${errors.city ? "is-invalid" : ""}`}
                            style={{ borderRadius: "0 12px 12px 0", borderLeft: "none" }}
                            placeholder="Mumbai"
                            {...register("city", { required: "City is required" })}
                          />
                        </InputGroup>
                        <ErrMsg error={errors.city} />
                      </Form.Group>
                    </Col>

                    {/* Pincode */}
                    <Col sm={6}>
                      <Form.Group>
                        <SrLabel>Pincode *</SrLabel>
                        <InputGroup>
                          <InputGroup.Text style={{ border: "2px solid #e8eaf6", borderRight: "none", borderRadius: "12px 0 0 12px", background: "#f8f9ff" }}>📮</InputGroup.Text>
                          <Form.Control
                            className={`sr-input ${errors.pincode ? "is-invalid" : ""}`}
                            style={{ borderRadius: "0 12px 12px 0", borderLeft: "none" }}
                            placeholder="400001"
                            maxLength={6}
                            {...register("pincode", {
                              required: "Pincode is required",
                              pattern: { value: /^\d{6}$/, message: "Enter valid 6-digit pincode" },
                            })}
                          />
                        </InputGroup>
                        <ErrMsg error={errors.pincode} />
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Full Address */}
                  <Form.Group className="mb-4">
                    <SrLabel>Full Address *</SrLabel>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      className={`sr-input ${errors.full_address ? "is-invalid" : ""}`}
                      placeholder="Shop No., Building, Street, Area..."
                      {...register("full_address", { required: "Full address is required" })}
                    />
                    <ErrMsg error={errors.full_address} />
                  </Form.Group>
                </>
              )}

              {/* ══════════════════════════════════════════════════
                  STEP 4 — PAYMENT & KYC
              ══════════════════════════════════════════════════ */}
              {step === 4 && (
                <>
                  <div className="sr-section-title">💳 Payment &amp; KYC Details</div>
                  <div className="sr-section-sub">Secure &amp; encrypted — required for payouts</div>

                  <Alert variant="info" className="rounded-4 border-0 py-2 px-3 mb-4 d-flex align-items-center gap-2" style={{ background: "#eff6ff" }}>
                    <span>🔐</span>
                    <span style={{ fontSize: "0.83rem", color: "#1e40af", fontWeight: 700 }}>
                      Your data is 256-bit SSL encrypted. We never share your info.
                    </span>
                  </Alert>

                  <Row className="g-3 mb-3">
                    {/* Account Number */}
                    <Col sm={6}>
                      <Form.Group>
                        <SrLabel>Account Number *</SrLabel>
                        <InputGroup>
                          <InputGroup.Text style={{ border: "2px solid #e8eaf6", borderRight: "none", borderRadius: "12px 0 0 12px", background: "#f8f9ff" }}>🏦</InputGroup.Text>
                          <Form.Control
                            className={`sr-input sr-sensitive ${errors.account_number ? "is-invalid" : ""}`}
                            style={{ borderRadius: "0 12px 12px 0", borderLeft: "none" }}
                            placeholder="123456789012"
                            maxLength={18}
                            {...register("account_number", {
                              required: "Account number is required",
                              pattern: { value: /^\d{9,18}$/, message: "Enter valid account number (9–18 digits)" },
                            })}
                          />
                        </InputGroup>
                        <ErrMsg error={errors.account_number} />
                      </Form.Group>
                    </Col>

                    {/* IFSC */}
                    <Col sm={6}>
                      <Form.Group>
                        <SrLabel>IFSC Code *</SrLabel>
                        <InputGroup>
                          <InputGroup.Text style={{ border: "2px solid #e8eaf6", borderRight: "none", borderRadius: "12px 0 0 12px", background: "#f8f9ff" }}>🔖</InputGroup.Text>
                          <Form.Control
                            className={`sr-input ${errors.ifsc_code ? "is-invalid" : ""}`}
                            style={{ borderRadius: "0 12px 12px 0", borderLeft: "none", textTransform: "uppercase" }}
                            placeholder="SBIN0001234"
                            maxLength={11}
                            {...register("ifsc_code", {
                              required: "IFSC code is required",
                              pattern: { value: /^[A-Za-z]{4}0[A-Za-z0-9]{6}$/, message: "Enter valid IFSC code" },
                            })}
                          />
                        </InputGroup>
                        <ErrMsg error={errors.ifsc_code} />
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Account Holder Name */}
                  <Form.Group className="mb-3">
                    <SrLabel>Account Holder Name *</SrLabel>
                    <InputGroup>
                      <InputGroup.Text style={{ border: "2px solid #e8eaf6", borderRight: "none", borderRadius: "12px 0 0 12px", background: "#f8f9ff" }}>👤</InputGroup.Text>
                      <Form.Control
                        className={`sr-input ${errors.account_holder_name ? "is-invalid" : ""}`}
                        style={{ borderRadius: "0 12px 12px 0", borderLeft: "none" }}
                        placeholder="As per bank records"
                        {...register("account_holder_name", { required: "Account holder name is required" })}
                      />
                    </InputGroup>
                    <ErrMsg error={errors.account_holder_name} />
                  </Form.Group>

                  {/* UPI ID */}
                  <Form.Group className="mb-3">
                    <SrLabel>UPI ID (Optional)</SrLabel>
                    <InputGroup>
                      <InputGroup.Text style={{ border: "2px solid #e8eaf6", borderRight: "none", borderRadius: "12px 0 0 12px", background: "#f8f9ff" }}>📲</InputGroup.Text>
                      <Form.Control
                        className={`sr-input ${errors.upi_id ? "is-invalid" : ""}`}
                        style={{ borderRadius: "0 12px 12px 0", borderLeft: "none" }}
                        placeholder="rahul@upi"
                        {...register("upi_id", {
                          pattern: { value: /^[\w.\-_]{3,}@[a-zA-Z]{3,}$/, message: "Enter valid UPI ID" },
                        })}
                      />
                    </InputGroup>
                    <ErrMsg error={errors.upi_id} />
                  </Form.Group>

                  <Row className="g-3 mb-4">
                    {/* PAN */}
                    <Col sm={6}>
                      <Form.Group>
                        <SrLabel>PAN Number *</SrLabel>
                        <InputGroup>
                          <InputGroup.Text style={{ border: "2px solid #e8eaf6", borderRight: "none", borderRadius: "12px 0 0 12px", background: "#f8f9ff" }}>🪪</InputGroup.Text>
                          <Form.Control
                            className={`sr-input ${errors.pan_number ? "is-invalid" : ""}`}
                            style={{ borderRadius: "0 12px 12px 0", borderLeft: "none", textTransform: "uppercase" }}
                            placeholder="ABCDE1234F"
                            maxLength={10}
                            {...register("pan_number", {
                              required: "PAN number is required",
                              pattern: { value: /^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$/, message: "Enter valid PAN number" },
                            })}
                          />
                        </InputGroup>
                        <ErrMsg error={errors.pan_number} />
                      </Form.Group>
                    </Col>

                    {/* Aadhaar */}
                    <Col sm={6}>
                      <Form.Group>
                        <SrLabel>Aadhaar Number *</SrLabel>
                        <InputGroup>
                          <InputGroup.Text style={{ border: "2px solid #e8eaf6", borderRight: "none", borderRadius: "12px 0 0 12px", background: "#f8f9ff" }}>🆔</InputGroup.Text>
                          <Form.Control
                            className={`sr-input sr-sensitive ${errors.aadhaar_number ? "is-invalid" : ""}`}
                            style={{ borderRadius: "0 12px 12px 0", borderLeft: "none" }}
                            placeholder="1234 5678 9012"
                            maxLength={12}
                            {...register("aadhaar_number", {
                              required: "Aadhaar number is required",
                              pattern: { value: /^\d{12}$/, message: "Enter valid 12-digit Aadhaar" },
                            })}
                          />
                        </InputGroup>
                        <ErrMsg error={errors.aadhaar_number} />
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Summary Preview */}
                  <Card className="border-0 rounded-4 mb-4" style={{ background: "#f8f9ff" }}>
                    <Card.Body className="p-3">
                      <div className="fw-bold mb-2" style={{ fontSize: "0.82rem", color: "#555", textTransform: "uppercase", letterSpacing: "0.05em" }}>📋 Registration Summary</div>
                      <Row className="g-1">
                        {[
                          ["Seller Name", watch("name")],
                          ["Email", watch("email")],
                          ["Business", watch("business_name")],
                          ["Type", watch("business_type")],
                          ["Category", watch("category")],
                          ["City", `${watch("city")}${watch("state") ? ", " + watch("state") : ""}`],
                        ].map(([label, val]) => val ? (
                          <Col xs={6} key={label}>
                            <div style={{ fontSize: "0.76rem", color: "#999" }}>{label}</div>
                            <div className="fw-bold" style={{ fontSize: "0.85rem", color: "#333" }}>{val}</div>
                          </Col>
                        ) : null)}
                      </Row>
                    </Card.Body>
                  </Card>
                </>
              )}

              {/* ── NAV BUTTONS ── */}
              <div className="d-flex justify-content-between align-items-center gap-3 mt-2">
                {step > 1 ? (
                  <Button className="sr-btn-back" variant="outline-secondary" onClick={back} type="button" style={{ minWidth: 120 }}>
                    ← Back
                  </Button>
                ) : (
                  <div />
                )}

                {step < 4 ? (
                  <Button className="sr-btn-main text-white" onClick={next} type="button" style={{ minWidth: 140 }}>
                    Next Step →
                  </Button>
                ) : (
                  <Button className="sr-btn-main text-white" type="submit" style={{ minWidth: 180 }}>
                    🚀 Submit & Register
                  </Button>
                )}
              </div>

              {/* Trust footer */}
              <div className="d-flex justify-content-center gap-3 flex-wrap mt-4">
                {["🔒 SSL Secure", "✅ KYC Verified", "🏆 Trusted Platform"].map(b => (
                  <span key={b} className="text-muted fw-semibold" style={{ fontSize: "0.72rem" }}>{b}</span>
                ))}
              </div>

            </Card>
          </div>
        </Col>
      </Form>
    </Container>
  );
}