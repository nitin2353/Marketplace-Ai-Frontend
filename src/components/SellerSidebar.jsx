import Stack from "react-bootstrap/Stack";
import { useNavigate, useLocation } from "react-router-dom";

const NAV_ITEMS = [
    { icon: "📊", label: "Dashboard",   path: "/seller/dashboard" },
    { icon: "📦", label: "My Products", path: "/seller/product" },
    { icon: "➕", label: "Add Product", path: "/seller/product/create" },
    { icon: "🛒", label: "Orders",      path: "/seller/orders" },
    { icon: "💰", label: "Earnings",    path: "/seller/earnings" },
    { icon: "⭐", label: "Reviews",     path: "/seller/reviews" },
    { icon: "⚙️", label: "Settings",   path: "/seller/settings" },
];

/**
 * SellerSidebar
 *
 * Props:
 *  - stats: Array<{ icon, label, val }>   (optional — shown at bottom)
 *    Default: empty (no stats section rendered)
 *
 * Active nav item is auto-detected from react-router location.
 *
 * Usage:
 *   <SellerSidebar stats={[
 *     { icon: "📦", label: "Total Products", val: 12 },
 *     { icon: "💰", label: "Total Revenue",  val: "₹3.2L" },
 *     { icon: "⭐", label: "Avg Rating",     val: "4.6" },
 *   ]} />
 */
export default function SellerSidebar({ stats = [] }) {
    const navigate  = useNavigate();
    const { pathname } = useLocation();

    return (
        <div
            className="eco-hero d-none d-lg-flex flex-column justify-content-between p-4"
            style={{ minHeight: "100vh", height: "100vh", position: "sticky", top: 0, overflowY: "auto" }}
        >
            {/* ── TOP: Brand + Nav ── */}
            <div>
                {/* Logo */}
                <div
                    className="text-white fw-black mb-1"
                    style={{ fontFamily: "Nunito", fontSize: "1.9rem", fontWeight: 900, cursor: "pointer" }}
                    onClick={() => navigate("/")}
                >
                    🛍️ ShopEase
                </div>
                <div
                    className="text-white fw-semibold mb-5"
                    style={{ opacity: 0.85, fontSize: "0.88rem" }}
                >
                    Seller Dashboard
                </div>

                {/* Nav */}
                <Stack gap={1}>
                    {NAV_ITEMS.map(({ icon, label, path }) => {
                        // Mark active: exact match OR starts-with for nested routes
                        const isActive =
                            pathname === path ||
                            (path !== "/seller/dashboard" && pathname.startsWith(path));

                        return (
                            <div
                                key={label}
                                className={`eco-nav-item ${isActive ? "active" : ""}`}
                                onClick={() => navigate(path)}
                            >
                                <span style={{ fontSize: "1rem" }}>{icon}</span>
                                {label}
                            </div>
                        );
                    })}
                </Stack>
            </div>

            {/* ── BOTTOM: Stats + Trust line ── */}
            <div className="mt-4">
                {stats.length > 0 && (
                    <Stack gap={2} className="mb-3">
                        {stats.map(({ icon, label, val }) => (
                            <div key={label} className="eco-sidebar-stat d-flex align-items-center gap-2">
                                <span style={{ fontSize: "1.3rem" }}>{icon}</span>
                                <div className="text-white">
                                    <div className="fw-bold" style={{ fontSize: "0.92rem" }}>{val}</div>
                                    <div style={{ fontSize: "0.7rem", opacity: 0.75 }}>{label}</div>
                                </div>
                            </div>
                        ))}
                    </Stack>
                )}

                <div className="text-white" style={{ opacity: 0.65, fontSize: "0.75rem" }}>
                    ⭐ Trusted by 2 Crore+ happy customers
                </div>
            </div>
        </div>
    );
}