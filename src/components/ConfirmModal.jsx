import { Modal, Button } from "react-bootstrap";
import "./ConfirmModal.css";
import { useNavigate } from "react-router-dom";

const VARIANT_MAP = {
    danger: {
        iconBg: "linear-gradient(135deg, var(--danger), #dc3545)",
        iconShadow: "rgba(220, 38, 38, 0.22)",
        btnBg: "linear-gradient(135deg, var(--danger), #dc3545)",
        btnShadow: "rgba(220, 38, 38, 0.25)",
        badge: "#fee2e2",
        badgeText: "#dc2626",
    },
    warning: {
        iconBg: "linear-gradient(135deg, var(--warning), #f59e0b)",
        iconShadow: "rgba(245, 158, 11, 0.22)",
        btnBg: "linear-gradient(135deg, var(--warning), #f59e0b)",
        btnShadow: "rgba(245, 158, 11, 0.25)",
        badge: "#fef3c7",
        badgeText: "#d97706",
    },
    success: {
        iconBg: "linear-gradient(135deg, var(--success), #16a34a)",
        iconShadow: "rgba(34, 197, 94, 0.22)",
        btnBg: "linear-gradient(135deg, var(--success), #16a34a)",
        btnShadow: "rgba(34, 197, 94, 0.25)",
        badge: "#dcfce7",
        badgeText: "#16a34a",
    },
    info: {
        iconBg: "linear-gradient(135deg, var(--info), #0dcaf0)",
        iconShadow: "rgba(13, 202, 240, 0.22)",
        btnBg: "linear-gradient(135deg, var(--info), #0dcaf0)",
        btnShadow: "rgba(13, 202, 240, 0.25)",
        badge: "#e0f7ff",
        badgeText: "#0dcaf0",
    },
};

const DEFAULT_ICONS = {
    danger: "🗑️",
    warning: "⚠️",
    success: "✅",
    info: "ℹ️",
};

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

    // new props
    isMulti = false,
}) {
    const cfg = VARIANT_MAP[variant] || VARIANT_MAP.danger;
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
            </Modal.Body>

            <Modal.Footer className="d-flex gap-2">
                <Button
                    className="cm-btn-cancel"
                    onClick={() => !loading && onCancel?.()}
                    disabled={loading}
                >
                    {cancelText}
                </Button>

                {isMulti ? (
                    <>
                        <Button
                            className="cm-btn-confirm"
                            style={{
                                background: "linear-gradient(135deg, #2563eb, #0d6efd)",
                                "--btn-shadow": "rgba(37, 99, 235, 0.25)",
                            }}
                            onClick={() => navigate("/customer/register")}
                            disabled={loading}
                        >
                            Customer
                        </Button>

                        <Button
                            className="cm-btn-confirm"
                            style={{
                                background: cfg.btnBg,
                                "--btn-shadow": cfg.btnShadow,
                            }}
                            onClick={() => navigate("/seller/register")}
                            disabled={loading}
                        >
                            Seller
                        </Button>
                    </>
                ) : (
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