import Stack from "react-bootstrap/Stack";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthWrapper } from "../helper/AuthWrapper";

const NAV_ITEMS = [
    { icon: "📊", label: "Dashboard", path: "/seller/dashboard" },
    { icon: "📦", label: "My Products", path: "/seller/products" },
    { icon: "➕", label: "Add Product", path: "/seller/product/create" },
    { icon: "🛒", label: "Orders", path: "/seller/orders" },
    { icon: "⭐", label: "Reviews", path: "/seller/reviews" },
    { icon: "⚙️", label: "Settings", path: "/seller/settings" },
];

export default function SellerSidebar({ stats = [] }) {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { isOpen, setIsOpen } = useAuthWrapper();

    const handleNavigate = (path) => {
        navigate(path);

        // mobile par click ke baad sidebar band ho jaye
        if (window.innerWidth < 992) {
            setIsOpen(false);
        }
    };

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="d-lg-none"
                    onClick={() => setIsOpen(false)}
                    style={{
                        position: "fixed",
                        inset: 0,
                        backgroundColor: "rgba(0,0,0,0.45)",
                        zIndex: 1040,
                    }}
                />
            )}

            <div
                className={`eco-hero seller-sidebar ${isOpen ? "d-flex" : "d-none"
                    } d-lg-flex flex-column justify-content-between p-4`}
                style={{
                    minHeight: "100vh",
                    height: "100vh",
                    width: "280px",
                    position: "fixed",
                    top: 0,
                    left: 0,
                    zIndex: 1050,
                    overflowY: "auto",
                }}
            >
                {/* Close button - mobile only */}
                <div className="d-flex justify-content-end d-lg-none mb-3">
                    <button
                        type="button"
                        className="btn btn-light btn-sm rounded-circle fw-bold"
                        onClick={() => setIsOpen(false)}
                        style={{ width: "32px", height: "32px", padding: 0 }}
                    >
                        ×
                    </button>
                </div>

                {/* Top */}
                <div>
                    <div
                        className="text-white fw-black mb-1"
                        style={{
                            fontFamily: "Nunito",
                            fontSize: "1.9rem",
                            fontWeight: 900,
                            cursor: "pointer",
                        }}
                        onClick={() => handleNavigate("/")}
                    >
                        🛍️ ShopEase
                    </div>

                    <div
                        className="text-white fw-semibold mb-5"
                        style={{ opacity: 0.85, fontSize: "0.88rem" }}
                    >
                        Seller Dashboard
                    </div>

                    <Stack gap={1}>
                        {NAV_ITEMS.map(({ icon, label, path }) => {
                            const isActive =
                                pathname === path ||
                                (path !== "/seller/dashboard" && pathname.startsWith(path));

                            return (
                                <div
                                    key={label}
                                    className={`eco-nav-item ${isActive ? "active" : ""}`}
                                    onClick={() => handleNavigate(path)}
                                    style={{ cursor: "pointer" }}
                                >
                                    <span style={{ fontSize: "1rem" }}>{icon}</span>
                                    {label}
                                </div>
                            );
                        })}
                    </Stack>
                </div>

                {/* Bottom */}
                <div className="mt-4">
                    {stats.length > 0 && (
                        <Stack gap={2} className="mb-3">
                            {stats.map(({ icon, label, val }) => (
                                <div
                                    key={label}
                                    className="eco-sidebar-stat d-flex align-items-center gap-2"
                                >
                                    <span style={{ fontSize: "1.3rem" }}>{icon}</span>
                                    <div className="text-white">
                                        <div className="fw-bold" style={{ fontSize: "0.92rem" }}>
                                            {val}
                                        </div>
                                        <div style={{ fontSize: "0.7rem", opacity: 0.75 }}>
                                            {label}
                                        </div>
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
        </>
    );
}