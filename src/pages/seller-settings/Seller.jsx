import { useState, useEffect, useCallback, useRef } from "react";
import { Row, Col, Stack, InputGroup, Form } from "react-bootstrap";
import toast from "react-hot-toast";
import JWTService from "../../config/jwt.config";       // apna path
import SellerSidebar from "../../components/SellerSidebar";
import SellerNavbar from "../../components/Sellernavbar";
import "./SellerSettings.css";
import authApi from "../../api/authApi";
import userSettingsApi from "../../api/userSettings.api";
import { API_BASE_URL } from "../../helper/Constraints";

// ── Constants ─────────────────────────────────────────────────────────────────
const SIDEBAR_W = 280;
const IMG_BASE = API_BASE_URL.replace("/api/v1", "/uploads/profiles/");

const NAV_ITEMS = [
    { key: "profile", icon: "👤", label: "Profile" },
    { key: "store", icon: "🏪", label: "Store Info" },
    { key: "security", icon: "🔒", label: "Security" },
    { key: "notifications", icon: "🔔", label: "Notifications" },
    { key: "payments", icon: "💳", label: "Payments" },
    { key: "danger", icon: "⚠️", label: "Danger Zone" },
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

                {/* Avatar */}
                <div className="ss-card ss-fade ss-fade-1">
                    <SectionHead icon="🖼️" title="Profile Picture" />
                    <div className="ss-card-body">
                        <div className="d-flex align-items-center gap-4 flex-wrap">
                            <div className="ss-avatar-wrap" onClick={() => fileRef.current?.click()}>
                                {avatarPreview
                                    ? <img src={avatarPreview} alt="avatar" className="ss-avatar" style={{ display: "block" }} />
                                    : <div className="ss-avatar">{initials(displayName)}</div>
                                }
                                <div className="ss-avatar-edit">✏️</div>
                                <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleAvatarChange} />
                            </div>
                            <div>
                                <p style={{ fontWeight: 800, fontSize: "1rem", color: "#1a1a2e", marginBottom: 4 }}>{displayName}</p>
                                <p style={{ fontSize: "0.8rem", color: "#9ca3af", marginBottom: 10 }}>JPG, PNG or WEBP · Max 2MB</p>
                                <div className="d-flex gap-2">
                                    <button type="button" className="ss-btn-outline" style={{ fontSize: "0.8rem", padding: "6px 14px" }} onClick={() => fileRef.current?.click()}>
                                        📁 Upload Photo
                                    </button>
                                    {avatarPreview && (
                                        <button type="button" className="ss-btn-danger" style={{ fontSize: "0.8rem", padding: "6px 14px" }} onClick={() => { setAvatarFile(null); setAvatarPreview(null); }}>
                                            Remove
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

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
                                        <InputGroup.Text className="ss-addon ss-addon-l">+91</InputGroup.Text>
                                        <input className="ss-input ss-input-il" type="tel" value={form.mobile} onChange={set("mobile")} placeholder="9876543210" />
                                    </InputGroup>
                                </Field>
                            </Col>
                            <Col md={6}>
                                <Field label="Date of Birth">
                                    <input className="ss-input" type="date" value={form.dob} onChange={set("dob")} />
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
                            <Col md={6}>
                                <Field label="Website">
                                    <InputGroup>
                                        <InputGroup.Text className="ss-addon ss-addon-l" style={{ fontSize: "0.75rem" }}>https://</InputGroup.Text>
                                        <input className="ss-input ss-input-il" value={form.website} onChange={set("website")} placeholder="yoursite.com" />
                                    </InputGroup>
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
                                        className={`ss-input ${form.gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(form.gstin) ? 'is-invalid' : ''}`}
                                        value={form.gstin}
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
                                        className={`ss-input ${form.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.pan) ? 'is-invalid' : ''}`}
                                        value={form.pan}
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
    const [form, setForm] = useState({ current: "", newPw: "", confirm: "" });
    const [show, setShow] = useState({ current: false, newPw: false, confirm: false });
    const [saving, setSaving] = useState(false);
    const strength = pwStrength(form.newPw);

    const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));
    const flip = (k) => setShow(p => ({ ...p, [k]: !p[k] }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.current) { toast.error("Current password required"); return; }
        if (form.newPw.length < 8) { toast.error("New password must be ≥ 8 chars"); return; }
        if (form.newPw !== form.confirm) { toast.error("Passwords do not match"); return; }
        setSaving(true);
        try {
            await authApi.changePassword({ current_password: form.current, new_password: form.newPw });
            toast.success("Password updated successfully!");
            setForm({ current: "", newPw: "", confirm: "" });
        } catch (err) {
            toast.error(err?.message || "Failed to update password");
        } finally { setSaving(false); }
    };

    const PwField = ({ label, fkey }) => (
        <Field label={label}>
            <div style={{ position: "relative" }}>
                <input
                    className="ss-input"
                    type={show[fkey] ? "text" : "password"}
                    value={form[fkey]}
                    onChange={set(fkey)}
                    placeholder="••••••••"
                    style={{ paddingRight: 44 }}
                />
                <button type="button" onClick={() => flip(fkey)}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "1rem", color: "#9ca3af" }}>
                    {show[fkey] ? "🙈" : "👁️"}
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
                            <Col md={6}><PwField label="Current Password" fkey="current" /></Col>
                            <Col md={6}>
                                <PwField label="New Password" fkey="newPw" />
                                {form.newPw && (
                                    <>
                                        <div className="ss-pw-strength" style={{ background: strength.color, width: `${(strength.score / 4) * 100}%` }} />
                                        <p className="ss-pw-label" style={{ color: strength.color }}>{strength.label}</p>
                                    </>
                                )}
                            </Col>
                            <Col md={6}>
                                <PwField label="Confirm New Password" fkey="confirm" />
                                {form.confirm && form.newPw !== form.confirm && (
                                    <p className="ss-error">Passwords do not match</p>
                                )}
                            </Col>
                        </Row>
                        <div className="ss-info mt-3">
                            🔒 Use at least 8 characters with a mix of uppercase, numbers and symbols.
                        </div>
                    </div>
                </div>

                <div className="ss-card ss-fade ss-fade-2">
                    <SectionHead icon="🛡️" title="Login Sessions" />
                    <div className="ss-card-body">
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #f1f4ff" }}>
                            <div>
                                <p style={{ fontWeight: 800, fontSize: "0.88rem", color: "#1a1a2e", marginBottom: 2 }}>Current Session</p>
                                <p style={{ fontSize: "0.76rem", color: "#9ca3af", margin: 0 }}>This device · Active now</p>
                            </div>
                            <span style={{ background: "#dcfce7", color: "#166534", fontSize: "0.72rem", fontWeight: 900, padding: "3px 10px", borderRadius: 20 }}>Active</span>
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
function NotificationsTab({ seller }) {
    const [prefs, setPrefs] = useState({
        new_order: true,
        order_status: true,
        low_stock: true,
        new_review: true,
        payment_credit: true,
        promotions: false,
        weekly_summary: true,
        email_new_order: true,
        email_review: false,
        sms_order: true,
        push_all: true,
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (seller?.notification_preferences) {
            setPrefs(p => ({ ...p, ...seller.notification_preferences }));
        }
    }, [seller]);

    const toggle = (k) => (v) => setPrefs(p => ({ ...p, [k]: v }));

    const save = async () => {
        setSaving(true);
        try {
            await userSettingsApi.updateNotificationPrefs(JWTService.decodeTokenDetails?.()?.id, prefs);
            toast.success("Notification preferences saved!");
        } catch { toast.error("Failed to save preferences"); }
        finally { setSaving(false); }
    };

    const SECTIONS = [
        {
            title: "🔔 In-App Notifications", key: "inapp",
            rows: [
                { k: "new_order", label: "New Order", desc: "When a new order is placed" },
                { k: "order_status", label: "Order Status Update", desc: "Order confirmed, shipped, delivered" },
                { k: "low_stock", label: "Low Stock Alert", desc: "When product stock falls below limit" },
                { k: "new_review", label: "New Review", desc: "Customer leaves a review" },
                { k: "payment_credit", label: "Payment Credited", desc: "When payment is credited to account" },
                { k: "promotions", label: "Promotions & Offers", desc: "ShopEase deals and offers" },
            ],
        },
        {
            title: "📧 Email Notifications", key: "email",
            rows: [
                { k: "email_new_order", label: "New Order Email", desc: "Get email for every new order" },
                { k: "email_review", label: "Review Emails", desc: "Get email when reviews arrive" },
                { k: "weekly_summary", label: "Weekly Summary", desc: "Weekly performance digest email" },
            ],
        },
        {
            title: "📱 SMS & Push", key: "push",
            rows: [
                { k: "sms_order", label: "SMS for Orders", desc: "Text message for new orders" },
                { k: "push_all", label: "Push Notifications", desc: "Browser push notifications (all)" },
            ],
        },
    ];

    return (
        <Stack gap={4}>
            {SECTIONS.map((s, si) => (
                <div key={s.key} className={`ss-card ss-fade ss-fade-${si + 1}`}>
                    <SectionHead icon="" title={s.title} />
                    <div className="ss-card-body" style={{ paddingTop: 8 }}>
                        {s.rows.map(r => (
                            <ToggleRow key={r.k} label={r.label} desc={r.desc} checked={prefs[r.k]} onChange={toggle(r.k)} />
                        ))}
                    </div>
                </div>
            ))}
            <div className="d-flex justify-content-end">
                <button className="ss-btn-primary" onClick={save} disabled={saving}>
                    {saving ? "⏳ Saving…" : "💾 Save Preferences"}
                </button>
            </div>
        </Stack>
    );
}

