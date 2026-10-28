import { useNavigate } from "react-router-dom";
import { SIDEBAR_MENUS } from "../helper/Constraints";

export default function Sidebar({ cart, sidebarOpen, navSection, wishlist, IoLogOutOutline, IoCloseOutline, fmt, setSidebar, setNavSection }) {

    const navigate = useNavigate();


    const handleNavItemClick = (itemId) => {
        setNavSection(itemId);
        if (window.innerWidth < 992) {
            setSidebar(false);
        }

        // Navigate to orders page
        if (itemId === "orders") {
            navigate("/dashboard/orders");
        }

        // Navigate to settings page
        if (itemId === "settings") {
            navigate("/dashboard/settings");
        }

        // Navigate to returns page
        if (itemId === "returns") {
            navigate("/dashboard/returns");
        }
    };

    const handleCartBadgeClick = (e) => {
        e.stopPropagation();
        navigate("/dashboard/orders");
        if (window.innerWidth < 992) {
            setSidebar(false);
        }
    };


    return (
        <>
            <div className={`pd-sidebar ${sidebarOpen ? "" : "collapsed"}`} style={{
                background: "var(--bg-surface)",
                borderRight: "1px solid var(--border-light)",
                boxShadow: "var(--shadow-lg)"
            }}>
                <div
                    style={{
                        padding: "12px 16px",
                        borderBottom: "1px solid var(--border-light)",
                        width: "100%",
                        boxSizing: "border-box",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "12px",
                            minHeight: "45px",
                        }}
                    >
                        {/* Logo */}
                        <div
                            className="fw-bold"
                            style={{
                                fontFamily: "var(--font-heading)",
                                fontSize: "1.5rem",
                                color: "var(--primary)",
                                display: "flex",
                                alignItems: "center",
                                flex: 1,
                                minWidth: 0,
                                cursor: "pointer",
                            }}
                        >
                            <img
                                src="/Logo.png"
                                alt="FlashiBuy"
                                 style={{
                                    width: "180px",
                                    height: "auto",
                                    objectFit: "contain",
                                    objectPosition: "left center",
                                    display: "block",
                                }}
                            />
                        </div>

                        {/* Close Button */}
                        <button
                            type="button"
                            onClick={() => setSidebar(false)}
                            className="d-lg-none"
                            aria-label="Close sidebar"
                            style={{
                                width: "32px",
                                height: "32px",
                                minWidth: "32px",
                                padding: 0,
                                margin: 0,
                                background: "transparent",
                                border: "none",
                                borderRadius: "50%",
                                color: "var(--text-muted)",
                                fontSize: "24px",
                                fontWeight: 400,
                                lineHeight: 1,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                            }}
                        >
                            &times;
                        </button>
                    </div>
                </div>

                <div style={{ padding: "20px 0", flex: 1 }}>
                    <div className="pd-sidebar-section" style={{ color: "var(--text-light)", padding: "0 20px 10px" }}>MENU</div>
                    {SIDEBAR_MENUS.map(item => (
                        <button
                            key={item.id}
                            className={`pd-nav-item ${navSection === item.id ? "active" : ""}`}
                            onClick={() => handleNavItemClick(item.id)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                padding: "12px 20px",
                                width: "100%",
                                border: "none",
                                background: navSection === item.id ? "var(--bg-hover)" : "transparent",
                                color: navSection === item.id ? "var(--primary)" : "var(--text-main)",
                                fontWeight: navSection === item.id ? 700 : 500,
                                fontSize: "0.95rem",
                                transition: "all 0.2s ease",
                                cursor: "pointer",
                                borderLeft: navSection === item.id ? "4px solid var(--primary)" : "4px solid transparent"
                            }}
                        >
                            <span className="icon" style={{ fontSize: "1.2rem", opacity: navSection === item.id ? 1 : 0.7 }}>{item.icon}</span>
                            {item.label}
                            {item.id === "wishlist" && wishlist.length > 0 && <span className="nav-badge" style={{ background: "var(--primary)", color: "white", borderRadius: "20px", padding: "2px 8px", fontSize: "0.7rem", marginLeft: "auto" }}>{wishlist.length}</span>}
                            {item.id === "orders" && cart.length > 0 && (
                                <span className="nav-badge" style={{ background: "var(--secondary)", color: "white", borderRadius: "20px", padding: "2px 8px", fontSize: "0.7rem", marginLeft: "auto" }} onClick={handleCartBadgeClick}>
                                    {cart.length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Cart summary */}
                {cart.length > 0 && (
                    <div style={{ margin: "20px", background: "var(--bg-hover)", borderRadius: "var(--radius-md)", padding: "16px", border: "1px solid var(--border-light)" }}>
                        <div style={{ fontWeight: 600, fontSize: ".75rem", color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase" }}>🛒 Cart Summary</div>
                        <div style={{ fontWeight: 800, fontSize: "1.25rem", color: "var(--text-main)" }}>
                            {fmt(cart.reduce((a, c) => a + c.price * c.qty, 0))}
                        </div>
                        <div style={{ fontSize: ".8rem", color: "var(--text-light)", fontWeight: 500 }}>{cart.reduce((a, c) => a + c.qty, 0)} items</div>
                    </div>
                )}
            </div>

            {/* Mobile overlay */}
            <div
                className={`pd-overlay ${sidebarOpen ? "show" : ""}`}
                onClick={() => setSidebar(false)}
            />
        </>
    );
}