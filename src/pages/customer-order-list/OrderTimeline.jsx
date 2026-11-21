
import toast from "react-hot-toast";
import { trackDelivery } from "../../api/shiprocket.api";
import {
    TIMELINE_STEPS,
    TIMELINE_STATUS_META
} from "../../helper/GlobalHelper";
import "./orderpage.css";
import { useEffect, useCallback, useState } from "react";

function OrderTimeline({ currentStatus, order }) {
    const [trackingData, setTrackingData] = useState(null);

    const normalizedStatus = String(currentStatus || "")
        .trim()
        .toLowerCase();

    const waybills = order?.items
        ?.map(item => item.waybill)
        .filter(Boolean) || [];

    const refnum = order?.items?.at(-1)?.refnum;

    const fetchOrderStatusByTracking = useCallback(async () => {
        try {
            if (!waybills.length) {
                console.log("Tracking number not found");
                return;
            }

            console.log("Waybills:", waybills);
            console.log("Refnum:", refnum);

            const data = await trackDelivery(
                waybills.join(","),
                refnum || undefined
            );

            console.log("Tracking Data:", data);
            setTrackingData(data);

        } catch (error) {
            console.error("Tracking Error:", {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                url: error.config?.url,
                params: error.config?.params
            });

            toast.error(
                error.response?.data?.message ||
                error.message ||
                "Unable to fetch tracking details"
            );
        }
    }, [waybills.join(","), refnum]);

    useEffect(() => {
        fetchOrderStatusByTracking();
    }, [fetchOrderStatusByTracking]);

    const isCancelled = ["cancelled", "payment_failed"].includes(
        normalizedStatus
    );

    if (isCancelled) {
        return (
            <div className="d-flex align-items-center gap-2 p-3 rounded-3 bg-danger bg-opacity-10 border border-danger border-opacity-10">
                <i className="fas fa-times-circle text-danger"></i>
                <span className="small fw-bold text-danger">
                    {normalizedStatus === "payment_failed"
                        ? "Payment Failed"
                        : "Order Cancelled"}
                </span>
            </div>
        );
    }

    const STATUS_ALIASES = {
        placed: "confirmed",
        shipped: "in_transit",
    };

    const resolvedStatus =
        STATUS_ALIASES[normalizedStatus] || normalizedStatus;

    const activeIdx = TIMELINE_STEPS.indexOf(resolvedStatus);

    if (activeIdx === -1) {
        return (
            <div className="p-3 rounded-3 border bg-light">
                <span className="small text-muted">
                    Order status: {normalizedStatus || "Not available"}
                </span>
            </div>
        );
    }

    return (
        <div className="local-timeline py-3">
            {TIMELINE_STEPS.map((step, index) => {
                const isDone = index < activeIdx;
                const isActive = index === activeIdx;
                const meta = TIMELINE_STATUS_META[step];

                return (
                    <div
                        key={step}
                        className={`timeline-step ${isDone ? "done" : isActive ? "active" : ""
                            }`}
                    >
                        <div className="step-marker">
                            <div className="step-dot"></div>
                            {index < TIMELINE_STEPS.length - 1 && (
                                <div className="step-line"></div>
                            )}
                        </div>

                        <div className="step-content">
                            <span className="step-label">
                                {meta.label}
                            </span>

                            {isActive && (
                                <span className="step-status">
                                    In Progress
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default OrderTimeline;
