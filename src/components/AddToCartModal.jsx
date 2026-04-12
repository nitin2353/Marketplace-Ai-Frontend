import { useState, useEffect, useCallback } from "react";
import { Stack } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import cartApi from "../api/cartApi";
import "../style/Addtocartmodal.css";
import { useAuthWrapper } from "../helper/AuthWrapper";
import { FMT } from "../helper/GlobalHelper";

const hasVariants = (item) => Array.isArray(item?.variants) && item.variants.length > 0;



function useCartModal({ item, price, stock }) {
    const navigate = useNavigate();
    const { refresh, setRefresh } = useAuthWrapper();

    const [qty, setQty] = useState(1);
    const [adding, setAdding] = useState(false);
    const [added, setAdded] = useState(false);

    const isOOS = Number(stock) === 0;
    const clampQty = useCallback((q) => Math.min(Math.max(1, q), Number(stock)), [stock]);

    const submitToCart = useCallback(async (payload) => {
        if (adding) return;
        setAdding(true);
        try {
            await cartApi.createCart(payload);
            setAdded(true);
            setRefresh(!refresh);
        } catch {
            toast.error("Could not add to cart. Try again.");
        } finally {
            setAdding(false);
        }
    }, [adding, refresh, setRefresh]);

    const onViewCart = useCallback(() => navigate("/dashboard/cart"), [navigate]);
    const incQty = useCallback(() => setQty((q) => clampQty(q + 1)), [clampQty]);
    const decQty = useCallback(() => setQty((q) => clampQty(q - 1)), [clampQty]);

    return {
        qty, setQty,
        adding, added,
        isOOS,
        incQty, decQty,
        submitToCart,
        onViewCart,
    };
}



const Overlay = ({ onClose, children }) => (
    <div className="atc-overlay" onClick={onClose}>{children}</div>
);

const Shell = ({ children }) => (
    <div className="atc-shell" onClick={(e) => e.stopPropagation()}>{children}</div>
);

const ModalHeader = ({ item, price, discount, onClose }) => (
    <div className="atc-header">
        <Stack direction="horizontal" gap={3} className="align-items-center">
            <img
                src={item.img}
                alt={item.title}
                className="atc-header-img"
                onError={(e) => {
                    e.target.src = `https://placehold.co/64x64/ffe5d5/ff6b35?text=${encodeURIComponent(item.title.slice(0, 2))}`;
                }}
            />
            <div className="flex-grow-1" style={{ minWidth: 0 }}>
                <p className="atc-header-brand mb-0">{item.brand}</p>
                <p className="atc-header-title mb-1">{item.title}</p>
                <Stack direction="horizontal" gap={2} className="align-items-baseline flex-wrap">
                    <span className="atc-header-price">{FMT(price)}</span>
                    {item.old_price > price && (
                        <span className="atc-header-old">{FMT(item.old_price)}</span>
                    )}
                    {discount > 0 && (
                        <span className="atc-header-badge">{discount}% OFF</span>
                    )}
                </Stack>
            </div>
            <button className="atc-close-btn" onClick={onClose} aria-label="Close">✕</button>
        </Stack>
    </div>
);

const PolicyPills = ({ item }) => (
    <Stack direction="horizontal" gap={1} className="flex-wrap mb-3">
        {item.is_return && <span className="atc-pill atc-pill-return">↩️ {item.return_replace_duration}d Return</span>}
        {item.is_replace && <span className="atc-pill atc-pill-replace">🔄 Replace</span>}
        {item.is_customizable && <span className="atc-pill atc-pill-custom">✏️ Customizable</span>}
    </Stack>
);

const StockBadge = ({ stock }) => {
    const s = Number(stock);
    if (s === 0) return <span className="atc-stock out">✕ Out of stock</span>;
    if (s < 15) return <span className="atc-stock low">⚠ Limited Stock</span>;
    return <span className="atc-stock ok">✔ In stock</span>;
};

const QtyStepper = ({ qty, onDec, onInc, disableDec, disableInc }) => (
    <div className="atc-stepper">
        <button className="atc-stepper-btn" onClick={onDec} disabled={disableDec}>−</button>
        <div className="atc-stepper-val">{qty}</div>
        <button className="atc-stepper-btn" onClick={onInc} disabled={disableInc}>+</button>
    </div>
);

const TotalRow = ({ price, qty, oldPrice }) => (
    <>
        <div className="atc-divider" />
        <Stack direction="horizontal" className="justify-content-between align-items-center mb-3">
            <div>
                <p className="mb-1" style={{ fontSize: 12, color: "#9ca3af", fontWeight: 700 }}>Total</p>
                <p className="mb-0" style={{ fontSize: 22, fontWeight: 900, color: "#ff6b35" }}>
                    {FMT(price * qty)}
                </p>
            </div>
            {oldPrice > price && (
                <div className="text-end">
                    <p className="mb-1" style={{ fontSize: 12, color: "#9ca3af", fontWeight: 700 }}>You save</p>
                    <p className="mb-0" style={{ fontSize: 16, fontWeight: 900, color: "#22c55e" }}>
                        {FMT((oldPrice - price) * qty)}
                    </p>
                </div>
            )}
        </Stack>
    </>
);

