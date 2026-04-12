import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Container, Row, Col, Stack } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Toolbar from "../../components/Toolbar";
import orderApi from "../../api/order.api";
import { useAuthWrapper } from "../../helper/AuthWrapper";
import JWTService from "../../config/jwt.config";
import "./orderpage.css";
import { FMT, FMT_DATE, TABS, STATUS_META } from "../../helper/GlobalHelper";
import OrderCard from "./OrderCard";
import ConfirmModal from "../../components/ConfirmModal";



function SkeletonCard() {
    return (
        <div className="ord-card" style={{ cursor: "default", transform: "none" }}>
            <div className="ord-card-header">
                <div className="ord-skel" style={{ width: 140, height: 14 }} />
                <div className="ord-skel" style={{ width: 80, height: 22, borderRadius: 20 }} />
            </div>
            <div className="ord-card-body">
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="ord-skel" style={{ width: 52, height: 52, borderRadius: 10 }} />
                    ))}
                </div>
                <div className="ord-skel" style={{ height: 13, width: "60%", marginBottom: 6 }} />
                <div className="ord-skel" style={{ height: 13, width: "40%" }} />
            </div>
            <div className="ord-card-footer">
                <div className="ord-skel" style={{ width: 80, height: 20 }} />
                <div className="ord-skel" style={{ width: 100, height: 34, borderRadius: 10 }} />
            </div>
        </div>
    );
}




