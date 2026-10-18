import { useState } from "react";
import { Container, Row, Col, Card, Form, Button, Stack, ProgressBar } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import authApi from "../../../api/authApi";
import toast from "react-hot-toast";
import GlobalLoader from "../../../components/GlobalLoader";
import "./register.css";

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

const FEATURES = [
    { icon: "🚚", title: "Free Delivery", desc: "On orders above ₹499" },
    { icon: "↩️", title: "Easy 30-Day Returns", desc: "No questions asked" },
    { icon: "🔐", title: "100% Secure Payments", desc: "PCI DSS compliant" },
    { icon: "🎁", title: "Exclusive Member Deals", desc: "Up to 80% off every day" },
];

// Small helper: label + (optional) icon + input + error, so the form stays readable
function Field({ label, icon, prefix, error, children, className = "mb-3" }) {
    return (
        <Form.Group className={className}>
            <Form.Label className="eco-label">{label}</Form.Label>
            <div className="eco-field">
                {icon && <span className="eco-field-icon">{icon}</span>}
                {prefix && <span className="eco-prefix">{prefix}</span>}
                {children}
            </div>
            {error && <div className="eco-err">{error.message}</div>}
        </Form.Group>
    );
}

const inputCls = (error, extra = "") => `eco-input ${error ? "is-invalid" : ""} ${extra}`;

