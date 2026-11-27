import { Modal, Button } from "react-bootstrap";
import "./ConfirmModal.css";
import { useNavigate } from "react-router-dom";

const VARIANT_MAP = {
    primary: {
        iconBg: "var(--primary-gradient, linear-gradient(135deg, #2563eb, #1d4ed8))",
        iconShadow: "rgba(37, 99, 235, 0.25)",
        btnBg: "var(--primary-gradient, linear-gradient(135deg, #2563eb, #1d4ed8))",
        btnShadow: "rgba(37, 99, 235, 0.25)",
    },
    danger: {
        iconBg: "linear-gradient(135deg, var(--danger, #dc2626), #dc3545)",
        iconShadow: "rgba(220, 38, 38, 0.22)",
        btnBg: "linear-gradient(135deg, var(--danger, #dc2626), #dc3545)",
        btnShadow: "rgba(220, 38, 38, 0.25)",
    },
    warning: {
        iconBg: "linear-gradient(135deg, var(--warning, #f59e0b), #f59e0b)",
        iconShadow: "rgba(245, 158, 11, 0.22)",
        btnBg: "linear-gradient(135deg, var(--warning, #f59e0b), #f59e0b)",
        btnShadow: "rgba(245, 158, 11, 0.25)",
    },
    success: {
        iconBg: "linear-gradient(135deg, var(--success, #22c55e), #16a34a)",
        iconShadow: "rgba(34, 197, 94, 0.22)",
        btnBg: "linear-gradient(135deg, var(--success, #22c55e), #16a34a)",
        btnShadow: "rgba(34, 197, 94, 0.25)",
    },
    info: {
        iconBg: "linear-gradient(135deg, var(--info, #0dcaf0), #0dcaf0)",
        iconShadow: "rgba(13, 202, 240, 0.22)",
        btnBg: "linear-gradient(135deg, var(--info, #0dcaf0), #0dcaf0)",
        btnShadow: "rgba(13, 202, 240, 0.25)",
    },
};

const DEFAULT_ICONS = {
    danger: "🗑️",
    warning: "⚠️",
    success: "✅",
    info: "ℹ️",
};

const CHOICES = [
    {
        key: "customer",
        icon: "🛒",
        title: "Customer",
        text: "Shop products, track orders and save favourites",
        route: "/customer/register",
    },
    {
        key: "seller",
        icon: "🏪",
        title: "Seller",
        text: "List products, manage orders and grow your store",
        route: "/seller/register",
    },
];

export default function ConfirmModal({
    show = false,
    onConfirm,
    onCancel,
    title = "Are you sure?",
    message = "This action cannot be undone.",
    confirmText,
    cancelText = "Cancel",
    variant = "danger",
    loading = false,
    icon,

    // when true, shows the Customer / Seller registration choice
    isMulti = false,
}) {
    // The registration chooser always uses the brand (primary) colors
    const cfg = isMulti ? VARIANT_MAP.primary : VARIANT_MAP[variant] || VARIANT_MAP.danger;
    const iconEmoji = icon ?? DEFAULT_ICONS[variant] ?? "❓";
    const btnLabel = confirmText ?? (variant === "danger" ? "Yes, Delete" : "Confirm");

    const navigate = useNavigate();

    return (
        <Modal
            show={show}
            onHide={() => !loading && onCancel?.()}
            centered
            size="md"
            dialogClassName="cm-modal"
            backdrop={loading ? "static" : true}
            keyboard={!loading}
        >
            <Modal.Body className="text-center cm-fade-up">
                <div
                    className="cm-icon-ring"
                    style={{
                        background: cfg.iconBg,
                        boxShadow: `0 8px 24px ${cfg.iconShadow}`,
                    }}
                >
                    {iconEmoji}
                </div>

                <h5 className="cm-title">{title}</h5>
                <p className="cm-message">{message}</p>

                {isMulti && (
                    <div className="cm-choices">
                        {CHOICES.map((c) => (
                            <button
                                key={c.key}
                                type="button"
                                className="cm-choice"
                                onClick={() => navigate(c.route)}
                                disabled={loading}
                            >
                                <span className="cm-choice-icon">{c.icon}</span>
                                <span className="cm-choice-title">{c.title}</span>
                                <span className="cm-choice-text">{c.text}</span>
                                <span className="cm-choice-go">Continue →</span>
                            </button>
                        ))}
                    </div>
                )}
            </Modal.Body>

            <Modal.Footer className={`cm-footer ${isMulti ? "multi" : ""}`}>
                <Button
                    className="cm-btn-cancel"
                    onClick={() => !loading && onCancel?.()}
                    disabled={loading}
                >
                    {cancelText}
                </Button>

                {!isMulti && (
                    <Button
                        className="cm-btn-confirm"
                        style={{
                            background: cfg.btnBg,
                            "--btn-shadow": cfg.btnShadow,
                        }}
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading && <span className="cm-spinner" />}
                        {loading ? "Please wait…" : btnLabel}
                    </Button>
                )}
            </Modal.Footer>
        </Modal>
    );
}