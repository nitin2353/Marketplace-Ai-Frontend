import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Stack } from "react-bootstrap";
import { FMT, TIMELINE_STEPS } from "../../helper/GlobalHelper";
import { STATUS_META } from "../../helper/GlobalHelper";
import "./orderpage.css";


function OrderTimeline({ currentStatus }) {
    const activeIdx = TIMELINE_STEPS.indexOf(currentStatus);
    const isCancelled = currentStatus === "cancelled" || currentStatus === "payment_failed";

    if (isCancelled) {
        return (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0" }}>
                <span style={{ fontSize: 20 }}>❌</span>
                <span style={{ fontSize: "0.84rem", fontWeight: 800, color: "#dc2626" }}>
                    Order {currentStatus === "payment_failed" ? "Payment Failed" : "Cancelled"}
                </span>
            </div>
        );
    }

    return (
        <div className="ord-timeline">
            {TIMELINE_STEPS.map((step, i) => {
                const isDone = i < activeIdx;
                const isActive = i === activeIdx;
                const meta = STATUS_META[step];
                return (
                    <div key={step} className="ord-tl-item">
                        <div className={`ord-tl-dot ${isDone ? "done" : isActive ? "active" : ""}`} />
                        <span className="ord-tl-label" style={{ color: isDone || isActive ? "#1a1a2e" : "#9ca3af" }}>
                            {meta.icon} {meta.label}
                        </span>
                        {isActive && (
                            <span className="ord-tl-time">In progress</span>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default OrderTimeline;