import Stack from "react-bootstrap/Stack";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthWrapper } from "../helper/AuthWrapper";
import { SELLER_NAV_ITEMS } from "../helper/Constraints";

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
            <div
                className={`pd-overlay ${isOpen ? 'show' : ''}`}
                onClick={() => setIsOpen(false)}
            />

            <div
                className={`pd-sidebar ${!isOpen ? "collapsed" : ""}`}
                style={{
                    background: "var(--bg-surface)",
                    borderRight: "1px solid var(--border-light)",
                    boxShadow: "var(--shadow-lg)",
                    overflowY: "auto",
                    // width: "16%",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                }}
            >
                {/* Logo Section */}
                <div style={{ padding: "24px 20px", borderBottom: "1px solid var(--border-light)" }}>
                    <div className="d-flex justify-content-between align-items-center">
                        <div
                            style={{
                                fontFamily: "var(--font-heading)",
                                fontSize: "1.6rem",
                                fontWeight: 800,
                                color: "var(--primary)",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "10px"
                            }}
                            onClick={() => handleNavigate("/")}
                        >
                            
                            <img src="../../src/assets/logo.png" width="100%" alt="" />
                        </div>
                        <button
                            className="d-lg-none btn btn-light btn-sm rounded-circle"
                            onClick={() => setIsOpen(false)}
                            style={{ width: "32px", height: "32px" }}
                        >
                            ×
                        </button>
                    </div>
                    {/* <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600, marginTop: "4px", textTransform: "uppercase", letterSpacing: "1px" }}>
                        Seller Central
                    </div> */}
                </div>

                {/* Navigation */}
                <div style={{ padding: "20px 0", flex: 1 }}>
                    <div style={{ color: "var(--text-light)", fontSize: "0.75rem", fontWeight: 600, padding: "0 20px 10px", textTransform: "uppercase" }}>MAIN MENU</div>
                    <Stack gap={1}>
                        {SELLER_NAV_ITEMS.map(({ icon, label, path }) => {
                            const isActive =
                                pathname === path ||
                                (path !== "/seller/dashboard" && pathname.startsWith(path));

                            return (
                                <div
                                    key={label}
                                    onClick={() => handleNavigate(path)}
                                    style={{
                                        cursor: "pointer",
                                        padding: "12px 20px",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "12px",
                                        background: isActive ? "var(--bg-hover)" : "transparent",
                                        color: isActive ? "var(--primary)" : "var(--text-main)",
                                        fontWeight: isActive ? 700 : 500,
                                        fontSize: "0.95rem",
                                        borderLeft: isActive ? "4px solid var(--primary)" : "4px solid transparent",
                                        transition: "all 0.2s"
                                    }}
                                >
                                    <span style={{ fontSize: "1.2rem", opacity: isActive ? 1 : 0.7 }}>{icon}</span>
                                    {label}
                                </div>
                            );
                        })}
                    </Stack>
                </div>
            </div>
        </>
    );
}