import { TIMELINE_STEPS, STATUS_META } from "../../helper/GlobalHelper";
// import "./ordertimeline.css";
import "./orderpage.css";

function OrderTimeline({ currentStatus }) {
    const activeIdx = TIMELINE_STEPS.indexOf(currentStatus);
    const isCancelled = ["cancelled", "payment_failed"].includes(currentStatus);

    if (isCancelled) {
        return (
            <div className="d-flex align-items-center gap-2 p-3 rounded-3 bg-danger bg-opacity-10 border border-danger border-opacity-10">
                <i className="fas fa-times-circle text-danger"></i>
                <span className="small fw-bold text-danger">
                    Order {currentStatus === "payment_failed" ? "Payment Failed" : "Cancelled"}
                </span>
            </div>
        );
    }

    return (
        <div className="local-timeline py-3">
            {TIMELINE_STEPS.map((step, i) => {
                const isDone = i < activeIdx;
                const isActive = i === activeIdx;
                const meta = STATUS_META[step] || { label: step, icon: "•" };

                return (
                    <div key={step} className={`timeline-step ${isDone ? "done" : isActive ? "active" : ""}`}>
                        <div className="step-marker">
                            <div className="step-dot"></div>
                            {i < TIMELINE_STEPS.length - 1 && <div className="step-line"></div>}
                        </div>
                        <div className="step-content">
                            <span className="step-label">{meta.label}</span>
                            {isActive && <span className="step-status">In Progress</span>}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default OrderTimeline;