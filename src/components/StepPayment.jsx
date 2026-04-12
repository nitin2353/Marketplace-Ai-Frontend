// components/StepPayment.jsx
import { useState } from "react";
import { Stack } from "react-bootstrap";
import { METHODS } from "../helper/GlobalHelper";



export default function StepPayment({ selected, onSelect, onNext, onBack }) {


    const validateAndNext = () => { 
        if (!selected) {
            return;
        }
        onNext();
    };

    return (
        <div>
            <p className="co-section-title">💳 Choose Payment Method</p>

            <Stack gap={2} className="mb-2">
                {METHODS.map(({ id, icon, label, sub }) => (
                    <div
                        key={id}
                        className={`co-pay-opt ${selected === id ? "active" : ""}`}
                        onClick={() => onSelect(id)}
                    >
                        {/* Custom radio */}
                        <div className={`co-pay-radio ${selected === id ? "active" : ""}`}>
                            {selected === id && <div className="co-pay-radio-dot" />}
                        </div>
                        <span style={{ fontSize: 20 }}>{icon}</span>
                        <div>
                            <p className="co-pay-label mb-0">{label}</p>
                            <p className="co-pay-sub   mb-0">{sub}</p>
                        </div>
                    </div>
                ))}
            </Stack>
            {selected === "cod" && (
                <div className="co-info-box" style={{ marginTop: 14 }}>
                    💵 Cash on Delivery is available. Please keep exact change ready at delivery.
                </div>
            )}

            {/* Razorpay note for online payments */}
            {selected && selected !== "cod" && selected !== "card" && selected !== "upi" && (
                <div className="co-info-box" style={{ marginTop: 14 }}>
                    🔒 Razorpay makes your payment secure select gateway to complete the payment.
                </div>
            )}

            <Stack direction="horizontal" gap={2} className="mt-4">
                <button className="co-btn-back" onClick={onBack}>← Back</button>
                <button
                    className="co-btn-main flex-fill"
                    onClick={validateAndNext}
                    disabled={!selected}
                >
                    Review Order →
                </button>
            </Stack>
        </div>
    );
}