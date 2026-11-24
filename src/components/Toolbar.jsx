import '../style/Dashboard.css';
import { IoMdArrowRoundBack } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import productApi from '../api/product.api';
import GlobalHelper from '../helper/GlobalHelper';
import { useCallback, useEffect, useRef, useState } from "react";
import { Form, InputGroup, ListGroup } from 'react-bootstrap';
import cartApi from '../api/cartApi';
import notificationApi from '../api/notification.api';
import { useAuthWrapper } from '../helper/AuthWrapper';
import { Overlay, Popover } from 'react-bootstrap';
import NotificationPanel from './NotificationPanel';
import JWTService from '../config/jwt.config';
import { MdOutlineLogin } from "react-icons/md";
import wishlistApi from "../api/wishlist.api";




const Toolbar = ({
    searchRef,
    setSidebar,
    setRawProducts,
    isSideBar = true,
    isSearch = true,
    search: searchProp,
    setSearch: setSearchProp
}) => {

    const navigate = useNavigate();

    const [localSearch, setLocalSearch] = useState("");

    const committedSearch =
        searchProp !== undefined ? searchProp : localSearch;

    const setCommittedSearch =
        setSearchProp !== undefined ? setSearchProp : setLocalSearch;

    const [inputSearch, setInputSearch] = useState(committedSearch || "");

    const search = inputSearch;

    const [suggestions, setSuggestions] = useState([]);
    const [activeIndex, setActiveIndex] = useState(-1);

    const skipNextSuggestionRef = useRef(false);
    const searchRequestRef = useRef(0);
    const suggestionRequestRef = useRef(0);
    const [cartQuantity, setCartQuanity] = useState()
    const itemRefs = useRef([]);
    const dropdownRef = useRef(null);
    const bellRef = useRef(null);

    const [showNotif, setShowNotif] = useState(false);
    const [notifyCount, setNotifyCount] = useState(0);
    const [refreshNotify, setRefreshNotify] = useState(false);
    const isLogin = JWTService?.isTokenAvailable();
    const { isLike, refresh, setGlobalCartLength } = useAuthWrapper()
    const userData = JWTService.decodeTokenDetails();
    const entityId = userData?.id || userData?.user_id;

    useEffect(() => {
        setInputSearch(committedSearch || "");
    }, [committedSearch]);

    useEffect(() => {
        itemRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
    }, [activeIndex]);


    useEffect(() => {
        (isLogin) && fetchCart()
        if (entityId && refreshNotify && isLogin) fetchNotificationCount();

        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setSuggestions([]);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [entityId]);

    useEffect(() => {
        if (entityId && refreshNotify && isLogin) fetchNotificationCount();
    }, [entityId, refreshNotify]);

    const fetchNotificationCount = async () => {
        try {
            const result = await notificationApi.getUnreadCount();
            setNotifyCount(result.data.unread_count);
        } catch (error) {
            console.error("Fetch Notification Error", error);
        }
    };

    useEffect(() => {
        (isLogin) && fetchCart()
    }, [refresh])

    useEffect(() => {
        if (skipNextSuggestionRef.current) {
            skipNextSuggestionRef.current = false;
            setSuggestions([]);
            setActiveIndex(-1);
            return;
        }

        const query = inputSearch.trim();

        if (query.length < 2) {
            setSuggestions([]);
            setActiveIndex(-1);
            return;
        }

        let isActive = true;

        const timer = setTimeout(async () => {
            const requestId = ++suggestionRequestRef.current;

            try {
                const res = await productApi.productSuggestions(query);

                if (
                    !isActive ||
                    requestId !== suggestionRequestRef.current
                ) return;

                const rows = Array.isArray(res?.data)
                    ? res.data
                    : [];
                console.log('rows', rows)

                setSuggestions(
                    rows.filter(item => item?.keyword?.trim())
                );

                setActiveIndex(-1);

            } catch (error) {
                if (!isActive) return;

                console.error("Suggestion error:", error);
                setSuggestions([]);
            }
        }, 300);

        return () => {
            isActive = false;
            clearTimeout(timer);
        };

    }, [inputSearch]);



    const fetchProducts = useCallback(async (query) => {
        const requestId = ++searchRequestRef.current;

        try {
            const normalizedQuery = query.trim();

            let rows = [];

            if (!normalizedQuery) {
                const { data } = await productApi.getAllProducts();

                rows = Array.isArray(data)
                ? data
                    : Array.isArray(data?.rows)
                        ? data.rows
                        : Array.isArray(data?.data)
                            ? data.data
                            : Array.isArray(data?.data?.rows)
                                ? data.data.rows
                                : [];

            } else {
                const res = await productApi.searchProduct(normalizedQuery);
                
                rows = Array.isArray(res?.data)
                ? res.data
                : Array.isArray(res?.data?.rows)
                ? res.data.rows
                : [];
            }
            
            // Ignore outdated API responses
            if (requestId !== searchRequestRef.current) return;

            setRawProducts(
                rows.map(GlobalHelper.API_FIELDS_MAP.products)
            );
            
        } catch (error) {
            if (requestId !== searchRequestRef.current) return;

            console.error("Search error:", error);
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



    const handleChange = (e) => {
        const value = e.target.value;

        setInputSearch(value);
        setActiveIndex(-1);
    };

    const handleSelect = useCallback(async (keyword) => {
        const query = keyword?.trim() || "";

        skipNextSuggestionRef.current = true;

        setInputSearch(query);
        setCommittedSearch(query);

        setSuggestions([]);
        setActiveIndex(-1);

        await fetchProducts(query);

    }, [fetchProducts, setCommittedSearch]);


    const handleClear = useCallback(() => {
        skipNextSuggestionRef.current = true;

        setInputSearch("");
        setCommittedSearch("");

        setSuggestions([]);
        setActiveIndex(-1);

        fetchProducts("");

        searchRef?.current?.focus();

    }, [fetchProducts, searchRef, setCommittedSearch]);


    const handleKeyDown = (e) => {
        switch (e.key) {

            case "ArrowDown": {
                if (!suggestions.length) return;

                e.preventDefault();

                setActiveIndex(prev =>
                    prev < suggestions.length - 1
                        ? prev + 1
                        : 0
                );

                break;
            }

            case "ArrowUp": {
                if (!suggestions.length) return;

                e.preventDefault();

                setActiveIndex(prev =>
                    prev > 0
                        ? prev - 1
                        : suggestions.length - 1
                );

                break;
            }

            case "Enter": {
                e.preventDefault();

                const selected = suggestions[activeIndex];

                if (selected?.keyword) {
                    handleSelect(selected.keyword);
                } else {
                    const query = inputSearch.trim();

                    setSuggestions([]);
                    setActiveIndex(-1);
                    setCommittedSearch(query);

                    fetchProducts(query);
                }

                break;
            }

            case "Escape": {
                setSuggestions([]);
                setActiveIndex(-1);
                break;
            }

            default:
                // Backspace and normal typing work naturally.
                break;
        }
    };


    return (
        <div className="pd-topbar d-flex align-items-center gap-2 gap-md-3 px-2 py-2 px-md-4" style={{
            background: "var(--bg-surface)",
            borderBottom: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-sm)",
            minHeight: "2px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
        }}>


            {
                isSideBar ?
                    <button
                        onClick={() => setSidebar(s => !s)}
                        className="toolbar-btn d-flex align-items-center justify-content-center rounded-3 border-0"
                        style={{
                            height: "40px",
                            width: "40px",
                            fontSize: "1.2rem",
                            background: "var(--bg-hover)",
                            color: "var(--text-main)",
                            transition: "all 0.2s"
                        }}
                    >
                        ☰
                    </button>
                    :
                    <>
                        <button
                            className="d-flex align-items-center justify-content-center fw-bold rounded-2 border-0 text-white"
                            style={{ height: "32px", width: "32px", fontSize: "0.9rem", fontWeight: 900, background: "var(--primary-gradient)", }}
                            onClick={() => navigate('/')}
                        >
                            ←
                        </button>
                    </>
            }

            {/* ── SEARCH BOX ── */}
            <div ref={dropdownRef} style={{ position: "relative", maxWidth: 600, width: "100%" }} className='d-flex justify-content-center flex-grow-1'>
                {isSearch &&
                    <InputGroup style={{ boxShadow: "var(--shadow-sm)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
                        <InputGroup.Text style={{
                            background: "var(--bg-hover)",
                            border: "1px solid var(--border-light)",
                            borderRight: "none",
                            paddingLeft: "16px",
                            color: "var(--text-light)"
                        }}>
                            {/* {isLoading ? (
                                <span style={{ display: "inline-block", width: 18, height: 18, border: "2px solid var(--primary)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin .6s linear infinite" }} />
                            ) : "🔍"} */}
                        </InputGroup.Text>

                        <Form.Control
                            ref={searchRef}
                            value={inputSearch}
                            placeholder="Search for products, brands and more"
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            autoComplete="off"
                        />

                        {search && (
                            <InputGroup.Text
                                style={{
                                    cursor: "pointer",
                                    border: "1px solid var(--border-light)",
                                    borderLeft: "none",
                                    background: "var(--bg-hover)",
                                    color: "var(--text-light)",
                                    paddingRight: "16px"
                                }}
                                onClick={handleClear}
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
                            top: "100%",
                            left: 0,
                            right: 0,
                            zIndex: 9999,
                            marginTop: 6,
                            borderRadius: 12,
                            overflow: "hidden",
                            boxShadow: "var(--shadow-lg)",
                            border: "1px solid var(--border-light)"
                        }}
                    >
                        {suggestions.map((item, index) => (
                            <ListGroup.Item
                                key={index}
                                action={!item.isEmpty}
                                active={!item.isEmpty && index === activeIndex}
                                ref={el => (itemRefs.current[index] = el)}
                                onMouseEnter={() => !item.isEmpty && setActiveIndex(index)}
                                onClick={() => !item.isEmpty && handleSelect(item.keyword)}
                            // style={{
                            //     fontFamily: "var(--font-body)",
                            //     fontWeight: item.isEmpty ? 600 : index === activeIndex ? 600 : 500,
                            //     fontSize: "0.9rem",
                            //     border: "none",
                            //     borderBottom: "1px solid var(--border-light)",
                            //     padding: "12px 20px",
                            //     cursor: item.isEmpty ? "default" : "pointer",

                            //     background: item.isEmpty
                            //         ? "#f8fafc" // light solid bg for empty
                            //         : index === activeIndex
                            //             ? "var(--bg-hover)"
                            //             : "#ffffff", // normal solid bg

                            //     color: item.isEmpty
                            //         ? "#94a3b8" // muted text
                            //         : index === activeIndex
                            //             ? "var(--primary)"
                            //             : "var(--text-main)",

                            //     display: "flex",
                            //     alignItems: "center",
                            //     gap: 12,
                            // }}
                            >
                                <span style={{ fontSize: "0.9rem", opacity: 0.4 }}>
                                    {item.isEmpty ? "📭" : "🔍"}
                                </span>

                                {item.isEmpty ? item.keyword : highlightMatch(item.keyword, search)}
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                )}
            </div>

            {/* ── RIGHT ICONS ── */}
            <div className="d-flex align-items-center gap-3 ms-auto" style={{ marginBottom: '-8px' }}>

                {/* Cart */}
                <div
                    style={{ position: "relative", cursor: "pointer" }}
                    onClick={() => navigate('/dashboard/cart')}
                    className="toolbar-icon-wrapper"
                >
                    {cartQuantity > 0 && (
                        <div style={{
                            position: "absolute",
                            top: "4px",
                            right: "3px",
                            background: "var(--primary)",
                            color: "white",
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            width: "13px",
                            height: "13px",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            zIndex: 2,
                            boxShadow: "var(--shadow-sm)"
                        }}>
                            {cartQuantity}
                        </div>
                    )}
                    <div style={{ fontSize: "1.4rem", padding: "8px", borderRadius: "var(--radius-sm)", transition: "background 0.2s" }} className="hover-bg">🛒</div>
                </div>

                {/* Wishlist */}
                <div style={{ position: "relative", cursor: "pointer" }} onClick={() => navigate('/dashboard/wishlist')} className="toolbar-icon-wrapper">
                    {isLike.length > 0 && (
                        <div style={{
                            position: "absolute",
                            top: "4px",
                            right: "2px",
                            background: "var(--danger)",
                            color: "white",
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            width: "13px",
                            height: "13px",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            zIndex: 2,
                            boxShadow: "var(--shadow-sm)"
                        }}>
                            {isLike.length}
                        </div>
                    )}
                    <div style={{ fontSize: "1.4rem", padding: "8px", borderRadius: "var(--radius-sm)", transition: "background 0.2s" }} className="hover-bg">❤️</div>
                </div>

                {/* Chat */}
                <div style={{ position: "relative", cursor: "pointer" }} onClick={() => navigate('/chat')} className="toolbar-icon-wrapper">
                    <div style={{ fontSize: "1.4rem", padding: "8px", borderRadius: "var(--radius-sm)", transition: "background 0.2s" }} className="hover-bg">💬</div>
                </div>

                {/* Notifications */}
                <div style={{ position: "relative", cursor: "pointer" }} ref={bellRef} onClick={() => setShowNotif(!showNotif)} className="toolbar-icon-wrapper">
                    <div style={{ fontSize: "1.4rem", padding: "8px", borderRadius: "var(--radius-sm)", transition: "background 0.2s" }} className="hover-bg">
                        🔔
                        {notifyCount > 0 && (
                            <span style={{
                                position: "absolute",
                                top: "2px",
                                right: "2px",
                                background: "var(--primary)",
                                color: "white",
                                fontSize: "0.7rem",
                                fontWeight: 700,
                                width: "15px",
                                height: "15px",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                zIndex: 2,
                                boxShadow: "var(--shadow-sm)"
                            }}>
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
                        maxWidth: 360,
                        width: "100%",
                        padding: 0,
                        border: "1px solid var(--border-light)",
                        borderRadius: "var(--radius-md)",
                        boxShadow: "var(--shadow-lg)",
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
                    className="profile-trigger"
                    title="Profile"
                    onClick={() => navigate('/dashboard/settings')}
                    style={{
                        background: "linear-gradient(135deg, var(--primary), var(--primary-dark))",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: "0.9rem",
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                        marginBottom: "3px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        boxShadow: "var(--shadow-sm)",
                        marginLeft: "8px"
                    }}
                >
                    {userData?.firstName?.[0] || userData?.name?.[0] || (<MdOutlineLogin style={{ marginLeft: "-7px", fontSize: "1.3rem" }} />)}
                </div>
            </div>

            {/* Spinner keyframe (injected once) */}
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                .hover-bg:hover { background: var(--bg-hover); }
                .toolbar-icon-wrapper { transition: transform 0.1s; }
                .toolbar-icon-wrapper:active { transform: scale(0.95); }
            `}</style>
        </div >
    );
};

export default Toolbar;

// ── Highlight matching text in suggestion ───────────────────────────────────
function highlightMatch(text, query) {
    if (!query?.trim() || !text) return text;

    const words = query
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map(word => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

    if (!words.length) return text;

    const regex = new RegExp(`(${words.join("|")})`, "gi");

    return text.split(regex).map((part, index) => {
        const matched = words.some(
            word => new RegExp(`^${word}$`, "i").test(part)
        );

        return matched ? (
            <span key={index} style={{ fontWeight: 800 }}>
                {part}
            </span>
        ) : part;
    });
}