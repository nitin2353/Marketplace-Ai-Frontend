import { useEffect, useState } from "react";
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
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { formResetData } from "../../../helper/FormDefaults";
import authApi from "../../../api/authApi";
import toast from "react-hot-toast";
import GlobalLoader from '../../../components/GlobalLoader';
import './register.css'


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

export default function Register() {
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const navigate = useNavigate();

    // FIX 2: Single source of truth — everything goes through react-hook-form
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm({ defaultValues: {}, mode: "onChange" });


    // FIX 3: Watch password live so strength bar and confirm-match validation both work
    const passwordValue = watch("password");
    const strength = passwordStrength(passwordValue);

    // FIX 4: onSubmit now properly receives form data and sets submitted state
    const onSubmit = async (payload) => {
        setLoading(true);
        try {
            const res = await authApi?.signupCustomer(payload)
            if (res.success) {
                toast.success(res.message || "Your Account successfully Created");
                localStorage.setItem('token', res.token)
            }
            setLoading(false);
        } catch (err) {
            console.error("Registration error:", err);
            toast.error(res.message || "Something went wrong!!");
        } finally {
            setSubmitted(true)
        }
    };

    const handleLogin = () => {
        navigate("/customer/login");
    };

    // ── SUCCESS STATE ──
    if (submitted) {
        return (
            <Container fluid className="eco-hero d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
                <Card className="eco-card text-center p-5" style={{ maxWidth: 440 }}>
                    <div className="eco-success-ring mb-3">🎉</div>
                    <h2 className="fw-bold mb-2" style={{ fontFamily: "Nunito", fontSize: "1.9rem" }}>You're In!</h2>
                    <p className="text-muted mb-3">Your ShopEase account is ready. Start exploring thousands of products!</p>
                    <Alert variant="warning" className="rounded-4 border-0 fw-bold py-2">
                        🎁 ₹200 welcome coupon has been added to your wallet!
                    </Alert>
                    <Button className="eco-btn-main w-100 text-white mt-2" onClick={() => navigate('/dashboard/')}>Start Shopping →</Button>
                    <div className="mt-3">
                        <small className="text-muted">Check your email for verification link</small>
                    </div>
                </Card>
            </Container>
        );
    }

    // ── MAIN FORM ──
    return (
        <Container fluid className="p-0" style={{ minHeight: "100vh", background: "#f1f4ff" }}>
            {loading && <GlobalLoader />}
            {/* FIX 5: onSubmit wired to the <Form> tag, not the button's onClick */}
            <Form className="g-0 d-flex" style={{ minHeight: "100vh" }} onSubmit={handleSubmit(onSubmit)}>

                {/* ── LEFT PANEL ── */}
                <Col lg={5} className="eco-hero d-none d-lg-flex flex-column justify-content-between p-5">
                    {/* Brand */}
                    <div>
                        <div className="text-white fw-black mb-1" style={{ fontFamily: "Nunito", fontSize: "2.4rem", fontWeight: 900 }}>
                            🛍️ ShopEase
                        </div>
                        <div className="text-white fw-semibold mb-4" style={{ opacity: 0.88, fontSize: "1rem" }}>
                            India's Most Loved Shopping App
                        </div>
                    </div>

                    {/* Feature Cards */}
                    <Stack gap={3} className="flex-grow-1 justify-content-center">
                        {[
                            { icon: "🚚", title: "Free Delivery", desc: "On orders above ₹499" },
                            { icon: "↩️", title: "Easy 30-Day Returns", desc: "No questions asked" },
                            { icon: "🔐", title: "100% Secure Payments", desc: "PCI DSS compliant" },
                            { icon: "🎁", title: "Exclusive Member Deals", desc: "Up to 80% off every day" },
                        ].map(({ icon, title, desc }) => (
                            <div key={title} className="eco-feature-card d-flex align-items-center gap-3 p-3">
                                <div style={{ fontSize: "1.8rem", lineHeight: 1 }}>{icon}</div>
                                <div className="text-white">
                                    <div className="fw-bold" style={{ fontSize: "0.92rem" }}>{title}</div>
                                    <div style={{ fontSize: "0.78rem", opacity: 0.8 }}>{desc}</div>
                                </div>
                            </div>
                        ))}
                    </Stack>

                    {/* Category tags */}
                    <div className="d-flex flex-wrap gap-2 mt-4">
                        {["Electronics", "Fashion", "Home & Living", "Beauty", "Sports", "Grocery"].map(tag => (
                            <Badge key={tag} bg="light" text="dark" className="rounded-pill px-3 py-2 fw-semibold" style={{ opacity: 0.85, fontSize: "0.78rem" }}>
                                {tag}
                            </Badge>
                        ))}
                    </div>

                    {/* Social proof */}
                    <div className="mt-4 text-white" style={{ opacity: 0.75, fontSize: "0.82rem" }}>
                        ⭐ Trusted by 2 Crore+ happy customers across India
                    </div>
                </Col>

                {/* ── RIGHT FORM PANEL ── */}
                <Col lg={7} className="d-flex align-items-center justify-content-center p-3 p-md-4 p-lg-5">
                    <div style={{ width: "100%", maxWidth: 510 }}>

                        {/* Mobile logo */}
                        <div className="d-lg-none text-center mb-4">
                            <div className="fw-black" style={{ fontFamily: "Nunito", fontSize: "2rem", color: "#ff6b35", fontWeight: 900 }}>
                                🛍️ ShopEase
                            </div>
                        </div>

                        <Card className="eco-card p-4 p-md-5">

                            {/* Heading */}
                            <div className="mb-4">
                                <h2 className="fw-bold mb-1" style={{ fontFamily: "Nunito", fontSize: "1.75rem", color: "#1a1a2e" }}>
                                    Create Account
                                </h2>
                                <div style={{ fontSize: "0.88rem", color: "#777" }}>
                                    Already registered?{" "}
                                    <span
                                        onClick={handleLogin}
                                        style={{ color: "#ff6b35", fontWeight: 700, textDecoration: "none", cursor: "pointer" }}
                                    >
                                        Sign In
                                    </span>
                                </div>
                            </div>

                            {/* Welcome offer banner */}
                            <Alert variant="warning" className="rounded-4 border-0 d-flex align-items-center gap-2 py-2 px-3 mb-4" style={{ background: "#fff8e6" }}>
                                <span style={{ fontSize: "1.1rem" }}>🎁</span>
                                <span className="fw-bold" style={{ fontSize: "0.85rem", color: "#92400e" }}>
                                    Sign up & get ₹200 cashback on your first order!
                                </span>
                            </Alert>

                            {/* First + Last Name */}
                            <Row className="g-3 mb-3">
                                <Col sm={6}>
                                    <Form.Label className="fw-bold text-secondary" style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                        First Name *
                                    </Form.Label>
                                    <Form.Control
                                        className={`eco-input ${errors.first_name ? "is-invalid" : ""}`}
                                        placeholder="Rahul"
                                        {...register("first_name", { required: "First name is required" })}
                                    />
                                    {errors.first_name && (
                                        <div className="invalid-feedback d-block">{errors.first_name.message}</div>
                                    )}
                                </Col>
                                <Col sm={6}>
                                    <Form.Label className="fw-bold text-secondary" style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                        Last Name *
                                    </Form.Label>
                                    <Form.Control
                                        className={`eco-input ${errors.last_name ? "is-invalid" : ""}`}
                                        placeholder="Sharma"
                                        {...register("last_name", { required: "Last name is required" })}
                                    />
                                    {errors.last_name && (
                                        <div className="invalid-feedback d-block">{errors.last_name.message}</div>
                                    )}
                                </Col>
                            </Row>

                            {/* Email */}
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold text-secondary" style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                    Email Address *
                                </Form.Label>
                                <InputGroup>
                                    <InputGroup.Text style={{ border: "2px solid #e8eaf6", borderRight: "none", borderRadius: "12px 0 0 12px", background: "#f8f9ff" }}>
                                        ✉️
                                    </InputGroup.Text>
                                    <Form.Control
                                        className={`eco-input ${errors.email ? "is-invalid" : ""}`}
                                        style={{ borderRadius: "0 12px 12px 0", borderLeft: "none" }}
                                        type="email"
                                        placeholder="rahul@example.com"
                                        {...register("email", {
                                            required: "Email is required",
                                            pattern: {
                                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                                message: "Enter a valid email address",
                                            },
                                        })}
                                    />
                                </InputGroup>
                                {errors.email && (
                                    <div className="text-danger mt-1" style={{ fontSize: "0.8rem" }}>{errors.email.message}</div>
                                )}
                            </Form.Group>

                            {/* Phone */}
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold text-secondary" style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                    Mobile Number *
                                </Form.Label>
                                <InputGroup>
                                    <InputGroup.Text style={{ border: "2px solid #e8eaf6", borderRight: "none", borderRadius: "12px 0 0 12px", background: "#f8f9ff", fontWeight: 700, color: "#555" }}>
                                        🇮🇳 +91
                                    </InputGroup.Text>
                                    <Form.Control
                                        className={`eco-input ${errors.mobile ? "is-invalid" : ""}`}
                                        style={{ borderRadius: "0 12px 12px 0", borderLeft: "none" }}
                                        type="tel"
                                        placeholder="0000000000"
                                        maxLength={10}
                                        {...register("phone", {
                                            required: "Mobile number is required",
                                            pattern: {
                                                value: /^\d{10}$/,
                                                message: "Enter a valid 10-digit mobile number",
                                            },
                                        })}
                                    />
                                </InputGroup>
                                {errors.mobile && (
                                    <div className="text-danger mt-1" style={{ fontSize: "0.8rem" }}>{errors.mobile.message}</div>
                                )}
                            </Form.Group>

                            {/* FIX 6: Gender radios now each have a unique `value` prop */}
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold text-secondary d-block mb-2" style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                    Gender *
                                </Form.Label>
                                <div className="d-flex gap-4">
                                    {["Male", "Female", "Other"].map((g) => (
                                        <Form.Check
                                            key={g}
                                            inline
                                            type="radio"
                                            label={g}
                                            value={g}
                                            className="fw-semibold"
                                            {...register("gender", { required: "Please select your gender" })}
                                        />
                                    ))}
                                </div>
                                {errors.gender && (
                                    <div className="text-danger mt-1" style={{ fontSize: "0.8rem" }}>{errors.gender.message}</div>
                                )}
                            </Form.Group>

                            {/* Password */}
                            <Form.Group className="mb-1">
                                <Form.Label className="fw-bold text-secondary" style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                    Password *
                                </Form.Label>
                                <InputGroup>
                                    <Form.Control
                                        className={`eco-input ${errors.password ? "is-invalid" : ""}`}
                                        style={{ borderRadius: "12px 0 0 12px" }}
                                        type={showPass ? "text" : "password"}
                                        placeholder="Min. 6 characters"
                                        {...register("password", {
                                            required: "Password is required",
                                            minLength: {
                                                value: 6,
                                                message: "Password must be at least 6 characters",
                                            },
                                        })}
                                    />
                                    <Button
                                        variant="outline-secondary"
                                        style={{ borderRadius: "0 12px 12px 0", border: "2px solid #e8eaf6", borderLeft: "none" }}
                                        type="button"
                                        onClick={() => setShowPass((s) => !s)}
                                    >
                                        {showPass ? "🙈" : "👁️"}
                                    </Button>
                                </InputGroup>
                                {errors.password && (
                                    <div className="text-danger mt-1" style={{ fontSize: "0.8rem" }}>{errors.password.message}</div>
                                )}
                            </Form.Group>

                            {/* FIX 7: Strength bar now reads from RHF watch("password"), updates live */}
                            {strength && (
                                <div className="mb-3 mt-2">
                                    <ProgressBar
                                        now={strength.now}
                                        variant={strength.variant}
                                        style={{ height: 6, borderRadius: 8 }}
                                    />
                                    <div
                                        className="mt-1 fw-bold"
                                        style={{
                                            fontSize: "0.77rem",
                                            color:
                                                strength.variant === "danger"
                                                    ? "#dc3545"
                                                    : strength.variant === "warning"
                                                        ? "#f7931e"
                                                        : "#22c55e",
                                        }}
                                    >
                                        Strength: {strength.label}
                                    </div>
                                </div>
                            )}

                            {/* FIX 8: Confirm password now uses RHF with cross-field validate */}
                            <Form.Group className="mb-4">
                                <Form.Label className="fw-bold text-secondary" style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                    Confirm Password *
                                </Form.Label>
                                <InputGroup>
                                    <Form.Control
                                        className={`eco-input ${errors.confirm ? "is-invalid" : ""}`}
                                        style={{ borderRadius: "12px 0 0 12px" }}
                                        type={showConfirm ? "text" : "password"}
                                        placeholder="Re-enter your password"
                                        {...register("confirm", {
                                            required: "Please confirm your password",
                                            validate: (value) =>
                                                value === passwordValue || "Passwords do not match",
                                        })}
                                    />
                                    <Button
                                        variant="outline-secondary"
                                        type="button"
                                        style={{ borderRadius: "0 12px 12px 0", border: "2px solid #e8eaf6", borderLeft: "none" }}
                                        onClick={() => setShowConfirm((s) => !s)}
                                    >
                                        {showConfirm ? "🙈" : "👁️"}
                                    </Button>
                                </InputGroup>
                                {errors.confirm && (
                                    <div className="text-danger mt-1" style={{ fontSize: "0.8rem" }}>{errors.confirm.message}</div>
                                )}
                            </Form.Group>

                            {/* FIX 9: Checkboxes now registered with RHF */}
                            <Stack gap={2} className="mb-4">
                                <Form.Check
                                    type="checkbox"
                                    label={
                                        <span style={{ fontSize: "0.85rem" }}>
                                            I agree to ShopEase's{" "}
                                            <a href="#" style={{ color: "#ff6b35", fontWeight: 700, textDecoration: "none" }}>Terms of Service</a>
                                            {" & "}
                                            <a href="#" style={{ color: "#ff6b35", fontWeight: 700, textDecoration: "none" }}>Privacy Policy</a>
                                        </span>
                                    }
                                    {...register("agreed", { required: "You must accept Terms & Conditions" })}
                                />
                                {errors.agreed && (
                                    <div className="text-danger" style={{ fontSize: "0.8rem", marginTop: -4 }}>{errors.agreed.message}</div>
                                )}

                                <Form.Check
                                    type="checkbox"
                                    label={<span style={{ fontSize: "0.85rem" }}>📬 Notify me about deals, offers & new arrivals</span>}
                                    {...register("notify")}
                                />
                            </Stack>

                            {/* FIX 10: Button type="submit", no onClick needed — form's onSubmit handles it */}
                            <Button
                                type="submit"
                                className="eco-btn-main w-100 text-white mb-3"
                                disabled={loading}
                            >
                                {loading ? "⏳ Creating Your Account..." : "🚀 Create My Account — It's Free!"}
                            </Button>

                            {/* Divider */}
                            <div className="eco-divider mb-3">or continue with</div>

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

                            {/* Trust row */}
                            <div className="d-flex justify-content-center gap-3 flex-wrap">
                                {["🔒 SSL Encrypted", "✅ Verified Platform", "🏆 2Cr+ Customers"].map((b) => (
                                    <span key={b} className="text-muted fw-semibold" style={{ fontSize: "0.73rem" }}>{b}</span>
                                ))}
                            </div>

                        </Card>
                    </div>
                </Col>
            </Form>
        </Container>
    );
}