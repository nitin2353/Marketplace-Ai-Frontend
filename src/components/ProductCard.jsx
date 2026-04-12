import { Col, Row } from 'react-bootstrap';
import '../style/Dashboard.css'
import { useAuthWrapper } from '../helper/AuthWrapper';
import StarRating from './StarRating';
import cartApi from '../api/cartApi';
import toast from 'react-hot-toast';
import AddToCartModal from './AddToCartModal';
import { FMT } from '../helper/GlobalHelper';



function TagBadge({ tag }) {
    const style = tag === "Sale" ? { bg: "#dcfce7", color: "#166534" }
        : tag === "New Arrival" ? { bg: "#dbeafe", color: "#1d4ed8" }
            : tag === "Best Seller" ? { bg: "#fff0e6", color: "#ff6b35" }
                : tag === "Trending" ? { bg: "#fef9c3", color: "#854d0e" }
                    : tag === "Eco Friendly" ? { bg: "#d1fae5", color: "#065f46" }
                        : tag === "Premium" ? { bg: "#ede9fe", color: "#7c3aed" }
                            : { bg: "#f0f4ff", color: "#6366f1" };
    return (
        <span className="pd-card-badge" style={{ background: style.bg, color: style.color }}>
            {tag}
        </span>
    );
}


const ProductCard = ({ product, onAdd, onWishlist, onView, isWished, delay = 0, setCartModal }) => {

    const { setIsLike } = useAuthWrapper()
    const stock = Number(product.stock) || 0

    return (
        <div className="pd-card fu" style={{ animationDelay: `${delay}s` }} onClick={() => onView(product)}>
            <div className="pd-card-img-wrap">
                <img src={product.img} alt={product.title} className="pd-card-img"
                    onError={e => { e.target.src = `https://placehold.co/400x400/f1f4ff/ff6b35?text=${encodeURIComponent(product.title.slice(0, 2))}`; }} />
                {product.tag && <TagBadge tag={product.tag} />}
                {product.discount > 0 && (
                    <span style={{ position: "absolute", bottom: 10, left: 10, background: "#dc3545", color: "#fff", borderRadius: 20, padding: "2px 8px", fontSize: ".65rem", fontWeight: 900 }}>
                        {product.discount}% OFF
                    </span>
                )}
                <div className="pd-card-actions">
                    <button className="pd-action-btn" style={{ background: isWished ? "#463639" : "#ffffff" }} title="Wishlist" onClick={e => { e.stopPropagation(); onWishlist(product); setIsLike(product.id.split(',')) }}>
                        <span>❤️</span>
                    </button>
                </div>
            </div>
            <div className="pd-card-body">
                <div className="d-flex">
                    <div style={{ width: "250px" }} className="text-truncate">
                        {product.brand}
                    </div>
                </div>
                <div style={{ fontSize: "10px", width: "50px" }} className="mt-0 float-end pd-add-btn p-0 flex-grow-1 d-flex text-truncate border rounded-4 justify-content-center">
                    {product.category}
                </div>
                {/* <div className="fs-6 border rounded-6 p-"></div> */}
                <div className="pd-card-title">{product.title}</div>
                {/* Color swatches */}
                {/* {product?.colors?.length > 0 && (
                    <div className="d-flex gap-1 mb-2 flex-wrap">
                        {product.colors.slice(0, 6).map(c => (
                            <span key={c} className="pd-color-dot" style={{ background: c }} title={c} />
                        ))}
                        {product.colors.length > 6 && <span style={{ fontSize: ".66rem", color: "#9ca3af", fontWeight: 700, alignSelf: "center" }}>+{product.colors.length - 6}</span>}
                    </div>
                )} */}
                <div className="d-flex align-items-center gap-1 mb-1">
                    <StarRating rating={product.rating} />
                    <span style={{ fontSize: ".68rem", color: "#aaa", fontWeight: 700 }}>({product.reviews.toLocaleString()})</span>
                </div>
                <div className="d-flex align-items-baseline flex-wrap gap-1 mb-1">
                    <span className="pd-price">{FMT(product.price)}</span>
                    {product.old_price > product.price && <span className="pd-price-old">{FMT(product.old_price)}</span>}
                    {product.discount > 0 && <span className="pd-discount">↓{product.discount}%</span>}
                </div>
                <div style={{ fontSize: ".68rem", color: stock === 0 ? "#dc3545" : stock <= 15 ? "#b9a810" : '#3abd1a', fontWeight: 800, marginBottom: 2 }}>
                    {stock === 0 ? "❌ Out of Stock" : stock < 15 ? `⚠ Limited Stock !` : `✔ In Stock`}
                </div>
                {/* Badges row */}
                <div className="d-flex gap-1 flex-wrap mb-1">
                    {/* {product.is_return ? <span style={{ fontSize: ".62rem", fontWeight: 800, background: "#dcfce7", color: "#166534", borderRadius: 6, padding: "1px 6px" }}>↩ Return</span> : <span style={{ fontSize: ".62rem", fontWeight: 800, background: "#dcfce7", color: "#166534", borderRadius: 6, padding: "1px 6px" }}>↩ No Return</span>}
                    {product.is_replace ? <span style={{ fontSize: ".62rem", fontWeight: 800, background: "#dbeafe", color: "#1d4ed8", borderRadius: 6, padding: "1px 6px" }}>🔄 Replace</span> : <span style={{ fontSize: ".62rem", fontWeight: 800, background: "#dbeafe", color: "#1d4ed8", borderRadius: 6, padding: "1px 6px" }}>🔄 No Replace</span>} */}
                    {product.is_customizable ? <span style={{ fontSize: ".62rem", fontWeight: 800, background: "#ede9fe", color: "#7c3aed", borderRadius: 6, padding: "1px 6px" }}>✏️ Custom</span> : <span style={{ fontSize: ".62rem", fontWeight: 800, background: "#ede9fe", color: "#7c3aed", borderRadius: 6, padding: "1px 6px" }}>✏️ No Customization</span>}
                </div>
                <button
                    className="pd-add-btn"
                    disabled={stock === 0}
                    style={{ opacity: stock === 0 ? 0.5 : 1, cursor: stock === 0 ? "not-allowed" : "pointer" }}
                    onClick={e => { e.stopPropagation(); if (stock > 0) setCartModal(product); onAdd(product); }}
                >
                    {product.stock === 0 ? "Out of Stock" : "🛒 Add to Cart"}
                </button>
            </div>

        </div>
    );
}


export default ProductCard