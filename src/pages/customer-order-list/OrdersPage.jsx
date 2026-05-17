import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Container, Row, Col, Stack, Badge, Modal, Form, Button as RBButton } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Toolbar from "../../components/Toolbar";
import orderApi from "../../api/order.api";
import { useAuthWrapper } from "../../helper/AuthWrapper";
import JWTService from "../../config/jwt.config";
import { FMT, FMT_DATE, TABS, STATUS_META, PAYMENT_METHOD_LABELS, TIMELINE_STEPS } from "../../helper/GlobalHelper";
import ConfirmModal from "../../components/ConfirmModal";
import ReviewModal from "../../components/ReviewModal";
import "./orderpage.css";
import OrderTimeline from "./OrderTimeline";
import ReturnRequestModal from "../../components/ReturnRequestModal";

// ── Local Components to keep changes within this file ────────────────────────


const LocalOrderCard = ({ order, onCancel, cancelling, onReturn, onReplace }) => {
    const navigate = useNavigate();
    const { user } = useAuthWrapper();
    const [expanded, setExpanded] = useState(false);
    const [showReview, setShowReview] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [currentReviewItem, setCurrentReviewItem] = useState(null);
    const [orderDetails, setOrderDetails] = useState(null);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    const status = order?.order_status || order?.status || 'placed';
    const payment = order?.payment_method || order?.payment || 'cod';
    const meta = STATUS_META[status] || STATUS_META.placed;
    const payMeta = PAYMENT_METHOD_LABELS[payment] || PAYMENT_METHOD_LABELS.cod;

    const fetchOrderDetails = useCallback(async () => {
        if (loadingDetails || orderDetails) return;
        setLoadingDetails(true);
        try {
            const [itemsResponse, addressResponse] = await Promise.all([
                orderApi.getOrderItems(order.id).catch(() => ({ data: [] })),
                orderApi.getOrderAddressSnapshot(order.id).catch(() => ({ data: null }))
            ]);
            setOrderDetails({
                items: Array.isArray(itemsResponse?.data) ? itemsResponse.data : (Array.isArray(itemsResponse) ? itemsResponse : []),
                address_snapshot: addressResponse?.data || addressResponse || null
            });


        } catch (error) {
            console.error("Error fetching order details:", error);
        } finally {
            setLoadingDetails(false);
        }
    }, [order.id, loadingDetails, orderDetails]);

    const handleToggle = () => {
        const next = !expanded;
        setExpanded(next);
        if (next) fetchOrderDetails();
    };

    const items = orderDetails?.items || order?.items || [];
    const address = orderDetails?.address_snapshot || order?.address_snapshot;
    const canCancel = ["placed", "confirmed"].includes(status);
    const isDelivered = ["delivered", "completed"].includes(status);

    return (
        <div className={`order-card-premium ${expanded ? 'expanded' : ''} mt-3 p-3`} onClick={handleToggle}>
            {/* Header */}
            <div className="card-header-premium">
                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 w-100">
                    <div className="order-meta">
                        <span className="order-number">#{order.order_number}</span>
                        <span className="order-date">{FMT_DATE(order.created_time)}</span>
                    </div>
                    <div className="status-badges d-flex flex-row flex-sm-column flex-wrap gap-2">
                        <Badge className={`status-badge ${status}`}>{meta.icon} {meta.label}</Badge>
                        <Badge className={`payment-badge ${payment}`}>{payMeta.icon} {payMeta.label}</Badge>
                    </div>
                </div>
            </div>
            {/* Preview Body */}
            <div className="card-body-premium flex-column flex-md-row">
                <div className="product-previews mb-3 mb-md-0">
                    {items.slice(0, 3).map((item, idx) => {
                        let src = item?.product_image_url;
                        try {
                            if (src && (src.startsWith('[') || src.startsWith('{'))) {
                                const parsed = JSON.parse(src);
                                src = Array.isArray(parsed) ? parsed[0] : parsed;
                            } else if (src && src.includes(',')) {
                                src = src.split(',')[0].replace(/[{}"\\]/g, "");
                            }
                        } catch (e) {
                            console.error("Image parse error", e);
                        }

                        return (
                            <div key={idx} className="preview-img-wrapper shadow-sm">
                                <img
                                    src={src || `https://placehold.co/100?text=Product`}
                                    alt="item"
                                    onError={(e) => e.target.src = "https://placehold.co/100?text=Error"}
                                />
                            </div>
                        );
                    })}
                    {items.length > 3 && <div className="more-count">+{items.length - 3}</div>}
                </div>
                <div className="order-summary-text text-center text-md-start">
                    <h6 className="mb-1 fw-bold text-dark">
                        {items[0]?.product_title || "Multiple Items"}
                        {items.length > 1 && ` + ${items.length - 1} more`}
                    </h6>
                    <p className="mb-0 text-muted small">
                        Total Amount: <span className="text-primary fw-bold">{FMT(order.total_amount)}</span>
                    </p>
                </div>
                <div className="expand-indicator ms-md-auto">
                    <i className={`fas fa-chevron-${expanded ? 'up' : 'down'}`}></i>
                </div>
            </div>

            {/* Expanded Content */}
            {expanded && (
                <div className="card-expanded-content" onClick={(e) => e.stopPropagation()}>
                    <hr className="my-3 opacity-10" />
                    <Row className="g-4">
                        <Col lg={9}>
                            <h6 className="section-title">Order Items</h6>
                            <Stack gap={3}>
                                {loadingDetails ? (
                                    <div className="text-center py-4"><div className="spinner-border spinner-border-sm text-primary"></div></div>
                                ) : items.map((item, i) => {
                                    let src = item.product_image_url;
                                    try {
                                        if (src && (src.startsWith('[') || src.startsWith('{'))) {
                                            const parsed = JSON.parse(src);
                                            src = Array.isArray(parsed) ? parsed[0] : parsed;
                                        } else if (src && src.includes(',')) {
                                            src = src.split(',')[0].replace(/[{}"\\]/g, "");
                                        }
                                    } catch { /* Ignore parsing errors for malformed image strings */ }

                                    return (
                                        <div key={i} className="item-row d-flex flex-column flex-md-row gap-3 align-items-md-center p-3 p-md-2 rounded-3 hover-bg-light border border-light border-md-0 mb-2 mb-md-0">
                                            <img src={src || `https://placehold.co/100?text=Product`} className="item-img" alt="item" />
                                            <div className="flex-grow-1 min-w-0">
                                                <div className="fw-bold text-dark text-truncate small">{item.product_title}</div>
                                                <div className="text-muted tiny" onClick={() => navigate(`/product/${item.product_id}`)}>
                                                    Qty: {item.quantity} • {FMT(item.unit_price)} each
                                                </div>
                                            </div>
                                            <div className="item-actions d-flex flex-wrap gap-2 mt-2 mt-md-0 justify-content-md-end">
                                                {isDelivered && (
                                                    <>
                                                        <RBButton
                                                            size="sm"
                                                            variant="light"
                                                            className="action-btn-small"
                                                            onClick={() => { setCurrentReviewItem(item); setShowReview(true); }}
                                                            disabled={item.is_reviewed}
                                                        >
                                                            {item.is_reviewed ? "★ Reviewed" : "★ Review"}
                                                        </RBButton>
                                                        {/* Return Button if allowed */}
                                                        {(() => {
                                                            const deliveredDate = new Date(order.modified_time || order.created_time);
                                                            const now = new Date();
                                                            const diffDays = Math.ceil(Math.abs(now - deliveredDate) / (1000 * 60 * 60 * 24));
                                                            const isWithinWindow = diffDays <= (item.return_replace_duration || 0);

                                                            return (
                                                                <>
                                                                    {(item.is_return || item.return_allowed) && isWithinWindow && (
                                                                        <RBButton
                                                                            size="sm"
                                                                            variant="outline-primary"
                                                                            className="action-btn-small"
                                                                            onClick={() => onReturn(order, item)}
                                                                        >
                                                                            <i className="fas fa-undo me-1"></i> Return
                                                                        </RBButton>
                                                                    )}
                                                                    {(item.is_replace || item.is_replacement || item.replacement_allowed) && isWithinWindow && (
                                                                        <RBButton
                                                                            size="sm"
                                                                            variant="outline-info"
                                                                            className="action-btn-small text-info"
                                                                            onClick={() => onReplace(order, item)}
                                                                        >
                                                                            <i className="fas fa-sync me-1"></i> Replace
                                                                        </RBButton>
                                                                    )}
                                                                </>
                                                            );
                                                        })()}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </Stack>
                        </Col>
                        <Col lg={3}>
                            <div className="bg-light p-3 h-100 mb-5">
                                <h6 className="section-title">Timeline & Delivery</h6>
                                <OrderTimeline currentStatus={order.order_status} />
                                {address && (
                                    <div className="delivery-address mt-4 pt-3 border-top border-white">
                                        <p className="tiny fw-black text-muted uppercase mb-2">Shipping To</p>
                                        <div className="small fw-bold text-dark mb-0">{address.name}</div>
                                        <div className="small text-muted">{address.address_line_1}, {address.city}</div>
                                        <div className="small text-muted">Phone: {address.mobile || address.phone}</div>
                                    </div>
                                )}
                            </div>
                        </Col>
                    </Row>
                </div>
            )}

            {/* Footer / Quick Actions */}
            <div className="card-footer-premium" onClick={(e) => e.stopPropagation()}>
                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-4 w-100">
                    <div className="total-display text-center text-sm-start">
                        <span className="label">Amount Paid</span>
                        <span className="value">{FMT(order.total_amount)}</span>
                    </div>
                    <div className="action-buttons d-flex flex-wrap gap-2 justify-content-center justify-content-sm-end">
                        {status === 'delivered' && (
                            <RBButton
                                variant="outline-primary"
                                className="premium-btn-sm flex-grow-1 flex-sm-grow-0"
                                onClick={() => navigate(`/order/invoice/${order.id}/${Date.now()}`)}
                            >
                                <i className="fas fa-file-invoice me-1"></i> Invoice
                            </RBButton>
                        )}
                        {canCancel && (
                            <RBButton
                                variant="outline-danger"
                                className="premium-btn-sm flex-grow-1 flex-sm-grow-0"
                                disabled={cancelling === order.id}
                                onClick={() => setShowCancelConfirm(true)}
                            >
                                {cancelling === order.id ? "Processing..." : "Cancel Order"}
                            </RBButton>
                        )}
                        <RBButton
                            variant="primary"
                            className="premium-btn-sm flex-grow-1 flex-sm-grow-0"
                            onClick={handleToggle}
                        >
                            {expanded ? "Hide" : "Details"}
                        </RBButton>
                    </div>
                </div>
            </div>

            <ConfirmModal
                show={showCancelConfirm}
                onConfirm={() => { setShowCancelConfirm(false); onCancel(order); }}
                onCancel={() => setShowCancelConfirm(false)}
                title="Cancel Order?"
                message={`Are you sure you want to cancel order #${order.order_number}?`}
                loading={cancelling === order.id}
            />

            {currentReviewItem && (
                <ReviewModal
                    show={showReview}
                    onHide={() => setShowReview(false)}
                    orderId={order.id}
                    productId={currentReviewItem.product_id}
                    sellerId={currentReviewItem.seller_id}
                    onSuccess={() => {
                        toast.success("Review submitted!");
                        setShowReview(false);
                    }}
                />
            )}
        </div>
    );
};

function SkeletonCard() {
    return (
        <div className="skeleton-card mb-4">
            <div className="skeleton-line w-25 mb-3"></div>
            <div className="skeleton-rect h-100 mb-3"></div>
            <div className="skeleton-line w-50"></div>
        </div>
    );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function OrdersPage() {
    const navigate = useNavigate();
    const { user } = useAuthWrapper();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("all");
    const [search, setSearch] = useState("");
    const [cancelling, setCancelling] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    // Return/Replacement states
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [requestData, setRequestData] = useState(null); // { type, order, item, reason }
    const [requestLoading, setRequestLoading] = useState(false);

    const fetchOrders = useCallback(async () => {
        const userId = user?.id || user?.user_id || JWTService.decodeTokenDetails()?.id;
        if (!userId) return;

        setLoading(true);
        try {
            const response = await orderApi.getCustomerOrders(userId);
            const rawOrders = response?.data || response || [];

            if (Array.isArray(rawOrders)) {
                setOrders(rawOrders.map(order => ({
                    ...order,
                    order_status: order.order_status || order.status || 'placed',
                    total_amount: parseFloat(order.total_amount || 0),
                    created_time: order.created_time || order.created_at || new Date().toISOString(),
                })));
            } else {
                setOrders([]);
            }
        } catch (err) {
            console.error("Fetch orders error:", err);
            toast.error("Synchronization failed. Check your connection.");
        } finally {
            setLoading(false);
        }
    }, [user?.id, user?.user_id]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    const handleCancel = useCallback(async (order) => {
        setCancelling(order.id);
        try {
            const response = await orderApi.cancelOrder(order.id, { reason: "Customer request" });
            if (response?.success) {
                setOrders(prev => prev.map(o => o.id === order.id ? { ...o, order_status: "cancelled" } : o));
                toast.success("Order cancelled successfully.");
            } else {
                throw new Error(response?.message || "Failed to cancel.");
            }
        } catch (err) {
            toast.error(err?.message || "Operation failed.");
        } finally {
            setCancelling(null);
        }
    }, []);

    const handleReturnReplacement = (type, order, item) => {
        setRequestData({ type, order, item, reason: "" });
        setShowRequestModal(true);
    };

    const submitRequest = async () => {
        if (!requestData.reason.trim()) {
            toast.error("Please provide a reason.");
            return;
        }

        setRequestLoading(true);
        try {
            // Since there's no specific API for item return/replace in order.api, 
            // we simulate a success and maybe call updateOrderStatus if needed.
            // For now, we show a success toast and update local UI state if possible.
            await new Promise(res => setTimeout(res, 1000)); // Simulate API call

            toast.success(`${requestData.type === 'return' ? 'Return' : 'Replacement'} request submitted for ${requestData.item.product_title}`);
            setShowRequestModal(false);
        } catch (err) {
            console.error("Request error:", err);
            toast.error("Request failed. Please try again later.");
        } finally {
            setRequestLoading(false);
        }
    };

    const filtered = useMemo(() => {
        return orders
            .filter((o) => activeTab === "all" || o.order_status === activeTab)
            .filter((o) => {
                if (!search.trim()) return true;
                const q = search.toLowerCase();
                return (
                    o.order_number?.toLowerCase().includes(q) ||
                    o.items?.some(i => i.product_title?.toLowerCase().includes(q))
                );
            });
    }, [orders, activeTab, search]);

    const paginated = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filtered.slice(start, start + itemsPerPage);
    }, [filtered, currentPage]);

    const totalPages = Math.ceil(filtered.length / itemsPerPage);

    const stats = useMemo(() => ({
        total: orders.length,
        delivered: orders.filter(o => o.order_status === "delivered").length,
        active: orders.filter(o => !["delivered", "cancelled", "returned"].includes(o.order_status)).length,
        spent: orders.filter(o => o.order_status !== "cancelled").reduce((s, o) => s + o.total_amount, 0)
    }), [orders]);

    return (
        <div className="orders-page-root min-vh-100">
            <Toolbar isSideBar={false} isSearch={false} cart={[]} wishlist={[]} />

            {/* Hero Section */}
            <div className="orders-hero">
                <Container>
                    <Row className="align-items-center g-4">
                        <Col lg={6}>
                            <div className="d-flex align-items-center gap-3 mb-3">
                                <button onClick={() => navigate(-1)} className="hero-back-btn">
                                    <i className="fas fa-chevron-left"></i>
                                </button>
                                <h1 className="hero-title mb-0">My Orders</h1>
                            </div>
                            <p className="hero-subtitle">Track, manage and review your purchases in one place.</p>
                        </Col>
                        <Col lg={6}>
                            <div className="hero-stats justify-content-center justify-content-lg-end">
                                <div className="stat-card">
                                    <span className="stat-val text-white">{stats.total}</span>
                                    <span className="stat-label">Total Orders</span>
                                </div>
                                <div className="stat-card">
                                    <span className="stat-val text-white">{stats.delivered}</span>
                                    <span className="stat-label">Delivered</span>
                                </div>
                                <div className="stat-card">
                                    <span className="stat-val text-white">{FMT(stats.spent)}</span>
                                    <span className="stat-label">Total Spent</span>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>

            <Container className="py-5">
                {/* Filters */}
                <div className="orders-filter-bar shadow-sm">
                    <Row className="g-3 align-items-center">
                        <Col md={4}>
                            <div className="search-box">
                                <i className="fas fa-search"></i>
                                <input
                                    type="text"
                                    placeholder="Search by order ID or product..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </Col>
                        <Col md={8}>
                            <div className="tabs-wrapper">
                                {TABS.map(tab => (
                                    <button
                                        key={tab.key}
                                        className={`tab-item ${activeTab === tab.key ? 'active' : ''}`}
                                        onClick={() => { setActiveTab(tab.key); setCurrentPage(1); }}
                                    >
                                        {tab.label}
                                        {orders.filter(o => tab.key === 'all' || o.order_status === tab.key).length > 0 && (
                                            <span className="count">
                                                {orders.filter(o => tab.key === 'all' || o.order_status === tab.key).length}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </Col>
                    </Row>
                </div>

                {/* Content */}
                {loading ? (
                    <Stack gap={4}>{[1, 2, 3].map(i => <SkeletonCard key={i} />)}</Stack>
                ) : filtered.length === 0 ? (
                    <div className="empty-state text-center py-5">
                        <div className="empty-icon mb-4"><i className="fas fa-box-open"></i></div>
                        <h4 className="fw-black">No orders found</h4>
                        <p className="text-muted">Looks like you haven't placed any orders yet or no matches found.</p>
                        <RBButton onClick={() => navigate("/")} variant="primary" className="mt-3 px-4 py-2 rounded-pill fw-bold">
                            Start Shopping
                        </RBButton>
                    </div>
                ) : (
                    <>
                        <Stack gap={4}>
                            {paginated.map(order => (
                                <LocalOrderCard
                                    key={order.id}
                                    order={order}
                                    cancelling={cancelling}
                                    onCancel={handleCancel}
                                    onReturn={(ord, itm) => handleReturnReplacement('return', ord, itm)}
                                    onReplace={(ord, itm) => handleReturnReplacement('replacement', ord, itm)}
                                />
                            ))}
                        </Stack>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="pagination-wrapper mt-5 d-flex justify-content-center gap-2">
                                <RBButton
                                    disabled={currentPage === 1}
                                    variant="light"
                                    onClick={() => { setCurrentPage(c => c - 1); window.scrollTo(0, 400); }}
                                >
                                    <i className="fas fa-arrow-left"></i>
                                </RBButton>
                                {[...Array(totalPages)].map((_, i) => (
                                    <RBButton
                                        key={i}
                                        variant={currentPage === i + 1 ? "primary" : "light"}
                                        onClick={() => { setCurrentPage(i + 1); window.scrollTo(0, 400); }}
                                    >
                                        {i + 1}
                                    </RBButton>
                                ))}
                                <RBButton
                                    disabled={currentPage === totalPages}
                                    variant="light"
                                    onClick={() => { setCurrentPage(c => c + 1); window.scrollTo(0, 400); }}
                                >
                                    <i className="fas fa-arrow-right"></i>
                                </RBButton>
                            </div>
                        )}
                    </>
                )}
            </Container>

            {/* Use the comprehensive Return/Replacement Modal */}
            <ReturnRequestModal
                key={`${requestData?.order?.id}-${requestData?.item?.id}-${requestData?.type}`}
                show={showRequestModal}
                onHide={() => setShowRequestModal(false)}
                orderId={requestData?.order?.id}
                item={requestData?.item}
                requestType={requestData?.type}
                onSuccess={() => {
                    setShowRequestModal(false);
                    fetchOrders();
                }}
            />
        </div>
    );
}