export default function OrdersPage() {
    const navigate = useNavigate();
    const { user } = useAuthWrapper();

    const [showCancel, setShowCancel] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("all");
    const [search, setSearch] = useState("");
    const [cancelling, setCancelling] = useState(null); // order id being cancelled
    const [sidebar, setSidebar] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10); // Number of orders per page

    // ── Fetch orders ──────────────────────────────────────────────────────
    const fetchOrders = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const userData = JWTService.decodeTokenDetails();
            const userId = userData?.id || userData?.user_id || user?.id;
            if (!userId) throw new Error("User not authenticated.");

            const response = await orderApi.getCustomerOrders(userId);
            if (response?.success && Array.isArray(response.data)) {
                // Normalize the order data to match expected structure
                const normalizedOrders = response.data.map(order => ({
                    ...order,
                    // Ensure consistent field names and types
                    order_status: order.order_status,
                    payment_status: order.payment_status,
                    payment_method: order.payment_method,
                    total_amount: parseFloat(order.total_amount || 0),
                    subtotal: parseFloat(order.subtotal || 0),
                    delivery_charge: parseFloat(order.delivery_charge || 0),
                    discount_amount: parseFloat(order.discount_amount || 0),
                    tax_amount: parseFloat(order.tax_amount || 0),
                    total_items: parseInt(order.total_items || 0),
                    total_quantity: parseInt(order.total_quantity || 0),
                    created_time: order.created_time,
                    modified_time: order.modified_time,
                    // Add fallback for items (will be fetched separately if needed)
                    items: order.items || [],
                    // Add fallback for address snapshot (will be fetched separately if needed)
                    address_snapshot: order.address_snapshot || null,
                }));
                setOrders(normalizedOrders);
            } else {
                setOrders([]);
            }
        } catch (err) {
            console.error("Fetch orders error:", err);
            setError("Failed to load orders. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    // ── Cancel order ──────────────────────────────────────────────────────
    const handleCancel = useCallback(async (order) => {
        setCancelling(order.id);
        setShowCancel(false);
        try {
            const response = await orderApi.cancelOrder(order.id, { reason: "Cancelled by user" });
            if (response?.success) {
                setOrders((prev) =>
                    prev.map((o) =>
                        o.id === order.id ? { ...o, order_status: "cancelled" } : o
                    )
                );
                toast.success("Order cancelled successfully.");
            } else {
                throw new Error(response?.message || "Failed to cancel order.");
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || err?.message || "Failed to cancel order.");
        } finally {
            setCancelling(null);
        }
    }, []);

    // ── Handle page change ────────────────────────────────────────────────
    const handlePageChange = useCallback((page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    // ── Reset page when filters change ────────────────────────────────────
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, search]);

    // ── Filtered + searched orders ────────────────────────────────────────
    const filtered = useMemo(() => {
        return orders
            .filter((o) => activeTab === "all" || o.order_status === activeTab)
            .filter((o) => {
                if (!search.trim()) return true;
                const q = search.toLowerCase();
                return (
                    o.order_number?.toLowerCase().includes(q) ||
                    o.order_status?.toLowerCase().includes(q) ||
                    o.payment_method?.toLowerCase().includes(q) ||
                    // Search in items if available
                    o.items?.some((i) => i.product_title?.toLowerCase().includes(q)) ||
                    // Search in order details if loaded
                    (o.orderDetails?.items?.some((i) => i.product_title?.toLowerCase().includes(q)))
                );
            });
    }, [orders, activeTab, search]);

    // ── Paginated orders ──────────────────────────────────────────────────
    const paginatedOrders = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filtered.slice(startIndex, endIndex);
    }, [filtered, currentPage, itemsPerPage]);

    // ── Pagination info ───────────────────────────────────────────────────
    const totalPages = Math.ceil(filtered.length / itemsPerPage);

    // ── Stats ─────────────────────────────────────────────────────────────
    const stats = useMemo(() => ({
        total: orders.length,
        delivered: orders.filter((o) => o.order_status === "delivered").length,
        active: orders.filter((o) => ["placed", "confirmed", "processing", "shipped"].includes(o.order_status)).length,
        spent: orders.filter((o) => o.order_status !== "cancelled").reduce((s, o) => s + Number(o.total_amount || 0), 0),
    }), [orders]);

    // ── Tab counts ────────────────────────────────────────────────────────
    const tabCount = useCallback((key) => {
        if (key === "all") return orders.length;
        return orders.filter((o) => o.order_status === key).length;
    }, [orders]);

    // ─────────────────────────────────────────────────────────────────────
    //  Render
    // ─────────────────────────────────────────────────────────────────────
    return (
        <div className="ord-page">
            <Toolbar
                cart={[]} wishlist={[]}
                setSidebar={setSidebar}
                addToast={toast.success}
                isSideBar={false} isSearch={false}
            />

            {/* ── Hero ── */}
            <div className="ord-hero">
                <Container>
                    <div className="d-flex align-items-center gap-3 mb-1">
                        <button
                            onClick={() => navigate(-1)}
                            style={{ background: "rgba(255,255,255,.2)", border: "none", color: "#fff", borderRadius: "50%", width: 34, height: 34, cursor: "pointer", fontSize: "1.1rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                        >
                            ←
                        </button>
                        <div>
                            <h4 className="ord-hero-title mb-0">My Orders</h4>
                            <p className="ord-hero-sub mb-0">Track and manage your purchases</p>
                        </div>
                    </div>

                    {/* Stats */}
                    {!loading && orders.length > 0 && (
                        <div className="ord-stat-row ord-fu">
                            {[
                                { val: stats.total, label: "Total Orders" },
                                { val: stats.delivered, label: "Delivered" },
                                { val: stats.active, label: "Active" },
                                { val: FMT(stats.spent), label: "Total Spent" },
                            ].map(({ val, label }) => (
                                <div key={label} className="ord-stat">
                                    <span className="ord-stat-val">{val}</span>
                                    <span className="ord-stat-label">{label}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </Container>
            </div>

            <Container className="py-4">

                {/* ── Error ── */}
                {error && (
                    <div className="ord-fu" style={{ background: "#fef2f2", border: "2px solid #fca5a5", borderRadius: 14, padding: "16px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontSize: 20 }}>⚠️</span>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 800, color: "#dc2626", fontSize: "0.88rem" }}>{error}</div>
                            <button onClick={fetchOrders} style={{ marginTop: 4, border: "none", background: "none", color: "#ff6b35", fontWeight: 800, cursor: "pointer", fontFamily: "Nunito", fontSize: "0.8rem", padding: 0 }}>
                                🔄 Retry
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Loading ── */}
                {loading ? (
                    <>
                        {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
                    </>

                ) : orders.length === 0 ? (

                    /* ── Empty state ── */
                    <div className="ord-empty ord-fu">
                        <div style={{ fontSize: "3.5rem", marginBottom: 14 }}>📦</div>
                        <h5 className="fw-bold mb-2" style={{ color: "#1a1a2e" }}>No orders yet</h5>
                        <p className="text-muted mb-4" style={{ fontSize: "0.88rem" }}>
                            Start shopping and your orders will appear here.
                        </p>
                        <button
                            onClick={() => navigate("/dashboard")}
                            style={{ border: "none", borderRadius: 12, background: "linear-gradient(135deg,#ff6b35,#f7931e)", color: "#fff", fontWeight: 800, padding: "12px 32px", fontFamily: "Nunito", cursor: "pointer", fontSize: "0.9rem" }}
                        >
                            🛍️ Start Shopping
                        </button>
                    </div>

                ) : (
                    <>
                        {/* ── Search ── */}
                        <div className="ord-search-wrap ord-fu">
                            <span className="ord-search-icon">🔍</span>
                            <input
                                className="ord-search"
                                placeholder="Search by order number or product name…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        {/* ── Tabs ── */}
                        <div className="ord-tabs ord-fu">
                            {TABS.map(({ key, label }) => {
                                const count = tabCount(key);
                                return (
                                    <button
                                        key={key}
                                        className={`ord-tab ${activeTab === key ? "active" : ""}`}
                                        onClick={() => setActiveTab(key)}
                                    >
                                        {label}
                                        {count > 0 && (
                                            <span style={{ marginLeft: 5, opacity: 0.8, fontSize: "0.7rem" }}>
                                                ({count})
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* ── Results count ── */}
                        <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "#9ca3af", marginBottom: 16 }}>
                            Showing <strong style={{ color: "#374151" }}>{paginatedOrders.length}</strong> of {filtered.length} orders
                            {search && <> for <strong style={{ color: "#ff6b35" }}>"{search}"</strong></>}
                            {totalPages > 1 && <> (Page {currentPage} of {totalPages})</>}
                        </p>

                        {/* ── No filter results ── */}
                        {filtered.length === 0 ? (
                            <div className="ord-empty ord-fu">
                                <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🔍</div>
                                <p className="fw-bold mb-1" style={{ color: "#1a1a2e" }}>No orders found</p>
                                <p className="text-muted mb-3" style={{ fontSize: "0.84rem" }}>
                                    Try a different filter or search term.
                                </p>
                                <button
                                    onClick={() => { setActiveTab("all"); setSearch(""); }}
                                    style={{ border: "none", background: "none", color: "#ff6b35", fontWeight: 800, cursor: "pointer", fontFamily: "Nunito", fontSize: "0.84rem" }}
                                >
                                    Clear filters →
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* ── Order cards ── */}
                                {paginatedOrders.map((order, i) => (
                                    <div key={order.id} style={{ animationDelay: `${i * 0.04}s` }}>
                                        <OrderCard
                                            order={order}
                                            setSelectedOrder={setSelectedOrder}
                                            onCancel={handleCancel}
                                            cancelling={cancelling}
                                            setShowCancel={setShowCancel}
                                        />
                                    </div>
                                ))}

                                {/* ── Pagination ── */}
                                {totalPages > 1 && (
                                    <div className="ord-pagination ord-fu">
                                        <button
                                            className="ord-page-btn"
                                            disabled={currentPage === 1}
                                            onClick={() => handlePageChange(currentPage - 1)}
                                        >
                                            ‹ Previous
                                        </button>

                                        <div className="ord-page-numbers">
                                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                                .filter(page => {
                                                    const distance = Math.abs(page - currentPage);
                                                    return distance === 0 || distance === 1 || page === 1 || page === totalPages;
                                                })
                                                .map((page, index, arr) => (
                                                    <React.Fragment key={page}>
                                                        {index > 0 && arr[index - 1] !== page - 1 && (
                                                            <span className="ord-page-dots">...</span>
                                                        )}
                                                        <button
                                                            className={`ord-page-btn ${page === currentPage ? 'active' : ''}`}
                                                            onClick={() => handlePageChange(page)}
                                                        >
                                                            {page}
                                                        </button>
                                                    </React.Fragment>
                                                ))}
                                        </div>

                                        <button
                                            className="ord-page-btn"
                                            disabled={currentPage === totalPages}
                                            onClick={() => handlePageChange(currentPage + 1)}
                                        >
                                            Next ›
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </Container>
            <ConfirmModal
                show={showCancel}
                onConfirm={() => handleCancel(selectedOrder)}
                onCancel={() => setShowCancel(false)}
                title="Cancel Order?"
                message={`Are you sure you want to cancel order #${selectedOrder?.order_number}?`}
                loading={cancelling}
            />
        </div>
    );
}