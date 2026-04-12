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
            <div className="pd-sidebar" style={{ transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)" }}>
                <div className="pd-sidebar-logo">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div className="text-white fw-black" style={{ fontFamily: "Nunito", fontSize: "1.7rem" }}>🛍️ ShopEase</div>
                        <button onClick={() => setSidebar(false)} style={{ background: "none", border: "none", color: "white", fontSize: "1.5rem", cursor: "pointer" }}>
                            {/* <IoCloseOutline /> */}
                        </button>
                    </div>
                    <div style={{ color: "rgba(255,255,255,.75)", fontSize: ".8rem", fontWeight: 700 }}>Premium Marketplace</div>
                </div>

                <div style={{ padding: "12px 0" }}>
                    <div className="pd-sidebar-section">Navigation</div>
                    {SIDEBAR_MENUS.map(item => (
                        <button key={item.id} className={`pd-nav-item ${navSection === item.id ? "active" : ""}`}
                            onClick={() => handleNavItemClick(item.id)}>
                            <span className="icon d-flex align-items-center">{item.icon}</span>
                            {item.label}
                            {item.id === "wishlist" && wishlist.length > 0 && <span className="nav-badge">{wishlist.length}</span>}
                            {item.id === "orders" && cart.length > 0 && (
                                <span className="nav-badge" onClick={handleCartBadgeClick}>
                                    {cart.length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                <div style={{ height: 1, background: "#e8eaf6", margin: "4px 16px" }} />

                {/* Cart summary */}
                {cart.length > 0 && (
                    <div style={{ margin: "12px", background: "linear-gradient(135deg,#fff0e6,#fff8e6)", borderRadius: 14, padding: "14px 16px", border: "1.5px solid #ffddc9" }}>
                        <div style={{ fontWeight: 800, fontSize: ".8rem", color: "#92400e", marginBottom: 6 }}>🛒 Cart Summary</div>
                        <div style={{ fontWeight: 900, fontSize: "1.1rem", color: "var(--p)" }}>
                            {fmt(cart.reduce((a, c) => a + c.price * c.qty, 0))}
                        </div>
                        <div style={{ fontSize: ".72rem", color: "#888", fontWeight: 700 }}>{cart.reduce((a, c) => a + c.qty, 0)} items</div>
                    </div>
                )}

                {/* Logout */}
                <div style={{ marginTop: "auto", padding: "12px" }}>
                    <button
                        className="pd-nav-item"
                        style={{ color: "#dc3545", width: "calc(100% - 0px)", margin: 0 }}
                        onClick={handleLogout}
                    >
                        <IoLogOutOutline fontSize={18} />
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