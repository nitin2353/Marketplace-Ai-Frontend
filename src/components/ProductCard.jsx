import { Col, Row } from 'react-bootstrap';
import '../style/Dashboard.css'
import { useAuthWrapper } from '../helper/AuthWrapper';
import StarRating from './StarRating';
import cartApi from '../api/cartApi';
import toast from 'react-hot-toast';
import AddToCartModal from './AddToCartModal';
import { FMT } from '../helper/GlobalHelper';



function TagBadge({ tag }) {
    const style = tag === "Sale" ? { bg: "#fee2e2", color: "#b91c1c" }
        : tag === "New Arrival" ? { bg: "#eff6ff", color: "#1d4ed8" }
            : tag === "Best Seller" ? { bg: "#ecfdf5", color: "#047857" }
                : tag === "Trending" ? { bg: "#fef9c3", color: "#a16207" }
                    : { bg: "#f8fafc", color: "#64748b" };
    return (
        <span className="pd-card-badge" style={{ 
            background: style.bg, 
            color: style.color,
            padding: "4px 10px",
            borderRadius: "4px",
            fontSize: "0.65rem",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.5px"
        }}>
            {tag}
        </span>
    );
}

const ProductCard = ({ product, onAdd, onWishlist, onView, isWished, delay = 0, setCartModal }) => {
    const { setIsLike } = useAuthWrapper();
    const stock = Number(product.stock) || 0;

    return (
        <div 
            className="pd-card" 
            style={{ 
                animationDelay: `${delay}s`,
                background: "var(--bg-surface)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-light)",
                overflow: "hidden",
                transition: "all 0.3s ease",
                cursor: "pointer",
                height: "100%",
                display: "flex",
                flexDirection: "column"
            }} 
            onClick={() => onView(product)}
        >
            <div className="pd-card-img-wrap" style={{ position: "relative", background: "#f8fafc" }}>
                <img 
                    src={product.img} 
                    alt={product.title} 
                    style={{ width: "100%", aspectRatio: "1/1", objectFit: "contain", transition: "transform 0.5s" }}
                    onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
                    onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                    onError={e => { e.target.src = `https://placehold.co/400x400/eff6ff/2563eb?text=${encodeURIComponent(product.title.slice(0, 2))}`; }} 
                />
                
                {product.tag && (
                    <div style={{ position: "absolute", top: 10, left: 10 }}>
                        <TagBadge tag={product.tag} />
                    </div>
                )}

                <div style={{ position: "absolute", top: 10, right: 10 }}>
                    <button 
                        className="wishlist-btn"
                        style={{ 
                            background: "white", 
                            border: "none", 
                            width: "32px", 
                            height: "32px", 
                            borderRadius: "50%", 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "center",
                            boxShadow: "var(--shadow-sm)",
                            fontSize: "1rem",
                            color: isWished ? "var(--danger)" : "#cbd5e1",
                            transition: "all 0.2s"
                        }} 
                        title="Wishlist" 
                        onClick={e => { e.stopPropagation(); onWishlist(product); setIsLike(product.id.split(',')) }}
                    >
                        {isWished ? "❤️" : "🤍"}
                    </button>
                </div>

                {product.discount > 0 && (
                    <div style={{ 
                        position: "absolute", 
                        bottom: 10, 
                        left: 10, 
                        background: "var(--danger)", 
                        color: "white", 
                        padding: "2px 8px", 
                        borderRadius: "4px", 
                        fontSize: "0.7rem", 
                        fontWeight: 700 
                    }}>
                        {product.discount}% OFF
                    </div>
                )}
            </div>

            <div className="pd-card-body" style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column" }}>
                <div className="d-flex justify-content-between align-items-center mb-1">
                    <span style={{ fontSize: "0.75rem", color: "var(--text-light)", fontWeight: 600, textTransform: "uppercase" }}>
                        {product.brand}
                    </span>
                    <span style={{ fontSize: "0.65rem", background: "var(--bg-hover)", color: "var(--primary)", padding: "2px 6px", borderRadius: "4px", fontWeight: 700 }}>
                        {product.category}
                    </span>
                </div>

                <h3 style={{ 
                    fontSize: "0.95rem", 
                    fontWeight: 600, 
                    color: "var(--text-main)", 
                    margin: "4px 0 8px",
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    lineHeight: 1.4,
                    height: "2.8em",
                    fontFamily: "var(--font-heading)"
                }}>
                    {product.title}
                </h3>

                <div className="d-flex align-items-center gap-2 mb-2">
                    <StarRating rating={product.rating} />
                    <span style={{ fontSize: "0.75rem", color: "var(--text-light)", fontWeight: 500 }}>
                        ({product.reviews.toLocaleString()})
                    </span>
                </div>

                <div className="mt-auto">
                    <div className="d-flex align-items-baseline gap-2 mb-1">
                        <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-main)" }}>
                            {FMT(product.price)}
                        </span>
                        {product.old_price > product.price && (
                            <span style={{ fontSize: "0.85rem", color: "var(--text-light)", textDecoration: "line-through" }}>
                                {FMT(product.old_price)}
                            </span>
                        )}
                    </div>

                    <div style={{ 
                        fontSize: "0.75rem", 
                        color: stock === 0 ? "var(--danger)" : stock < 15 ? "#b45309" : "var(--success)", 
                        fontWeight: 700,
                        marginBottom: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                    }}>
                        {stock === 0 ? "• Out of Stock" : stock < 15 ? "• Limited Stock" : "• In Stock"}
                    </div>

                    <button
                        className="btn-add-to-cart"
                        disabled={stock === 0}
                        style={{ 
                            width: "100%",
                            padding: "10px",
                            borderRadius: "var(--radius-md)",
                            background: stock === 0 ? "var(--bg-hover)" : "var(--primary)",
                            color: stock === 0 ? "var(--text-light)" : "white",
                            border: "none",
                            fontWeight: 700,
                            fontSize: "0.9rem",
                            cursor: stock === 0 ? "not-allowed" : "pointer",
                            transition: "all 0.2s ease",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px"
                        }}
                        onClick={e => { 
                            e.stopPropagation(); 
                            if (stock > 0) {
                                setCartModal(product); 
                                onAdd(product);
                            }
                        }}
                    >
                        {stock === 0 ? "Out of Stock" : <>🛒 Add to Cart</>}
                    </button>
                </div>
            </div>

            <style>{`
                .pd-card:hover {
                    box-shadow: var(--shadow-lg);
                    transform: translateY(-4px);
                    border-color: var(--primary);
                }
                .wishlist-btn:hover {
                    transform: scale(1.1);
                    color: var(--danger) !important;
                }
                .btn-add-to-cart:hover:not(:disabled) {
                    background: var(--primary-dark) !important;
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
                }
            `}</style>
        </div>
    );
}


export default ProductCard