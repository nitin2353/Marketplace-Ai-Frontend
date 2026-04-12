function StarRating({ rating, size = ".75rem" }) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    return (
        <span className="pd-stars" style={{ fontSize: size }}>
            {"★".repeat(full)}{half ? "½" : ""}{"☆".repeat(5 - full - (half ? 1 : 0))}
        </span>
    );
}

export default StarRating