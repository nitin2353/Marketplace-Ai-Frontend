import '../style/Dashboard.css';
import { IoMdArrowRoundBack } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import productApi from '../api/product.api';
import GlobalHelper from '../helper/GlobalHelper';
import { useCallback, useEffect, useRef, useState } from "react";
import { Form, InputGroup, ListGroup } from 'react-bootstrap';
import cartApi from '../api/cartApi';
import wishlistApi from '../api/wishlist.api';
import notificationApi from '../api/notification.api';
import { useAuthWrapper } from '../helper/AuthWrapper';
import { Overlay, Popover } from 'react-bootstrap';
import NotificationPanel from './NotificationPanel';
import JWTService from '../config/jwt.config';
import toast from "react-hot-toast";


function debounce(fn, delay = 500) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}


const Toolbar = ({
    searchRef,
    setSidebar,
    setRawProducts,
    isSideBar = true,
    isSearch = true
}) => {
    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [cartQuantity, setCartQuanity] = useState()
    const [wishlistQuantity, setWishlistQty] = useState(0)
    const itemRefs = useRef([]);
    const dropdownRef = useRef(null);
    const searchValueRef = useRef("");
    const bellRef = useRef(null);

    const [showNotif, setShowNotif] = useState(false);
    const [notifyCount, setNotifyCount] = useState(0);
    const [refreshNotify, setRefreshNotify] = useState(false);

    const { isLike, refresh, setGlobalCartLength } = useAuthWrapper()
    const userData = JWTService.decodeTokenDetails();
    const entityId = userData?.id || userData?.user_id;

    useEffect(() => {
        searchValueRef.current = search;
    }, [search]);

    useEffect(() => {
        itemRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
    }, [activeIndex]);


    useEffect(() => {
        fetchCart()
        if (entityId) fetchNotificationCount();
        
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setSuggestions([]);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [entityId]);

    useEffect(() => {
        if (entityId) fetchNotificationCount();
    }, [entityId, refreshNotify]);

    const fetchNotificationCount = async () => {
        try {
            const result = await notificationApi.getUnreadCount(entityId);
            setNotifyCount(result.data.unread_count);
        } catch (error) {
            console.error("Fetch Notification Error", error);
        }
    };

    useEffect(() => {
        fetchCart()
    }, [refresh])


    const fetchSuggestions = useCallback(async (query) => {
        if (!query.trim()) {
            setSuggestions([]);
            return;
        }
        try {
            const res = await productApi.productSuggestions(query);
            setSuggestions(res?.data ?? []);
            setActiveIndex(0);
        } catch (err) {
            console.error("Suggestion error:", err);
            setSuggestions([]);
        }
    }, []);


    const fetchProducts = useCallback(async (query) => {
        setIsLoading(true);
        try {
            if (!query.trim()) {

                const { data } = await productApi.getAllProducts();
                const rows = Array.isArray(data) ? data
                    : Array.isArray(data?.rows) ? data.rows
                        : Array.isArray(data?.data) ? data.data
                            : Array.isArray(data?.data?.rows) ? data.data.rows
                                : [];
                console.log(data)
                setRawProducts(rows.map(GlobalHelper.API_FIELDS_MAP['products']));
            } else {
                const res = await productApi.searchProduct(query);
                const rows = Array.isArray(res?.data) ? res.data
                    : Array.isArray(res?.data?.rows) ? res.data.rows
                        : [];
                setRawProducts(rows.map(GlobalHelper.API_FIELDS_MAP['products']));
            }
        } catch (err) {
            console.error("Search error:", err);
        } finally {
            setIsLoading(false);
        }
    }, [setRawProducts]);


    const fetchCart = async () => {
        try {
            const { data } = await cartApi.getAllCart();
            if (data.success) {
                setCartQuanity(data.data.length || 0);
                setGlobalCartLength(data.data.length || 0)
            }
        } catch (error) {
            console.error(error)
        }
    }

    const fetchSuggestionsRef = useRef(fetchSuggestions);
    useEffect(() => { fetchSuggestionsRef.current = fetchSuggestions; }, [fetchSuggestions]);

    const debouncedSuggestions = useRef(
        debounce((query) => fetchSuggestionsRef.current(query), 400)
    ).current;


    const handleChange = (e) => {
        const value = e.target.value;
        setSearch(value);
        debouncedSuggestions(value);

        if (!value.trim()) {
            fetchProducts("");
        }
    };

    const handleSelect = useCallback(async (keyword) => {
        const q = keyword?.trim() ?? "";
        setSearch(q);
        setSuggestions([]);
        setActiveIndex(0);
        await fetchProducts(q);
    }, [fetchProducts]);

    const handleClear = useCallback(() => {
        setSearch("");
        setSuggestions([]);
        setActiveIndex(0);
        fetchProducts("");
        searchRef?.current?.focus();
    }, [fetchProducts, searchRef]);


    const handleKeyDown = (e) => {
        if (!suggestions.length && e.key !== "Enter" && e.key !== "Backspace") return;

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setActiveIndex(prev => Math.min(prev + 1, suggestions.length - 1));
                break;

            case "ArrowUp":
                e.preventDefault();
                setActiveIndex(prev => Math.max(prev - 1, 0));
                break;

            case "Enter": {
                e.preventDefault();
                const selected = suggestions[activeIndex];
                if (selected?.keyword) {
                    handleSelect(selected.keyword);
                } else {
                    fetchProducts(searchValueRef.current);
                    setSuggestions([]);
                }
                break;
            }

            case "Backspace":

                if (searchValueRef.current.length <= 1) {
                    setSuggestions([]);
                    fetchProducts("");
                }
                break;

            case "Escape":
                setSuggestions([]);
                break;

            default:
                break;
        }
    };

    return (
        <div className="pd-topbar d-flex align-items-center gap-3">

            {
                isSideBar ?
                    <button onClick={() => setSidebar(s => !s)} className="toolbar-btn d-flex rounded-3 border-0 text-light" style={{height: "35px", padding: "0 12px", fontSize: "0.9rem", fontWeight: 900, background: "linear-gradient(135deg, var(--p), var(--p2)) !important",} }>
                        ☰
                    </button>
                    :
                    <div className="text-dark fw-black" style={{ fontFamily: "Nunito", fontSize: "1.7rem", cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>ShopEase</div>
            }

            {/* ── SEARCH BOX ── */}

            <div ref={dropdownRef} style={{ position: "relative", maxWidth: 420, width: "100%" }} className='d-flex justify-content-center'>
                {isSearch &&
                    <InputGroup>
                        <InputGroup.Text style={{ background: "#f8f9ff", border: "2px solid #e8eaf6", borderRight: "none", borderRadius: "12px 0 0 12px" }}>
                            {isLoading ? (
                                <span style={{ display: "inline-block", width: 16, height: 16, border: "2px solid #ff6b35", borderTopColor: "transparent", borderRadius: "50%", animation: "spin .6s linear infinite" }} />
                            ) : "🔍"}
                        </InputGroup.Text>

                        <Form.Control
                            ref={searchRef}
                            value={search}
                            placeholder="Search products, brands, tags..."
                            style={{
                                border: "2px solid #e8eaf6",
                                borderLeft: "none",
                                borderRight: search ? "none" : "2px solid #e8eaf6",
                                borderRadius: search ? 0 : "0 12px 12px 0",
                                fontFamily: "Nunito, sans-serif",
                                fontWeight: 600,
                                fontSize: "0.9rem",
                                background: "#f8f9ff",
                            }}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            autoComplete="off"
                        />

                        {search && (
                            <InputGroup.Text
                                style={{
                                    cursor: "pointer",
                                    border: "2px solid #e8eaf6",
                                    borderLeft: "none",
                                    borderRadius: "0 12px 12px 0",
                                    background: "#f8f9ff",
                                    color: "#9ca3af",
                                    fontWeight: 900,
                                }}
                                onClick={handleClear}
                                title="Clear search"
                            >
                                ✕
                            </InputGroup.Text>
                        )}
                    </InputGroup>
                }

                {/* ── Suggestions dropdown ── */}
                {suggestions.length > 0 && (
                    <ListGroup
                        style={{
                            position: "absolute",
                            top: "calc(100% + 4px)",
                            left: 0,
                            width: "100%",
                            zIndex: 1050,
                            maxHeight: 240,
                            overflowY: "auto",
                            borderRadius: 14,
                            border: "2px solid #e8eaf6",
                            boxShadow: "0 12px 36px rgba(0,0,0,0.12)",
                            background: "#fff",
                        }}
                    >
                        {suggestions.map((item, index) => (
                            <ListGroup.Item
                                key={index}
                                action
                                active={index === activeIndex}
                                ref={el => (itemRefs.current[index] = el)}
                                onMouseEnter={() => setActiveIndex(index)}
                                onClick={() => handleSelect(item.keyword)}
                                style={{
                                    fontFamily: "Nunito, sans-serif",
                                    fontWeight: 700,
                                    fontSize: "0.87rem",
                                    border: "none",
                                    borderBottom: "1px solid #f1f4ff",
                                    padding: "10px 16px",
                                    cursor: "pointer",
                                    background: index === activeIndex ? "linear-gradient(135deg,#fff0e6,#fff8f4)" : "#fff",
                                    color: index === activeIndex ? "#ff6b35" : "#374151",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                }}
                            >
                                <span style={{ fontSize: "0.8rem", opacity: 0.5 }}>🔍</span>
                                {/* Highlight matching part */}
                                {highlightMatch(item.keyword, search)}
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                )}

            </div>

            {/* ── RIGHT ICONS ── */}
            <div className="d-flex gap-2 ms-auto">

                {/* Cart */}
                <div
                    style={{ position: "relative", cursor: "pointer" }}
                    onClick={() => navigate('/dashboard/cart')}
                    title="Cart"
                >
                    {cartQuantity > 0 && (
                        <div className="badge-number">
                            {cartQuantity}
                        </div>
                    )}
                    <div className="toolbar-btn rounded-3 border">🛒</div>
                </div>

                {/* Wishlist */}
                <div style={{ position: "relative", cursor: "pointer" }} onClick={() => navigate('/dashboard/wishlist')} title="Wishlist">
                    {isLike.length > 0 && (
                        <div className="badge-number">
                            {isLike.length}
                        </div>
                    )}
                    <div className="toolbar-btn d-flex rounded-3 border">❤️</div>
                </div>

                {/* Notifications */}
                <div style={{ position: "relative", cursor: "pointer" }} ref={bellRef} onClick={() => setShowNotif(!showNotif)} title="Notifications">
                    <div className="toolbar-btn rounded-3 border">
                        🔔
                        {notifyCount > 0 && (
                            <span className="badge-number" style={{ top: -5, right: -5 }}>
                                {notifyCount > 9 ? "9+" : notifyCount}
                            </span>
                        )}
                    </div>
                </div>

                <Overlay
                    target={bellRef.current}
                    show={showNotif}
                    placement="bottom-end"
                    rootClose
                    onHide={() => setShowNotif(false)}
                >
                    <Popover style={{
                        maxWidth: 340, padding: 0,
                        border: "0.5px solid #e5e7eb",
                        borderRadius: 12,
                        boxShadow: "0 8px 32px rgba(0,0,0,.12)",
                        overflow: "hidden",
                    }}>
                        <NotificationPanel 
                            mode="user" 
                            refreshNotify={refreshNotify} 
                            setRefreshNotify={setRefreshNotify}
                            onMarkAllRead={() => setRefreshNotify(r => !r)}
                        />
                    </Popover>
                </Overlay>

                {/* Profile */}
                <div 
                    className="toolbar-btn rounded-3 border" 
                    title="Profile" 
                    onClick={() => navigate('/dashboard/settings/profile')}
                    style={{ background: "linear-gradient(135deg,#ff6b35,#f7931e)", color: "#fff", fontWeight: 900, fontSize: "0.8rem" }}
                >
                    {userData?.firstName?.[0] || userData?.name?.[0] || "U"}
                </div>
            </div>

            {/* Spinner keyframe (injected once) */}
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default Toolbar;

// ── Highlight matching text in suggestion ───────────────────────────────────
function highlightMatch(text, query) {
    if (!query.trim()) return text;
    try {
        const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, "gi");
        const parts = text.split(regex);
        return parts.map((part, i) =>
            regex.test(part)
                ? <span key={i} style={{ color: "#ff6b35", fontWeight: 900 }}>{part}</span>
                : part
        );
    } catch {
        return text;
    }
}