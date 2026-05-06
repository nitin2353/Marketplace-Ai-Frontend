import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Container, Row, Col, Stack } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Toolbar from "../../components/Toolbar";
import orderApi from "../../api/order.api";
import { useAuthWrapper } from "../../helper/AuthWrapper";
import JWTService from "../../config/jwt.config";
import { FMT, FMT_DATE, TABS, STATUS_META } from "../../helper/GlobalHelper";
import OrderCard from "./OrderCard";
import ConfirmModal from "../../components/ConfirmModal";
import "./orderpage.css";



function SkeletonCard() {
    return (
        <div className="app-card p-4 mb-3 border-light shadow-sm opacity-50">
            <div className="d-flex justify-content-between mb-3">
                <div className="bg-light rounded" style={{ width: 140, height: 16 }} />
                <div className="bg-light rounded-pill" style={{ width: 80, height: 24 }} />
            </div>
            <div className="d-flex gap-2 mb-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-light rounded-3" style={{ width: 50, height: 50 }} />
                ))}
            </div>
            <div className="bg-light rounded mb-2" style={{ height: 14, width: "60%" }} />
            <div className="bg-light rounded" style={{ height: 14, width: "40%" }} />
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
        const userId = user?.id || user?.user_id || JWTService.decodeTokenDetails()?.id;
        if (!userId) return;

        setLoading(true);
        setError(null);
        try {
            const response = await orderApi.getCustomerOrders(userId);
            const rawOrders = response?.data || response || [];

            if (Array.isArray(rawOrders)) {
                const normalizedOrders = rawOrders.map(order => ({
                    ...order,
                    order_status: order.order_status || order.status || 'placed',
                    payment_status: order.payment_status || 'pending',
                    payment_method: order.payment_method || 'cod',
                    total_amount: parseFloat(order.total_amount || 0),
                    items: Array.isArray(order.items) ? order.items : [],
                    address_snapshot: order.address_snapshot || null,
                    created_time: order.created_time || order.created_at || new Date().toISOString(),
                }));
                setOrders(normalizedOrders);
            } else {
                setOrders([]);
            }
        } catch (err) {
            console.error("Fetch orders error:", err);
            setError("Connectivity error. Please retry synchronization.");
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

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
                toast.success("Transaction cancelled successfully.");
            } else {
                throw new Error(response?.message || "Failed to terminate order.");
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || err?.message || "Termination failed.");
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
                    o.items?.some((i) => i.product_title?.toLowerCase().includes(q)) ||
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

    return (
        <div className="app-page min-vh-100 bg-light">
            <Toolbar
                cart={[]} wishlist={[]}
                setSidebar={setSidebar}
                addToast={toast.success}
                isSideBar={false} isSearch={false}
            />

            {/* ── Professional Hero ── */}
            <div className="bg-primary py-5 position-relative overflow-hidden shadow-sm">
                <div className="position-absolute top-0 start-0 w-100 h-100 opacity-10" style={{ background: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                <Container className="position-relative">
                    <Row className="align-items-center g-4">
                        <Col lg={6}>
                            <div className="d-flex align-items-center gap-3 mb-3">
                                <button
                                    onClick={() => navigate(-1)}
                                    className="app-btn border-0 bg-white bg-opacity-20 text-white rounded-circle d-flex align-items-center justify-content-center hover-scale"
                                    style={{ width: '40px', height: '40px' }}
                                >
                                    <i className="fas fa-arrow-left small"></i>
                                </button>
                                <h2 className="fw-black text-white mb-0 fs-1">Command History</h2>
                            </div>
                            <p className="text-white opacity-75 fw-bold uppercase letter-spacing-2 tiny">Securely track and manage your neural marketplace transactions</p>
                        </Col>
                        <Col lg={6}>
                            {!loading && orders.length > 0 && (
                                <div className="d-flex gap-3 overflow-auto pb-2 scroll-hide">
                                    {[
                                        { val: stats.total, label: "Total Logs", icon: "clipboard-list" },
                                        { val: stats.delivered, label: "Deployed", icon: "check-double" },
                                        { val: stats.active, label: "In Flux", icon: "sync" },
                                        { val: FMT(stats.spent), label: "Net Asset Flow", icon: "layer-group" },
                                    ].map(({ val, label, icon }) => (
                                        <div key={label} className="bg-white bg-opacity-10 border border-white border-opacity-10 rounded-4 p-3 min-w-150 shadow-sm backdrop-blur">
                                            <div className="d-flex align-items-center gap-2 mb-1">
                                                <i className={`fas fa-${icon} text-white opacity-50 tiny`}></i>
                                                <span className="text-white fw-black fs-5">{val}</span>
                                            </div>
                                            <span className="tiny fw-bold text-white opacity-75 uppercase letter-spacing-1">{label}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Col>
                    </Row>
                </Container>
            </div>

            <Container className="py-5">
                {/* ── Error ── */}
                {error && (
                    <div className="app-card p-4 border-danger bg-danger bg-opacity-5 mb-5 animate__animated animate__shakeX">
                        <div className="d-flex align-items-center gap-3">
                            <div className="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '40px', height: '40px' }}>
                                <i className="fas fa-exclamation-triangle"></i>
                            </div>
                            <div className="flex-grow-1">
                                <h6 className="fw-bold text-danger mb-0 uppercase letter-spacing-1">Protocol Failure</h6>
                                <p className="tiny fw-bold text-muted mb-0">{error}</p>
                            </div>
                            <button onClick={fetchOrders} className="app-btn app-btn-outline border-danger text-danger py-1 px-3 tiny fw-bold uppercase">
                                RE-SYNC
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Content ── */}
                {loading ? (
                    <Row className="g-4">
                        {[1, 2, 3].map((i) => <Col key={i} xs={12}><SkeletonCard /></Col>)}
                    </Row>
                ) : orders.length === 0 ? (
                    <div className="text-center py-5 animate__animated animate__fadeIn">
                        <div className="display-1 text-primary opacity-10 mb-4"><i className="fas fa-box-open"></i></div>
                        <h3 className="fw-black text-dark mb-2">Registry Empty</h3>
                        <p className="app-muted mb-5 fw-bold">No transactions detected in your command history.</p>
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="app-btn app-btn-primary px-5 py-3 shadow-lg fs-6 fw-bold transition-all hover-scale"
                        >
                            <i className="fas fa-shopping-cart me-2"></i>INITIALIZE SHOPPING
                        </button>
                    </div>
                ) : (
                    <>
                        {/* ── Filters & Search ── */}
                        <div className="app-card p-2 bg-white shadow-sm border-light mb-5">
                            <Row className="g-2 align-items-center">
                                <Col lg={4}>
                                    <div className="position-relative">
                                        <i className="fas fa-search position-absolute start-0 top-50 translate-middle-y ms-3 text-muted small"></i>
                                        <input
                                            className="app-input border-0 shadow-none ps-5"
                                            placeholder="Query order # or node name…"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                        />
                                    </div>
                                </Col>
                                <Col lg={8}>
                                    <div className="d-flex gap-1 overflow-auto scroll-hide p-1">
                                        {TABS.map(({ key, label }) => {
                                            const count = tabCount(key);
                                            return (
                                                <button
                                                    key={key}
                                                    className={`app-btn py-2 px-3 small fw-bold uppercase letter-spacing-1 transition-all flex-shrink-0 ${activeTab === key ? 'app-btn-primary shadow-sm' : 'bg-transparent text-muted hover-bg-light border-0 shadow-none'}`}
                                                    onClick={() => setActiveTab(key)}
                                                >
                                                    {label} {count > 0 && <span className="opacity-50 ms-1 tiny">[{count}]</span>}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </Col>
                            </Row>
                        </div>

                        {/* ── Results Info ── */}
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <p className="tiny fw-bold text-muted mb-0 uppercase letter-spacing-2">
                                GRID: <span className="text-dark">{paginatedOrders.length}</span> / {filtered.length} LOGS
                                {search && <span> · FILTER: <span className="text-primary">"{search}"</span></span>}
                            </p>
                            {totalPages > 1 && <span className="tiny fw-bold text-muted uppercase">PAGE {currentPage} OF {totalPages}</span>}
                        </div>

                        {/* ── No filtered results ── */}
                        {filtered.length === 0 ? (
                            <div className="app-card p-5 text-center bg-white border-light shadow-sm animate__animated animate__fadeIn">
                                <div className="fs-1 text-muted opacity-25 mb-3"><i className="fas fa-search-minus"></i></div>
                                <h6 className="fw-bold text-dark mb-1 uppercase letter-spacing-1">No matches found in grid</h6>
                                <p className="tiny fw-bold text-muted mb-4 opacity-75">Adjust your neural filters or query parameters.</p>
                                <button
                                    onClick={() => { setActiveTab("all"); setSearch(""); }}
                                    className="app-btn app-btn-outline py-2 px-4 tiny fw-bold uppercase letter-spacing-1"
                                >
                                    WIPE FILTERS
                                </button>
                            </div>
                        ) : (
                            <>
                                <Stack gap={4}>
                                    {paginatedOrders.map((order, i) => (
                                        <div key={order.id} className="animate__animated animate__fadeInUp" style={{ animationDelay: `${i * 0.05}s` }}>
                                            <OrderCard
                                                order={order}
                                                setSelectedOrder={setSelectedOrder}
                                                onCancel={handleCancel}
                                                cancelling={cancelling}
                                                setShowCancel={setShowCancel}
                                            />
                                        </div>
                                    ))}
                                </Stack>

                                {/* ── Pagination ── */}
                                {totalPages > 1 && (
                                    <div className="d-flex justify-content-center align-items-center gap-2 mt-5">
                                        <button
                                            className="app-btn app-btn-outline py-2 px-3 border-0 shadow-none hover-bg-light"
                                            disabled={currentPage === 1}
                                            onClick={() => handlePageChange(currentPage - 1)}
                                        >
                                            <i className="fas fa-chevron-left"></i>
                                        </button>

                                        <div className="d-flex gap-1">
                                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                                .filter(page => {
                                                    const distance = Math.abs(page - currentPage);
                                                    return distance === 0 || distance === 1 || page === 1 || page === totalPages;
                                                })
                                                .map((page, index, arr) => (
                                                    <React.Fragment key={page}>
                                                        {index > 0 && arr[index - 1] !== page - 1 && (
                                                            <span className="px-2 py-2 text-muted fw-bold">...</span>
                                                        )}
                                                        <button
                                                            className={`app-btn shadow-none px-3 py-2 small fw-black ${page === currentPage ? 'app-btn-primary shadow-sm' : 'bg-transparent text-muted hover-bg-light border-0'}`}
                                                            onClick={() => handlePageChange(page)}
                                                        >
                                                            {page}
                                                        </button>
                                                    </React.Fragment>
                                                ))}
                                        </div>

                                        <button
                                            className="app-btn app-btn-outline py-2 px-3 border-0 shadow-none hover-bg-light"
                                            disabled={currentPage === totalPages}
                                            onClick={() => handlePageChange(currentPage + 1)}
                                        >
                                            <i className="fas fa-chevron-right"></i>
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
                title="Terminate Order Process?"
                message={`Are you sure you want to cancel log #${selectedOrder?.order_number}? This action might be permanent depending on the node status.`}
                loading={cancelling}
            />
        </div>
    );
}