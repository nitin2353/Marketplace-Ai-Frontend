import { useCallback, useEffect, useRef, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Toolbar from "../../components/Toolbar";
import wishlistApi from "../../api/wishlist.api";
import cartApi from "../../api/cartApi";
import SkeletonCard from "../../components/SkeletonCard";
import StarRating from "../../components/StarRating";
import { useAuthWrapper } from "../../helper/AuthWrapper";
import GlobalHelper from "../../helper/GlobalHelper";
import AddToCartModal from "../../components/AddToCartModal";
import { FMT } from "../../helper/GlobalHelper";

const TABS = ["All", "Sale"];
const SORTS = ["Recently Added", "Price: Low → High", "Price: High → Low", "Top Rated", "Most Sold"];


export default function WishlistPage() {
    const navigate = useNavigate();
    const searchRef = useRef();

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tab, setTab] = useState("All");
    const [sort, setSort] = useState("Recently Added");
    const [popAnim, setPopAnim] = useState(null);
    const [cart, setCart] = useState([]);
    const [sidebar, setSidebar] = useState(false);
    const [cartModal, setCartModal] = useState(null);

    const addToast = useCallback((msg) => toast.success(msg), []);
    const { isLike, setIsLike, setRefresh, refresh } = useAuthWrapper();

    useEffect(() => { fetchWishlist(); }, []);

    const fetchWishlist = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await wishlistApi.getAllWishlistItems();

            // Keep isLike in sync: array of { id: wishlistRowId }
            if (data?.success && Array.isArray(data.data)) {
                setIsLike(data.data.map(r => ({ id: r.id })));
            }

            const raw = data?.success
                ? (Array.isArray(data.data) ? data.data : [])
                : Array.isArray(data?.data) ? data.data
                    : Array.isArray(data) ? data
                        : [];

            setItems(raw.map(GlobalHelper.API_FIELDS_MAP['wishlist']));
            console.log("API_FIELDS_MAP", raw.map(GlobalHelper.API_FIELDS_MAP['wishlist']))
        } catch (err) {
            console.error("Wishlist fetch error:", err);
            setError("Failed to load wishlist. Please try again.");
        } finally {
            setLoading(false);
        }
    };


    const removeFromWishlist = async (item) => {
        setPopAnim(item.wishlistId);
        await new Promise(r => setTimeout(r, 280)); // wait for CSS fade

        const snapshot = [...items];
        setItems(prev => prev.filter(i => i.wishlistId !== item.wishlistId));
        setIsLike(prev => (Array.isArray(prev) ? prev : []).filter(e => e.id !== item.wishlistId));
        setPopAnim(null);

        try {
            await wishlistApi.toogleWishlist({ id: item.wishlistId });
            toast.success("Removed from wishlist");
        } catch (err) {
            console.error(err);
            // Rollback on failure
            setItems(snapshot);
            setIsLike(prev => [...(Array.isArray(prev) ? prev : []), { id: item.wishlistId }]);
            toast.error("Could not remove. Try again.");
        }
    };


    const removeAllItems = async () => {
        const snapshot = [...items];
        setItems([]);
        setIsLike([]);

        try {
            await wishlistApi.removeAllWishlistItems();
            toast.success("Wishlist cleared");
        } catch (err) {
            console.error(err);
            setItems(snapshot);
            toast.error("Could not clear. Try again.");
        }
    };


    const addToCart = async (item) => {
        setCartModal(item);
    };


    const filtered = items
        .filter(p => {
            if (tab === "Sale") return Number(p.discount) > 0;
            return true;
        })
        .sort((a, b) => {
            const aPrice = Number(a.price) || 0;
            const bPrice = Number(b.price) || 0;
            const aRating = Number(a.rating) || 0;
            const bRating = Number(b.rating) || 0;
            const aSold = Number(a.sold) || 0;
            const bSold = Number(b.sold) || 0;

            if (sort === "Price: Low → High") return aPrice - bPrice;
            if (sort === "Price: High → Low") return bPrice - aPrice;
            if (sort === "Top Rated") return bRating - aRating;
            if (sort === "Most Sold") return bSold - aSold;
            // "Recently Added" → newest created_time first
            return new Date(b.addedOn) - new Date(a.addedOn);
        });


    const totalSaved = items.reduce((s, i) => {
        const price = Number(i.price) || 0;
        const oldPrice = Number(i.old_price) || 0;
        return s + Math.max(0, oldPrice - price);
    }, 0);
    const onSaleCount = items.filter(i => Number(i.discount) > 0).length;



    return (
        <div style={{ minHeight: "100vh", background: "#f1f4ff" }}>

            <Toolbar
                searchRef={searchRef}
                cart={cart}
                wishlist={items}
                setWishlist={setItems}
                setSidebar={setSidebar}
                addToast={addToast}
                isSideBar={false}
                isSearch={false}
            />

            <Container className="pb-5 mt-4">

                {/* ── Error banner ── */}
                {error && (
                    <div className="fu" style={{ background: "#fef2f2", border: "2px solid #fca5a5", borderRadius: 16, padding: "18px 22px", marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontSize: "1.4rem" }}>⚠️</span>
                        <div>
                            <div style={{ fontWeight: 800, color: "#dc2626" }}>{error}</div>
                            <button
                                onClick={fetchWishlist}
                                style={{ marginTop: 4, border: "none", background: "none", color: "#ff6b35", fontWeight: 800, cursor: "pointer", fontFamily: "Nunito", fontSize: ".84rem", padding: 0 }}
                            >
                                🔄 Try again
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Skeleton loading ── */}
                {loading ? (
                    <Row className="g-3">
                        {[1, 2, 3, 4].map(i => (
                            <Col xs={6} sm={6} md={4} xl={3} key={i}><SkeletonCard /></Col>
                        ))}
                    </Row>

                ) : items.length === 0 ? (

                    /* ── Empty state ── */
                    <div className="empty-wish fu">
                        <div className="empty-wish-ring">💔</div>
                        <h4 className="fw-bold mb-2" style={{ color: "#1a1a2e" }}>Your wishlist is empty</h4>
                        <p className="text-muted mb-4" style={{ fontSize: ".9rem" }}>
                            Save items you love and come back to them anytime!
                        </p>
                        <button
                            onClick={() => navigate("/")}
                            style={{ border: "none", borderRadius: 12, background: "#414af2ff", color: "#ffffffff", fontWeight: 800, padding: "12px 32px", fontFamily: "Nunito", cursor: "pointer", fontSize: ".95rem" }}
                        >
                            🛍️ Discover Products
                        </button>
                    </div>

                ) : (
                    <>
                        {/* ── Filter + Sort bar ── */}
                        <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap mb-4 fu">
                            <div className="d-flex gap-2 flex-wrap align-items-center">
                                {TABS.map(t => (
                                    <button
                                        key={t}
                                        className={`wish-tab ${tab === t ? "active" : ""}`}
                                        onClick={() => setTab(t)}
                                    >
                                        {t}
                                        {t === "Sale" && (
                                            <span style={{ marginLeft: 4, opacity: .75, fontSize: ".7rem" }}>
                                                ({onSaleCount})
                                            </span>
                                        )}
                                    </button>
                                ))}
                                <span style={{ fontSize: ".8rem", fontWeight: 700, color: "#9ca3af" }}>
                                    {filtered.length} of {items.length} item{items.length !== 1 ? "s" : ""}
                                </span>
                            </div>
                            <select className="wish-select" value={sort} onChange={e => setSort(e.target.value)}>
                                {SORTS.map(s => <option key={s}>{s}</option>)}
                            </select>
                        </div>

                        {/* ── Savings banner ── */}
                        {totalSaved > 0 && (
                            <div className="fu" style={{ background: "linear-gradient(135deg,#fff0e6,#fff8f0)", border: "1.5px solid #ffddc9", borderRadius: 14, padding: "12px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10, animationDelay: ".05s" }}>
                                <span style={{ fontSize: "1.3rem" }}>🎉</span>
                                <span style={{ fontWeight: 800, color: "#92400e", fontSize: ".88rem" }}>
                                    Your wishlist saves you{" "}
                                    <strong style={{ color: "var(--p)" }}>{FMT(totalSaved)}</strong>{" "}
                                    compared to MRP!
                                </span>
                            </div>
                        )}

                        {/* ── No filter results ── */}
                        {filtered.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "60px 20px", background: "#fff", borderRadius: 18, border: "2px dashed #e0e4f0" }}>
                                <div style={{ fontSize: "2.5rem", marginBottom: 10 }}>🔍</div>
                                <div className="fw-bold" style={{ color: "#555", marginBottom: 8 }}>No items on sale right now</div>
                                <button
                                    onClick={() => setTab("All")}
                                    style={{ border: "none", background: "none", color: "#262fdcff", fontWeight: 800, cursor: "pointer", fontFamily: "Nunito", fontSize: ".84rem" }}
                                >
                                    Show all →
                                </button>
                            </div>
                        ) : (

                            /* ── Product Grid ── */
                            <Row className="g-3">
                                {filtered.map((item, i) => (
                                    <Col xs={6} sm={6} md={4} xl={3} key={item.wishlistId}>
                                        <div
                                            className={`wish-card fu ${popAnim === item.wishlistId ? "opacity-25" : ""}`}
                                            style={{ animationDelay: `${i * 0.05}s`, transition: "opacity .28s" }}
                                        >

                                            {/* ── Image ── */}
                                            <div className="wish-card-img-wrap">
                                                <img
                                                    src={item.img}
                                                    alt={item.title}
                                                    className="wish-card-img"
                                                    style={{ cursor: "pointer" }}
                                                    onClick={() => navigate(`/product/${item.id}`)}
                                                    onError={e => {
                                                        e.target.src = `https://placehold.co/400x400/f1f4ff/ff6b35?text=${encodeURIComponent(item.title.slice(0, 2))}`;
                                                    }}
                                                />

                                                {/* Discount ribbon */}
                                                {item.discount > 0 && (
                                                    <span className="wish-discount">{(item.discount)}% OFF</span>
                                                )}

                                                {/* Remove button */}
                                                <button
                                                    className={`wish-heart ${popAnim === item.wishlistId ? "heart-pop" : ""}`}
                                                    onClick={() => removeFromWishlist(item)}
                                                    title="Remove from wishlist"
                                                >
                                                    ❤️
                                                </button>

                                                {/* Multi-image badge */}
                                                {item.images.length > 1 && (
                                                    <div style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,.5)", borderRadius: 8, padding: "2px 7px", fontSize: ".62rem", fontWeight: 800, color: "#fff" }}>
                                                        +{item.images.length - 1} 📷
                                                    </div>
                                                )}
                                            </div>

                                            {/* ── Card body ── */}
                                            <div style={{ padding: "12px 14px 8px", flex: 1, display: "flex", flexDirection: "column" }}>

                                                {/* Brand + Category */}
                                                <div className="d-flex align-items-center justify-content-between mb-1">
                                                    <span style={{ fontSize: ".66rem", color: "var(--p)", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".04em" }}>
                                                        {item.brand}
                                                    </span>
                                                    {item.category && (
                                                        <span style={{ fontSize: ".62rem", fontWeight: 700, color: "#9ca3af", background: "#f1f4ff", borderRadius: 6, padding: "1px 7px" }}>
                                                            {item.category}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Title */}
                                                <div
                                                    className="fw-bold mb-2"
                                                    style={{
                                                        fontSize: ".88rem",
                                                        color: "#1a1a2e",
                                                        lineHeight: 1.35,
                                                        cursor: "pointer",
                                                        overflow: "hidden",
                                                        maxWidth: "200px",
                                                        textOverflow: "ellipsis",
                                                        whiteSpace: "nowrap" // Required for ellipsis to work
                                                    }}
                                                    onClick={() => navigate(`/product/${item.id}`)}
                                                >
                                                    {item.title}
                                                </div>

                                                {/* Rating + sold */}
                                                <div className="d-flex align-items-center gap-1 mb-2 flex-wrap">
                                                    <StarRating rating={item.rating} />
                                                    <span style={{ fontSize: ".66rem", color: "#9ca3af", fontWeight: 700 }}>
                                                        {item.rating} ({item.reviews.toLocaleString()})
                                                    </span>
                                                    <span style={{ fontSize: ".64rem", color: "#d1d5db" }}>·</span>
                                                    <span style={{ fontSize: ".64rem", color: "#6b7280", fontWeight: 700 }}>
                                                        {item.sold.toLocaleString()} sold
                                                    </span>
                                                </div>

                                                {/* Price */}
                                                <div className="d-flex align-items-baseline gap-1 mb-2 flex-wrap">
                                                    <span style={{ fontWeight: 900, fontSize: "1.08rem", color: "var(--p)" }}>
                                                        {FMT(Number(item.price) || 0)}
                                                    </span>
                                                    {Number(item.old_price) > Number(item.price) && (
                                                        <>
                                                            <span style={{ fontSize: ".74rem", color: "#bbb", textDecoration: "line-through", fontWeight: 600 }}>
                                                                {FMT(Number(item.old_price) || 0)}
                                                            </span>
                                                            <span style={{ fontSize: ".66rem", fontWeight: 900, color: "#22c55e" }}>
                                                                Save {FMT(Number(item.old_price) - Number(item.price) || 0)}
                                                            </span>
                                                        </>
                                                    )}
                                                    {item.is_customizable && (
                                                    <span style={{ fontSize: ".6rem", fontWeight: 800, background: "#ede9fe", color: "#7c3aed", borderRadius: 6, padding: "1px 6px" }}>
                                                        ✏️ Custom
                                                    </span>
                                                )}
                                                </div>
                                                
                                            </div>

                                            {/* ── Add to Cart CTA ── */}
                                            <button
                                                className="wish-cart-btn"
                                                onClick={() => addToCart(item)}
                                                style={{
                                                    background: cart.includes(item.id)
                                                        ? "linear-gradient(135deg,#22c55e,#16a34a)"
                                                        : undefined,
                                                }}
                                            >
                                                {cart.includes(item.id) ? "✅ Added to Cart" : "🛒 Add to Cart"}
                                            </button>

                                        </div>
                                    </Col>
                                ))}
                            </Row>
                        )}

                        {/* ── Bulk actions ── */}
                        <div className="d-flex justify-content-center gap-3 mt-5 fu flex-wrap">
                            <button
                                onClick={removeAllItems}
                                style={{ border: "2px solid #444cddff", borderRadius: 12, background: "#fff", color: "#262fdcff", fontWeight: 700, fontSize: ".9rem", padding: "12px 24px", fontFamily: "Nunito", cursor: "pointer", transition: "background .15s" }}
                                onMouseEnter={e => e.currentTarget.style.background = "#f0f1ffff"}
                                onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                            >
                                🗑️ Clear Wishlist
                            </button>
                        </div>
                    </>
                )}
            </Container>
            {cartModal && (
                <AddToCartModal
                    item={cartModal}
                    onClose={() => setCartModal(null)}
                    onSuccess={() => setCartModal(null)}
                />
            )}
        </div>
    );
}