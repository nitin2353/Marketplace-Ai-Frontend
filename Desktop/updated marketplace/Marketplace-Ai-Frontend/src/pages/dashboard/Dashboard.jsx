import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Row, Col, Pagination } from "react-bootstrap";
import { IoLogOutOutline, IoCloseOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import productApi from "../../api/product.api";
import toast from "react-hot-toast";
import '../../style/Dashboard.css'
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
import { useLocation } from "react-router-dom";





const PER_PAGE = 12;

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
    const [priceMax, setPriceMax] = useState(200000);
    const [minRating, setMinRating] = useState(0);
    const [activeTags, setActiveTags] = useState([]);
    const [cartModal, setCartModal] = useState(null);
    // UI state
    const [wishlist, setWishlist] = useState([]);
    const [cart, setCart] = useState([]);
    const [compareList, setCompare] = useState([]);
    const [toasts, setToasts] = useState([]);
    const [selectedProduct, setSelected] = useState(null);
    const [sidebarOpen, setSidebar] = useState(window.innerWidth >= 992);
    const [categorySections, setCategorySections] = useState([]);
    const [isDefaultView, setIsDefaultView] = useState(true);


    const { isLike, setIsLike, globalCartLength } = useAuthWrapper()

    const searchRef = useRef();


    // ── Fetch products from API ────────────────────────────────────────────────
    useEffect(() => {
        fetchProductData();
        fetchWishlist();
        fetchCategorySections();
    }, []);

    // useEffect(() => {
    //     const q = queryParams.get("search");
    //     if (q) setSearch(q);
    // }, [location.search]);


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
                if (navSection === "trending") return p.sold > 500 || p.tags.includes("Trending");
                if (navSection === "new") return p.tags.includes("New Arrival");
                if (navSection === "sale") return p.discount > 0;
                if (navSection === "toprated") return p.rating >= 4.5;
                if (navSection === "wishlist") return wishlist.includes(p.id);

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
                if (sortBy === "price_lo") return a.price - b.price;
                if (sortBy === "price_hi") return b.price - a.price;
                if (sortBy === "rating") return b.rating - a.rating;
                if (sortBy === "newest") return new Date(b.created_at) - new Date(a.created_at);
                if (sortBy === "popular") return b.sold - a.sold;
                return 0;
            });
    }, [rawProducts, navSection, wishlist, search, priceMax, minRating, activeTags, sortBy]);

    const dataMaxPrice = useMemo(() => {
        return (rawProducts && rawProducts.length > 0)
            ? Math.max(...rawProducts.map(p => Number(p.price || 0)), 200000)
            : 200000;
    }, [rawProducts]);

    useEffect(() => {
        // If there's a search, or navSection is NOT 'all', or filters are active, show grid view
        const activeFiltersCount = (activeTags?.length || 0) + (minRating > 0 ? 1 : 0) + (priceMax < (dataMaxPrice || 200000) ? 1 : 0);
        const hasActiveFilters = activeFiltersCount > 0 || sortBy !== "relevance";

        console.log("Dashboard state:", { search, navSection, activeFiltersCount, sortBy, isDefaultView });

        if (search || navSection !== "all" || hasActiveFilters) {
            setIsDefaultView(false);
        } else {
            setIsDefaultView(true);
        }
    }, [search, navSection, activeTags, minRating, priceMax, dataMaxPrice, sortBy]);


    const handleSeeAll = (section) => {
        if (section.category) {
            setNavSection("all");
            // setSearch(section.category);
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


    const totalPages = Math.ceil((filtered?.length || 0) / PER_PAGE);
    const paged = (filtered || []).slice((page - 1) * PER_PAGE, page * PER_PAGE);


    const toggleTag = (tag) => {
        setActiveTags(t => t.includes(tag) ? t.filter(x => x !== tag) : [...t, tag]);
        setPage(1);
    };



    return (
        <div className="pd-shell">

            <Sidebar cart={cart} sidebarOpen={sidebarOpen} navSection={navSection} wishlist={wishlist} IoLogOutOutline={IoLogOutOutline} IoCloseOutline={IoCloseOutline} fmt={FMT} setSidebar={setSidebar} setNavSection={setNavSection} />

            {/* ══ MAIN ══ */}
            <div
                className="pd-main"
                style={{
                    marginLeft: sidebarOpen && window.innerWidth >= 992 ? "var(--sidebar-w)" : 0,
                    transition: "margin-left 0.3s ease",
                    width: sidebarOpen && window.innerWidth >= 992 ? `calc(100vw - var(--sidebar-w))` : "100vw",
                }}
            >
                {/* ── Topbar ── */}
                <Toolbar searchRef={searchRef} search={search} cart={cart} wishlist={wishlist} setWishlist={setWishlist} setRawProducts={setRawProducts} setSidebar={setSidebar} addToast={addToast} setSearch={setSearch} />

                {/* ── Body ── */}
                <div style={{ padding: "20px", paddingBottom: compareList.length ? 100 : 20 }}>


                    {/* Toolbar */}
                    <div className="d-flex mb-3 gap-2 fu" style={{ animationDelay: ".04s" }}>
                        {/* <div style={{ fontWeight: 700, color: "var(--muted)", fontSize: ".84rem" }}>
                            {loading ? "Loading products…" : (
                                <>Showing <strong style={{ color: "var(--p)" }}>{filtered?.length || 0}</strong> of {rawProducts?.length || 0} products
                                    {search && <> for <strong style={{ color: "var(--text)" }}>"{search}"</strong></>}
                                </>
                            )}
                        </div> */}

                        <div className="pd-toolbar float-end">
                            <button className={`pd-filter-btn ${showFilters ? "active" : ""}`} onClick={() => setShowFilters(f => !f)}>
                                ⚙️ Filters {showFilters ? "▲" : "▼"}
                            </button>
                            <select className="pd-select" value={sortBy} onChange={e => { setSortBy(e.target.value); setPage(1); }}>
                                {GlobalHelper.SORT_OPTIONS.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                            </select>
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
                            {/* {search && <span className="pd-pill on" onClick={() => setSearch("")}>🔍 "{search}" ✕</span>} */}
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
                            <div className="fw-bold" style={{ fontSize: "1.1rem", color: "#555" }}>{error}</div>
                        </div>
                    ) : (paged && paged.length === 0) ? (

                        <div className="pd-empty fu">
                            <div style={{ fontSize: "3.5rem", marginBottom: 12 }}>
                                {navSection === "wishlist" ? "💔" : error ? "⚠️" : "🔍"}
                            </div>
                            <div className="fw-bold" style={{ fontSize: "1.1rem", color: "#555", marginBottom: 6 }}>
                                {navSection === "wishlist" ? "Your wishlist is empty" : "No products found"}
                            </div>
                            <div style={{ color: "#aaa", fontSize: ".85rem", marginBottom: 16 }}>
                                {navSection === "wishlist" ? "Browse products and add your favourites!" : "Try adjusting your search or filters"}
                            </div>
                            <button
                                onClick={() => { setSearch(""); setActiveTags([]); setMinRating(0); setPriceMax(dataMaxPrice); setNavSection("all"); setPage(1); }}
                                style={{ border: "none", borderRadius: 12, background: "linear-gradient(135deg,#ff6b35,#f7931e)", color: "#fff", fontWeight: 800, padding: "11px 24px", fontFamily: "Nunito", cursor: "pointer", fontSize: ".9rem" }}>
                                🏪 Browse All Products
                            </button>
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

                    {!loading && !isDefaultView && filtered.length > 0 && (
                        <div className="text-center mt-2" style={{ fontSize: ".75rem", color: "#bbb", fontWeight: 700 }}>
                            Page {page} of {totalPages} · {filtered.length} products
                        </div>
                    )}

                </div>
            </div>

            {cartModal && (
                <AddToCartModal
                    item={cartModal}
                    onClose={() => setCartModal(null)}
                    onSuccess={() => setCartModal(null)}
                />
            )}

            {/* ══ COMPARE BAR ══ */}
            {/* {compareList.length > 0 && (
                <div className="pd-compare-bar" style={{ left: sidebarOpen && window.innerWidth >= 992 ? "var(--sidebar-w)" : 0, transition: "left .3s ease" }}>
                    <span style={{ fontWeight: 800, fontSize: ".84rem", color: "#555", flexShrink: 0 }}>⚖️ Compare:</span>
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
                        <button className="pd-cmp-btn" onClick={() => addToast(`Comparing ${compareList.length} products!`, "⚖️")}>Compare Now</button>
                    )}
                    <button onClick={() => setCompare([])} style={{ marginLeft: "auto", border: "none", background: "none", cursor: "pointer", fontWeight: 800, color: "#aaa", fontSize: ".82rem", fontFamily: "Nunito" }}>
                        Clear
                    </button>
                </div>
            )} */}

            {/* ══ TOASTS ══ */}
            <div style={{ position: "fixed", bottom: compareList.length ? 110 : 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                {toasts.map(t => (
                    <div key={t.id} className="pd-toast">
                        <span style={{ fontSize: "1.1rem" }}>{t.icon}</span>
                        {t.msg}
                    </div>
                ))}
            </div>
        </div>
    );
}