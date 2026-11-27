
function SkeletonCard() {
    return (
        <div style={{ 
            background: "var(--bg-surface)", 
            borderRadius: "var(--radius-lg)", 
            border: "1px solid var(--border-light)", 
            overflow: "hidden",
            boxShadow: "var(--shadow-sm)"
        }}>
            <div className="pd-skeleton" style={{ aspectRatio: "1/1", background: "var(--bg-hover)" }} />
            <div style={{ padding: "16px" }}>
                <div className="pd-skeleton" style={{ height: 10, width: "30%", marginBottom: 8, background: "var(--bg-hover)" }} />
                <div className="pd-skeleton" style={{ height: 18, marginBottom: 8, background: "var(--bg-hover)" }} />
                <div className="pd-skeleton" style={{ height: 14, width: "70%", marginBottom: 12, background: "var(--bg-hover)" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div className="pd-skeleton" style={{ height: 20, width: "40%", background: "var(--bg-hover)" }} />
                    <div className="pd-skeleton" style={{ height: 32, width: "32px", borderRadius: "50%", background: "var(--bg-hover)" }} />
                </div>
            </div>
        </div>
    );
}

export default SkeletonCard;