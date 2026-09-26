import { useState, useEffect, useCallback, useRef } from "react";
import { Row, Col, Stack, InputGroup, Container } from "react-bootstrap";
import toast from "react-hot-toast";
import JWTService from "../../config/jwt.config";       // apna path
import SellerSidebar from "../../components/SellerSidebar.jsx";
import SellerNavbar from "../../components/SellerNavbar.jsx";
import authApi from "../../api/authApi";
import userSettingsApi from "../../api/userSettings.api";
import { API_BASE_URL } from "../../helper/Constraints";
import "./Sellersettings.css";
import "../../style/Dashboard.css"
import {LogoutTab} from '../../helper/GlobalHelper';

const IMG_BASE = API_BASE_URL.replace("/api/v1", "/uploads/profiles/");

const NAV_ITEMS = [
    { key: "profile", icon: "👤", label: "Profile" },
    { key: "store", icon: "🏪", label: "Store Info" },
    { key: "security", icon: "🔒", label: "Security" },
    // { key: "notifications", icon: "🔔", label: "Notifications" },
    { key: "payments", icon: "💳", label: "Payments" },
    { key: "logout", icon: "🚪", label: "Logout" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const initials = (name = "") =>
    name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "SE";

const pwStrength = (pw) => {
    if (!pw) return { score: 0, label: "", color: "" };
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    const map = [
        { label: "Too weak", color: "#ef4444" },
        { label: "Weak", color: "#f97316" },
        { label: "Fair", color: "#eab308" },
        { label: "Good", color: "#22c55e" },
        { label: "Strong", color: "#16a34a" },
    ];
    return { score: s, ...map[s] };
};

// ── Reusable Field ────────────────────────────────────────────────────────────
function Field({ label, error, hint, children }) {
    return (
        <div>
            {label && <label className="ss-label">{label}</label>}
            {children}
            {error && <p className="ss-error">{error}</p>}
            {hint && <p style={{ fontSize: "0.73rem", color: "#9ca3af", fontWeight: 600, marginTop: 4 }}>{hint}</p>}
        </div>
    );
}

// ── Toggle Row ────────────────────────────────────────────────────────────────
function ToggleRow({ label, desc, checked, onChange }) {
    return (
        <div className="ss-toggle-row">
            <div>
                <div className="ss-toggle-label">{label}</div>
                {desc && <div className="ss-toggle-desc">{desc}</div>}
            </div>
            <label className="ss-switch">
                <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
                <span className="ss-switch-slider" />
            </label>
        </div>
    );
}

// ── Section Header ────────────────────────────────────────────────────────────
function SectionHead({ icon, title, action }) {
    return (
        <div className="ss-card-header">
            <div className="ss-card-title">{icon} {title}</div>
            {action}
        </div>
    );
}

// ════════════════════════════════════════════════════════════════════════════
// TAB: PROFILE
// ════════════════════════════════════════════════════════════════════════════
function ProfileTab({ seller, onSave, saving }) {
    const [form, setForm] = useState({
        first_name: "", last_name: "", email: "", mobile: "",
        bio: "", website: "", dob: "", gender: "",
    });
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const fileRef = useRef();

    useEffect(() => {
        if (!seller) return;
        setForm({
            first_name: seller.first_name || "",
            last_name: seller.last_name || "",
            email: seller.email || "",
            mobile: seller.mobile || seller.phone || "",
            bio: seller.bio || "",
            website: seller.website || "",
            dob: seller.dob || "",
            gender: seller.gender || "",
        });
        setAvatarPreview(seller.avatar || seller.profile_picture || null);
    }, [seller]);

    const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

    const handleAvatarChange = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        setAvatarFile(f);
        setAvatarPreview(URL.createObjectURL(f));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => fd.append(k, v));
        if (avatarFile) fd.append("avatar", avatarFile);
        await onSave(fd);
    };

    const displayName = `${form.first_name} ${form.last_name}`.trim() || "Seller";

    return (
        <form onSubmit={handleSubmit}>
            <Stack gap={4}>

                {/* Personal Info */}
                <div className="ss-card ss-fade ss-fade-2">
                    <SectionHead icon="👤" title="Personal Information" />
                    <div className="ss-card-body">
                        <Row className="g-3">
                            <Col md={6}>
                                <Field label="First Name">
                                    <input className="ss-input" value={form.first_name} onChange={set("first_name")} placeholder="John" />
                                </Field>
                            </Col>
                            <Col md={6}>
                                <Field label="Last Name">
                                    <input className="ss-input" value={form.last_name} onChange={set("last_name")} placeholder="Doe" />
                                </Field>
                            </Col>
                            <Col md={6}>
                                <Field label="Email Address">
                                    <input className="ss-input" type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" />
                                </Field>
                            </Col>
                            <Col md={6}>
                                <Field label="Mobile Number">
                                    <InputGroup>
                                        {/* <InputGroup.Text className="ss-addon ss-addon-l">+91</InputGroup.Text> */}
                                        <input className="ss-input" type="tel" value={form.mobile} onChange={set("mobile")} placeholder="9876543210" />
                                    </InputGroup>
                                </Field>
                            </Col>
                            <Col md={6}>
                                <Field label="Gender">
                                    <select className="ss-select" value={form.gender} onChange={set("gender")}>
                                        <option value="">Select</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                        <option value="prefer_not">Prefer not to say</option>
                                    </select>
                                </Field>
                            </Col>
                            <Col xs={12}>
                                <Field label="Bio" hint="Brief description about yourself, shown on your store page.">
                                    <textarea className="ss-textarea" value={form.bio} onChange={set("bio")} placeholder="Tell customers about yourself…" rows={3} />
                                </Field>
                            </Col>
                        </Row>
                    </div>
                </div>

                <div className="d-flex gap-2 justify-content-end">
                    <button type="submit" className="ss-btn-primary" disabled={saving}>
                        {saving ? "⏳ Saving…" : "💾 Save Profile"}
                    </button>
                </div>
            </Stack>
        </form>
    );
}

