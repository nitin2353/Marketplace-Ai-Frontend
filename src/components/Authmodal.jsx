import { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import "../style/auth-modal.css";

export default function AuthModal({ show, onHide, redirectTo = "/" }) {
    const navigate = useNavigate();
    const [tab, setTab] = useState("login"); // login | signup
    const [isLoading, setIsLoading] = useState(false);

    const handleNavigate = (path) => {
        onHide?.();
        navigate(path);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        // Navigation hoga after successful login in the login page itself
        navigate("/auth/login", { state: { from: redirectTo } });
        setIsLoading(false);
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        navigate("/auth/signup", { state: { from: redirectTo } });
        setIsLoading(false);
    };

    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            backdrop="static"
            keyboard={false}
            className="auth-modal"
            size="md"
        >
            <Modal.Body className="auth-modal-body p-0">
                {/* Header with tabs */}
                <div className="auth-modal-header">
                    <div className="auth-modal-tabs">
                        <button
                            className={`auth-tab ${tab === "login" ? "active" : ""}`}
                            onClick={() => setTab("login")}
                        >
                            🔐 Login
                        </button>
                        <button
                            className={`auth-tab ${tab === "signup" ? "active" : ""}`}
                            onClick={() => setTab("signup")}
                        >
                            ✨ Sign Up
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="auth-modal-content">
                    {tab === "login" ? (
                        <LoginTab
                            onSubmit={handleLogin}
                            isLoading={isLoading}
                        />
                    ) : (
                        <SignupTab
                            onSubmit={handleSignup}
                            isLoading={isLoading}
                        />
                    )}
                </div>
            </Modal.Body>
        </Modal>
    );
}

// ── Login Tab ──────────────────────────────────────────────────────────────────
function LoginTab({ onSubmit, isLoading }) {
    const navigate = useNavigate();

    return (
        <div className="auth-form-wrap">
            <div className="auth-form-title">Welcome Back! 👋</div>
            <p className="auth-form-sub">Sign in to your account to continue</p>

            <form onSubmit={onSubmit} className="auth-form">
                <div className="auth-form-group">
                    <label className="auth-form-label">Email or Phone</label>
                    <input
                        type="text"
                        className="auth-form-input"
                        placeholder="your@email.com or 9876543210"
                        required
                    />
                </div>

                <div className="auth-form-group">
                    <label className="auth-form-label">Password</label>
                    <input
                        type="password"
                        className="auth-form-input"
                        placeholder="••••••••"
                        required
                    />
                </div>

                <div className="auth-form-remember">
                    <input type="checkbox" id="remember" />
                    <label htmlFor="remember">Remember me</label>
                </div>

                <button
                    type="submit"
                    className="auth-form-btn primary"
                    disabled={isLoading}
                >
                    {isLoading ? "⏳ Logging in…" : "🔓 Login"}
                </button>
            </form>

            <div className="auth-form-divider">or continue as</div>

            <div className="auth-social-btns">
                <button className="auth-social-btn google" title="Continue with Google">
                    <i className="fab fa-google" style={{ color: "#4285F4" }}></i> Google
                </button>
                <button className="auth-social-btn facebook" title="Continue with Facebook">
                    <i className="fab fa-facebook-f" style={{ color: "#1877F2" }}></i> Facebook
                </button>
            </div>

            <div className="auth-form-link">
                <span>Forgot password?</span>
                <a href="/auth/forgot-password">Reset here</a>
            </div>
        </div>
    );
}

// ── Signup Tab ─────────────────────────────────────────────────────────────────
function SignupTab({ onSubmit, isLoading }) {
    const [userType, setUserType] = useState("buyer"); // buyer | seller

    return (
        <div className="auth-form-wrap">
            <div className="auth-form-title">Join ShopEase! ✨</div>
            <p className="auth-form-sub">Create an account to get started</p>

            {/* User type selector */}
            <div className="auth-user-type">
                <button
                    type="button"
                    className={`auth-type-btn ${userType === "buyer" ? "active" : ""}`}
                    onClick={() => setUserType("buyer")}
                >
                    🛍️ Buyer
                </button>
                <button
                    type="button"
                    className={`auth-type-btn ${userType === "seller" ? "active" : ""}`}
                    onClick={() => setUserType("seller")}
                >
                    🏪 Seller
                </button>
            </div>

            <form onSubmit={onSubmit} className="auth-form">
                <div className="auth-form-group">
                    <label className="auth-form-label">Full Name</label>
                    <input
                        type="text"
                        className="auth-form-input"
                        placeholder="John Doe"
                        required
                    />
                </div>

                <div className="auth-form-group">
                    <label className="auth-form-label">Email</label>
                    <input
                        type="email"
                        className="auth-form-input"
                        placeholder="your@email.com"
                        required
                    />
                </div>

                <div className="auth-form-group">
                    <label className="auth-form-label">Phone</label>
                    <input
                        type="tel"
                        className="auth-form-input"
                        placeholder="9876543210"
                        required
                    />
                </div>

                <div className="auth-form-group">
                    <label className="auth-form-label">Password</label>
                    <input
                        type="password"
                        className="auth-form-input"
                        placeholder="Min 8 characters"
                        required
                    />
                </div>

                {userType === "seller" && (
                    <div className="auth-seller-note">
                        ℹ️ You'll be able to set up your store after registration
                    </div>
                )}

                <div className="auth-form-terms">
                    <input type="checkbox" id="terms" required />
                    <label htmlFor="terms">
                        I agree to the <a href="/terms">Terms & Conditions</a>
                    </label>
                </div>

                <button
                    type="submit"
                    className="auth-form-btn primary"
                    disabled={isLoading}
                >
                    {isLoading ? "⏳ Creating account…" : "✨ Sign Up"}
                </button>
            </form>

            <div className="auth-form-divider">or sign up with</div>

            <div className="auth-social-btns">
                <button className="auth-social-btn google" title="Sign up with Google">
                    <i className="fab fa-google" style={{ color: "#4285F4" }}></i> Google
                </button>
                <button className="auth-social-btn facebook" title="Sign up with Facebook">
                    <i className="fab fa-facebook-f" style={{ color: "#1877F2" }}></i> Facebook
                </button>
            </div>
        </div>
    );
}