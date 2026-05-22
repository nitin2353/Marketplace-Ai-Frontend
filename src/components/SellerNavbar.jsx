import { useNavigate, useLocation } from "react-router-dom";
import { useAuthWrapper } from "../helper/AuthWrapper";
import { useEffect, useState, useRef, useId } from "react";
import JWTService from "../config/jwt.config";
import { Overlay, Popover } from "react-bootstrap";
import NotificationPanel from "./NotificationPanel";
import notificationApi from "../api/notification.api";
import toast from "react-hot-toast";

const SellerNavbar = ({
    sellerName = "",
    notifCount = 1,
    pageTitle = "",
    notifications = [],
}) => {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { isOpen, setIsOpen } = useAuthWrapper();

    const [userInfo, setUserInfo] = useState(null);
    const [displayName, setDisplayName] = useState("My Store");
    const [showNotif, setShowNotif] = useState(false);
    const [refreshNotify, setRefreshNotify] = useState(false);
    const [notifyCount, setNotifyCount] = useState(0)
    const bellRef = useRef(null);

    useEffect(() => {
        setName();
    }, []);

    useEffect(() => {
        if (userInfo?.id) {
            fetchNotificationCount();
        }
    }, [userInfo?.id, refreshNotify]);

    const setName = () => {
        const data = JWTService.decodeTokenDetails();
        if (data) {
            setUserInfo(data);
            const fullName = `${data?.firstName || ""} ${data?.lastName || ""}`.trim();
            setDisplayName(fullName || sellerName || "My Store");
        } else {
            setUserInfo(null);
            setDisplayName(sellerName || "My Store");
        }
    };

    const titleMap = {
        "/seller/dashboard": "Dashboard",
        "/seller/products": "My Products",
        "/seller/product/create": "Add Product",
        "/seller/orders": "Orders",
        "/seller/earnings": "Earnings",
        "/seller/reviews": "Reviews",
        "/seller/settings": "Settings",
    };

    const currentTitle =
        pageTitle ||
        Object.entries(titleMap).find(
            ([path]) => pathname === path || (path !== "/seller/dashboard" && pathname.startsWith(path))
        )?.[1] ||
        "Seller Dashboard";

    const initials =
        displayName && displayName !== "My Store"
            ? displayName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
            : "SE";

    const btnStyle = (active = false) => ({
        width: 40, height: 40, borderRadius: 10,
        border: `1.5px solid ${active ? "var(--primary)" : "#e8eaf6"}`,
        background: active ? "var(--bg-hover)" : "#f8f9ff",
        cursor: "pointer", display: "flex",
        alignItems: "center", justifyContent: "center",
        fontSize: "1.05rem", transition: "all 0.2s",
    });



    const fetchNotificationCount = async () => {
        try {
            const result = await notificationApi.getUnreadCount();
            setNotifyCount(result.data.unread_count)
        } catch (error) {
            toast.error("Fetch Notification Error");
        }
    }


    return (
        <nav
            style={{
                position: "sticky",
                top: 0,
                // zIndex: 1040,
                background: "var(--bg-surface)",
                borderBottom: "1px solid var(--border-light)",
                boxShadow: "var(--shadow-sm)",
                height: "72px",
                display: "flex",
                alignItems: "center",
                paddingInline: "24px",
                gap: "16px",
                transition: "all 0.3s ease",
            }}
        >
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="d-flex align-items-center justify-content-center rounded-3 border-0"
                style={{
                    width: 42,
                    height: 42,
                    background: "var(--bg-hover)",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    flexShrink: 0
                }}
            >
                <div style={{ width: 20, height: 14, position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <span style={{ display: "block", width: "100%", height: 2, background: "var(--primary)", borderRadius: 2, transition: "0.3s", transform: isOpen ? "rotate(45deg) translateY(6px) translateX(2px)" : "none" }} />
                    {!isOpen && <span style={{ display: "block", width: "100%", height: 2, background: "var(--primary)", borderRadius: 2, transition: "0.3s" }} />}
                    <span style={{ display: "block", width: "100%", height: 2, background: "var(--primary)", borderRadius: 2, transition: "0.3s", transform: isOpen ? "rotate(-45deg) translateY(-6px) translateX(2px)" : "none" }} />
                </div>
            </button>

            <div
                style={{
                    fontWeight: 700,
                    fontSize: "1.2rem",
                    color: "var(--text-main)",
                    fontFamily: "var(--font-heading)",
                    flex: 1,
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                }}
            >
                {currentTitle}
            </div>

            {/* ── Right actions ── */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>

                {/* ── Bell button ── */}
                <div 
                    ref={bellRef}
                    onClick={() => setShowNotif((v) => !v)}
                    style={{ 
                        position: "relative",
                        width: 42, 
                        height: 42, 
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "var(--bg-hover)",
                        fontSize: "1.3rem",
                        cursor: "pointer",
                        transition: "all 0.2s"
                    }}
                >
                    🔔
                    {notifyCount > 0 && (
                        <span style={{
                            position: "absolute", 
                            top: 2, 
                            right: 2,
                            background: "var(--primary)", 
                            color: "#fff",
                            fontSize: "0.65rem", 
                            fontWeight: 700,
                            padding: "1px 5px",
                            borderRadius: "10px",
                            boxShadow: "var(--shadow-sm)"
                        }}>
                            {notifyCount > 9 ? "9+" : notifyCount}
                        </span>
                    )}
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
                        <NotificationPanel mode={"seller"} refreshNotify={refreshNotify} setRefreshNotify={setRefreshNotify}  />
                    </Popover>
                </Overlay>

                {/* ── User pill ── */}
                <div
                    onClick={() => navigate("/seller/settings")}
                    style={{
                        display: "flex", 
                        alignItems: "center", 
                        gap: 10,
                        background: "var(--bg-hover)", 
                        border: "1px solid var(--border-light)",
                        borderRadius: "30px", 
                        padding: "5px 16px 5px 5px",
                        cursor: "pointer", 
                        transition: "all 0.2s",
                    }}
                >
                    <div style={{
                        width: 34, 
                        height: 34, 
                        borderRadius: "50%",
                        background: "var(--primary-gradient)",
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center",
                        fontSize: "0.85rem", 
                        fontWeight: 700, 
                        color: "#fff",
                        boxShadow: "var(--shadow-sm)"
                    }}>
                        {initials}
                    </div>
                    <span className="d-none d-md-block" style={{
                        color: "var(--text-main)", 
                        fontSize: "0.9rem", 
                        fontWeight: 600,
                        maxWidth: 120, 
                        overflow: "hidden",
                        whiteSpace: "nowrap", 
                        textOverflow: "ellipsis",
                    }}>
                        {displayName}
                    </span>
                </div>
            </div>
        </nav>
    );
}

export default SellerNavbar;