// ════════════════════════════════════════════════════════════════════════════
// TAB: STORE INFO
// ════════════════════════════════════════════════════════════════════════════
function StoreTab({ seller, onSave, saving }) {
    const [form, setForm] = useState({
        business_name: "", business_type: "", gstin: "", pan: "",
        store_description: "", city: "", state: "", pincode: "",
        address_line_1: "", country: "India",
    });

    useEffect(() => {
        if (!seller) return;
        setForm({
            business_name: seller.business_name || "",
            business_type: seller.business_type || "",
            gstin: seller.gstin || "",
            pan: seller.pan || "",
            store_description: seller.store_description || seller.description || "",
            city: seller.city || "",
            state: seller.state || "",
            pincode: seller.pincode || "",
            address_line_1: seller.address_line_1 || "",
            country: seller.country || "India",
        });
    }, [seller]);

    const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => fd.append(k, v));
        await onSave(fd);
    };

    return (
        <form onSubmit={handleSubmit}>
            <Stack gap={4}>

                <div className="ss-card ss-fade ss-fade-1">
                    <SectionHead icon="🏪" title="Store Details" />
                    <div className="ss-card-body">
                        <Row className="g-3">
                            <Col md={6}>
                                <Field label="Business / Store Name *">
                                    <input className="ss-input" value={form.business_name} onChange={set("business_name")} placeholder="My Awesome Store" />
                                </Field>
                            </Col>
                            <Col md={6}>
                                <Field label="Business Type">
                                    <select className="ss-select" value={form.business_type} onChange={set("business_type")}>
                                        <option value="">Select type</option>
                                        <option value="individual">Individual / Sole Proprietor</option>
                                        <option value="partnership">Partnership</option>
                                        <option value="pvt_ltd">Private Limited</option>
                                        <option value="llp">LLP</option>
                                        <option value="other">Other</option>
                                    </select>
                                </Field>
                            </Col>
                            <Col xs={12}>
                                <Field label="Store Description" hint="Appears on your public store page.">
                                    <textarea className="ss-textarea" value={form.store_description} onChange={set("store_description")} placeholder="What does your store specialise in?" rows={3} />
                                </Field>
                            </Col>
                        </Row>
                    </div>
                </div>

                <div className="ss-card ss-fade ss-fade-2">
                    <SectionHead icon="📄" title="Tax & Compliance" />
                    <div className="ss-card-body">
                        <Row className="g-3">
                            <Col md={6}>
                                <Field label="GSTIN" hint="15-digit Goods and Services Tax Identification Number">
                                    <input
                                        className={`ss-input ${form.gstin.toUpperCase() && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(form.gstin.toUpperCase()) ? 'is-invalid' : ''}`}
                                        value={form.gstin.toUpperCase()}
                                        onChange={set("gstin")}
                                        placeholder="22AAAAA0000A1Z5"
                                        maxLength={15}
                                        style={{ textTransform: "uppercase" }}
                                    />
                                </Field>
                            </Col>
                            <Col md={6}>
                                <Field label="PAN Number" hint="Permanent Account Number">
                                    <input
                                        className={`ss-input ${form.pan.toUpperCase() && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.pan.toUpperCase()) ? 'is-invalid' : ''}`}
                                        value={form.pan.toUpperCase()}
                                        onChange={set("pan")}
                                        placeholder="ABCDE1234F"
                                        maxLength={10}
                                        style={{ textTransform: "uppercase" }}
                                    />
                                </Field>
                            </Col>
                        </Row>
                    </div>
                </div>

                <div className="ss-card ss-fade ss-fade-3">
                    <SectionHead icon="📍" title="Store Address" />
                    <div className="ss-card-body">
                        <Row className="g-3">
                            <Col xs={12}>
                                <Field label="Address Line">
                                    <input className="ss-input" value={form.address_line_1} onChange={set("address_line_1")} placeholder="Street / Area / Locality" />
                                </Field>
                            </Col>
                            <Col md={4}>
                                <Field label="City">
                                    <input className="ss-input" value={form.city} onChange={set("city")} placeholder="Mumbai" />
                                </Field>
                            </Col>
                            <Col md={4}>
                                <Field label="State">
                                    <input className="ss-input" value={form.state} onChange={set("state")} placeholder="Maharashtra" />
                                </Field>
                            </Col>
                            <Col md={4}>
                                <Field label="Pincode">
                                    <input className="ss-input" value={form.pincode} onChange={set("pincode")} placeholder="400001" maxLength={6} />
                                </Field>
                            </Col>
                        </Row>
                    </div>
                </div>

                <div className="d-flex justify-content-end">
                    <button type="submit" className="ss-btn-primary" disabled={saving}>
                        {saving ? "⏳ Saving…" : "💾 Save Store Info"}
                    </button>
                </div>
            </Stack>
        </form>
    );
}