export default function Register() {
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const navigate = useNavigate();

    // Single source of truth — everything goes through react-hook-form
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm({ defaultValues: {}, mode: "onChange" });

    // Watch password live so the strength meter and confirm-match validation both work
    const passwordValue = watch("password");
    const strength = passwordStrength(passwordValue);

    const onSubmit = async (payload) => {
        setLoading(true);
        try {
            const res = await authApi?.signupCustomer(payload);
            if (res.success) {
                toast.success(res.message || "Your Account successfully Created");
                localStorage.setItem("token", res.token);
                setSubmitted(true); // only show the success screen when signup really worked
            } else {
                toast.error(res.message || "Something went wrong!!");
            }
        } catch (err) {
            console.error("Registration error:", err);
            toast.error(err?.message || "Something went wrong!!");
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = () => navigate("/customer/login");

    // ── SUCCESS STATE ──
    if (submitted) {
        return (
            <Container fluid className="eco-hero d-flex align-items-center justify-content-center p-3" style={{ minHeight: "100vh" }}>
                <Card className="eco-card text-center p-4 p-md-5" style={{ maxWidth: 440, width: "100%" }}>
                    <div className="eco-success-ring mb-4">🎉</div>
                    <h2 className="eco-title mb-2">You're in!</h2>
                    <p className="text-muted mb-3 fw-semibold">
                        Your ShopEase account is ready. Start exploring thousands of products!
                    </p>
                    <div className="eco-offer justify-content-center mb-3">
                        <span className="eco-offer-icon">🎁</span>
                        ₹200 welcome coupon has been added to your wallet!
                    </div>
                    <Button className="eco-btn-main w-100 text-white" onClick={() => navigate("/dashboard/")}>
                        Start Shopping →
                    </Button>
                    <div className="mt-3">
                        <small className="text-muted fw-semibold">Check your email for the verification link</small>
                    </div>
                </Card>
            </Container>
        );
    }

    // ── MAIN FORM ──
    return (
        <Container fluid className="p-0" style={{ minHeight: "100vh" }}>
            {loading && <GlobalLoader />}

            <Form className="d-flex" style={{ minHeight: "100vh" }} onSubmit={handleSubmit(onSubmit)} noValidate>

                {/* ── LEFT PANEL ── */}
                <Col lg={5} className="eco-hero d-none d-lg-flex flex-column justify-content-between p-5">
                    <div>
                        <div className="text-white mb-1" style={{ fontSize: "2.4rem", fontWeight: 900 }}>
                            🛍️ ShopEase
                        </div>
                        <div className="text-white fw-semibold mb-4" style={{ opacity: 0.9, fontSize: "1rem" }}>
                            India's Most Loved Shopping App
                        </div>
                        <div className="text-white" style={{ fontSize: "1.9rem", fontWeight: 900, lineHeight: 1.2, maxWidth: 380 }}>
                            Create your account and start saving today.
                        </div>
                    </div>

                    <Stack gap={3} className="flex-grow-1 justify-content-center py-4">
                        {FEATURES.map(({ icon, title, desc }) => (
                            <div key={title} className="eco-feature-card d-flex align-items-center gap-3 p-3">
                                <div className="eco-feature-icon">{icon}</div>
                                <div className="text-white">
                                    <div className="fw-bold" style={{ fontSize: "0.92rem" }}>{title}</div>
                                    <div style={{ fontSize: "0.78rem", opacity: 0.82 }}>{desc}</div>
                                </div>
                            </div>
                        ))}
                    </Stack>

                    <div className="text-white" style={{ opacity: 0.8, fontSize: "0.82rem", fontWeight: 700 }}>
                        ⭐ Trusted by 2 Crore+ happy customers across India
                    </div>
                </Col>

                {/* ── RIGHT FORM PANEL ── */}
                <Col xs={12} lg={7} className="d-flex flex-column">
                    <div className="eco-mobile-brand d-lg-none">🛍️ ShopEase</div>

                    <div className="flex-grow-1 d-flex align-items-center justify-content-center p-3 p-md-4 p-lg-5 eco-pull">
                        <div style={{ width: "100%", maxWidth: 510 }}>
                            <Card className="eco-card p-4 p-md-5">

                                <div className="mb-4">
                                    <h2 className="eco-title">Create account</h2>
                                    <div className="eco-sub">
                                        Already registered?{" "}
                                        <button type="button" className="eco-link" onClick={handleLogin}>Sign in</button>
                                    </div>
                                </div>

                                <div className="eco-offer">
                                    <span className="eco-offer-icon">🎁</span>
                                    Sign up &amp; get ₹200 cashback on your first order!
                                </div>

                                {/* First + Last Name */}
                                <Row className="g-3 mb-3">
                                    <Col sm={6}>
                                        <Field label="First name *" error={errors.first_name} className="">
                                            <Form.Control
                                                className={inputCls(errors.first_name)}
                                                placeholder="Rahul"
                                                autoComplete="given-name"
                                                {...register("first_name", { required: "First name is required" })}
                                            />
                                        </Field>
                                    </Col>
                                    <Col sm={6}>
                                        <Field label="Last name *" error={errors.last_name} className="">
                                            <Form.Control
                                                className={inputCls(errors.last_name)}
                                                placeholder="Sharma"
                                                autoComplete="family-name"
                                                {...register("last_name", { required: "Last name is required" })}
                                            />
                                        </Field>
                                    </Col>
                                </Row>

                                {/* Email */}
                                <Field label="Email address *" icon="✉️" error={errors.email}>
                                    <Form.Control
                                        className={inputCls(errors.email, "has-icon")}
                                        type="email"
                                        placeholder="rahul@example.com"
                                        autoComplete="email"
                                        {...register("email", {
                                            required: "Email is required",
                                            pattern: {
                                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                                message: "Enter a valid email address",
                                            },
                                        })}
                                    />
                                </Field>

                                {/* Phone — field is registered as "phone", so errors.phone (was errors.mobile) */}
                                <Field label="Mobile number *" prefix="🇮🇳 +91" error={errors.phone}>
                                    <Form.Control
                                        className={inputCls(errors.phone, "has-prefix")}
                                        type="tel"
                                        inputMode="numeric"
                                        placeholder="0000000000"
                                        maxLength={10}
                                        autoComplete="tel-national"
                                        {...register("phone", {
                                            required: "Mobile number is required",
                                            pattern: {
                                                value: /^\d{10}$/,
                                                message: "Enter a valid 10-digit mobile number",
                                            },
                                        })}
                                    />
                                </Field>

                                {/* Gender */}
                                <Form.Group className="mb-3">
                                    <Form.Label className="eco-label d-block">Gender *</Form.Label>
                                    <div className="eco-chips">
                                        {["Male", "Female", "Other"].map((g) => (
                                            <label key={g} className="eco-chip">
                                                <input
                                                    type="radio"
                                                    value={g}
                                                    {...register("gender", { required: "Please select your gender" })}
                                                />
                                                <span>{g}</span>
                                            </label>
                                        ))}
                                    </div>
                                    {errors.gender && <div className="eco-err">{errors.gender.message}</div>}
                                </Form.Group>

                                {/* Password */}
                                <Field label="Password *" icon="🔑" error={errors.password} className="mb-1">
                                    <Form.Control
                                        className={inputCls(errors.password, "has-icon has-eye")}
                                        type={showPass ? "text" : "password"}
                                        placeholder="Min. 6 characters"
                                        autoComplete="new-password"
                                        {...register("password", {
                                            required: "Password is required",
                                            minLength: { value: 6, message: "Password must be at least 6 characters" },
                                        })}
                                    />
                                    <button
                                        type="button"
                                        className="eco-eye"
                                        onClick={() => setShowPass((s) => !s)}
                                        aria-label={showPass ? "Hide password" : "Show password"}
                                    >
                                        {showPass ? "🙈" : "👁️"}
                                    </button>
                                </Field>

                                {strength && (
                                    <div className="mb-3">
                                        <ProgressBar
                                            now={strength.now}
                                            variant={strength.variant}
                                            style={{ height: 5, borderRadius: 8, marginTop: 8 }}
                                        />
                                        <div className="eco-strength-text" style={{ color: STRENGTH_COLOR[strength.variant] }}>
                                            Strength: {strength.label}
                                        </div>
                                    </div>
                                )}

                                {/* Confirm password */}
                                <Field label="Confirm password *" icon="🔐" error={errors.confirm} className="mb-4">
                                    <Form.Control
                                        className={inputCls(errors.confirm, "has-icon has-eye")}
                                        type={showConfirm ? "text" : "password"}
                                        placeholder="Re-enter your password"
                                        autoComplete="new-password"
                                        {...register("confirm", {
                                            required: "Please confirm your password",
                                            validate: (value) => value === passwordValue || "Passwords do not match",
                                        })}
                                    />
                                    <button
                                        type="button"
                                        className="eco-eye"
                                        onClick={() => setShowConfirm((s) => !s)}
                                        aria-label={showConfirm ? "Hide password" : "Show password"}
                                    >
                                        {showConfirm ? "🙈" : "👁️"}
                                    </button>
                                </Field>

                                {/* Checkboxes */}
                                <Stack gap={2} className="mb-4">
                                    <Form.Check
                                        className="eco-check"
                                        id="agreed"
                                        type="checkbox"
                                        label={
                                            <span>
                                                I agree to ShopEase's <a href="#">Terms of Service</a> &amp; <a href="#">Privacy Policy</a>
                                            </span>
                                        }
                                        {...register("agreed", { required: "You must accept Terms & Conditions" })}
                                    />
                                    {errors.agreed && <div className="eco-err" style={{ marginTop: -4 }}>{errors.agreed.message}</div>}

                                    <Form.Check
                                        className="eco-check"
                                        id="notify"
                                        type="checkbox"
                                        label="📬 Notify me about deals, offers & new arrivals"
                                        {...register("notify")}
                                    />
                                </Stack>

                                <Button type="submit" className="eco-btn-main w-100 text-white mb-3" disabled={loading}>
                                    {loading ? "⏳ Creating your account..." : "🚀 Create my account — it's free!"}
                                </Button>

                                <div className="eco-divider my-3"><span>or continue with</span></div>

                                {/* Social Auth */}
                                <Row className="g-2 mb-4">
                                    <Col xs={6}>
                                        <Button type="button" className="eco-social-btn w-100 d-flex align-items-center justify-content-center gap-2" variant="outline-secondary">
                                            <svg width="17" height="17" viewBox="0 0 48 48">
                                                <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.2l6.8-6.8C35.8 2.5 30.3 0 24 0 14.7 0 6.7 5.4 2.7 13.3l7.9 6.1C12.5 13.2 17.8 9.5 24 9.5z" />
                                                <path fill="#34A853" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.5 2.8-2.1 5.1-4.5 6.7l7.1 5.5c4.1-3.8 6.5-9.4 6.5-16.2z" />
                                                <path fill="#FBBC05" d="M10.6 28.6A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.7-4.6l-7.9-6.1A23.9 23.9 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l8-6.2z" />
                                                <path fill="#4285F4" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.1-5.5c-2.1 1.4-4.8 2.3-8.8 2.3-6.2 0-11.5-3.7-13.4-9.4l-8 6.2C6.7 42.6 14.7 48 24 48z" />
                                            </svg>
                                            Google
                                        </Button>
                                    </Col>
                                    <Col xs={6}>
                                        <Button type="button" className="eco-social-btn w-100 d-flex align-items-center justify-content-center gap-2" variant="outline-secondary">
                                            <svg width="17" height="17" viewBox="0 0 24 24" fill="#1877F2">
                                                <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.88v2.27h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07z" />
                                            </svg>
                                            Facebook
                                        </Button>
                                    </Col>
                                </Row>

                                <div className="eco-trust d-flex justify-content-center gap-3 flex-wrap">
                                    {["🔒 SSL Encrypted", "✅ Verified Platform", "🏆 2Cr+ Customers"].map((b) => (
                                        <span key={b}>{b}</span>
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