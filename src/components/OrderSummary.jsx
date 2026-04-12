import { useEffect } from "react";
import { FMT } from "../helper/GlobalHelper";


const TRUST = [
    { icon: "🔒", label: "100% Secure" },
    { icon: "🚚", label: "Fast Delivery" },
    { icon: "↩️", label: "Easy Returns" },
];

export default function OrderSummary({
    cart = [],
    coupon, discount, couponMsg,
    subtotal, saved, couponSave, delivery, total,
    onCouponChange, onCouponApply,
}) {


    useEffect(() => {
        if(coupon)
        onCouponApply();
    },[])    


    return (
        <div className="co-summary-card">
            <p className="co-section-title">🧾 Order Summary</p>

            {/* Items */}
            <div style={{ marginBottom: 16 }}>
                {cart.map((item) => (
                    <div key={item.id} className="co-order-item">
                        <img
                            src={item.img || item.image_url}
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
                                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: item.color, border: "1px solid rgba(0,0,0,.12)", display: "inline-block" }} />
                                )}
                                <span>× {item.qty}</span>
                            </div>
                        </div>
                        <span className="co-order-price">{FMT(item.product_price * item.qty)}</span>
                    </div>
                ))}
            </div>

            {/* Coupon */}
            <div style={{ marginBottom: 16 }}>
                <p className="co-label mb-2">Have a coupon?</p>
                <div className="co-coupon-wrap">
                    <input
                        className="co-coupon-input"
                        placeholder="e.g. SAVE10"
                        value={coupon}
                        onChange={(e) => onCouponChange(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && onCouponApply()}
                    />
                    <button className="co-coupon-btn" onClick={onCouponApply}>Apply</button>
                </div>
                {couponMsg && (
                    <p style={{ fontSize: "0.75rem", fontWeight: 700, marginTop: 5, color: couponMsg.type === "success" ? "#16a34a" : "#dc2626" }}>
                        {couponMsg.text}
                    </p>
                )}
                <p style={{ fontSize: "0.7rem", color: "#9ca3af", fontWeight: 700, marginTop: 4 }}>
                    Try: SAVE10 · SHOP20 · FIRST50
                </p>
            </div>

            <div className="co-divider" />

            {/* Breakdown */}
            {[
                { label: "Subtotal", val: FMT(subtotal), cls: "val" },
                ...(saved > 0 ? [{ label: "You save", val: `-${FMT(saved)}`, cls: "save" }] : []),
                ...(couponSave > 0 ? [{ label: `Coupon (${discount}%)`, val: `-${FMT(couponSave)}`, cls: "save" }] : []),
                { label: "Delivery", val: delivery === 0 ? "FREE 🎉" : FMT(delivery), cls: delivery === 0 ? "free" : "val" },
            ].map(({ label, val, cls }) => (
                <div key={label} className="co-summary-row">
                    <span className="label">{label}</span>
                    <span className={cls}>{val}</span>
                </div>
            ))}

            {delivery > 0 && subtotal > 0 && (
                <div className="co-delivery-nudge">
                    🚚 Add <b>{FMT(499 - subtotal)}</b> more for FREE delivery!
                </div>
            )}

            <div className="co-divider" />

            <div className="co-total-row">
                <span className="co-total-label">Total</span>
                <span className="co-total-val">{FMT(total)}</span>
            </div>

            <div className="co-divider" />

            {/* Trust badges */}
            <div className="d-flex justify-content-center gap-4 flex-wrap mt-2">
                {TRUST.map(({ icon, label }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.72rem", fontWeight: 700, color: "#6b7280" }}>
                        <span style={{ fontSize: 14 }}>{icon}</span>
                        <span>{label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}