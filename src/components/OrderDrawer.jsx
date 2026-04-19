import { useState, useEffect } from "react";
import "../pages/seller-orders/SellerOrders.css";
import OrderTimeline from "../pages/customer-order-list/OrderTimeline";
import { PAYMENT_METHOD_META } from "../helper/Constraints";
import { Stack } from "react-bootstrap";
import { FMT, FMT_DATE } from "../helper/GlobalHelper";
import PayBadge from "./PayBadge";
import { useParams } from "react-router-dom";



const fmtDT = (d) =>
    d
        ? new Date(d).toLocaleString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
        : "—";

const ORDER_STATUSES = [
    { value: "placed", label: "Placed", icon: "📋" },
    { value: "confirmed", label: "Confirmed", icon: "✅" },
    { value: "processing", label: "Processing", icon: "⚙️" },
    { value: "shipped", label: "Shipped", icon: "🚚" },
    { value: "delivered", label: "Delivered", icon: "📦" },
    { value: "cancelled", label: "Cancelled", icon: "❌" },
    { value: "payment_failed", label: "Payment Failed", icon: "⚠️" },
];

const PAYMENT_STATUSES = [
    { value: "pending", label: "Pending" },
    { value: "paid", label: "Paid" },
    { value: "failed", label: "Failed" },
    { value: "refunded", label: "Refunded" },
    { value: "cancelled", label: "Cancelled" },
];



const StatusBadge = ({ status }) => (
    <span className={`so-status ${status || ""}`}>
        {ORDER_STATUSES.find((s) => s.value === status)?.icon} {String(status || "unknown").replace("_", " ")}
    </span>
);




