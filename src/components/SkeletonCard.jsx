
function SkeletonCard() {
    return (
        <div style={{ background: "#fff", borderRadius: 20, border: "2px solid #e8eaf6", overflow: "hidden" }}>
            <div className="pd-skeleton" style={{ aspectRatio: "1/1" }} />
            <div style={{ padding: "12px 14px 14px" }}>
                <div className="pd-skeleton" style={{ height: 10, width: "50%", marginBottom: 8 }} />
                <div className="pd-skeleton" style={{ height: 14, marginBottom: 6 }} />
                <div className="pd-skeleton" style={{ height: 14, width: "75%", marginBottom: 10 }} />
                <div className="pd-skeleton" style={{ height: 12, width: "40%", marginBottom: 14 }} />
                <div className="pd-skeleton" style={{ height: 38, borderRadius: 0 }} />
            </div>
        </div>
    );
}

export default SkeletonCard;