// ════════════════════════════════════════════════════════════════════════════
// TAB: SECURITY
// ════════════════════════════════════════════════════════════════════════════
function SecurityTab() {
    const [form, setForm] = useState({
        current_password: "",
        new_password: "",
        confirm_password: "",
    });

    const [show, setShow] = useState({
        current_password: false,
        new_password: false,
        confirm_password: false,
    });

    const [saving, setSaving] = useState(false);
    const strength = pwStrength(form.new_password);

    const set = (key) => (e) => {
        setForm((prev) => ({
            ...prev,
            [key]: e.target.value,
        }));
    };

    const flip = (key) => {
        setShow((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const currentPassword = form.current_password.trim();
        const newPassword = form.new_password.trim();
        const confirmPassword = form.confirm_password.trim();

        if (!currentPassword) {
            toast.error("Current password required");
            return;
        }

        if (!newPassword) {
            toast.error("New password required");
            return;
        }

        if (newPassword.length < 8) {
            toast.error("New password must be at least 8 characters");
            return;
        }

        if (currentPassword === newPassword) {
            toast.error("New password must be different from current password");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setSaving(true);

        try {
            const payload = {
                current_password: currentPassword,
                old_password: currentPassword,
                password: currentPassword,

                new_password: newPassword,
                newPassword: newPassword,

                confirm_password: confirmPassword,
                confirmPassword: confirmPassword,
            };

            const res = await authApi.changePassword(payload);

            if (res?.data?.success === false) {
                toast.error(res?.data?.message || "Failed to update password");
                return;
            }

            toast.success(res?.data?.message || "Password updated successfully!");

            setForm({
                current_password: "",
                new_password: "",
                confirm_password: "",
            });

            setShow({
                current_password: false,
                new_password: false,
                confirm_password: false,
            });
        } catch (err) {
            toast.error(
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                err?.message ||
                "Failed to update password"
            );
        } finally {
            setSaving(false);
        }
    };

    const renderPwField = (label, name) => (
        <Field label={label}>
            <div style={{ position: "relative" }}>
                <input
                    className="ss-input"
                    name={name}
                    type={show[name] ? "text" : "password"}
                    value={form[name]}
                    onChange={set(name)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    disabled={saving}
                    style={{ paddingRight: 44 }}
                />

                <button
                    type="button"
                    onClick={() => flip(name)}
                    disabled={saving}
                    style={{
                        position: "absolute",
                        right: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "1rem",
                        color: "#9ca3af",
                    }}
                >
                    {show[name] ? "🙈" : "👁️"}
                </button>
            </div>
        </Field>
    );

    return (
        <form onSubmit={handleSubmit}>
            <Stack gap={4}>
                <div className="ss-card ss-fade ss-fade-1">
                    <SectionHead icon="🔑" title="Change Password" />

                    <div className="ss-card-body">
                        <Row className="g-3">
                            <Col md={6}>
                                {renderPwField("Current Password", "current_password")}
                            </Col>

                            <Col md={6}>
                                {renderPwField("New Password", "new_password")}

                                {form.new_password && (
                                    <>
                                        <div
                                            className="ss-pw-strength"
                                            style={{
                                                background: strength.color,
                                                width: `${(strength.score / 4) * 100}%`,
                                            }}
                                        />
                                        <p className="ss-pw-label" style={{ color: strength.color }}>
                                            {strength.label}
                                        </p>
                                    </>
                                )}
                            </Col>

                            <Col md={6}>
                                {renderPwField("Confirm New Password", "confirm_password")}

                                {form.confirm_password &&
                                    form.new_password !== form.confirm_password && (
                                        <p className="ss-error">Passwords do not match</p>
                                    )}
                            </Col>
                        </Row>

                        <div className="ss-info mt-3">
                            🔒 Use at least 8 characters with a mix of uppercase, numbers and symbols.
                        </div>
                    </div>
                </div>

                <div className="d-flex justify-content-end">
                    <button type="submit" className="ss-btn-primary" disabled={saving}>
                        {saving ? "⏳ Updating…" : "🔐 Update Password"}
                    </button>
                </div>
            </Stack>
        </form>
    );
}

// ════════════════════════════════════════════════════════════════════════════
// TAB: NOTIFICATIONS
// ════════════════════════════════════════════════════════════════════════════
// function NotificationsTab({ seller }) {
//     const [prefs, setPrefs] = useState({
//         new_order: true,
//         order_cancelled: true,
//         payment_received: true,
//         low_stock: true,
//         out_of_stock: true,
//         new_review: true,
//         chat_messages: true,
//         weekly_summary: false,
//         email_notifications: true,
//         sms_notifications: false
//     });
//     const [saving, setSaving] = useState(false);

//     useEffect(() => {
//         if (seller?.notification_preferences) {
//             setPrefs(p => ({ ...p, ...seller.notification_preferences }));
//         }
//     }, [seller]);

//     const toggle = (k) => (v) => setPrefs(p => ({ ...p, [k]: v }));

//     const save = async () => {
//         setSaving(true);
//         try {
//             await userSettingsApi.updateNotificationPrefs(prefs);
//             toast.success("Notification preferences saved!");
//         } catch { toast.error("Failed to save preferences"); }
//         finally { setSaving(false); }
//     };

//     const SECTIONS = [
//         {
//             // title: "🔔 Order Notifications", key: "orders",
//             rows: [
//                 { k: "new_order", label: "New Order", desc: "When a new order is placed" },
//                 { k: "order_cancelled", label: "Order Cancelled", desc: "When an order is cancelled by customer" },
//                 { k: "payment_received", label: "Payment Received", desc: "When payment for an order is successful" },
//             ],
//         },
//         {
//             title: "📦 Inventory & Feedback", key: "inventory",
//             rows: [
//                 { k: "low_stock", label: "Low Stock Alert", desc: "When product stock falls below limit" },
//                 { k: "out_of_stock", label: "Out of Stock", desc: "When a product becomes unavailable" },
//                 { k: "new_review", label: "New Review", desc: "When a customer leaves a review" },
//             ],
//         },
//         {
//             title: "💬 Communication", key: "communication",
//             rows: [
//                 { k: "chat_messages", label: "Chat Messages", desc: "Get notified when a customer messages you" },
//                 { k: "weekly_summary", label: "Weekly Summary", desc: "Weekly performance digest" },
//             ],
//         },
//         // {
//         //     title: "📧 External Notifications", key: "external",
//         //     rows: [
//         //         { k: "email_notifications", label: "Email Notifications", desc: "Receive important updates via email" },
//         //         { k: "sms_notifications", label: "SMS Notifications", desc: "Receive urgent alerts via SMS" },
//         //     ],
//         // },
//     ];

//     return (
//         <Stack gap={4}>
//             {SECTIONS.map((s, si) => (
//                 <div key={s.key} className={`ss-card ss-fade ss-fade-${si + 1}`}>
//                     <SectionHead icon="" title={s.title} />
//                     <div className="ss-card-body" style={{ paddingTop: 8 }}>
//                         {s.rows.map(r => (
//                             <ToggleRow key={r.k} label={r.label} desc={r.desc} checked={prefs[r.k]} onChange={toggle(r.k)} />
//                         ))}
//                     </div>
//                 </div>
//             ))}
//             <div className="d-flex justify-content-end">
//                 <button className="ss-btn-primary" onClick={save} disabled={saving}>
//                     {saving ? "⏳ Saving…" : "💾 Save Preferences"}
//                 </button>
//             </div>
//         </Stack>
//     );
// }

// ════════════════════════════════════════════════════════════════════════════
// TAB: PAYMENTS
// ════════════════════════════════════════════════════════════════════════════
function PaymentsTab({ seller, onSave, saving }) {
    const [form, setForm] = useState({
        bank_name: "",
        account_holder: "",
        account_number: "",
        confirm_account: "",
        ifsc: "",
        account_type: "savings",
        upi_id: "",
    });

    const [isMaskedAccount, setIsMaskedAccount] = useState(false);

    useEffect(() => {
        if (!seller) return;

        setForm({
            bank_name: seller.bank_name || "",
            account_holder: seller.account_holder || "",
            account_number: seller.account_number || "",
            confirm_account: seller.account_number || "",
            ifsc: seller.ifsc || "",
            account_type: seller.account_type || "savings",
            upi_id: seller.upi_id || "",
        });

        setIsMaskedAccount(Boolean(seller.account_number));
    }, [seller]);

    const handleChange = (key) => (e) => {
        let value = e.target.value;

        if (key === "ifsc") {
            value = value.toUpperCase().replace(/\s/g, "");
        }

        if (key === "account_number" || key === "confirm_account") {
            value = value.replace(/\D/g, "");
        }

        if (key === "account_number" && isMaskedAccount) {
            setIsMaskedAccount(false);
            value = value.replace(/•/g, "");
        }

        setForm((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            bank_name: form.bank_name.trim(),
            account_holder: form.account_holder.trim(),
            account_number: form.account_number.trim(),
            confirm_account: form.confirm_account.trim(),
            ifsc: form.ifsc.trim().toUpperCase(),
            account_type: form.account_type,
            upi_id: form.upi_id.trim(),
        };

        if (!payload.bank_name) {
            toast.error("Bank name is required");
            return;
        }

        if (!payload.account_holder) {
            toast.error("Account holder name is required");
            return;
        }

        if (!isMaskedAccount) {
            if (!payload.account_number) {
                toast.error("Account number is required");
                return;
            }

            if (payload.account_number.length < 9 || payload.account_number.length > 18) {
                toast.error("Account number must be 9 to 18 digits");
                return;
            }

            if (payload.account_number !== payload.confirm_account) {
                toast.error("Account numbers do not match");
                return;
            }
        }

        if (!payload.ifsc) {
            toast.error("IFSC code is required");
            return;
        }

        if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(payload.ifsc)) {
            toast.error("Enter valid IFSC code");
            return;
        }

        if (payload.upi_id && !/^[\w.\-]{2,256}@[a-zA-Z]{2,64}$/.test(payload.upi_id)) {
            toast.error("Enter valid UPI ID");
            return;
        }

        if (isMaskedAccount) {
            delete payload.account_number;
            delete payload.confirm_account;
        } else {
            delete payload.confirm_account;
        }

        const fd = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
            fd.append(key, value);
        });

        await onSave(fd);
    };

    const accountMismatch =
        !isMaskedAccount &&
        form.confirm_account &&
        form.account_number !== form.confirm_account;

    return (
        <form onSubmit={handleSubmit}>
            <Stack gap={4}>
                <div className="ss-card ss-fade ss-fade-1">
                    <SectionHead icon="🏦" title="Bank Account Details" />

                    <div className="ss-card-body">
                        <div className="ss-warn mb-3">
                            🔒 Bank details are encrypted and used only for payouts. Never share these with anyone.
                        </div>

                        <Row className="g-3">
                            <Col md={6}>
                                <Field label="Bank Name">
                                    <input
                                        className="ss-input"
                                        value={form.bank_name}
                                        onChange={handleChange("bank_name")}
                                        placeholder="State Bank of India"
                                        disabled={saving}
                                    />
                                </Field>
                            </Col>

                            <Col md={6}>
                                <Field label="Account Holder Name">
                                    <input
                                        className="ss-input"
                                        value={form.account_holder}
                                        onChange={handleChange("account_holder")}
                                        placeholder="As per passbook"
                                        disabled={saving}
                                    />
                                </Field>
                            </Col>

                            <Col md={6}>
                                <Field label="Account Number">
                                    <input
                                        className="ss-input"
                                        type="text"
                                        inputMode="numeric"
                                        value={form.account_number}
                                        onChange={handleChange("account_number")}
                                        placeholder="Enter account number"
                                        disabled={saving}
                                    />
                                </Field>
                            </Col>

                            <Col md={6}>
                                <Field label="Confirm Account Number">
                                    <input
                                        className="ss-input"
                                        type="text"
                                        inputMode="numeric"
                                        value={form.confirm_account}
                                        onChange={handleChange("confirm_account")}
                                        placeholder={isMaskedAccount ? "Leave blank if unchanged" : "Re-enter account number"}
                                        disabled={saving || isMaskedAccount}
                                    />

                                    {accountMismatch && (
                                        <p className="ss-error">Account numbers do not match</p>
                                    )}
                                </Field>
                            </Col>

                            <Col md={6}>
                                <Field label="IFSC Code">
                                    <input
                                        className={`ss-input ${form.ifsc && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifsc)
                                            ? "is-invalid"
                                            : ""
                                            }`}
                                        value={form.ifsc.toUpperCase()}
                                        onChange={handleChange("ifsc")}
                                        placeholder="SBIN0001234"
                                        maxLength={11}
                                        disabled={saving}
                                    />
                                </Field>
                            </Col>

                            <Col md={6}>
                                <Field label="Account Type">
                                    <select
                                        className="ss-select"
                                        value={form.account_type}
                                        onChange={handleChange("account_type")}
                                        disabled={saving}
                                    >
                                        <option value="savings">Savings</option>
                                        <option value="current">Current</option>
                                    </select>
                                </Field>
                            </Col>
                        </Row>
                    </div>
                </div>

                <div className="ss-card ss-fade ss-fade-2">
                    <SectionHead icon="📲" title="UPI Details" />

                    <div className="ss-card-body">
                        <Row className="g-3">
                            <Col md={6}>
                                <Field label="UPI ID" hint="e.g. yourname@upi">
                                    <input
                                        className="ss-input"
                                        value={form.upi_id}
                                        onChange={handleChange("upi_id")}
                                        placeholder="yourname@okaxis"
                                        disabled={saving}
                                    />
                                </Field>
                            </Col>
                        </Row>
                    </div>
                </div>

                <div className="d-flex justify-content-end">
                    <button type="submit" className="ss-btn-primary" disabled={saving}>
                        {saving ? "⏳ Saving…" : "💾 Save Payment Details"}
                    </button>
                </div>
            </Stack>
        </form>
    );
}

export default function SellerSettings() {
    const [activeTab, setActiveTab] = useState("profile");
    const [seller, setSeller] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const sellerId = (() => {
        const d = JWTService.decodeTokenDetails?.() || {};
        return d?.id || d?.user_id;
    })();

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 992);
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Fetch seller profile
    const fetchSeller = useCallback(async () => {
        if (!sellerId) return;
        setLoading(true);
        try {
            const res = await userSettingsApi.getProfile(sellerId);
            setSeller(res?.data || res || null);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load profile");
        }
        finally { setLoading(false); }
    }, [sellerId]);

    useEffect(() => { fetchSeller(); }, [fetchSeller]);

    // Generic save
    const handleSave = useCallback(async (data) => {
        setSaving(true);
        try {
            if (activeTab === "profile") {
                await userSettingsApi.updateProfile(sellerId, data);
            } else if (activeTab === "store") {
                const json = Object.fromEntries(data.entries());
                await userSettingsApi.updateStore(sellerId, json);
            } else if (activeTab === "payments") {
                const json = Object.fromEntries(data.entries());
                await userSettingsApi.updatePayment(sellerId, json);
            }
            toast.success("Settings saved successfully!");
            fetchSeller();
        } catch (err) {
            toast.error(err?.message || "Failed to save. Try again.");
        } finally { setSaving(false); }
    }, [sellerId, fetchSeller, activeTab]);

    return (
        <Container fluid className="sr-page p-0">
            <div className="d-flex">
                <SellerSidebar />

                <div className="pd-main flex-grow-1" style={{ minWidth: 0 }}>
                    <SellerNavbar pageTitle="Settings" />

                    <div className="ss-topbar">
                        <span className="ss-topbar-title">⚙️ Account Settings</span>
                    </div>

                    <div style={{ padding: "24px 20px 48px" }}>
                        <Row className="g-4">
                            <Col xs={12} lg={3} xl={2}>
                                <nav className="ss-nav">
                                    {NAV_ITEMS.map((item) => (
                                        <button
                                            key={item.key}
                                            type="button"
                                            className={`ss-nav-item ${activeTab === item.key ? "active" : ""
                                                }`}
                                            onClick={() => setActiveTab(item.key)}
                                        >
                                            <span className="ss-nav-icon">{item.icon}</span>
                                            <span>{item.label}</span>
                                        </button>
                                    ))}
                                </nav>
                            </Col>

                            <Col xs={12} lg={9} xl={10}>
                                {loading ? (
                                    <Stack gap={3}>
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="ss-card" style={{ padding: 24 }}>
                                                <div className="ss-skel" style={{ height: 12, width: "25%", marginBottom: 16 }} />
                                                <div className="ss-skel" style={{ height: 10, width: "60%", marginBottom: 10 }} />
                                                <div className="ss-skel" style={{ height: 10, width: "45%" }} />
                                            </div>
                                        ))}
                                    </Stack>
                                ) : (
                                    <>
                                        {activeTab === "profile" && <ProfileTab seller={seller} onSave={handleSave} saving={saving} />}
                                        {activeTab === "store" && <StoreTab seller={seller} onSave={handleSave} saving={saving} />}
                                        {activeTab === "security" && <SecurityTab />}
                                        {/* {activeTab === "notifications" && <NotificationsTab seller={seller} />} */}
                                        {activeTab === "payments" && <PaymentsTab seller={seller} onSave={handleSave} saving={saving} />}
                                        {activeTab === "logout" && <LogoutTab />}
                                    </>
                                )}
                            </Col>
                        </Row>
                    </div>
                </div>
            </div>
        </Container>
    );
}