// ════════════════════════════════════════════════════════════════════════════
// TAB: PAYMENTS
// ════════════════════════════════════════════════════════════════════════════
function PaymentsTab({ seller, onSave, saving }) {
    const [form, setForm] = useState({
        bank_name: "", account_holder: "", account_number: "",
        confirm_account: "", ifsc: "", account_type: "savings",
        upi_id: "",
    });

    useEffect(() => {
        if (!seller) return;
        setForm({
            bank_name: seller.bank_name || "",
            account_holder: seller.account_holder || "",
            account_number: seller.account_number ? "•".repeat(8) : "",
            confirm_account: "",
            ifsc: seller.ifsc || "",
            account_type: seller.account_type || "savings",
            upi_id: seller.upi_id || "",
        });
    }, [seller]);

    const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.account_number !== form.confirm_account && !form.account_number.startsWith("•")) {
            toast.error("Account numbers do not match"); return;
        }

        // Filter out masked values if they weren't changed
        const filtered = { ...form };
        if (filtered.account_number.startsWith("•")) delete filtered.account_number;
        delete filtered.confirm_account;

        const fd = new FormData();
        Object.entries(filtered).forEach(([k, v]) => fd.append(k, v));
        await onSave(fd);
    };

    return (
        <form onSubmit={handleSubmit}>
            <Stack gap={4}>
                <div className="ss-card ss-fade ss-fade-1">
                    <SectionHead icon="🏦" title="Bank Account Details" />
                    <div className="ss-card-body">
                        <div className="ss-warn mb-3">🔒 Bank details are encrypted and used only for payouts. Never share these with anyone.</div>
                        <Row className="g-3">
                            <Col md={6}>
                                <Field label="Bank Name">
                                    <input className="ss-input" value={form.bank_name} onChange={set("bank_name")} placeholder="State Bank of India" />
                                </Field>
                            </Col>
                            <Col md={6}>
                                <Field label="Account Holder Name">
                                    <input className="ss-input" value={form.account_holder} onChange={set("account_holder")} placeholder="As per passbook" />
                                </Field>
                            </Col>
                            <Col md={6}>
                                <Field label="Account Number">
                                    <input className="ss-input" type="password" value={form.account_number} onChange={set("account_number")} placeholder="Enter account number" />
                                </Field>
                            </Col>
                            <Col md={6}>
                                <Field label="Confirm Account Number">
                                    <input className="ss-input" type="password" value={form.confirm_account} onChange={set("confirm_account")} placeholder="Re-enter account number" />
                                    {form.confirm_account && form.account_number !== form.confirm_account && (
                                        <p className="ss-error">Account numbers do not match</p>
                                    )}
                                </Field>
                            </Col>
                            <Col md={6}>
                                <Field label="IFSC Code">
                                    <input
                                        className={`ss-input ${form.ifsc && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifsc) ? 'is-invalid' : ''}`}
                                        value={form.ifsc}
                                        onChange={set("ifsc")}
                                        placeholder="SBIN0001234"
                                        style={{ textTransform: "uppercase" }}
                                    />
                                </Field>
                            </Col>
                            <Col md={6}>
                                <Field label="Account Type">
                                    <select className="ss-select" value={form.account_type} onChange={set("account_type")}>
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
                                <Field label="UPI ID" hint="e.g. yourname@upi or +91xxxxxxxxxx@paytm">
                                    <input className="ss-input" value={form.upi_id} onChange={set("upi_id")} placeholder="yourname@okaxis" />
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

// ════════════════════════════════════════════════════════════════════════════
// TAB: LOGOUT
// ════════════════════════════════════════════════════════════════════════════
function LogoutTab() {
    const handleLogout = async () => {
        if (!window.confirm("Are you sure you want to logout?")) return;
        try {
            JWTService.clearTokenDetails()
            toast.success("Logged out successfully!");
            window.location.href = "/auth/login";
        } catch (err) {
            toast.error(err?.message || "Failed to logout");
        }
    };

    return (
        <Stack gap={4}>
            <div className="ss-card ss-fade ss-fade-1">
                <SectionHead icon="🚪" title="Logout" />
                <div className="ss-card-body">
                    <p style={{ fontSize: "0.88rem", color: "#374151", marginBottom: 16, lineHeight: 1.6 }}>
                        Logout from your seller account. You will be redirected to the login page.
                    </p>
                    <div className="ss-danger-zone">
                        <button className="ss-btn-danger" onClick={handleLogout}>
                            🚪 Logout
                        </button>
                    </div>
                </div>
            </div>
        </Stack>
    );
}
// ════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════════════════════════════════════════
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

    const displayName = seller
        ? `${seller.first_name || ""} ${seller.last_name || ""}`.trim() || seller.business_name || "Seller"
        : "Seller";

    return (
        <div className="ss-page">
            <SellerNavbar pageTitle="Settings" />

            <div style={{ display: "flex" }}>
                <SellerSidebar />

                <div style={{
                    flex: 1,
                    marginLeft: isMobile ? 0 : SIDEBAR_W,
                    minWidth: 0,
                    transition: "margin-left 0.3s ease"
                }}>

                    {/* Orange topbar */}
                    <div className="ss-topbar">
                        <span className="ss-topbar-title">⚙️ Account Settings</span>
                        {seller && (
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div className="ss-avatar" style={{ width: 32, height: 32, fontSize: "0.75rem", flexShrink: 0 }}>
                                    {seller.avatar ? <img src={seller.avatar.startsWith('http') ? seller.avatar : `${IMG_BASE}${seller.avatar}`} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%' }} /> : initials(displayName)}
                                </div>
                                <span style={{ color: "#fff", fontWeight: 700, fontSize: "0.85rem" }}>{displayName}</span>
                            </div>
                        )}
                    </div>

                    <div style={{ padding: "24px 20px 48px" }}>
                        <Row className="g-4">

                            {/* Left nav */}
                            <Col lg={3} xl={2}>
                                <nav className="ss-nav">
                                    {NAV_ITEMS.map((item, i) => (
                                        <button
                                            key={item.key}
                                            className={`ss-nav-item ${activeTab === item.key ? "active" : ""}`}
                                            onClick={() => setActiveTab(item.key)}
                                        >
                                            <span className="ss-nav-icon">{item.icon}</span>
                                            {item.label}
                                        </button>
                                    ))}
                                </nav>
                            </Col>

                            {/* Content */}
                            <Col lg={9} xl={10}>
                                {loading ? (
                                    <Stack gap={3}>
                                        {[1, 2, 3].map(i => (
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
                                        {activeTab === "notifications" && <NotificationsTab seller={seller} />}
                                        {activeTab === "payments" && <PaymentsTab seller={seller} onSave={handleSave} saving={saving} />}
                                        {activeTab === "danger" && <DangerTab />}
                                        {activeTab === "logout" && <LogoutTab />}
                                    </>
                                )}
                            </Col>
                        </Row>
                    </div>
                </div>
            </div>
        </div>
    );
}