const PayBadge = ({ status }) => (
    <span className={`so-pay-badge ${status || ""}`}>
        {status === "paid"
            ? "✔"
            : status === "failed"
                ? "✕"
                : status === "refunded"
                    ? "↩"
                    : "⏳"}{" "}
        {status || "pending"}
    </span>
);


export default PayBadge