const SuccessScreen = ({ item, selColor, selSize, qty, dispPrice, onClose, onViewCart }) => (
    <>
        <ModalHeader item={item} price={dispPrice} discount={0} onClose={onClose} />
        <div className="atc-body text-center py-5">
            <div className="atc-success-ring mx-auto">✅</div>
            <p className="fw-bold mb-1" style={{ fontSize: 16, color: "#1a1a2e" }}>Added to cart!</p>
            <Stack direction="horizontal" gap={2} className="justify-content-center align-items-center mb-1 flex-wrap">
                {selSize && <span className="atc-success-size-chip">{selSize}</span>}
                {selColor && <span className="atc-success-color-dot" style={{ background: selColor }} />}
                <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 700 }}>× {qty}</span>
            </Stack>
            <p style={{ fontSize: 24, fontWeight: 900, color: "#ff6b35" }} className="mt-2 mb-4">
                {FMT(dispPrice * qty)}
            </p>
            <Stack direction="horizontal" gap={2}>
                <button className="atc-btn-keep" onClick={onClose}>← Keep Browsing</button>
                <button className="atc-btn-view-cart" onClick={onViewCart}>View Cart →</button>
            </Stack>
        </div>
    </>
);

const ModalFooter = ({ onAdd, onClose, adding, disabled, label }) => (
    <Stack gap={2}>
        <button className="atc-btn-primary" onClick={onAdd} disabled={disabled || adding}>
            {adding ? "Adding…" : label}
        </button>
        <button className="atc-btn-secondary" onClick={onClose}>Maybe later</button>
    </Stack>
);



function NoVariantModal({ item, onClose }) {
    const price = Number(item.price) || 0;
    const stock = Number(item.stock) || 0;
    const discount = item.discount ?? (item.old_price > price
        ? ((1 - price / item.old_price) * 100) : 0);

    const { qty, adding, added, isOOS, incQty, decQty, submitToCart, onViewCart } =
        useCartModal({ item, price, stock });

    const handleAdd = useCallback(() => {
        if (isOOS) return;
        submitToCart({
            product_id: item.id,
            total_quantity: qty,
            price: price * qty,
            prouduct_price: price,
        });
    }, [isOOS, submitToCart, item.id, qty, price]);

    return (
        <Overlay onClose={onClose}>
            <Shell>
                {added ? (
                    <SuccessScreen
                        item={item} selColor={null} selSize={null}
                        qty={qty} dispPrice={price}
                        onClose={onClose} onViewCart={onViewCart}
                    />
                ) : (
                    <>
                        <ModalHeader item={item} price={price} discount={discount} onClose={onClose} />
                        <div className="atc-body">

                            {/* Tags */}
                            {item.tags?.length > 0 && (
                                <Stack direction="horizontal" gap={1} className="flex-wrap mb-3">
                                    {item.tags.slice(0, 4).map((t) => (
                                        <span key={t} className="atc-pill atc-pill-tag">{t}</span>
                                    ))}
                                </Stack>
                            )}

                            <PolicyPills item={item} />

                            <p className="atc-label">Quantity</p>
                            <Stack direction="horizontal" gap={3} className="align-items-center mb-3">
                                <QtyStepper
                                    qty={qty}
                                    onDec={decQty}
                                    onInc={incQty}
                                    disableDec={qty <= 1}
                                    disableInc={qty >= stock || isOOS}
                                />
                                <StockBadge stock={stock} />
                            </Stack>

                            <TotalRow price={price} qty={qty} oldPrice={item.old_price} />

                            <ModalFooter
                                onAdd={handleAdd}
                                onClose={onClose}
                                adding={adding}
                                disabled={isOOS}
                                label={isOOS ? "❌ Out of Stock" : "🛒 Add to Cart"}
                            />
                        </div>
                    </>
                )}
            </Shell>
        </Overlay>
    );
}



