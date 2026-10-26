import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Row, Col } from "react-bootstrap";
import { IoLogOutOutline, IoCloseOutline } from "react-icons/io5";
import { useNavigate, useLocation } from "react-router-dom";
import productApi from "../../api/product.api";
import toast from "react-hot-toast";
import '../../style/Dashboard.css'
// import '../../style/DashboardLanding.css'   // NEW: landing-page styles (colors come from the same CSS variables)
import GlobalHelper from "../../helper/GlobalHelper";
import ProductCard from "../../components/ProductCard";
import Sidebar from "../../components/Sidebar";
import Toolbar from "../../components/Toolbar";
import wishlistApi from "../../api/wishlist.api";
import { useAuthWrapper } from "../../helper/AuthWrapper";
import SkeletonCard from "../../components/SkeletonCard";
import AddToCartModal from "../../components/AddToCartModal";
import { FMT } from "../../helper/GlobalHelper";
import CategorySection from "../../components/CategorySection";

const PER_PAGE = 12;
const WELCOME_COUPON = "WELCOME10";
const WELCOME_KEY = "pd_welcome_seen";
const CART_ROUTE = "/cart"; // 👈 apne cart page ka route yahan set karein


const HERO_SLIDES = [
    {
        id: 1,
        tag: "🔥 Mega Sale",
        cta: "Shop the sale",
        action: "sale",
        emoji: "🛍️",
    },
    {
        id: 2,
        tag: "✨ Just landed",
        cta: "See what's new",
        action: "new",
        emoji: "🆕",
    },
    {
        id: 3,
        tag: "⭐ Customer favourites",
        cta: "View top rated",
        action: "toprated",
        emoji: "🏆",
    },
];

// Calculate the real discount from the original and current prices.
// If the original price is unavailable, use the API discount field.
const getDiscountPercent = (product) => {
    if (!product) return 0;

    const currentPrice = Number(product.price);
    const originalPrice = Number(
        product.original_price ??
        product.originalPrice ??
        product.mrp ??
        product.compare_at_price
    );

    if (
        Number.isFinite(currentPrice) &&
        currentPrice >= 0 &&
        Number.isFinite(originalPrice) &&
        originalPrice > currentPrice
    ) {
        return Math.round(
            ((originalPrice - currentPrice) / originalPrice) * 100
        );
    }

    const discount = Number(product.discount);

    return Number.isFinite(discount)
        ? Math.max(0, Math.min(100, discount))
        : 0;
};

const getProductDate = (product) => {
    const date = new Date(
        product?.created_at ?? product?.createdAt ?? ""
    );

    return Number.isNaN(date.getTime()) ? 0 : date.getTime();
};

const getProductRating = (product) => {
    const rating = Number(product?.rating);
    return Number.isFinite(rating) ? rating : 0;
};

const getProductTitle = (product) =>
    product?.title || product?.name || "Featured product";


const TRUST_ITEMS = [
    { icon: "🚚", title: "Free delivery", text: "On orders above ₹499" },
    {
        icon: "🖊️",
        title: "Customization Available",
        text: "Customize your order to match your preferences."
    },
    { icon: "🔒", title: "Secure payments", text: "100% protected checkout" },
    { icon: "💬", title: "24/7 support", text: "We're always here to help" },
];


const NAV_RULES = {
    trending: (p) =>
        Number(p.sold || 0) > 500 ||
        (Array.isArray(p.tags) && p.tags.includes("Trending")),

    new: (p) =>
        Boolean(p.created_at || p.createdAt) ||
        (Array.isArray(p.tags) && p.tags.includes("New Arrival")),

    sale: (p) => getDiscountPercent(p) > 0,

    toprated: (p) => getProductRating(p) >= 4.5,
};


/* ───────────────────────── small helpers ───────────────────────── */

