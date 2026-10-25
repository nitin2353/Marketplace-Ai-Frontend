import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Form, Button, Badge, Alert, Stack, ProgressBar } from "react-bootstrap";
import { useForm } from "react-hook-form";
import authApi from "../../../api/authApi";
import toast from "react-hot-toast";
import GlobalLoader from "../../../components/GlobalLoader";
import { useNavigate } from "react-router-dom";

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
    body { font-family: var(--font-main, 'Nunito', sans-serif) !important; background: var(--bg-main, #f1f4ff) !important; }

    /* ── Left hero ── */
    .sr-hero { position: relative; overflow: hidden; background: var(--primary-gradient, linear-gradient(135deg,#2563eb,#1d4ed8)) !important; }
    .sr-hero::before, .sr-hero::after { content: ""; position: absolute; border-radius: 50%; pointer-events: none; background: rgba(255,255,255,.10); }
    .sr-hero::before { width: 440px; height: 440px; top: -150px; right: -150px; }
    .sr-hero::after  { width: 280px; height: 280px; bottom: -110px; left: -90px; background: rgba(255,255,255,.07); }
    .sr-hero > * { position: relative; z-index: 1; }
    .sr-feature-card { background: rgba(255,255,255,.14); border-radius: 16px; border: 1px solid rgba(255,255,255,.24); backdrop-filter: blur(6px); transition: transform .2s, background .2s; }
    .sr-feature-card:hover { transform: translateX(4px); background: rgba(255,255,255,.2); }
    .sr-feature-icon { width: 42px; height: 42px; border-radius: 12px; background: rgba(255,255,255,.24); display: flex; align-items: center; justify-content: center; font-size: 1.25rem; flex-shrink: 0; }
    .sr-side-step { display: flex; align-items: center; gap: 14px; margin-bottom: 14px; }
    .sr-side-dot { width: 38px; height: 38px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 1.05rem; transition: all .3s; }
    .sr-side-line { width: 2px; height: 14px; background: rgba(255,255,255,.3); margin: -8px 0 6px 18px; }

    /* ── Mobile brand strip ── */
    .sr-mobile-brand { background: var(--primary-gradient, linear-gradient(135deg,#2563eb,#1d4ed8)); border-radius: 0 0 28px 28px; padding: 26px 20px 66px; text-align: center; color: #fff; font-weight: 900; font-size: 1.7rem; }
    @media (max-width: 991px) { .sr-pull { margin-top: -46px; } }

    /* ── Card ── */
    .sr-card { border-radius: 24px !important; border: none !important; background: var(--bg-surface, #fff) !important; box-shadow: var(--shadow-lg, 0 24px 64px rgba(0,0,0,.13)) !important; animation: srFade .4s ease both; }
    @keyframes srFade { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
    .sr-section-title { font-weight: 900; color: var(--text-main, #1f2340); font-size: 1.45rem; margin-bottom: 4px; }
    .sr-section-sub { font-size: .88rem; font-weight: 600; color: var(--text-muted, #8a8fa8); margin-bottom: 22px; }
    .sr-step-anim { animation: srSlide .3s ease both; }
    @keyframes srSlide { from { opacity: 0; transform: translateX(14px); } to { opacity: 1; transform: none; } }

    .sr-progress.progress { height: 7px; border-radius: 8px; background: var(--border-light, #e8eaf6); margin-bottom: 26px; }
    .sr-progress .progress-bar { background: var(--primary-gradient, linear-gradient(135deg,#2563eb,#1d4ed8)); border-radius: 8px; transition: width .4s ease; }

    /* ── Stepper ── */
    .sr-step-bubble { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: .9rem; transition: background .3s, color .3s, box-shadow .3s, transform .3s; }
    .sr-step-bubble.done, .sr-step-bubble.active { background: var(--primary-gradient, linear-gradient(135deg,#2563eb,#1d4ed8)); color: #fff; box-shadow: var(--shadow-sm); }
    .sr-step-bubble.active { transform: scale(1.1); box-shadow: var(--shadow-md); }
    .sr-step-bubble.pending { background: var(--bg-hover, #eef1ff); color: #aab; border: 2px solid var(--border-light, #e8eaf6); }
    .sr-connector { flex: 1; height: 3px; border-radius: 4px; background: var(--border-light, #e8eaf6); transition: background .4s; }
    .sr-connector.done { background: var(--primary-gradient, linear-gradient(135deg,#2563eb,#1d4ed8)); }

    /* ── Fields ── */
    .sr-label { font-weight: 800 !important; color: var(--text-main, #444) !important; font-size: .74rem !important; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 6px !important; }
    .sr-field { position: relative; }
    .sr-field-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); font-size: 1rem; opacity: .6; pointer-events: none; }
    .sr-field.textarea .sr-field-icon { top: 18px; transform: none; }
    .form-control.sr-input, .form-select.sr-input {
      border-radius: 12px; border: 2px solid var(--border-light, #e8eaf6); padding: 11px 15px; font-size: .93rem; font-weight: 600;
      background-color: var(--bg-main, #f8f9ff); font-family: var(--font-main, 'Nunito', sans-serif);
      transition: border-color .2s, box-shadow .2s, background .2s;
    }
    .form-control.sr-input.has-icon { padding-left: 42px; }
    .form-control.sr-input.has-eye { padding-right: 48px; }
    .form-control.sr-input:focus, .form-select.sr-input:focus { border-color: var(--primary, #3b82f6); box-shadow: var(--shadow-sm); background-color: #fff; outline: none; }
    .form-control.sr-input.is-invalid, .form-select.sr-input.is-invalid { border-color: #dc3545; background-image: none; }
    .form-select.sr-input.is-invalid { background-image: var(--bs-form-select-bg-img); }
    .sr-eye { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); border: none; background: none; width: 34px; height: 34px; padding: 0; border-radius: 10px; cursor: pointer; }
    .sr-eye:hover { background: var(--bg-hover, #eef1ff); }
    .sr-err { color: #dc3545; font-size: .8rem; font-weight: 700; margin-top: 4px; }
    .sr-sensitive { letter-spacing: .08em; }
    .sr-upper { text-transform: uppercase; }

    /* ── Upload ── */
    .sr-drop { display: flex; align-items: center; gap: 14px; width: 100%; cursor: pointer; padding: 14px 16px; border: 2px dashed var(--border-light, #d6daf0); border-radius: 16px; background: var(--bg-main, #f8f9ff); transition: border-color .2s, background .2s; margin: 0; }
    .sr-drop:hover { border-color: var(--primary, #3b82f6); background: var(--bg-hover, #eef1ff); }
    .sr-drop-icon { width: 54px; height: 54px; border-radius: 14px; background: var(--primary-gradient, linear-gradient(135deg,#2563eb,#1d4ed8)); display: flex; align-items: center; justify-content: center; font-size: 1.4rem; flex-shrink: 0; overflow: hidden; }
    .sr-drop-icon img { width: 100%; height: 100%; object-fit: contain; background: #fff; }
    .sr-drop-title { font-weight: 800; font-size: .88rem; color: var(--text-main, #333); }
    .sr-drop-sub { font-weight: 600; font-size: .76rem; color: var(--text-muted, #8a8fa8); word-break: break-all; }

    /* ── Buttons ── */
    .btn.sr-btn-main { background: var(--primary-gradient, linear-gradient(135deg,#2563eb,#1d4ed8)); border: none; border-radius: 14px; font-weight: 800; font-size: 1rem; padding: 13px 28px; letter-spacing: .3px; color: #fff; transition: transform .15s, box-shadow .15s; }
    .btn.sr-btn-main:hover:not(:disabled) { transform: translateY(-2px); box-shadow: var(--shadow-md); color: #fff; }
    .btn.sr-btn-main:disabled { opacity: .65; }
    .btn.sr-btn-back { border-radius: 14px; font-weight: 800; font-size: 1rem; padding: 12px 28px; border: 2px solid var(--border-light, #e8eaf6); background: #fff; color: #555; transition: border-color .2s, color .2s, background .2s; }
    .btn.sr-btn-back:hover { border-color: var(--primary, #3b82f6); color: var(--primary, #3b82f6); background: var(--bg-hover, #eef1ff); }

    .sr-note { display: flex; align-items: center; gap: 10px; border-radius: 16px; padding: 11px 14px; font-weight: 700; font-size: .84rem; margin-bottom: 20px; background: var(--bg-hover, #eef1ff); border: 2px dashed var(--primary, #3b82f6); color: var(--text-main, #333); }
    .sr-note.info { border-style: solid; border-width: 1px; border-color: var(--border-light, #dbe4ff); }

    .sr-summary { background: var(--bg-main, #f8f9ff); border: 2px solid var(--border-light, #e8eaf6); border-radius: 18px; padding: 16px; margin-bottom: 22px; }
    .sr-summary-title { font-weight: 800; font-size: .76rem; color: var(--text-muted, #666); text-transform: uppercase; letter-spacing: .06em; margin-bottom: 10px; }
    .sr-summary small { display: block; font-size: .72rem; color: var(--text-muted, #999); font-weight: 700; }
    .sr-summary b { font-size: .86rem; color: var(--text-main, #333); word-break: break-word; }

    .sr-success-ring { width: 88px; height: 88px; border-radius: 50%; background: var(--primary-gradient, linear-gradient(135deg,#2563eb,#1d4ed8)); display: flex; align-items: center; justify-content: center; font-size: 2.3rem; margin: 0 auto 18px; box-shadow: 0 0 0 10px rgba(255,255,255,.5), var(--shadow-md); }

    .sr-input:focus-visible, .sr-btn-main:focus-visible, .sr-btn-back:focus-visible, .sr-eye:focus-visible { outline: 3px solid var(--primary, #3b82f6); outline-offset: 2px; }
    @media (max-width: 575px) { .sr-card { border-radius: 22px !important; } .sr-section-title { font-size: 1.25rem; } }
    @media (prefers-reduced-motion: reduce) { .sr-card, .sr-step-anim { animation: none; } }
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

const STEP_TITLES = {
  1: ["👤 Basic information", "Let's start with your personal details"],
  2: ["🏪 Business information", "Tell us about your business"],
  3: ["📍 Business address", "Where is your business located?"],
  4: ["💳 Payment & KYC details", "Secure & encrypted — required for payouts"],
};

// ── Password strength ────────────────────────────────────────────────────────
const passwordStrength = (pwd) => {
  if (!pwd) return null;
  let s = 0;
  if (pwd.length >= 6) s++;
  if (pwd.length >= 10) s++;
  if (/[A-Z]/.test(pwd)) s++;
  if (/[0-9]/.test(pwd)) s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  if (s <= 1) return { now: 25, variant: "danger", label: "Weak" };
  if (s <= 3) return { now: 60, variant: "warning", label: "Medium" };
  return { now: 100, variant: "success", label: "Strong" };
};
const STRENGTH_COLOR = { danger: "#dc3545", warning: "#f59e0b", success: "#16a34a" };

// ── Step field names (used for per-step trigger) ─────────────────────────────
const STEP_FIELDS = {
  1: ["name", "email", "password", "phone", "gender", "dob", "seller_signature_image"],
  2: ["business_name", "business_type", "category", "experience", "store_description", "website", "bio"],
  3: ["country", "state", "city", "pincode", "address_line_1"],
  4: ["account_number", "ifsc", "account_holder", "upi_id", "pan", "gstin", "bank_name", "account_type"],
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const ic = (error, icon, extra = "") =>
  `sr-input ${icon ? "has-icon" : ""} ${error ? "is-invalid" : ""} ${extra}`;

/** Label + optional icon + control + error message */
function Field({ label, icon, error, children, className = "mb-3", textarea = false }) {
  return (
    <Form.Group className={className}>
      {label && <Form.Label className="sr-label">{label}</Form.Label>}
      <div className={`sr-field ${textarea ? "textarea" : ""}`}>
        {icon && <span className="sr-field-icon">{icon}</span>}
        {children}
      </div>
      {error && <div className="sr-err">{error.message}</div>}
    </Form.Group>
  );
}

function StepIndicator({ current }) {
  return (
    <div className="d-flex align-items-center mb-4 px-1">
      {STEPS.map((step, idx) => (
        <div key={step.id} className="d-flex align-items-center" style={{ flex: idx < STEPS.length - 1 ? 1 : "unset" }}>
          <div className="d-flex flex-column align-items-center">
            <div className={`sr-step-bubble ${current > step.id ? "done" : current === step.id ? "active" : "pending"}`}>
              {current > step.id ? "✓" : step.icon}
            </div>
            <div className="mt-1 text-center" style={{ fontSize: "0.68rem", color: current >= step.id ? "var(--primary)" : "#aab", whiteSpace: "nowrap", fontWeight: 800 }}>
              {step.label}
            </div>
          </div>
          {idx < STEPS.length - 1 && <div className={`sr-connector mx-2 mb-3 ${current > step.id ? "done" : ""}`} />}
        </div>
      ))}
    </div>
  );
}

/** Signature upload with preview */

function SignatureUpload({ register, watch, error }) {
  const file = watch("seller_signature_image")?.[0];
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <Form.Group className="mb-3">
      <Form.Label className="sr-label">
        Signature image *
      </Form.Label>

      <label className="sr-drop">
        <input
          type="file"
          accept="image/png,image/jpeg"
          hidden
          {...register("seller_signature_image", {
            required: "Please upload your signature",
            validate: {
              fileSize: (files) =>
                !files?.[0] ||
                files[0].size <= 2 * 1024 * 1024 ||
                "Signature must be 2 MB or smaller",
              fileType: (files) =>
                !files?.[0] ||
                ["image/png", "image/jpeg"].includes(files[0].type) ||
                "Only JPG and PNG files are allowed",
            },
          })}
        />

        <div className="sr-drop-icon">
          {preview ? (
            <img src={preview} alt="Signature preview" />
          ) : (
            "✍️"
          )}
        </div>

        <div>
          <div className="sr-drop-title">
            {file ? "Change signature" : "Upload your signature *"}
          </div>
          <div className="sr-drop-sub">
            {file ? file.name : "JPG or PNG · Maximum 2 MB"}
          </div>
        </div>
      </label>

      {error && <div className="sr-err">{error.message}</div>}
    </Form.Group>
  );
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

  const navigate = useNavigate();

  const {
    register,
    trigger,
    watch,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      // Step 1
      name: "", email: "", password: "", phone: "", gender: "", dob: "",
      // Step 2
      business_name: "", business_type: "", category: "", experience: "",
      store_description: "", website: "", bio: "",
      // Step 3
      country: "India", state: "", city: "", pincode: "", address_line_1: "",
      // Step 4
      account_number: "", ifsc: "", account_holder: "", upi_id: "", pan: "",
      gstin: "", bank_name: "", account_type: "Savings",
    },
    mode: "onTouched",
  });

  const watchedPwd = watch("password");
  const watchedCountry = watch("country");
  const strength = passwordStrength(watchedPwd);
  const progress = (step / STEPS.length) * 100;

  // ── Step navigation ────────────────────────────────────────────────────────
  const next = async () => {
    const valid = await trigger(STEP_FIELDS[step]);
    if (!valid) return;
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const back = () => {
    setStep((s) => s - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const onSubmit = async (payload) => {
    setLoading(true);
    setApiError(null);

    try {
      const formData = new FormData();

      // All normal registration fields
      Object.entries(payload).forEach(([key, value]) => {
        if (key !== "seller_signature_image") {
          formData.append(key, value ?? "");
        }
      });

      // Signature image
      const signatureFile = payload.seller_signature_image?.[0];
      if (signatureFile) {
        formData.append("seller_signature_image", signatureFile);
      }

      const res = await authApi?.signupSeller(formData);

      if (res.success) {
        toast.success(res.message || "Your Account successfully Created");
        localStorage.setItem("token", res.token);
        setSubmittedData({ name: payload.name, email: payload.email });
        setDone(true);
      }
    } catch (err) {
      console.error("Registration error:", err);
      const msg = err?.message || "Something went wrong!!";
      setApiError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── SUCCESS SCREEN ────────────────────────────────────────────────────────
  if (done) {
    const v = submittedData || getValues();
    return (
      <Container fluid className="sr-hero d-flex align-items-center justify-content-center p-3" style={{ minHeight: "100vh" }}>
        <Card className="sr-card text-center p-4 p-md-5" style={{ maxWidth: 480, width: "100%" }}>
          <div className="sr-success-ring">🎊</div>
          <h2 className="sr-section-title" style={{ fontSize: "1.8rem" }}>Seller account created!</h2>
          <p className="text-muted fw-semibold mb-3">
            Welcome, <strong style={{ color: "var(--primary)" }}>{v.name}</strong>! Your application is under review.
            We'll notify you at <strong>{v.email}</strong> within 24–48 hours.
          </p>
          <div className="sr-note justify-content-center">🎁 First 3 months — zero commission on all sales!</div>
          <div className="d-flex gap-2 flex-wrap justify-content-center mb-4">
            {["📦 List Products", "📊 View Dashboard", "💬 Seller Support"].map((b) => (
              <Badge key={b} bg="light" text="dark" className="px-3 py-2 fw-bold rounded-pill" style={{ fontSize: "0.8rem" }}>{b}</Badge>
            ))}
          </div>
          <Button className="sr-btn-main w-100" onClick={() => navigate("/auth/login")}>Continue to login →</Button>
        </Card>
      </Container>
    );
  }

  const [title, sub] = STEP_TITLES[step];

  // ── MAIN LAYOUT ───────────────────────────────────────────────────────────
  return (
    <Container fluid className="p-0" style={{ minHeight: "100vh" }}>
      {loading && <GlobalLoader />}

      <Form className="d-flex" style={{ minHeight: "100vh" }} onSubmit={handleSubmit(onSubmit)} noValidate>

        {/* ── LEFT HERO ── */}
        <Col lg={4} className="sr-hero d-none d-lg-flex flex-column justify-content-between p-5">
          <div>
            <div className="text-white mb-1" style={{ fontSize: "2.2rem", fontWeight: 900 }}>🛍️ ShopEase</div>
            <div className="text-white fw-bold mb-1" style={{ fontSize: "1.05rem", opacity: 0.95 }}>Seller registration</div>
            <div style={{ color: "rgba(255,255,255,0.78)", fontSize: "0.87rem", marginBottom: 28, fontWeight: 600 }}>
              Join 5 lakh+ sellers already growing with us
            </div>

            {STEPS.map((s) => (
              <div key={s.id}>
                <div className="sr-side-step">
                  <div
                    className="sr-side-dot"
                    style={{
                      background: step >= s.id ? "rgba(255,255,255,0.96)" : "rgba(255,255,255,0.2)",
                      boxShadow: step >= s.id ? "0 4px 12px rgba(0,0,0,0.15)" : "none",
                    }}
                  >
                    {step > s.id ? "✅" : s.icon}
                  </div>
                  <div>
                    <div className="fw-bold" style={{ color: step >= s.id ? "#fff" : "rgba(255,255,255,0.55)", fontSize: "0.9rem", lineHeight: 1.2 }}>
                      Step {s.id}: {s.label}
                    </div>
                    <div style={{ fontSize: "0.73rem", fontWeight: 600, color: step >= s.id ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.4)" }}>
                      {step > s.id ? "Completed" : step === s.id ? "In progress..." : "Pending"}
                    </div>
                  </div>
                </div>
                {s.id < STEPS.length && <div className="sr-side-line" />}
              </div>
            ))}
          </div>

          <Stack gap={2} className="my-4">
            {LEFT_FEATURES.map(({ icon, title, desc }) => (
              <div key={title} className="sr-feature-card d-flex align-items-center gap-3 p-3">
                <span className="sr-feature-icon">{icon}</span>
                <div className="text-white">
                  <div className="fw-bold" style={{ fontSize: "0.88rem" }}>{title}</div>
                  <div style={{ fontSize: "0.76rem", opacity: 0.8 }}>{desc}</div>
                </div>
              </div>
            ))}
          </Stack>

          <div className="text-white" style={{ opacity: 0.75, fontSize: "0.8rem", fontWeight: 700 }}>
            ⭐ Rated #1 Seller Platform in India — 2024
          </div>
        </Col>

        {/* ── RIGHT FORM PANEL ── */}
        <Col xs={12} lg={8} className="d-flex flex-column">
          <div className="sr-mobile-brand d-lg-none">🛍️ ShopEase Seller</div>

          <div className="flex-grow-1 d-flex align-items-start justify-content-center p-3 p-md-4 p-lg-5 sr-pull">
            <div style={{ width: "100%", maxWidth: 640 }}>
              <Card className="sr-card p-4 p-md-5">

                {/* Overall Progress */}
                <div className="mb-2 d-flex justify-content-between align-items-center">
                  <span className="fw-bold text-muted" style={{ fontSize: "0.76rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Registration progress
                  </span>
                  <span className="fw-bold" style={{ fontSize: "0.82rem", color: "var(--primary)" }}>
                    Step {step} of {STEPS.length}
                  </span>
                </div>
                <ProgressBar now={progress} className="sr-progress" />

                <StepIndicator current={step} />

                {apiError && (
                  <Alert variant="danger" className="rounded-4 border-0 mb-3" onClose={() => setApiError(null)} dismissible>
                    ❌ {apiError}
                  </Alert>
                )}

                <div key={step} className="sr-step-anim">
                  <div className="sr-section-title">{title}</div>
                  <div className="sr-section-sub">{sub}</div>

                  {/* ══ STEP 1 — BASIC INFO ══ */}
                  {step === 1 && (
                    <>
                      <Field label="Full name *" icon="🙍" error={errors.name}>
                        <Form.Control
                          className={ic(errors.name, true)}
                          placeholder="Rahul Sharma"
                          autoComplete="name"
                          {...register("name", { required: "Full name is required" })}
                        />
                      </Field>

                      <Field label="Email address *" icon="✉️" error={errors.email}>
                        <Form.Control
                          type="email"
                          className={ic(errors.email, true)}
                          placeholder="rahul@example.com"
                          autoComplete="email"
                          {...register("email", {
                            required: "Email is required",
                            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email" },
                          })}
                        />
                      </Field>

                      <Field label="Password *" icon="🔒" error={errors.password} className="mb-1">
                        <Form.Control
                          className={ic(errors.password, true, "has-eye")}
                          type={showPwd ? "text" : "password"}
                          placeholder="Min. 6 characters"
                          autoComplete="new-password"
                          {...register("password", {
                            required: "Password is required",
                            minLength: { value: 6, message: "Minimum 6 characters" },
                          })}
                        />
                        <button type="button" className="sr-eye" onClick={() => setShowPwd((v) => !v)} aria-label={showPwd ? "Hide password" : "Show password"}>
                          {showPwd ? "🙈" : "👁️"}
                        </button>
                      </Field>

                      {strength && (
                        <div className="mb-3 mt-2">
                          <ProgressBar now={strength.now} variant={strength.variant} style={{ height: 5, borderRadius: 8 }} />
                          <div className="mt-1 fw-bold" style={{ fontSize: "0.76rem", color: STRENGTH_COLOR[strength.variant] }}>
                            Strength: {strength.label}
                          </div>
                        </div>
                      )}

                      <Field label="Phone number *" icon="📞" error={errors.phone} className="mb-3 mt-3">
                        <Form.Control
                          className={ic(errors.phone, true)}
                          placeholder="9876543210"
                          maxLength={10}
                          inputMode="numeric"
                          autoComplete="tel-national"
                          {...register("phone", {
                            required: "Phone number is required",
                            pattern: { value: /^\d{10}$/, message: "Enter valid 10-digit number" },
                          })}
                        />
                      </Field>

                      <Row className="g-3 mb-3">
                        <Col sm={6}>
                          <Field label="Gender" className="">
                            <Form.Select className={ic(errors.gender)} {...register("gender")}>
                              <option value="">Select gender...</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </Form.Select>
                          </Field>
                        </Col>
                        <Col sm={6}>
                          <Field label="Date of birth" className="">
                            <Form.Control type="date" className={ic(errors.dob)} {...register("dob")} />
                          </Field>
                        </Col>
                      </Row>

                      <SignatureUpload
                        register={register}
                        watch={watch}
                        error={errors.seller_signature_image}
                      />

                      <div className="sr-note">🎁 Register now &amp; sell commission-free for 3 months!</div>
                    </>
                  )}

                  {/* ══ STEP 2 — BUSINESS INFO ══ */}
                  {step === 2 && (
                    <>
                      <Field label="Business name *" icon="🏢" error={errors.business_name}>
                        <Form.Control
                          className={ic(errors.business_name, true)}
                          placeholder="Rahul Enterprises"
                          {...register("business_name", { required: "Business name is required" })}
                        />
                      </Field>

                      <Row className="g-3 mb-3">
                        <Col sm={6}>
                          <Field label="Business type *" error={errors.business_type} className="">
                            <Form.Select className={ic(errors.business_type)} {...register("business_type", { required: "Select business type" })}>
                              <option value="">Select type...</option>
                              {["Individual", "Company", "Freelancer", "Partnership", "LLP"].map((t) => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </Form.Select>
                          </Field>
                        </Col>
                        <Col sm={6}>
                          <Field label="Product category *" error={errors.category} className="">
                            <Form.Select className={ic(errors.category)} {...register("category", { required: "Select a category" })}>
                              <option value="">Select category...</option>
                              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                            </Form.Select>
                          </Field>
                        </Col>
                      </Row>

                      <Field label="Years of experience *" icon="📅" error={errors.experience}>
                        <Form.Control
                          type="number"
                          className={ic(errors.experience, true)}
                          placeholder="e.g. 3"
                          min={0}
                          max={60}
                          {...register("experience", {
                            required: "Experience is required",
                            min: { value: 0, message: "Cannot be negative" },
                          })}
                        />
                      </Field>

                      <Field label="Website (optional)" icon="🌐" error={errors.website}>
                        <Form.Control
                          className={ic(errors.website, true)}
                          placeholder="https://example.com"
                          {...register("website")}
                        />
                      </Field>

                      <Field label="Bio (optional)" error={errors.bio}>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          className={ic(errors.bio)}
                          placeholder="A short bio about yourself as a seller"
                          {...register("bio")}
                        />
                      </Field>

                      <Field label="Store description *" error={errors.store_description} className="mb-4">
                        <Form.Control
                          as="textarea"
                          rows={4}
                          className={ic(errors.store_description)}
                          placeholder="Describe your business, products you sell, your strengths..."
                          maxLength={500}
                          {...register("store_description", {
                            required: "Description is required",
                            maxLength: { value: 500, message: "Max 500 characters" },
                          })}
                        />
                        <div className="text-end text-muted mt-1" style={{ fontSize: "0.75rem", fontWeight: 700 }}>
                          {(watch("store_description") || "").length} / 500
                        </div>
                      </Field>
                    </>
                  )}

                  {/* ══ STEP 3 — ADDRESS ══ */}
                  {step === 3 && (
                    <>
                      <Row className="g-3 mb-3">
                        <Col sm={6}>
                          <Field label="Country *" error={errors.country} className="">
                            <Form.Select className={ic(errors.country)} {...register("country", { required: "Select country" })}>
                              <option value="">Select country...</option>
                              {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                            </Form.Select>
                          </Field>
                        </Col>
                        <Col sm={6}>
                          <Field label="State *" error={errors.state} className="">
                            {watchedCountry === "India" ? (
                              <Form.Select className={ic(errors.state)} {...register("state", { required: "State is required" })}>
                                <option value="">Select state...</option>
                                {INDIA_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                              </Form.Select>
                            ) : (
                              <Form.Control
                                className={ic(errors.state)}
                                placeholder="Enter your state"
                                {...register("state", { required: "State is required" })}
                              />
                            )}
                          </Field>
                        </Col>
                      </Row>

                      <Row className="g-3 mb-3">
                        <Col sm={6}>
                          <Field label="City *" icon="🏙️" error={errors.city} className="">
                            <Form.Control
                              className={ic(errors.city, true)}
                              placeholder="Mumbai"
                              {...register("city", { required: "City is required" })}
                            />
                          </Field>
                        </Col>
                        <Col sm={6}>
                          <Field label="Pincode *" icon="📮" error={errors.pincode} className="">
                            <Form.Control
                              className={ic(errors.pincode, true)}
                              placeholder="400001"
                              maxLength={6}
                              inputMode="numeric"
                              {...register("pincode", {
                                required: "Pincode is required",
                                pattern: { value: /^\d{6}$/, message: "Enter valid 6-digit pincode" },
                              })}
                            />
                          </Field>
                        </Col>
                      </Row>

                      <Field label="Full address *" error={errors.address_line_1} className="mb-4">
                        <Form.Control
                          as="textarea"
                          rows={3}
                          className={ic(errors.address_line_1)}
                          placeholder="Shop No., Building, Street, Area..."
                          {...register("address_line_1", { required: "Full address is required" })}
                        />
                      </Field>
                    </>
                  )}

                  {/* ══ STEP 4 — PAYMENT & KYC ══ */}
                  {step === 4 && (
                    <>
                      <div className="sr-note info">
                        <span>🔐</span>
                        <span>Your data is 256-bit SSL encrypted. We never share your info.</span>
                      </div>

                      <Row className="g-3 mb-3">
                        <Col sm={6}>
                          <Field label="Account number *" icon="🏦" error={errors.account_number} className="">
                            <Form.Control
                              className={ic(errors.account_number, true, "sr-sensitive")}
                              placeholder="123456789012"
                              maxLength={18}
                              inputMode="numeric"
                              {...register("account_number", {
                                required: "Account number is required",
                                pattern: { value: /^\d{9,18}$/, message: "Enter valid account number (9–18 digits)" },
                              })}
                            />
                          </Field>
                        </Col>
                        <Col sm={6}>
                          <Field label="IFSC code *" icon="🔖" error={errors.ifsc} className="">
                            <Form.Control
                              className={ic(errors.ifsc, true, "sr-upper")}
                              placeholder="SBIN0001234"
                              maxLength={11}
                              {...register("ifsc", {
                                required: "IFSC code is required",
                                pattern: { value: /^[A-Za-z]{4}0[A-Za-z0-9]{6}$/, message: "Enter valid IFSC code" },
                              })}
                            />
                          </Field>
                        </Col>
                      </Row>

                      <Row className="g-3 mb-3">
                        <Col sm={6}>
                          <Field label="Account holder name *" icon="👤" error={errors.account_holder} className="">
                            <Form.Control
                              className={ic(errors.account_holder, true)}
                              placeholder="As per bank records"
                              {...register("account_holder", { required: "Account holder name is required" })}
                            />
                          </Field>
                        </Col>
                        <Col sm={6}>
                          <Field label="Bank name" className="">
                            <Form.Control className={ic(errors.bank_name)} placeholder="e.g. HDFC Bank" {...register("bank_name")} />
                          </Field>
                        </Col>
                      </Row>

                      <Row className="g-3 mb-3">
                        <Col sm={6}>
                          <Field label="Account type" className="">
                            <Form.Select className={ic(errors.account_type)} {...register("account_type")}>
                              <option value="Savings">Savings</option>
                              <option value="Current">Current</option>
                              <option value="Business">Business</option>
                            </Form.Select>
                          </Field>
                        </Col>
                        <Col sm={6}>
                          <Field label="UPI ID (optional)" icon="📲" error={errors.upi_id} className="">
                            <Form.Control
                              className={ic(errors.upi_id, true)}
                              placeholder="rahul@upi"
                              {...register("upi_id", {
                                pattern: { value: /^[\w.\-_]{3,}@[a-zA-Z]{3,}$/, message: "Enter valid UPI ID" },
                              })}
                            />
                          </Field>
                        </Col>
                      </Row>

                      <Row className="g-3 mb-4">
                        <Col sm={6}>
                          <Field label="PAN number *" icon="🪪" error={errors.pan} className="">
                            <Form.Control
                              className={ic(errors.pan, true, "sr-upper")}
                              placeholder="ABCDE1234F"
                              maxLength={10}
                              {...register("pan", {
                                required: "PAN number is required",
                                pattern: { value: /^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$/, message: "Enter valid PAN number" },
                              })}
                            />
                          </Field>
                        </Col>
                        <Col sm={6}>
                          <Field label="GSTIN (optional)" error={errors.gstin} className="">
                            <Form.Control
                              className={ic(errors.gstin, false, "sr-upper")}
                              placeholder="22AAAAA0000A1Z5"
                              maxLength={15}
                              {...register("gstin", {
                                pattern: { value: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, message: "Enter valid GSTIN" },
                              })}
                            />
                          </Field>
                        </Col>
                      </Row>

                      {/* Summary */}
                      <div className="sr-summary">
                        <div className="sr-summary-title">📋 Registration summary</div>
                        <Row className="g-2">
                          {[
                            ["Seller name", watch("name")],
                            ["Email", watch("email")],
                            ["Business", watch("business_name")],
                            ["Type", watch("business_type")],
                            ["Category", watch("category")],
                            ["Location", [watch("city"), watch("state")].filter(Boolean).join(", ")],
                          ].map(([label, val]) =>
                            val ? (
                              <Col xs={6} key={label}>
                                <small>{label}</small>
                                <b>{val}</b>
                              </Col>
                            ) : null
                          )}
                        </Row>
                      </div>
                    </>
                  )}
                </div>

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
                    <Button className="sr-btn-main" onClick={next} type="button" style={{ minWidth: 140 }}>
                      Next step →
                    </Button>
                  ) : (
                    <Button className="sr-btn-main" type="submit" disabled={loading} style={{ minWidth: 190 }}>
                      {loading ? "⏳ Submitting..." : "🚀 Submit & register"}
                    </Button>
                  )}
                </div>

                <div className="d-flex justify-content-center gap-3 flex-wrap mt-4">
                  {["🔒 SSL Secure", "✅ KYC Verified", "🏆 Trusted Platform"].map((b) => (
                    <span key={b} className="text-muted fw-bold" style={{ fontSize: "0.72rem" }}>{b}</span>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </Col>
      </Form>
    </Container>
  );
}