function VariantModal({ item, onClose }) {
    const [selColor, setSelColor] = useState(null);
    const [selSize, setSelSize] = useState(null);


    const getVariant = useCallback(
        (color, size) => item.variants.find((v) => v.color === color && v.size === size) || null,
        [item.variants]
    );

    const sizesForColor = useCallback(
        (color) => [...new Set(
            item.variants.filter((v) => v.color === color).map((v) => v.size).filter(Boolean)
        )],
        [item.variants]
    );

    const allColors = [...new Set(item.variants.map((v) => v.color).filter(Boolean))];

    const av = getVariant(selColor, selSize);
    const dispPrice = Number(av?.price ?? item.price);
    const dispStock = Number(av?.stock ?? 0);
    const noVariant = !av;
    const isOOS = av ? dispStock === 0 : false;
    const discount = item.old_price > dispPrice
        ? ((1 - dispPrice / item.old_price) * 100)
        : item.discount ?? 0;

    const { qty, setQty, adding, added, incQty, decQty, submitToCart, onViewCart } =
        useCartModal({ item, price: dispPrice, stock: dispStock });

    // Init to first in-stock variant on mount
    useEffect(() => {
        const first = item.variants.find((v) => v.stock > 0) || item.variants[0];
        if (first) { setSelColor(first.color); setSelSize(first.size); }
    }, [item]);

    const handleColorClick = useCallback((color) => {
        setSelColor(color);
        const firstAvail = item.variants.find((v) => v.color === color && v.stock > 0);
        const sizes = sizesForColor(color);
        setSelSize(firstAvail?.size ?? sizes[0] ?? null);
        setQty(1);
    }, [item.variants, sizesForColor, setQty]);

    const handleAdd = useCallback(() => {
        if (!av || isOOS) return;
        submitToCart({
            product_id: item.id,
            variant_id: av.id,
            total_quantity: qty,
            price: av.price * qty,
        });
    }, [av, isOOS, submitToCart, item.id, qty]);

    const ctaLabel = noVariant ? "⚙️ Select a variant"
        : isOOS ? "❌ Out of Stock"
            : "🛒 Add to Cart";

    return (
        <Overlay onClose={onClose}>
            <Shell>
                {added ? (
                    <SuccessScreen
                        item={item} selColor={selColor} selSize={selSize}
                        qty={qty} dispPrice={dispPrice}
                        onClose={onClose} onViewCart={onViewCart}
                    />
                ) : (
                    <>
                        <ModalHeader item={item} price={dispPrice} discount={discount} onClose={onClose} />
                        <div className="atc-body">

                            {/* Color picker */}
                            <p className="atc-label">Choose color</p>
                            <Stack direction="horizontal" gap={2} className="flex-wrap mb-3">
                                {allColors.map((c) => {
                                    const hasStock = item.variants.some((v) => v.color === c && v.stock > 0);
                                    return (
                                        <div
                                            key={c}
                                            title={c}
                                            className={`atc-color-dot ${selColor === c ? "active" : ""} ${!hasStock ? "oos" : ""}`}
                                            style={{ background: c }}
                                            onClick={() => handleColorClick(c)}
                                        >
                                            {!hasStock && <div className="atc-oos-strike" />}
                                        </div>
                                    );
                                })}
                            </Stack>

                            {/* Size picker */}
                            {sizesForColor(selColor).length > 0 && (
                                <>
                                    <p className="atc-label">Choose size</p>
                                    <Stack direction="horizontal" gap={2} className="flex-wrap mb-3">
                                        {sizesForColor(selColor).map((s) => {
                                            const v = getVariant(selColor, s);
                                            const oos = v?.stock === 0;
                                            return (
                                                <button
                                                    key={s}
                                                    className={`atc-size-btn ${selSize === s ? "active" : ""}`}
                                                    disabled={oos}
                                                    onClick={() => { if (!oos) { setSelSize(s); setQty(1); } }}
                                                >
                                                    {s}
                                                    {!oos && v?.stock < 15 && <span className="atc-low-dot" />}
                                                </button>
                                            );
                                        })}
                                    </Stack>
                                </>
                            )}

                            {/* Combo unavailable warning */}
                            {selColor && selSize && noVariant && (
                                <p className="atc-combo-warn mb-3">
                                    ⚠️ This combination is unavailable. Try another.
                                </p>
                            )}

                            <PolicyPills item={item} />

                            <p className="atc-label">Quantity</p>
                            <Stack direction="horizontal" gap={3} className="align-items-center mb-3">
                                <QtyStepper
                                    qty={qty}
                                    onDec={decQty}
                                    onInc={incQty}
                                    disableDec={qty <= 1}
                                    disableInc={noVariant || isOOS || qty >= dispStock}
                                />
                                {av && <StockBadge stock={dispStock} />}
                            </Stack>

                            {av ? (
                                <TotalRow price={dispPrice} qty={qty} oldPrice={item.old_price} />
                            ) : (
                                <div className="atc-divider" />
                            )}

                            <ModalFooter
                                onAdd={handleAdd}
                                onClose={onClose}
                                adding={adding}
                                disabled={noVariant || isOOS}
                                label={ctaLabel}
                            />
                        </div>
                    </>
                )}
            </Shell>
        </Overlay>
    );
}



export default function AddToCartModal({ item, onClose, onSuccess }) {
    if (!item) return null;
    const handleClose = () => onClose?.();
    return hasVariants(item)
        ? <VariantModal item={item} onClose={handleClose} onSuccess={onSuccess} />
        : <NoVariantModal item={item} onClose={handleClose} onSuccess={onSuccess} />;
}