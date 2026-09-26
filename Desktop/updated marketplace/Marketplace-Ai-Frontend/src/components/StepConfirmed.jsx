// components/StepConfirmed.jsx
import { useNavigate } from "react-router-dom";
import { Stack } from "react-bootstrap";
import { METHOD_ICONS } from "../helper/GlobalHelper";
import { FMT } from "../helper/GlobalHelper";
import "../style/checkout.css";



export default function StepConfirmed({ orderId, total, address, paymentMethod, cart = [] }) {
    const navigate = useNavigate();

    console.log("StepConfirmed props", { orderId, total, address, paymentMethod, cart });


    return (    
        <div className="co-confirmed-wrap">
            {/* Success ring */}
            <div className="co-confirmed-ring">
                <i className="fas fa-check"></i>
            </div>

            <h4 className="fw-bold mb-2" style={{ color: "var(--text-main)", fontSize: "1.75rem", fontFamily: "var(--font-display)" }}>Order Confirmed! 🎉</h4>
            <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", fontWeight: 600, marginBottom: 24, maxWidth: "400px", margin: "0 auto 24px" }}>
                Success! Your neural network components are being prepared for dispatch. We've sent a confirmation to your inbox.
            </p>

            {/* Order ID */}
            <div className="co-order-id-chip" style={{color: "#4261ecff"}}>Order # {orderId}</div>

            {/* Total */}
            <p style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--primary)", margin: "8px 0 20px" }}>
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
            <Stack gap={2} className="co-cta-stack">
                <button className="" style={{ width: "100%", background: "#4261ecff", color: "white", border: "none", padding: "10px 0", fontWeight: 600, fontSize: "1.1rem", borderRadius: "10px" }} onClick={() => navigate("/dashboard/orders")}>
                    📦 Track My Order
                </button>
                <button className="co-btn-back" onClick={() => navigate("/")}>
                    ← Continue Shopping
                </button>
            </Stack>
        </div>
    );
}