export default function OrderDrawer({ order, onClose, onStatusUpdate, onPaymentUpdate, updating }) {
    const [newStatus, setNewStatus] = useState(order.order_status || "placed");
    const [newPayment, setNewPayment] = useState(order.payment_status || "pending");

    console.log("order", order)

    useEffect(() => {
        setNewStatus(order.order_status || "placed");
        setNewPayment(order.payment_status || "pending");
    }, [order]);

    const items = order.items || [];
    const addr = order.address_snapshot || {};
    const user = order.user_snapshot || {};
    const payMeta = PAYMENT_METHOD_META[order.payment_method] || {
        icon: "💳",
        label: order.payment_method || "Unknown",
    };




    return (
        <div className="so-drawer-overlay" onClick={onClose}>
            <div className="so-drawer" onClick={(e) => e.stopPropagation()}>
                <div className="so-drawer-header">
                    <div>
                        <p
                            style={{
                                color: "rgba(255,255,255,.75)",
                                fontSize: "0.72rem",
                                fontWeight: 800,
                                textTransform: "uppercase",
                                letterSpacing: "0.06em",
                                marginBottom: 1,
                            }}
                        >
                            Order Details
                        </p>
                        <p
                            style={{
                                color: "#fff",
                                fontSize: "0.96rem",
                                fontWeight: 900,
                                marginBottom: 0,
                            }}
                        >
                            #{order.order_number}
                        </p>
                    </div>
                    <Stack direction="horizontal" gap={2} className="align-items-center">
                        <StatusBadge status={order.order_status} />
                        <button className="so-drawer-close" onClick={onClose}>
                            ✕
                        </button>
                    </Stack>
                </div>

                <div className="so-drawer-body">
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
                        {[
                            { label: "Placed", val: FMT_DATE(order.created_time) },
                            { label: "Payment", val: `${payMeta.icon} ${payMeta.label}` },
                            {
                                label: "Items",
                                val: `${order.total_items || items.length} item${(order.total_items || items.length) !== 1 ? "s" : ""
                                    }`,
                            },
                            { label: "Total", val: FMT(order.total_amount) },
                        ].map(({ label, val }) => (
                            <div
                                key={label}
                                style={{
                                    background: "#fafbff",
                                    border: "1.5px solid var(--border)",
                                    borderRadius: 10,
                                    padding: "8px 14px",
                                    minWidth: 100,
                                }}
                            >
                                <p
                                    style={{
                                        fontSize: "0.68rem",
                                        fontWeight: 800,
                                        color: "#9ca3af",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.05em",
                                        marginBottom: 2,
                                    }}
                                >
                                    {label}
                                </p>
                                <p
                                    style={{
                                        fontSize: "0.82rem",
                                        fontWeight: 900,
                                        color: "#1a1a2e",
                                        marginBottom: 0,
                                    }}
                                >
                                    {val}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="so-drawer-section">
                        <p className="so-drawer-section-title">👤 Customer</p>
                        <p
                            style={{
                                fontWeight: 800,
                                fontSize: "0.88rem",
                                color: "#1a1a2e",
                                marginBottom: 2,
                            }}
                        >
                            {user.full_name || addr.name || "—"}
                        </p>
                        {user.email && (
                            <p
                                style={{
                                    fontSize: "0.78rem",
                                    color: "#6b7280",
                                    fontWeight: 700,
                                    marginBottom: 1,
                                }}
                            >
                                ✉️ {user.email}
                            </p>
                        )}
                        {(user.mobile || addr.mobile) && (
                            <p
                                style={{
                                    fontSize: "0.78rem",
                                    color: "#6b7280",
                                    fontWeight: 700,
                                    marginBottom: 0,
                                }}
                            >
                                📞 {user.mobile || addr.mobile}
                            </p>
                        )}
                    </div>

                    <div className="so-drawer-section">
                        <p className="so-drawer-section-title">📦 Delivery Address</p>
                        <p
                            style={{
                                fontSize: "0.84rem",
                                fontWeight: 800,
                                color: "#1a1a2e",
                                marginBottom: 2,
                            }}
                        >
                            <span>Name :</span> {addr.name || "—"}
                        </p>
                        <p
                            style={{
                                fontSize: "0.8rem",
                                color: "#4b5563",
                                fontWeight: 700,
                                lineHeight: 1.6,
                                marginBottom: 0,
                            }}
                        >   <span style={{
                            fontSize: "0.84rem",
                            fontWeight: 800,
                            color: "#1a1a2e",
                            marginBottom: 2,
                        }}>Address :{" "}</span>
                            {addr.address_line_1 || "—"}
                            {addr.address_line_2 ? `, ${addr.address_line_2}` : ""}
                            <br />
                            {addr.city || "—"}, {addr.state || "—"} — {addr.pincode || "—"}
                            <br />
                            📞 {addr.mobile || addr.phone || "—"}
                        </p>
                        {addr.instructions && (
                            <p
                                style={{
                                    fontSize: "0.76rem",
                                    color: "#9ca3af",
                                    fontWeight: 700,
                                    marginTop: 6,
                                    marginBottom: 0,
                                }}
                            >
                                <span style={{
                                    fontSize: "0.84rem",
                                    fontWeight: 800,
                                    color: "#1a1a2e",
                                    marginBottom: 2,
                                }}>📝 {"Delivery Instructions"} : </span>{addr.instructions}
                            </p>
                        )}
                    </div>

                    <div className="so-drawer-section">
                        <p className="so-drawer-section-title">🛍️ Items ({items.length})</p>

                        {items.map((item) => {
                            const imgSrc = Array.isArray(item.product_image_url)
                                ? item.product_image_url[0]
                                : item.product_image_url;
                            console.log(imgSrc.replace('{"', '').replace('"}', '').trim())
                            return (
                                <div key={item.id} className="so-item-row">
                                    <img
                                        src={imgSrc.replace('{"', '').replace('"}', '').trim()}
                                        alt={item.product_title || "Product"}
                                        className="so-item-img"
                                        onError={(e) => {
                                            e.target.src = `https://placehold.co/46x46/f1f4ff/ff6b35?text=${encodeURIComponent(
                                                (item.product_title || "P").slice(0, 2)
                                            )}`;
                                        }}
                                    />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p
                                            style={{
                                                fontSize: "0.82rem",
                                                fontWeight: 800,
                                                color: "#1a1a2e",
                                                marginBottom: 2,
                                                overflow: "hidden",
                                                whiteSpace: "nowrap",
                                                textOverflow: "ellipsis",
                                            }}
                                        >
                                            {item.product_title || "Untitled Product"}
                                        </p>
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 5,
                                                flexWrap: "wrap",
                                                fontSize: "0.7rem",
                                                color: "#6b7280",
                                                fontWeight: 700,
                                            }}
                                        >
                                            {item.product_brand && <span>{item.product_brand}</span>}
                                            {item.variant_size && (
                                                <>
                                                    <span>·</span>
                                                    <span>{item.variant_size}</span>
                                                </>
                                            )}
                                            {item.variant_color && (
                                                <span
                                                    className="so-color-dot"
                                                    style={{ background: item.variant_color }}
                                                />
                                            )}
                                            <span>· Qty: {item.quantity || 0}</span>
                                            <span>· {FMT(item.unit_price)} each</span>
                                        </div>
                                    </div>
                                    <p
                                        style={{
                                            fontWeight: 900,
                                            fontSize: "0.9rem",
                                            color: "#ff6b35",
                                            flexShrink: 0,
                                            marginBottom: 0,
                                        }}
                                    >
                                        {FMT(item.line_total)}
                                    </p>
                                </div>
                            );
                        })}

                        <div style={{ marginTop: 12, borderTop: "1px solid #f1f4ff", paddingTop: 10 }}>
                            {[
                                { label: "Subtotal", val: FMT(order.subtotal) },
                                { label: "Delivery", val: FMT(order.delivery_charge) },
                                {
                                    label: "Discount",
                                    val: `-${FMT(order.discount_amount)}`,
                                    hide: !Number(order.discount_amount),
                                },
                                {
                                    label: "Tax",
                                    val: FMT(order.tax_amount),
                                    hide: !Number(order.tax_amount),
                                },
                            ]
                                .filter((r) => !r.hide)
                                .map(({ label, val }) => (
                                    <div
                                        key={label}
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            fontSize: "0.8rem",
                                            fontWeight: 700,
                                            color: "#6b7280",
                                            marginBottom: 4,
                                        }}
                                    >
                                        <span>{label}</span>
                                        <span>{val}</span>
                                    </div>
                                ))}

                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    fontWeight: 900,
                                    fontSize: "0.96rem",
                                    color: "#1a1a2e",
                                    marginTop: 6,
                                    borderTop: "1px solid #f1f4ff",
                                    paddingTop: 8,
                                }}
                            >
                                <span>Total</span>
                                <span style={{ color: "#ff6b35" }}>{FMT(order.total_amount)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="so-drawer-section">
                        <p className="so-drawer-section-title">🗺️ Order Progress</p>
                        <OrderTimeline currentStatus={order.order_status} />
                    </div>

                    <div className="so-update-panel">
                        <p className="so-drawer-section-title mb-3">⚙️ Update Order Status</p>

                        <Stack direction="horizontal" gap={2} className="mb-2 flex-wrap">
                            <select
                                className="so-status-select flex-fill"
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                            >
                                {ORDER_STATUSES.map((s) => (
                                    <option key={s.value} value={s.value}>
                                        {s.icon} {s.label}
                                    </option>
                                ))}
                            </select>

                            <button
                                className="so-btn-primary"
                                onClick={() => onStatusUpdate(order.id, newStatus)}
                                disabled={updating || newStatus === order.order_status}
                            >
                                {updating ? "Saving…" : "Update"}
                            </button>
                        </Stack>

                        <Stack direction="horizontal" gap={2} className="flex-wrap">
                            <select
                                className="so-status-select flex-fill"
                                value={newPayment}
                                onChange={(e) => setNewPayment(e.target.value)}
                            >
                                {PAYMENT_STATUSES.map((s) => (
                                    <option key={s.value} value={s.value}>
                                        {s.label}
                                    </option>
                                ))}
                            </select>

                            <button
                                className="so-btn-outline"
                                style={{ whiteSpace: "nowrap" }}
                                onClick={() => onPaymentUpdate(order.id, newPayment)}
                                disabled={updating || newPayment === order.payment_status}
                            >
                                {updating ? "Saving…" : "Pay Status"}
                            </button>
                        </Stack>
                    </div>

                    {order.razorpay_payment_id && (
                        <div className="so-drawer-section">
                            <p className="so-drawer-section-title">💳 Payment Info</p>

                            {[
                                { label: "Payment ID", val: order.razorpay_payment_id },
                                { label: "Gateway", val: order.payment_gateway || "—" },
                                { label: "Status", val: <PayBadge status={order.payment_status} /> },
                            ].map(({ label, val }) => (
                                <div
                                    key={label}
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        fontSize: "0.8rem",
                                        fontWeight: 700,
                                        color: "#4b5563",
                                        marginBottom: 6,
                                    }}
                                >
                                    <span style={{ color: "#9ca3af" }}>{label}</span>
                                    <span>{val}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
