import { useCallback, useEffect, useRef, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Toolbar from "../../components/Toolbar";
import './Cart.css'
import cartApi from "../../api/cartApi";
import GlobalLoader from "../../components/GlobalLoader";
import GlobalHelper from "../../helper/GlobalHelper";
import { useAuthWrapper } from "../../helper/AuthWrapper";
import { FMT } from "../../helper/GlobalHelper";



export default function CartPage() {
    const [cart, setCart] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [sidebar, setSidebar] = useState(false);
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState([]);
    const [discount, setDiscount] = useState(0);
    const [couponMsg, setCouponMsg] = useState(null);
    const [removing, setRemoving] = useState(null);
    const [updatingQty, setUpdatingQty] = useState(null);

    const searchRef = useRef();
    const navigate = useNavigate();
    const { refresh, setRefresh, coupon, setCoupon } = useAuthWrapper();
    const addToast = useCallback((msg) => toast.success(msg), []);


    const fetchCart = async () => {
        setLoading(true);
        try {
            const { data } = await cartApi.getAllCart();

            if (data.success && Array.isArray(data.data)) {
                setItems(data.data.map(GlobalHelper.API_FIELDS_MAP['cart']));
            } else {
                setItems(data.data[0].GlobalHelper.API_FIELDS_MAP['cart']);
            }
        } catch (error) {
            console.error("Cart fetch error:", error.message);
            toast.error("Failed to load cart. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCart(); }, []);
    

    const updateQty = async (cartId, delta) => {

        const item = items.find(i => i.id === cartId);
        if (!item) return;

        const newQty = Math.max(1, Math.min(item.stock, item.qty + delta));

        if (newQty === item.qty) return;

        setItems(prev => prev.map(i => i.id === cartId ? { ...i, qty: newQty } : i));
        setUpdatingQty(cartId);
        console.log({ quantity: newQty })
        try {
            await cartApi.updateCart(cartId, { quantity: newQty });
        } catch (error) {
            // Rollback on failure
            setItems(prev => prev.map(i => i.id === cartId ? { ...i, qty: item.qty } : i));
            toast.error("Could not update quantity. Please try again.");
        } finally {
            setUpdatingQty(null);
        }
    };


    const removeItem = async (cartId) => {
        setRemoving(cartId);
        // Short delay for fade-out animation
        await new Promise(r => setTimeout(r, 300));

        const snapshot = [...items];
        setItems(prev => prev.filter(i => i.id !== cartId));
        setRemoving(null);
        setRefresh(!refresh);
        try {
            await cartApi.deleteCart(cartId);
            addToast("Item removed from cart");
        } catch (error) {
            setItems(snapshot);
            toast.error("Could not remove item. Please try again.");
        }
    };


    const clearCart = async () => {
        const snapshot = [...items];
        setItems([]);
        try {
            await cartApi.allRemoveFromCart();
            addToast("Cart cleared");
        } catch (error) {
            setItems(snapshot);
            toast.error("Could not clear cart. Please try again.");
        } finally {
            setRefresh(!refresh)
        }
    };


    const applyCoupon = () => {
        const code = coupon.trim().toUpperCase();
        if (GlobalHelper.COUPONS[code]) {
            setDiscount(GlobalHelper.COUPONS[code]);
            setCouponMsg({ type: "success", text: `✅ Coupon applied! ${GlobalHelper.COUPONS[code]}% off` });
        } else {
            setDiscount(0);
            setCouponMsg({ type: "error", text: "❌ Invalid coupon code" });
        }
    };


    const subtotal = items.reduce((s, i) => s + i.product_price * i.qty, 0);
    const saved = items.reduce((s, i) => s + Math.max(0, i.old_price - i.price) * i.qty, 0);
    const couponSave = Math.round(subtotal * discount / 100);
    const delivery = subtotal > 0 && subtotal >= 499 ? 0 : subtotal > 0 ? 49 : 0;
    console.log(items);
    const total = subtotal - couponSave + delivery;
    const totalItems = items.reduce((s, i) => s + i.qty, 0);

    useEffect(() => {
        if (coupon)
            applyCoupon()
    }, [])


    return (
        <div style={{ minHeight: "100vh", background: "#f1f4ff" }}>
            {loading && <GlobalLoader />}
            <Toolbar
                searchRef={searchRef}
                cart={cart}
                wishlist={wishlist}
                setSidebar={setSidebar}
                addToast={addToast}
                isSideBar={false}
                isSearch={false}
            />

            <Container className="py-4">
                {!loading && items.length === 0 ? (

                    /* ── Empty state ── */
                    <div className="empty-cart fu">
                        <div className="empty-ring">🛒</div>
                        <h4 className="fw-bold mb-2" style={{ color: "#1a1a2e" }}>Your cart is empty!</h4>
                        <p className="text-muted mb-4" style={{ fontSize: ".9rem" }}>
                            Looks like you haven't added anything yet.
                        </p>
                        <button
                            onClick={() => navigate("/dashboard")}
                            style={{
                                border: "none", borderRadius: 12,
                                background: "linear-gradient(135deg,#ff6b35,#f7931e)",
                                color: "#fff", fontWeight: 800, padding: "12px 32px",
                                fontFamily: "Nunito", cursor: "pointer", fontSize: ".95rem"
                            }}
                        >
                            🛍️ Start Shopping
                        </button>
                    </div>

                ) : (
                    <Row className="g-4">
                        {/* ══ CART ITEMS ══ */}
                        <Col lg={8}>
                            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                                {/* Header row */}
                                {items.length > 0 && (
                                    <div className="d-flex justify-content-between align-items-center fu">
                                        <span style={{ fontWeight: 800, fontSize: ".9rem", color: "#374151" }}>
                                            🛒 {items.length} item{items.length !== 1 ? "s" : ""} in your cart
                                        </span>
                                        <button
                                            onClick={clearCart}
                                            style={{
                                                border: "1.5px solid #fca5a5", borderRadius: 8,
                                                background: "#fff", color: "#dc2626",
                                                fontWeight: 700, fontSize: ".78rem",
                                                padding: "5px 14px", fontFamily: "Nunito", cursor: "pointer",
                                                transition: "background .15s"
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = "#fff0f0"}
                                            onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                                        >
                                            🗑️ Clear Cart
                                        </button>
                                    </div>
                                )}

                                {/* Savings banner */}
                                {saved > 0 && (
                                    <div className="fu" style={{
                                        background: "linear-gradient(135deg,#f0fdf4,#dcfce7)",
                                        borderRadius: 14, padding: "12px 18px",
                                        border: "1.5px solid #86efac",
                                        display: "flex", alignItems: "center", gap: 10
                                    }}>
                                        <span style={{ fontSize: "1.2rem" }}>🎉</span>
                                        <span style={{ fontWeight: 800, color: "#166534", fontSize: ".9rem" }}>
                                            You're saving <strong>{FMT(saved)}</strong> on this order!
                                        </span>
                                    </div>
                                )}


                                {items.map((item, i) => (
                                    <div
                                        key={item.id}
                                        className={`cart-item fu ${removing === item.id ? "opacity-25" : ""}`}
                                        style={{ animationDelay: `${i * 0.06}s`, transition: "opacity .3s" }}
                                    >
                                        {console.log("itemitem", )}
                                        <div style={{ position: "relative", flexShrink: 0 }}>
                                            {item.image_url
                                                ? <img src={item.image_url.split(',')[0].replaceAll('"{\\"', "").replaceAll('\\"', "")} alt={item.title} className="cart-img"
                                                    onError={e => { e.target.src = `https://placehold.co/100x100/f1f4ff/ff6b35?text=${encodeURIComponent(item.title.slice(0, 2))}`; }}
                                                    style={{ cursor: "pointer" }}
                                                    onClick={() => navigate(`/product/${item.product_id}`)}
                                                />
                                                : <div className="cart-img-placeholder">📦</div>
                                            }

                                        </div>

                                        {/* Product Info */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div className="d-flex justify-content-between align-items-start gap-2">
                                                <div style={{ minWidth: 0, flex: 1 }}>

                                                    {/* Brand */}
                                                    <div style={{
                                                        fontSize: ".7rem", fontWeight: 800, color: "var(--p)",
                                                        textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 2
                                                    }}>
                                                        {item.brand}
                                                    </div>

                                                    {/* Title */}
                                                    <div
                                                        className="fw-bold"
                                                        style={{
                                                            fontSize: ".95rem", color: "#1a1a2e",
                                                            lineHeight: 1.35, marginBottom: 6,
                                                            cursor: "pointer",
                                                            overflow: "hidden", display: "-webkit-box",
                                                            WebkitLineClamp: 2, WebkitBoxOrient: "vertical"
                                                        }}
                                                        onClick={() => navigate(`/product/${item.product_id}`)}
                                                    >
                                                        {item.title}
                                                    </div>

                                                    {/* ── Variant info chips ── */}
                                                    <div className="d-flex flex-wrap gap-2 mb-2 align-items-center">
                                                        {item.color && (
                                                            <div className="d-flex align-items-center gap-1"
                                                                style={{
                                                                    background: "#f8f9ff", border: "1px solid #e8eaf6",
                                                                    borderRadius: 8, padding: "3px 10px",
                                                                    fontSize: ".72rem", fontWeight: 700, color: "#374151"
                                                                }}>
                                                                <span style={{
                                                                    width: 12, height: 12, borderRadius: "50%",
                                                                    background: item.color,
                                                                    display: "inline-block", flexShrink: 0,
                                                                    border: "1.5px solid rgba(0,0,0,.12)"
                                                                }} />
                                                                {item.color}
                                                            </div>
                                                        )}
                                                        {console.log("item", item)}
                                                        {item.size && (
                                                            <div style={{
                                                                background: "#f8f9ff", border: "1px solid #e8eaf6",
                                                                borderRadius: 8, padding: "3px 10px",
                                                                fontSize: ".72rem", fontWeight: 800, color: "#374151"
                                                            }}>
                                                                Size: {item.size}
                                                            </div>
                                                        )}
                                                        {discount > 0 && (
                                                            <div style={{
                                                                background: "#dcfce7", color: "#166534",
                                                                borderRadius: 8, padding: "3px 10px",
                                                                fontSize: ".72rem", fontWeight: 900
                                                            }}>
                                                                {discount}% OFF
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Stock warning */}
                                                    {item.stock > 0 && item.stock < 15 && (
                                                        <div style={{ fontSize: ".7rem", color: "#d97706", fontWeight: 800, marginBottom: 4 }}>
                                                            ⚠️ Limited stock!
                                                        </div>
                                                    )}
                                                    {item.stock === 0 && (
                                                        <div style={{ fontSize: ".7rem", color: "#dc2626", fontWeight: 800, marginBottom: 4 }}>
                                                            ❌ Out of stock
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Remove button */}
                                                <button
                                                    className="remove-btn"
                                                    onClick={() => removeItem(item.id)}
                                                    disabled={removing === item.id}
                                                    title="Remove from cart"
                                                >✕</button>
                                            </div>

                                            {/* ── Price + Qty row ── */}
                                            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mt-1">
                                                {console.log(item)}
                                                {/* Price */}
                                                <div className="d-flex align-items-baseline gap-2 flex-wrap">
                                                    <span style={{ fontWeight: 900, fontSize: "1.1rem", color: "var(--p)" }}>
                                                        {FMT(item.product_price)}
                                                    </span>
                                                </div>

                                                {/* Qty controls */}
                                                <div className="d-flex align-items-center gap-2">
                                                    <button
                                                        className="qty-btn"
                                                        disabled={item.qty <= 1 || updatingQty === item.id || removing === item.id}
                                                        onClick={() => updateQty(item.id, -1)}
                                                    >−</button>

                                                    <span style={{
                                                        fontWeight: 900, fontSize: "1rem",
                                                        minWidth: 28, textAlign: "center",
                                                        opacity: updatingQty === item.id ? 0.4 : 1,
                                                        transition: "opacity .2s"
                                                    }}>
                                                        {item.qty}
                                                    </span>

                                                    <button
                                                        className="qty-btn"
                                                        disabled={item.qty >= item.stock || updatingQty === item.id || removing === item.id}
                                                        onClick={() => updateQty(item.id, 1)}
                                                    >+</button>

                                                    <span style={{ fontSize: ".75rem", color: "#9ca3af", fontWeight: 700, marginLeft: 4 }}>
                                                        = <b style={{ color: "#374151" }}>{FMT(item.product_price * item.qty)}</b>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Trust badges */}
                            <div className="d-flex gap-3 flex-wrap mt-4 fu">
                                {[
                                    { icon: "🚚", label: "Free Delivery above ₹499" },
                                    { icon: "🔒", label: "100% Secure Payment" },
                                    { icon: "↩️", label: "Easy 7-day Returns" },
                                ].map(({ icon, label }) => (
                                    <div key={label} className="trust-badge">
                                        <span style={{ fontSize: "1.1rem" }}>{icon}</span>
                                        <span style={{ fontSize: ".75rem", fontWeight: 700, color: "#4b5563" }}>{label}</span>
                                    </div>
                                ))}
                            </div>
                        </Col>

                        {/* ══ ORDER SUMMARY ══ */}
                        <Col lg={4}>
                            <div className="summary-card fu" style={{ animationDelay: ".1s" }}>
                                <div style={{ fontWeight: 900, fontSize: "1rem", color: "#1a1a2e", marginBottom: 20 }}>
                                    📋 Order Summary
                                </div>

                                {/* Coupon */}
                                <div style={{ marginBottom: 16 }}>
                                    <div style={{
                                        fontSize: ".75rem", fontWeight: 800, color: "#6b7280",
                                        textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8
                                    }}>
                                        Have a coupon?
                                    </div>
                                    <div className="d-flex gap-2">
                                        <input
                                            className="coupon-input"
                                            placeholder="Enter code (e.g. SAVE10)"
                                            value={coupon}
                                            onChange={e => { setCoupon(e.target.value); setCouponMsg(null); }}
                                            onKeyDown={e => e.key === "Enter" && applyCoupon()}
                                        />
                                        <button className="coupon-apply" onClick={applyCoupon}>Apply</button>
                                    </div>
                                    {couponMsg && (
                                        <div style={{
                                            marginTop: 6, fontSize: ".78rem", fontWeight: 700,
                                            color: couponMsg.type === "success" ? "#166534" : "#dc2626"
                                        }}>
                                            {couponMsg.text}
                                        </div>
                                    )}
                                    <div style={{ marginTop: 6, fontSize: ".72rem", color: "#9ca3af", fontWeight: 700 }}>
                                        Try: SAVE10 · SHOP20 · FIRST50
                                    </div>
                                </div>

                                <div className="summary-divider" />

                                {/* Per-item breakdown */}
                                <div style={{ marginBottom: 12 }}>
                                    {items.map(item => (
                                        <div key={item.id} className="d-flex justify-content-between align-items-center mb-1">
                                            <span style={{ fontSize: ".78rem", color: "#6b7280", fontWeight: 600, flex: 1, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", marginRight: 8 }}>
                                                {item.title.slice(0, 22)}{item.title.length > 22 ? "…" : ""}
                                                {item.size ? ` (${item.size})` : ""}
                                                {" "}×{item.qty}
                                            </span>
                                            <span style={{ fontSize: ".8rem", fontWeight: 800, color: "#374151", flexShrink: 0 }}>
                                                {FMT(item.product_price * item.qty)}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="summary-divider" />

                                {/* Totals */}
                                {[
                                    { label: `Subtotal (${totalItems} items)`, val: FMT(subtotal), color: "#374151" },
                                    ...(saved > 0 ? [{ label: "You Save", val: `-${FMT(saved)}`, color: "#22c55e" }] : []),
                                    ...(couponSave > 0 ? [{ label: `Coupon (${discount}% off)`, val: `-${FMT(couponSave)}`, color: "#22c55e" }] : []),
                                    { label: "Delivery", val: delivery === 0 ? "FREE 🎉" : FMT(delivery), color: delivery === 0 ? "#22c55e" : "#374151" },
                                ].map(({ label, val, color }) => (
                                    <div key={label} className="d-flex justify-content-between align-items-center mb-2">
                                        <span style={{ fontSize: ".85rem", color: "#6b7280", fontWeight: 700 }}>{label}</span>
                                        <span style={{ fontSize: ".88rem", fontWeight: 800, color }}>{val}</span>
                                    </div>
                                ))}

                                <div className="summary-divider" />

                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <span style={{ fontWeight: 900, fontSize: "1rem", color: "#1a1a2e" }}>Total Amount</span>
                                    <span style={{ fontWeight: 900, fontSize: "1.3rem", color: "var(--p)" }}>{FMT(total)}</span>
                                </div>

                                {/* Free delivery nudge */}
                                {delivery > 0 && subtotal > 0 && (
                                    <div style={{
                                        background: "#fff8e6", borderRadius: 10, padding: "8px 12px",
                                        marginBottom: 14, fontSize: ".78rem", fontWeight: 700, color: "#92400e"
                                    }}>
                                        🚚 Add <b>{FMT(499 - subtotal)}</b> more for FREE delivery!
                                    </div>
                                )}

                                <button
                                    className="checkout-btn"
                                    disabled={items.length === 0}
                                    onClick={() => navigate("/dashboard/checkout", {
                                        state: { items, subtotal, saved, couponSave, delivery, total, totalItems }
                                    })}
                                >
                                    Proceed to Checkout →
                                </button>

                                <button
                                    style={{
                                        width: "100%", border: "2px solid #e8eaf6", borderRadius: 12,
                                        background: "#fff", color: "#555", fontWeight: 700, fontSize: ".88rem",
                                        padding: "11px", fontFamily: "Nunito", cursor: "pointer",
                                        marginTop: 10, transition: "all .15s"
                                    }}
                                    onClick={() => navigate("/dashboard")}
                                >
                                    ← Continue Shopping
                                </button>
                            </div>
                        </Col>

                    </Row>
                )}
            </Container>
        </div>
    );
}