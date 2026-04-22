import { useNavigate, useLocation } from "react-router-dom";
import { useAuthWrapper } from "../helper/AuthWrapper";
import { useEffect, useState } from "react";
import JWTService from "../config/jwt.config";

export default function SellerNavbar({
    sellerName = "",
    notifCount = 1,
    pageTitle = ""
}) {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { isOpen, setIsOpen } = useAuthWrapper();

    const [userInfo, setUserInfo] = useState(null);
    const [displayName, setDisplayName] = useState("My Store");

    useEffect(() => {
        setName();
    }, []);

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
            ? displayName
                  .split(" ")
                  .map((word) => word[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()
            : "SE";

    return (
        <nav
            style={{
                position: "sticky",
                top: 0,
                zIndex: 1030,
                width: "100%",
                background: "#ffffff",
                borderBottom: "1.5px solid #e8eaf6",
                fontFamily: "Nunito, sans-serif",
                height: 60,
                display: "flex",
                alignItems: "center",
                paddingInline: 16,
                gap: 12,
            }}
        >
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                title={isOpen ? "Close sidebar" : "Open sidebar"}
                style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    border: `1.5px solid ${isOpen ? "#ff6b35" : "#e8eaf6"}`,
                    background: isOpen ? "#fff3ee" : "#f8f9ff",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 5,
                    flexShrink: 0,
                    transition: "all 0.2s",
                }}
            >
                <span
                    style={{
                        display: "block",
                        width: 18,
                        height: 2,
                        borderRadius: 2,
                        background: "#ff6b35",
                        transformOrigin: "center",
                        transition: "transform 0.25s",
                        transform: isOpen ? "translateY(7px) rotate(45deg)" : "none",
                    }}
                />
                <span
                    style={{
                        display: "block",
                        width: 18,
                        height: 2,
                        borderRadius: 2,
                        background: "#ff6b35",
                        transition: "opacity 0.2s",
                        opacity: isOpen ? 0 : 1,
                    }}
                />
                <span
                    style={{
                        display: "block",
                        width: 18,
                        height: 2,
                        borderRadius: 2,
                        background: "#ff6b35",
                        transformOrigin: "center",
                        transition: "transform 0.25s",
                        transform: isOpen ? "translateY(-7px) rotate(-45deg)" : "none",
                    }}
                />
            </button>

            <div
                style={{
                    fontWeight: 800,
                    fontSize: "1.05rem",
                    color: "#1a1a2e",
                    flex: 1,
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                }}
            >
                {currentTitle}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <button
                    type="button"
                    onClick={() => navigate("/seller/notifications")}
                    style={{
                        position: "relative",
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        border: "1.5px solid #e8eaf6",
                        background: "#f8f9ff",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.1rem",
                        transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#fff3ee";
                        e.currentTarget.style.borderColor = "#ff6b35";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#f8f9ff";
                        e.currentTarget.style.borderColor = "#e8eaf6";
                    }}
                >
                    🔔
                    {notifCount > 0 && (
                        <span
                            style={{
                                position: "absolute",
                                top: -5,
                                right: -5,
                                background: "#ff6b35",
                                color: "#fff",
                                fontSize: "0.58rem",
                                fontWeight: 900,
                                borderRadius: "50%",
                                width: 17,
                                height: 17,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                border: "2px solid #fff",
                            }}
                        >
                            {notifCount > 9 ? "9+" : notifCount}
                        </span>
                    )}
                </button>

                <button
                    type="button"
                    onClick={() => navigate("/")}
                    title="View store"
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        border: "1.5px solid #e8eaf6",
                        background: "#f8f9ff",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.05rem",
                        transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#fff3ee";
                        e.currentTarget.style.borderColor = "#ff6b35";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#f8f9ff";
                        e.currentTarget.style.borderColor = "#e8eaf6";
                    }}
                >
                    🏪
                </button>

                <div
                    onClick={() => navigate("/seller/settings")}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        background: "#f8f9ff",
                        border: "1.5px solid #e8eaf6",
                        borderRadius: 24,
                        padding: "5px 12px 5px 5px",
                        cursor: "pointer",
                        transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#fff3ee";
                        e.currentTarget.style.borderColor = "#ff6b35";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#f8f9ff";
                        e.currentTarget.style.borderColor = "#e8eaf6";
                    }}
                >
                    <div
                        style={{
                            width: 30,
                            height: 30,
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #ff6b35, #f7931e)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.72rem",
                            fontWeight: 900,
                            color: "#fff",
                            flexShrink: 0,
                            letterSpacing: 0.5,
                        }}
                    >
                        {initials}
                    </div>

                    <span
                        className="d-none d-sm-block"
                        style={{
                            color: "#1a1a2e",
                            fontSize: "0.82rem",
                            fontWeight: 700,
                            maxWidth: 110,
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                            textOverflow: "ellipsis",
                        }}
                    >
                        {displayName}
                    </span>
                </div>
            </div>
        </nav>
    );
}