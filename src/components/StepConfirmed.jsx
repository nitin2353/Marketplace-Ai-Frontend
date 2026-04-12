// components/StepConfirmed.jsx
import { useNavigate } from "react-router-dom";
import { Stack } from "react-bootstrap";
import { METHOD_ICONS } from "../helper/GlobalHelper";
import { FMT } from "../helper/GlobalHelper";



export default function StepConfirmed({ orderId, total, address, paymentMethod, cart = [] }) {
    const navigate = useNavigate();

    console.log("StepConfirmed props", { orderId, total, address, paymentMethod, cart });


    return (    
        <div className="co-confirmed-wrap">
            {/* Success ring */}
            <div className="co-confirmed-ring">🎉</div>

            <h4 className="fw-bold mb-2" style={{ color: "#1a1a2e" }}>Order Placed!</h4>
            <p style={{ fontSize: "0.88rem", color: "#505a6d", fontWeight: 700, marginBottom: 16 }}>
                Your order has been confirmed. We'll send updates to your email.
            </p>

            {/* Order ID */}
            <div className="co-order-id-chip">Order # {orderId}</div>

            {/* Total */}
            <p style={{ fontSize: "1.5rem", fontWeight: 900, color: "#ff6b35", margin: "8px 0 20px" }}>
                {FMT(total)}
            </p>

            {/* Delivery & payment summary */}
            <div className="co-confirmed-info">
                <div className="co-confirmed-info-row">
                    <span>📦</span>
                    <span>{address?.name} · {address?.city}, {address?.pincode}</span>
                </div>
                <div className="co-confirmed-info-row">
                    <span>{METHOD_ICONS[paymentMethod] || "💳"}</span>
                    <span>{paymentMethod === "cod" ? "Cash on Delivery" : "Paid online"}</span>
                </div>
                <div className="co-confirmed-info-row">
                    <span>🛍️</span>
                    <span>{cart.length} item{cart.length !== 1 ? "s" : ""}</span>
                </div>
            </div>

            {/* CTAs */}
            <Stack gap={2} style={{ maxWidth: 320, margin: "0 auto" }}>
                <button className="co-btn-main" onClick={() => navigate("/dashboard/orders")}>
                    📦 Track My Order
                </button>
                <button className="co-btn-back" onClick={() => navigate("/dashboard")}>
                    ← Continue Shopping
                </button>
            </Stack>
        </div>
    );
}