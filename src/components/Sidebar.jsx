import { useNavigate } from "react-router-dom";
import { SIDEBAR_MENUS } from "../helper/Constraints";

export default function Sidebar({ cart, sidebarOpen, navSection, wishlist, handleLogout, IoLogOutOutline, IoCloseOutline, fmt, setSidebar, setNavSection }) {

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
            <div className="pd-sidebar" style={{
                transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
                background: "var(--bg-surface)",
                borderRight: "1px solid var(--border-light)",
                boxShadow: "var(--shadow-lg)"
            }}>
                <div className="pd-sidebar-logo" style={{
                    background: "white",
                    padding: "24px 20px",
                    borderBottom: "1px solid var(--border-light)"
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div className="fw-bold" style={{
                            fontFamily: "var(--font-heading)",
                            fontSize: "1.5rem",
                            color: "var(--primary)",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px"
                        }}>
                            <span style={{ fontSize: "1.8rem" }}>🛍️</span> ShopEase
                        </div>
                        <button onClick={() => setSidebar(false)} className="d-lg-none" style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "1.5rem", cursor: "pointer" }}>
                            <IoCloseOutline />
                        </button>
                    </div>
                    <div style={{ color: "var(--text-muted)", fontSize: ".75rem", fontWeight: 600, marginTop: "4px", textTransform: "uppercase", letterSpacing: "1px" }}>
                        Marketplace Portal
                    </div>
                </div>

                <div style={{ padding: "20px 0" }}>
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
                            <span className="icon" style={{ fontSize: "1.2rem", opacity: navSection === item.id ? 1 : 0.7, marginTop: "-15px" }}>{item.icon}</span>
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

                {/* Logout */}
                <div style={{ marginTop: "auto", padding: "20px" }}>
                    <button
                        className="pd-nav-item logout-btn"
                        style={{
                            color: "var(--primary)",
                            width: "107%",
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            padding: "12px",
                            border: "1px solid #e2e4feff",
                            borderLeft: "4px solid #5463e6ff",
                            borderRight: "4px solid #5463e6ff",
                            background: "#f5f6ffff",
                            borderRadius: "var(--radius-md)",
                            fontWeight: 600,
                            cursor: "pointer",
                            marginLeft: "-5px"
                        }}
                        onClick={handleLogout}
                    >
                        <IoLogOutOutline fontSize={20} />
                        Logout
                    </button>
                </div>
            </div>

            {/* Mobile overlay */}
            {sidebarOpen && window.innerWidth < 992 && (
                <div className="pd-overlay show" onClick={() => setSidebar(false)} style={{ display: "block" }} />
            )}
        </>
    );
}