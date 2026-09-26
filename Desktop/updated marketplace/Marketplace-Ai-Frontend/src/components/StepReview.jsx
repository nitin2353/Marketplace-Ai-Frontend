// components/StepReview.jsx
import { Col, Row, Stack } from "react-bootstrap";
import { FMT } from "../helper/GlobalHelper";

const METHOD_LABELS = {
    card: { icon: "💳", label: "Credit / Debit Card" },
    upi: { icon: "📱", label: "UPI" },
    netbanking: { icon: "🏦", label: "Net Banking" },
    wallet: { icon: "👛", label: "Mobile Wallet" },
    cod: { icon: "💵", label: "Cash on Delivery" },
};

export default function StepReview({
    cart, address, paymentMethod,
    coupon, discount, couponMsg,
    subtotal, saved, couponSave, delivery, tax_amount, total,
    placing,
    onCouponChange, onCouponApply,
    onBack, onPlace,
}) {
    const method = METHOD_LABELS[paymentMethod] || {};

    return (
        <div>
            <p className="co-section-title">📋 Review Your Order</p>
            {console.log("address", address)}
            {/* ── Address ── */}
            <div className="co-review-block">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="co-review-block-header mb-0">
                        <span>📦 Delivering to</span>
                    </div>
                    <div style={{
                        background: "var(--primary-gradient)",
                        borderRadius: 8, padding: "3px 10px",
                        fontSize: ".72rem", fontWeight: 800, color: "#ffffff"
                    }}>
                        {address?.label}
                    </div>
                </div>
                <p style={{ fontWeight: 800, fontSize: "0.9rem", color: "#1a1a2e", marginBottom: 3 }}>
                    {address?.name}
                </p>
                <p style={{ fontSize: "0.82rem", color: "#6b7280", fontWeight: 700, marginBottom: 2 }}>
                    {address?.address_line_1}
                    {address?.address_line_2 ? `, ${address.address_line_2}` : ""}
                </p>
                <p style={{ fontSize: "0.82rem", color: "#6b7280", fontWeight: 700, marginBottom: 2 }}>
                    {address?.city}, {address?.state} — {address?.pincode}
                </p>
                <p style={{ fontSize: "0.82rem", color: "#6b7280", fontWeight: 700, marginBottom: 0 }}>
                    📞 {address?.mobile || address?.phone}
                </p>
            </div>

            {/* ── Payment ── */}
            <div className="co-review-block">
                <div className="co-review-block-header">
                    <span>💳 Payment via</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <span style={{ fontSize: 22 }}>{method.icon}</span>
                    <span style={{ fontWeight: 800, fontSize: "0.9rem", color: "#1a1a2e" }}>
                        {method.label}
                    </span>
                </div>
            </div>

            {/* ── Items ── */}
            <div className="co-review-block">
                <div className="co-review-block-header">
                    <span>🛍️ {cart.length} item{cart.length !== 1 ? "s" : ""}</span>
                </div>
                {cart.map((item) => (
                    <div key={item.id} className="co-order-item">
                        <img
                            src={item.image_url.split(',')[0].replace(/[{}"\\]/g, "")}
                            alt={item.title}
                            className="co-order-img"
                            onError={(e) => {
                                e.target.src = `https://placehold.co/52x52/f1f4ff/ff6b35?text=${encodeURIComponent((item.title || "P").slice(0, 2))}`;
                            }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p className="co-order-title mb-0">{item.title}</p>
                            <div className="co-order-meta">
                                {item.size && <span>{item.size}</span>}
                                {item.color && (
                                    <span
                                        style={{ width: 10, height: 10, borderRadius: "50%", background: item.color, border: "1px solid rgba(0,0,0,.12)", display: "inline-block" }}
                                    />
                                )}
                                <span>× {item.qty}</span>
                            </div>
                        </div>
                        <span className="co-order-price">{FMT(item.price)}</span>
                    </div>
                ))}
            </div>

            {/* ── Coupon ── */}
            {/* <div className="co-review-block">
                <div className="co-review-block-header"><span>🏷️ Coupon</span></div>
                <div className="co-coupon-wrap">
                    <input
                        className="co-coupon-input"
                        placeholder="e.g. SAVE10"
                        value={coupon}
                        onChange={(e) => onCouponChange(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && onCouponApply()}
                    />
                    <button style={{ background: "#5a62f2ff", color: "white", width: "20%", border: "none", padding: "10px 0", fontWeight: 600, fontSize: "1.1rem", borderRadius: "10px" }} onClick={onCouponApply}>Apply</button>

                </div>
                {couponMsg && (
                    <p style={{ fontSize: "0.75rem", fontWeight: 700, marginTop: 6, color: couponMsg.type === "success" ? "#16a34a" : "#dc2626" }}>
                        {couponMsg.text}
                    </p>
                )}
                <p style={{ fontSize: "0.7rem", color: "#9ca3af", fontWeight: 700, marginTop: 4 }}>
                    Try: SAVE10 · SHOP20 · FIRST50
                </p>
            </div> */}

            {/* ── Price breakdown ── */}
            <div className="co-review-block">
                <div className="co-review-block-header"><span>💰 Price Breakdown</span></div>
                {[
                    { label: "Subtotal", val: FMT(subtotal), cls: "val" },
                    ...(saved > 0 ? [{ label: "Discount", val: `-${FMT(saved)}`, cls: "save" }] : []),
                    ...(couponSave > 0 ? [{ label: `Coupon (${discount}%)`, val: `-${FMT(couponSave)}`, cls: "save" }] : []),
                    // { label: "Tax", val: FMT(tax_amount), cls: "val" },
                    { label: "Delivery", val: delivery === 0 ? "FREE 🎉" : FMT(delivery), cls: delivery === 0 ? "free" : "val" },
                ].map(({ label, val, cls }) => (
                    <div key={label} className="co-summary-row">
                        <span className="label">{label}</span>
                        <span className={cls}>{val}</span>
                    </div>
                ))}
                <div className="co-divider" />
                <div className="co-total-row">
                    <span className="co-total-label">Total</span>
                    <span className="co-total-val">{FMT(total)}</span>
                </div>
            </div>

            <div className="d-flex flex-sm-row gap-2 mt-4">
                <button className="co-btn-back h-100 w-25 order-2 order-sm-1" onClick={onBack}>← Back</button>

                <button className="w-75 h-100 mt-2" disabled={placing} style={{ background: "#4261ecff", color: "white", border: "none", padding: "10px 0", fontWeight: 600, fontSize: "1.1rem", borderRadius: "10px" }} onClick={() => onPlace(total)}>{placing
                    ? "Placing Order…"
                    : `✅ Place Order · ${FMT(total)}`}
                </button>
            </div>
        </div >
    );
}