function useEscape(onClose) {
    useEffect(() => {
        const onKey = e => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);
}

function getTimeLeft() {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const s = Math.max(0, Math.floor((end - new Date()) / 1000));
    return { h: Math.floor(s / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

const pad = n => String(n).padStart(2, "0");

/* ───────────────────────── Hero banner ───────────────────────── */


function HeroBanner({ products, onCta }) {
    const [idx, setIdx] = useState(0);
    const [paused, setPaused] = useState(false);

    useEffect(() => {
        if (paused) return;

        const timer = setInterval(() => {
            setIdx((current) => (current + 1) % HERO_SLIDES.length);
        }, 5000);

        return () => clearInterval(timer);
    }, [paused]);

    const slide = HERO_SLIDES[idx];
    const product = products[idx];

    const discount = getDiscountPercent(product);
    const rating = getProductRating(product);

    const title = !product
        ? "Discover products you'll love"
        : idx === 0
            ? `${discount}% OFF on ${getProductTitle(product).slice(0, 20)+'..'}`
            : idx === 1
                ? `New arrival: ${getProductTitle(product).slice(0, 20)+'..'}`
                : `${getProductTitle(product).slice(0, 20)+'..'} — ${rating.toFixed(1)} ★`;

    const subtitle = !product
        ? "Explore our latest products and offers."
        : idx === 0
            ? `Special offer! Buy now for ${FMT(product.price)}.`
            : idx === 1
                ? `Recently. Explore our latest products.`
                : `Customer rating: ${rating.toFixed(1)} out of 5.`;

    return (
        <section
            className="lp-hero"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            aria-roledescription="carousel"
        >
            <div className="lp-hero-slide" key={slide.id}>
                <div className="lp-hero-text">
                    <span className="lp-hero-tag">
                        {idx === 0 && product
                            ? `🔥 ${discount}% OFF`
                            : slide.tag}
                    </span>

                    <h1>{title}</h1>
                    <p>{subtitle}</p>

                    <div className="lp-hero-cta">
                        <button
                            className="lp-btn-light"
                            onClick={() => onCta(slide.action)}
                        >
                            {slide.cta}
                        </button>

                        <button
                            className="lp-btn-ghost"
                            onClick={() => onCta("all")}
                        >
                            Browse all
                        </button>
                    </div>
                </div>

                <div className="lp-hero-visual">
                    {product?.img ? (
                        <img
                            src={product.img}
                            alt={getProductTitle(product)}
                        />
                    ) : (
                        <span className="lp-hero-emoji">
                            {slide.emoji}
                        </span>
                    )}
                </div>
            </div>

            <div className="lp-hero-dots">
                {HERO_SLIDES.map((item, index) => (
                    <button
                        key={item.id}
                        className={index === idx ? "on" : ""}
                        onClick={() => setIdx(index)}
                        aria-label={`Slide ${index + 1}`}
                    />
                ))}
            </div>
        </section>
    );
}


/* ───────────────────────── Flash sale strip (own timer so page doesn't re-render) ───────────────────────── */

function FlashStrip({ onShop, onCopy }) {
    const [t, setT] = useState(getTimeLeft());
    useEffect(() => {
        const id = setInterval(() => setT(getTimeLeft()), 1000);
        return () => clearInterval(id);
    }, []);

    return (
        <div className="lp-flash">
            <div className="lp-flash-left">
                <span className="lp-flash-title">⚡ Flash sale ends today</span>
                <div className="lp-timer" aria-label="Time left">
                    <span>{pad(t.h)}</span>:<span>{pad(t.m)}</span>:<span>{pad(t.s)}</span>
                </div>
            </div>
            <div className="lp-flash-right">
                <button className="lp-code" onClick={onCopy} title="Copy coupon code">
                    Use code <strong>{WELCOME_COUPON}</strong>
                </button>
                <button className="lp-flash-btn" onClick={onShop}>Shop deals</button>
            </div>
        </div>
    );
}

/* ───────────────────────── Popups ───────────────────────── */

function WelcomePopup({ onClose, onShop }) {
    useEscape(onClose);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(WELCOME_COUPON);
            toast.success("Coupon code copied!");
        } catch {
            toast.error("Couldn't copy. Code: " + WELCOME_COUPON);
        }
    };

    return (
        <div className="lp-overlay" onClick={onClose}>
            <div className="lp-popup lp-welcome" role="dialog" aria-modal="true" aria-label="Welcome offer" onClick={e => e.stopPropagation()}>
                <button className="lp-close" onClick={onClose} aria-label="Close"><IoCloseOutline /></button>
                <div className="lp-welcome-art">🎁</div>
                <div className="lp-welcome-body">
                    <h2>Get 10% off your first order</h2>
                    <p>Use this coupon at checkout and save on anything in the store.</p>
                    <div className="lp-coupon">
                        <span>{WELCOME_COUPON}</span>
                        <button onClick={copy}>Copy code</button>
                    </div>
                    <button className="lp-btn-main" onClick={() => { onShop(); onClose(); }}>Start shopping</button>
                    <button className="lp-link" onClick={onClose}>No thanks</button>
                </div>
            </div>
        </div>
    );
}

function AddedPopup({ item, onClose, onViewCart }) {
    useEscape(onClose);
    useEffect(() => {
        const t = setTimeout(onClose, 6000);
        return () => clearTimeout(t);
    }, [onClose]);

    return (
        <div className="lp-added" role="status">
            <div className="lp-added-head">
                <span className="lp-added-check">✓</span>
                <strong>Added to cart</strong>
                <button className="lp-close sm" onClick={onClose} aria-label="Close"><IoCloseOutline /></button>
            </div>
            <div className="lp-added-body">
                {item?.img && <img src={item.img} alt="" />}
                <div className="lp-added-info">
                    <div className="lp-added-title">{item?.title}</div>
                    {item?.price != null && <div className="lp-added-price">{FMT(item.price)}</div>}
                </div>
            </div>
            <div className="lp-added-actions">
                <button className="lp-btn-main sm" onClick={onViewCart}>View cart</button>
                <button className="lp-btn-sec sm" onClick={onClose}>Keep shopping</button>
            </div>
        </div>
    );
}

function CompareModal({ items, onClose, onRemove, onClear }) {
    useEscape(onClose);

    const rows = [
        { label: "Brand", render: p => p.brand || "—" },
        { label: "Category", render: p => p.category || "—" },
        { label: "Price", render: p => FMT(p.price) },
        { label: "Discount", render: p => (p.discount > 0 ? `${p.discount}% off` : "—") },
        { label: "Rating", render: p => (p.rating ? `${p.rating} ★` : "—") },
        { label: "Availability", render: p => (Number(p.stock) > 0 ? "In stock" : "Out of stock") },
    ];

    return (
        <div className="lp-overlay" onClick={onClose}>
            <div className="lp-popup lp-compare" role="dialog" aria-modal="true" aria-label="Compare products" onClick={e => e.stopPropagation()}>
                <div className="lp-compare-head">
                    <h3>Compare products</h3>
                    <button className="lp-close sm" onClick={onClose} aria-label="Close"><IoCloseOutline /></button>
                </div>
                <div className="lp-compare-scroll">
                    <table className="lp-compare-table">
                        <thead>
                            <tr>
                                <th />
                                {items.map(p => (
                                    <th key={p.id}>
                                        {p.img && <img src={p.img} alt={p.title} />}
                                        <div className="lp-compare-name">{p.title}</div>
                                        <button className="lp-link" onClick={() => onRemove(p)}>Remove</button>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map(r => (
                                <tr key={r.label}>
                                    <td className="lp-compare-label">{r.label}</td>
                                    {items.map(p => <td key={p.id}>{r.render(p)}</td>)}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="lp-compare-foot">
                    <button className="lp-btn-sec" onClick={onClear}>Clear all</button>
                    <button className="lp-btn-main" onClick={onClose}>Done</button>
                </div>
            </div>
        </div>
    );
}

/* ───────────────────────── Main page ───────────────────────── */

export default function ProductDashboard() {
    const navigate = useNavigate();

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialSearch = queryParams.get("search") || "";

    const [rawProducts, setRawProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [search, setSearch] = useState(initialSearch);

    const [navSection, setNavSection] = useState("all");
    const [sortBy, setSortBy] = useState("relevance");
    const [view, setView] = useState("grid");
    const [page, setPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    const [priceMax, setPriceMax] = useState(20000);
    const [minRating, setMinRating] = useState(0);
    const [activeTags, setActiveTags] = useState([]);
    const [cartModal, setCartModal] = useState(null);
    // UI state
    const [wishlist, setWishlist] = useState([]);
    const [cart, setCart] = useState([]);
    const [compareList, setCompare] = useState([]);
    const [selectedProduct, setSelected] = useState(null);
    const [sidebarOpen, setSidebar] = useState(window.innerWidth >= 992);
    const [categorySections, setCategorySections] = useState([]);
    const [isDefaultView, setIsDefaultView] = useState(true);

    // NEW popup / landing state
    const [showWelcome, setShowWelcome] = useState(false);
    const [showCompare, setShowCompare] = useState(false);
    const [addedItem, setAddedItem] = useState(null);
    const [showTop, setShowTop] = useState(false);

    const { isLike, setIsLike, globalCartLength } = useAuthWrapper()

    const searchRef = useRef();
    const contentRef = useRef();

    // ── Fetch products from API ────────────────────────────────────────────────
    useEffect(() => {
        fetchProductData();
        fetchWishlist();
        fetchCategorySections();
    }, []);

    const fetchCategorySections = async () => {
        try {
            const res = await productApi.getCategorySections();
            if (res.success) {
                const mappedSections = res.data.map(section => ({
                    ...section,
                    products: section.products.map(GlobalHelper.API_FIELDS_MAP['products'])
                }));
                setCategorySections(mappedSections);
            }
        } catch (err) {
            console.error("Failed to fetch category sections:", err);
        }
    };

    const fetchProductData = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await productApi.getAllProducts();

            const rows = Array.isArray(data.data)
                ? data.data
                : Array.isArray(data.data?.rows)
                    ? data.data.rows
                    : [];

            setRawProducts(rows.map(GlobalHelper?.API_FIELDS_MAP['products']));
        } catch (err) {
            console.error("Failed to fetch products:", err);
            setError("Failed to load products. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const fetchWishlist = async () => {
        try {
            const { data } = await wishlistApi.getAllWishlistItems();

            if (data.success) {
                setIsLike(data.data.map(ele => ele.id) || [])
            }
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        if (selectedProduct)
            navigate(`/product/${selectedProduct?.id}`)
    }, [selectedProduct])

    useEffect(() => {
        const onResize = () => setSidebar(window.innerWidth >= 992);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    // Back-to-top visibility
    useEffect(() => {
        const onScroll = () => setShowTop(window.scrollY > 500);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Welcome offer popup (once per browser, after a short delay)
    useEffect(() => {
        let seen = false;
        try { seen = !!localStorage.getItem(WELCOME_KEY); } catch { /* storage blocked */ }
        if (seen) return;
        const t = setTimeout(() => setShowWelcome(true), 3000);
        return () => clearTimeout(t);
    }, []);

    const closeWelcome = useCallback(() => {
        setShowWelcome(false);
        try { localStorage.setItem(WELCOME_KEY, "1"); } catch { /* ignore */ }
    }, []);

    const addToast = useCallback((msg, icon = "✅") => {
        toast.success(msg)
    }, []);

    const addToCart = useCallback((product) => {
        setCartModal(product);
    }, []);

    const createWishlist = async (product) => {
        try {
            const result = await wishlistApi.toogleWishlist({ id: product.id });
            if (result.success) {
                toast.success(result?.data?.message || result?.message);
                fetchWishlist();
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const toggleCompare = useCallback((product) => {
        setCompare(c => {
            if (c.find(x => x.id === product.id)) return c.filter(x => x.id !== product.id);
            if (c.length >= 3) { addToast("Max 3 products to compare", "⚠️"); return c; }
            addToast(`${product.title.slice(0, 22)}… added to compare`, "⚖️");
            return [...c, product];
        });
    }, [addToast]);

    // ── Filter + Sort ─────────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        return rawProducts
            .filter(p => {
                if (navSection === "wishlist" && !wishlist.includes(p.id)) return false;
                if (NAV_RULES[navSection] && !NAV_RULES[navSection](p)) return false;

                if (search) {
                    const q = search.toLowerCase();
                    if (!p.title.toLowerCase().includes(q) &&
                        !p.brand.toLowerCase().includes(q) &&
                        !p.category.toLowerCase().includes(q) &&
                        !p.tags.some(t => t.toLowerCase().includes(q)))
                        return false;
                }
                if (p.price > priceMax) return false;
                if (p.rating < minRating) return false;
                if (activeTags.length && !activeTags.some(t => p.tags.includes(t))) return false;
                return true;
            })

            .sort((a, b) => {
                // Sale: highest discount first.
                if (navSection === "sale") {
                    return (
                        getDiscountPercent(b) - getDiscountPercent(a) ||
                        Number(b.sold || 0) - Number(a.sold || 0)
                    );
                }

                // New arrivals: newest creation date first.
                if (navSection === "new") {
                    return getProductDate(b) - getProductDate(a);
                }

                // Top rated: highest rating first.
                if (navSection === "toprated") {
                    return (
                        getProductRating(b) - getProductRating(a) ||
                        Number(b.sold || 0) - Number(a.sold || 0)
                    );
                }

                if (sortBy === "price_lo") return a.price - b.price;
                if (sortBy === "price_hi") return b.price - a.price;
                if (sortBy === "rating") {
                    return getProductRating(b) - getProductRating(a);
                }
                if (sortBy === "newest") {
                    return getProductDate(b) - getProductDate(a);
                }
                if (sortBy === "popular") {
                    return Number(b.sold || 0) - Number(a.sold || 0);
                }

                return 0;
            });

    }, [rawProducts, navSection, wishlist, search, priceMax, minRating, activeTags, sortBy]);

    const dataMaxPrice = useMemo(() => {
        return (rawProducts && rawProducts.length > 0)
            ? Math.max(...rawProducts.map(p => Number(p.price || 0)), 20000)
            : 20000;
    }, [rawProducts]);

    // Quick category chips come from the real product data
    const categories = useMemo(() => {
        return [...new Set(rawProducts.map(p => p.category).filter(Boolean))].slice(0, 12);
    }, [rawProducts]);

    // Products used as visuals in the hero banner

    const heroProducts = useMemo(() => {
        const availableProducts = rawProducts.filter(
            (product) => Number(product.stock) > 0
        );

        // Highest actual discount first.
        const saleProduct = [...availableProducts]
            .filter((product) => getDiscountPercent(product) > 0)
            .sort(
                (a, b) => getDiscountPercent(b) - getDiscountPercent(a)
            )[0];

        // Latest created product first.
        const newestProduct = [...availableProducts]
            .filter((product) => getProductDate(product) > 0)
            .sort(
                (a, b) => getProductDate(b) - getProductDate(a)
            )[0];

        // Highest rating first; break ties using sales.
        const topRatedProduct = [...availableProducts]
            .filter((product) => getProductRating(product) > 0)
            .sort(
                (a, b) =>
                    getProductRating(b) - getProductRating(a) ||
                    Number(b.sold || 0) - Number(a.sold || 0)
            )[0];

        return [
            saleProduct,
            newestProduct,
            topRatedProduct,
        ];
    }, [rawProducts]);

    useEffect(() => {
        // Search / section / filters active → grid view, otherwise landing sections
        const activeFiltersCount = (activeTags?.length || 0) + (minRating > 0 ? 1 : 0) + (priceMax < (dataMaxPrice || 20000) ? 1 : 0);
        const hasActiveFilters = activeFiltersCount > 0 || sortBy !== "relevance";

        if (search || navSection !== "all" || hasActiveFilters) {
            setIsDefaultView(false);
        } else {
            setIsDefaultView(true);
        }
    }, [search, navSection, activeTags, minRating, priceMax, dataMaxPrice, sortBy]);

    const scrollToContent = () => {
        contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    // Used by hero buttons, flash strip and welcome popup

    const goSection = (key) => {
        setSearch("");
        setNavSection(key);
        setPage(1);

        if (key === "new") {
            setSortBy("newest");
        } else if (key === "toprated") {
            setSortBy("rating");
        } else if (key === "trending") {
            setSortBy("popular");
        } else {
            setSortBy("relevance");
        }

        if (key === "all") {
            scrollToContent();
        } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };


    const pickCategory = (cat) => {
        setNavSection("all");
        setSearch(cat);
        setPage(1);
        scrollToContent();
    };

    const handleSeeAll = (section) => {
        if (section.category) {
            setNavSection("all");
        } else if (section.section_key === "trending") {
            setNavSection("trending");
        } else if (section.section_key === "new_arrivals") {
            setNavSection("new");
        } else if (section.section_key === "on_sale") {
            setNavSection("sale");
        } else if (section.section_key === "top_rated") {
            setNavSection("toprated");
        }
        setPage(1);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const copyCoupon = async () => {
        try {
            await navigator.clipboard.writeText(WELCOME_COUPON);
            toast.success("Coupon code copied!");
        } catch {
            toast.error("Code: " + WELCOME_COUPON);
        }
    };

    const totalPages = Math.ceil((filtered?.length || 0) / PER_PAGE);
    const paged = (filtered || []).slice((page - 1) * PER_PAGE, page * PER_PAGE);

    const toggleTag = (tag) => {
        setActiveTags(t => t.includes(tag) ? t.filter(x => x !== tag) : [...t, tag]);
        setPage(1);
    };

    const clearAll = () => {
        setSearch(""); setActiveTags([]); setMinRating(0); setPriceMax(dataMaxPrice); setNavSection("all"); setSortBy("relevance"); setPage(1);
    };

    const sidebarShown = sidebarOpen && window.innerWidth >= 992;
    const showLanding = isDefaultView && !loading && !error;

    return (
        <div className="pd-shell">

            <Sidebar cart={cart} sidebarOpen={sidebarOpen} navSection={navSection} wishlist={wishlist} IoLogOutOutline={IoLogOutOutline} IoCloseOutline={IoCloseOutline} fmt={FMT} setSidebar={setSidebar} setNavSection={setNavSection} />

            {/* ══ MAIN ══ */}
            <div
                className="pd-main"
                style={{
                    marginLeft: sidebarShown ? "var(--sidebar-w)" : 0,
                    transition: "margin-left 0.3s ease",
                    width: sidebarShown ? `calc(100vw - var(--sidebar-w))` : "100vw",
                }}
            >
                {/* ── Topbar ── */}
                <Toolbar searchRef={searchRef} search={search} cart={cart} wishlist={wishlist} setWishlist={setWishlist} setRawProducts={setRawProducts} setSidebar={setSidebar} addToast={addToast} setSearch={setSearch} />

                {/* ── Body ── */}
                <div className="lp-body" style={{ paddingBottom: compareList.length ? 110 : 24 }}>

                    {/* Landing top: hero + flash sale */}
                    {showLanding && (
                        <>
                            <HeroBanner products={heroProducts} onCta={goSection} />
                            <FlashStrip onShop={() => goSection("sale")} onCopy={copyCoupon} />
                        </>
                    )}

                    {/* Category chips */}
                    {!loading && categories.length > 0 && (
                        <div className="lp-cats" role="tablist" aria-label="Shop by category">
                            <button className={`lp-cat ${!search && navSection === "all" ? "on" : ""}`} onClick={clearAll}>All</button>
                            {categories.map(c => (
                                <button key={c} className={`lp-cat ${search === c ? "on" : ""}`} onClick={() => pickCategory(c)}>{c}</button>
                            ))}
                        </div>
                    )}

                    {/* Trust badges */}
                    {showLanding && (
                        <div className="lp-trust">
                            {TRUST_ITEMS.map(t => (
                                <div key={t.title} className="lp-trust-item">
                                    <span className="lp-trust-icon">{t.icon}</span>
                                    <div>
                                        <div className="lp-trust-title">{t.title}</div>
                                        <div className="lp-trust-text">{t.text}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div ref={contentRef} className="lp-anchor" />

                    {/* Heading + sort / filters */}
                    <div className="lp-head fu">
                        {/* <div>
                            <h2 className="lp-title">
                                {isDefaultView ? "Shop by collection" : (SECTION_TITLES[navSection] || "Products")}
                            </h2>
                            {!isDefaultView && !loading && (
                                <div className="lp-count">
                                    <strong>{filtered.length}</strong> of {rawProducts.length} products
                                    {search && <> for <strong>"{search}"</strong></>}
                                </div>
                            )}
                        </div> */}
                        <div className="pd-toolbar">
                            <button className={`pd-filter-btn ${showFilters ? "active" : ""}`} onClick={() => setShowFilters(f => !f)}>
                                ⚙️ Filters {showFilters ? "▲" : "▼"}
                            </button>
                            {/* <select className="pd-select" value={sortBy} onChange={e => { setSortBy(e.target.value); setPage(1); }}>
                                {GlobalHelper.SORT_OPTIONS.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                            </select> */}
                        </div>
                    </div>

                    {/* Filter Panel */}
                    {showFilters && (
                        <div className="pd-filter-panel fu mb-3">
                            <Row className="g-4">
                                <Col md={4}>
                                    <label className="pd-label">Max Price: <strong style={{ color: "var(--p)" }}>{FMT(priceMax)}</strong></label>
                                    <div className="pd-range-wrap">
                                        <span style={{ fontSize: ".72rem", color: "#bbb", fontWeight: 700 }}>₹0</span>
                                        <input type="range" className="pd-range" min={0} max={dataMaxPrice} step={100}
                                            value={priceMax}
                                            style={{ "--rv": `${(priceMax / dataMaxPrice) * 100}%` }}
                                            onChange={e => { setPriceMax(+e.target.value); setPage(1); }}
                                        />
                                        <span style={{ fontSize: ".72rem", color: "#bbb", fontWeight: 700 }}>{FMT(dataMaxPrice)}</span>
                                    </div>
                                </Col>
                                <Col md={3}>
                                    <label className="pd-label">Minimum Rating</label>
                                    {[4.5, 4, 3.5, 3, 0].map(r => (
                                        <div key={r} className={`pd-rating-row ${minRating === r ? "active" : ""}`} onClick={() => { setMinRating(r); setPage(1); }}>
                                            <span className="pd-stars" style={{ fontSize: ".8rem" }}>{"★".repeat(Math.floor(r))}{r % 1 ? "+" : ""}</span>
                                            <span style={{ fontSize: ".8rem", color: "#555", fontWeight: 700 }}>{r === 0 ? "All Ratings" : `${r}+ stars`}</span>
                                            {minRating === r && <span style={{ marginLeft: "auto", color: "var(--p)", fontWeight: 900 }}>✓</span>}
                                        </div>
                                    ))}
                                </Col>
                                <Col md={5}>
                                    <label className="pd-label">Product Tags</label>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                                        {GlobalHelper.ALL_TAGS.map(tag => (
                                            <span key={tag} className={`pd-tag ${activeTags.includes(tag) ? "active" : ""}`} onClick={() => toggleTag(tag)}>
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    {((activeTags?.length || 0) > 0 || minRating > 0 || priceMax < dataMaxPrice) && (
                                        <button onClick={() => { setActiveTags([]); setMinRating(0); setPriceMax(dataMaxPrice); setPage(1); }}
                                            style={{ marginTop: 10, fontSize: ".78rem", color: "var(--p)", fontWeight: 800, border: "none", background: "none", cursor: "pointer", padding: 0, fontFamily: "Nunito" }}>
                                            ✕ Clear All Filters
                                        </button>
                                    )}
                                </Col>
                            </Row>
                        </div>
                    )}

                    {/* Active filter chips */}
                    {(search || activeTags.length > 0 || minRating > 0 || priceMax < dataMaxPrice) && (
                        <div className="d-flex gap-2 flex-wrap mb-3 fu">
                            {search && <span className="pd-pill on" onClick={() => setSearch("")}>🔍 "{search}" ✕</span>}
                            {priceMax < dataMaxPrice && <span className="pd-pill on" onClick={() => setPriceMax(dataMaxPrice)}>Under {FMT(priceMax)} ✕</span>}
                            {minRating > 0 && <span className="pd-pill on" onClick={() => setMinRating(0)}>{minRating}+ ★ ✕</span>}
                            {activeTags.map(t => <span key={t} className="pd-pill on" onClick={() => toggleTag(t)}>{t} ✕</span>)}
                        </div>
                    )}

                    {/* Products */}
                    {loading ? (
                        <div className="pd-grid">
                            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
                        </div>
                    ) : (error && (!rawProducts || rawProducts.length === 0)) ? (
                        <div className="pd-empty fu">
                            <div style={{ fontSize: "3.5rem", marginBottom: 12 }}>⚠️</div>
                            <div className="fw-bold" style={{ fontSize: "1.1rem", color: "#555", marginBottom: 14 }}>{error}</div>
                            <button className="lp-btn-main" onClick={fetchProductData}>Try again</button>
                        </div>
                    ) : (paged && paged.length === 0) ? (
                        <div className="pd-empty fu">
                            <div style={{ fontSize: "3.5rem", marginBottom: 12 }}>
                                {navSection === "wishlist" ? "💔" : "🔍"}
                            </div>
                            <div className="fw-bold" style={{ fontSize: "1.1rem", color: "#555", marginBottom: 6 }}>
                                {navSection === "wishlist" ? "Your wishlist is empty" : "No products found"}
                            </div>
                            <div style={{ color: "#aaa", fontSize: ".85rem", marginBottom: 16 }}>
                                {navSection === "wishlist" ? "Browse products and add your favourites." : "Try a different search or remove some filters."}
                            </div>
                            <button className="lp-btn-main" onClick={clearAll}>Browse all products</button>
                        </div>
                    ) : (isDefaultView && categorySections && categorySections.length > 0) ? (
                        <div className="category-sections-wrapper">
                            {categorySections.map((section) => (
                                <CategorySection
                                    key={section.section_key}
                                    title={section.title}
                                    products={section.products}
                                    onSeeAll={() => handleSeeAll(section)}
                                    setCartModal={setCartModal}
                                    addToCart={addToCart}
                                    createWishlist={createWishlist}
                                    toggleCompare={toggleCompare}
                                    setSelected={setSelected}
                                    isLike={isLike}
                                    compareList={compareList}
                                />
                            ))}
                        </div>
                    ) : view === "grid" && (
                        <div className="pd-grid">
                            {paged.map((p, i) => {
                                if (Number(p.stock) <= 0) return null;
                                return (
                                    <ProductCard
                                        key={p.id}
                                        product={p}
                                        setCartModal={setCartModal}
                                        onAdd={addToCart}
                                        onWishlist={createWishlist}
                                        onCompare={toggleCompare}
                                        onView={setSelected}
                                        isWished={isLike?.includes(p.id)}
                                        isCompared={!!compareList?.find(x => x.id === p.id)}
                                        delay={i * 0.04}
                                    />
                                );
                            })}
                        </div>
                    )}

                    {/* Pagination - only show if not in default sections view */}
                    {!loading && !isDefaultView && totalPages > 1 && (
                        <div className="d-flex justify-content-center align-items-center gap-2 mt-5 fu">
                            <button className="pd-pg-btn" disabled={page === 1} onClick={() => { setPage(p => p - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}>‹</button>
                            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                                const p = totalPages <= 7 ? i + 1
                                    : page <= 4 ? i + 1
                                        : page >= totalPages - 3 ? totalPages - 6 + i
                                            : page - 3 + i;
                                return (
                                    <button key={p} className={`pd-pg-btn ${page === p ? "on" : ""}`} onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                                        {p}
                                    </button>
                                );
                            })}
                            <button className="pd-pg-btn" disabled={page === totalPages} onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}>›</button>
                        </div>
                    )}

                    {/* {!loading && !isDefaultView && filtered.length > 0 && (
                        <div className="text-center mt-2" style={{ fontSize: ".75rem", color: "#bbb", fontWeight: 700 }}>
                            Page {page} of {totalPages} · {filtered.length} products
                        </div>
                    )} */}
                </div>
            </div>

            {/* ══ POPUPS ══ */}
            {cartModal && (
                <AddToCartModal
                    item={cartModal}
                    onClose={() => setCartModal(null)}
                    onSuccess={() => { setAddedItem(cartModal); setCartModal(null); }}
                />
            )}

            {addedItem && (
                <AddedPopup
                    item={addedItem}
                    onClose={() => setAddedItem(null)}
                    onViewCart={() => { setAddedItem(null); navigate(CART_ROUTE); }}
                />
            )}

            {showWelcome && <WelcomePopup onClose={closeWelcome} onShop={() => goSection("sale")} />}

            {showCompare && compareList.length > 0 && (
                <CompareModal
                    items={compareList}
                    onClose={() => setShowCompare(false)}
                    onRemove={toggleCompare}
                    onClear={() => { setCompare([]); setShowCompare(false); }}
                />
            )}

            {/* ══ COMPARE BAR ══ */}
            {compareList.length > 0 && (
                <div className="pd-compare-bar" style={{ left: sidebarShown ? "var(--sidebar-w)" : 0, transition: "left .3s ease" }}>
                    <span className="lp-compare-label">⚖️ Compare ({compareList.length}/3)</span>
                    {compareList.map(p => (
                        <div key={p.id} className="pd-compare-slot">
                            <img src={p.img} alt={p.title} />
                            <div className="pd-compare-rm" onClick={() => toggleCompare(p)}>✕</div>
                        </div>
                    ))}
                    {Array.from({ length: 3 - compareList.length }).map((_, i) => (
                        <div key={i} className="pd-compare-slot">+</div>
                    ))}
                    {compareList.length >= 2 && (
                        <button className="pd-cmp-btn" onClick={() => setShowCompare(true)}>Compare now</button>
                    )}
                    <button className="lp-compare-clear" onClick={() => setCompare([])}>Clear</button>
                </div>
            )}

            {/* ══ BACK TO TOP ══ */}
            {showTop && (
                <button
                    className="lp-top"
                    style={{ bottom: compareList.length ? 96 : 24 }}
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    aria-label="Back to top"
                >↑</button>
            )}
        </div>
    );
}