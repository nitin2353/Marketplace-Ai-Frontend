import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Row, Col, Stack } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import orderApi from "../../api/order.api";
import { useAuthWrapper } from "../../helper/AuthWrapper";
import JWTService from "../../config/jwt.config";
import "./SellerOrders.css";
import { FMT, FMT_DATE_TIME, FORMATED_TIME } from "../../helper/GlobalHelper";
import OrderDrawer from "../../components/OrderDrawer";
import { PAYMENT_METHOD_META, ORDER_STATUSES } from "../../helper/Constraints";
import PayBadge from "../../components/PayBadge";
import SellerSidebar from "../../components/SellerSidebar.jsx";
import SellerNavbar from "../../components/SellerNavbar.jsx";
import ScheduledPickupModal from "../../components/ScheduledPickupModal";
import { FaInfoCircle } from "react-icons/fa";
import globalApi from "../../api/globalApi.jsx";


const fmt = FMT;

const fmtDate = (d) =>
    d
        ? new Date(d).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        })
        : "—";

const PER_PAGE = 15;



const PAYMENT_STATUSES = [
    { value: "pending", label: "Pending" },
    { value: "paid", label: "Paid" },
    { value: "failed", label: "Failed" },
    { value: "refunded", label: "Refunded" },
    { value: "cancelled", label: "Cancelled" },
];

const STAT_DEFS = [
    { key: "total", label: "Total Orders", icon: "📦", bg: "#ede9fe", color: "#7c3aed" },
    { key: "active", label: "Active", icon: "🔥", bg: "#fff0e6", color: "#ff6b35" },
    { key: "delivered", label: "Delivered", icon: "✅", bg: "#dcfce7", color: "#16a34a" },
    { key: "revenue", label: "Revenue", icon: "💰", bg: "#fef9c3", color: "#854d0e" },
];

// ─── useWindowWidth — reactive window width ──────────────────────────────────
function useWindowWidth() {
    const [width, setWidth] = useState(() => window.innerWidth);
    useEffect(() => {
        const handler = () => setWidth(window.innerWidth);
        window.addEventListener("resize", handler);
        return () => window.removeEventListener("resize", handler);
    }, []);
    return width;
}

// ─── useSidebarState — single source of truth for sidebar open/closed ────────
function useSidebarState(isDesktop) {
    // On desktop: default open. On mobile: default closed.
    const [open, setOpen] = useState(isDesktop);

    // When crossing breakpoint, auto-correct state
    const prevDesktop = useRef(isDesktop);
    useEffect(() => {
        if (prevDesktop.current !== isDesktop) {
            setOpen(isDesktop);
            prevDesktop.current = isDesktop;
        }
    }, [isDesktop]);

    const toggle = useCallback(() => setOpen((v) => !v), []);
    const close = useCallback(() => setOpen(false), []);

    return { open, toggle, close };
}

// ─── Skeleton row ────────────────────────────────────────────────────────────
function SkeletonRow() {
    return (
        <tr>
            {[40, 120, 80, 90, 80, 70, 80, 90].map((w, i) => (
                <td key={i}>
                    <div className="so-skel" style={{ height: 14, width: w }} />
                </td>
            ))}
        </tr>
    );
}

// ─── Confirm dialog ──────────────────────────────────────────────────────────
function ConfirmDialog({ message, onConfirm, onCancel, loading }) {
    return (
        <div className="so-confirm-overlay" onClick={onCancel}>
            <div className="so-confirm-box" onClick={(e) => e.stopPropagation()}>
                <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>⚠️</div>
                <p style={{ fontWeight: 800, fontSize: "0.96rem", color: "#1a1a2e", marginBottom: 6 }}>
                    Are you sure?
                </p>
                <p style={{ fontSize: "0.84rem", color: "#6b7280", fontWeight: 700, marginBottom: 24 }}>
                    {message}
                </p>
                <Stack direction="horizontal" gap={2} className="justify-content-center">
                    <button className="so-btn-outline" onClick={onCancel}>
                        Cancel
                    </button>
                    <button className="so-btn-danger" onClick={onConfirm} disabled={loading}>
                        {loading ? "Processing…" : "Confirm"}
                    </button>
                </Stack>
            </div>
        </div>
    );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function SellerOrders() {
    const { id } = useParams();
    const { user } = useAuthWrapper();

    const { isOpen, setIsOpen } = useAuthWrapper();

    // ── Responsive state ──
    const winW = useWindowWidth();

    // ── Data state ──
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [paymentFilter, setPaymentFilter] = useState("all");
    const [dateSort, setDateSort] = useState("desc");
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState(new Set());
    const [drawerOrder, setDrawerOrder] = useState(null);
    const [orderDetailsMap, setOrderDetailsMap] = useState({});
    const [updating, setUpdating] = useState(false);
    const [bulkWorking, setBulkWorking] = useState(false);
    const [confirm, setConfirm] = useState(null);
    const [showPickupModal, setShowPickupModal] = useState(false);
    const [scheduledDate, setScheduledDate] = useState([]);
    const [showScheduledPickups, setShowScheduledPickups] = useState(false);

    // ── Search debounce ──
    useEffect(() => {
        const t = setTimeout(() => setSearch(searchInput), 300);
        return () => clearTimeout(t);
    }, [searchInput]);

    // ── Fetch orders ──
    const fetchOrders = useCallback(async () => {
        setLoading(true);
        setError(null);
        fetchPickupScheduledDate()
        try {
            const userData = JWTService.decodeTokenDetails?.() || {};
            const sellerId = userData?.id || userData?.user_id || user?.id;
            if (!sellerId) throw new Error("Not authenticated.");
            const { data } = await orderApi.getSellerOrders(sellerId);
            setOrders(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Fetch orders:", err);
            setError("Failed to load orders.");
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    // ── Open drawer ──
    const openDrawer = useCallback(
        async (order) => {
            if (orderDetailsMap[order.id]) {
                setDrawerOrder(orderDetailsMap[order.id]);
                return;
            }
            if (order.items) {
                setDrawerOrder(order);
                setOrderDetailsMap((prev) => ({ ...prev, [order.id]: order }));
                return;
            }
            try {
                const response = await orderApi.getOrderById(order.id);
                const full = response?.data?.data || response?.data || order;
                setDrawerOrder(full);
                setOrderDetailsMap((prev) => ({ ...prev, [order.id]: full }));
            } catch {
                setDrawerOrder(order);
            }
        },
        [orderDetailsMap]
    );

    // ── Status / payment updates ──
    const handleStatusUpdate = useCallback(async (orderId, newStatus, pickup_payload) => {
        setUpdating(true);
        try {
            const data = await orderApi.updateOrderStatus(orderId, newStatus, pickup_payload);
            if (!data?.success) throw new Error(data?.message || "Update failed");
            const patch = (o) => (o.id === orderId ? { ...o, order_status: newStatus } : o);
            setOrders((prev) => prev.map(patch));
            setDrawerOrder((prev) => prev?.id === orderId ? { ...prev, order_status: newStatus } : prev);
            setOrderDetailsMap((prev) => ({
                ...prev,
                [orderId]: prev[orderId] ? { ...prev[orderId], order_status: newStatus } : prev[orderId],
            }));
            toast.success(`Order status updated to "${newStatus}"`);
        } catch (err) {
            toast.error(err?.response?.data?.data?.message || err?.message || "Update failed.");
        } finally {
            setUpdating(false);
        }
    }, []);

    const handlePaymentUpdate = useCallback(async (orderId, newStatus) => {
        setUpdating(true);
        try {
            const data = await orderApi.updatePaymentStatus(orderId, newStatus);
            if (!data?.success) throw new Error(data?.message || "Update failed");
            const patch = (o) => (o.id === orderId ? { ...o, payment_status: newStatus } : o);
            setOrders((prev) => prev.map(patch));
            setDrawerOrder((prev) => prev?.id === orderId ? { ...prev, payment_status: newStatus } : prev);
            setOrderDetailsMap((prev) => ({
                ...prev,
                [orderId]: prev[orderId] ? { ...prev[orderId], payment_status: newStatus } : prev[orderId],
            }));
            toast.success(`Payment status updated to "${newStatus}"`);
        } catch (err) {
            toast.error(err?.response?.data?.message || err?.message || "Update failed.");
        } finally {
            setUpdating(false);
        }
    }, []);

    // ── Bulk update ──
    const bulkUpdateStatus = useCallback(
        async (newStatus) => {
            if (!selected.size) return;
            setBulkWorking(true);
            const ids = Array.from(selected);
            try {

                console.log(ids, newStatus)

                const pickup_payload = {
                    order_ids: ids,
                    status: newStatus
                };

                const results = await orderApi.updateOrderStatus(null, null, pickup_payload)

                if (results.success) {
                    toast.success(`Status Update Successfuly`);
                }
                setSelected(new Set());
                setConfirm(null);
            } catch {
                toast.error("Bulk update failed.");
            } finally {
                setBulkWorking(false);
            }
        },
        [selected]
    );

    // ── Selection helpers ──
    const toggleSelect = useCallback((id) => {
        setSelected((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }, []);

    const toggleAll = useCallback((ids) => {
        setSelected((prev) => {
            const allSel = ids.length > 0 && ids.every((id) => prev.has(id));
            return allSel ? new Set() : new Set(ids);
        });
    }, []);

    // ── Filtered + paged ──
    const filtered = useMemo(() => {
        const list = Array.isArray(orders) ? orders : [];

        return [...list]
            .filter((o) => {
                const orderStatus = String(o?.order_status || "").toLowerCase();
                const paymentStatus = String(o?.payment_status || "").toLowerCase();

                if (
                    statusFilter !== "all" &&
                    orderStatus !== String(statusFilter).toLowerCase()
                ) {
                    return false;
                }

                if (
                    paymentFilter !== "all" &&
                    paymentStatus !== String(paymentFilter).toLowerCase()
                ) {
                    return false;
                }

                const q = search.trim().toLowerCase();

                if (q) {
                    const customerName =
                        o?.user_snapshot?.full_name ||
                        o?.address_snapshot?.name ||
                        "";

                    const customerMobile =
                        o?.address_snapshot?.mobile ||
                        o?.address_snapshot?.phone ||
                        o?.user_snapshot?.mobile ||
                        "";

                    const sellerName =
                        o?.seller_info?.business_name ||
                        o?.seller_info?.name ||
                        o?.items?.[0]?.seller_business_name ||
                        o?.items?.[0]?.seller_name ||
                        "";

                    const productText = Array.isArray(o?.items)
                        ? o.items
                            .map((item) =>
                                [
                                    item?.product_title,
                                    item?.product_brand,
                                    item?.product_category,
                                    item?.product_tag,
                                    item?.product_id,
                                ]
                                    .filter(Boolean)
                                    .join(" ")
                            )
                            .join(" ")
                        : "";

                    const searchableText = [
                        o?.id,
                        o?.order_number,
                        o?.total_amount,
                        o?.payment_method,
                        o?.payment_status,
                        o?.order_status,
                        customerName,
                        customerMobile,
                        o?.user_snapshot?.email,
                        o?.address_snapshot?.city,
                        o?.address_snapshot?.state,
                        o?.address_snapshot?.pincode,
                        sellerName,
                        productText,
                    ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();

                    if (!searchableText.includes(q)) return false;
                }

                return true;
            })
            .sort((a, b) => {
                const da = new Date(a?.created_time || 0).getTime() || 0;
                const db = new Date(b?.created_time || 0).getTime() || 0;

                return dateSort === "desc" ? db - da : da - db;
            });
    }, [orders, statusFilter, paymentFilter, search, dateSort]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
    const pagedIds = paged.map((o) => o.id);

    useEffect(() => { setPage(1); }, [statusFilter, paymentFilter, search, dateSort]);
    useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);

    // ── Stats ──
    const stats = useMemo(() => {
        let active = 0, delivered = 0, revenue = 0;
        for (const o of orders) {
            if (["placed", "confirmed", "processing", "shipped"].includes(o.order_status)) active++;
            if (o.order_status === "delivered") delivered++;
            if (o.order_status !== "cancelled" && o.order_status !== "payment_failed") {
                revenue += Number(o.total_amount || 0);
            }
        }
        return { total: orders.length, active, delivered, revenue: fmt(revenue) };
    }, [orders]);

    // ── Auto-open drawer from URL param ──
    useEffect(() => { setSearchInput(id || ""); }, [id]);
    useEffect(() => {
        if (!id || !orders.length) return;
        const matched = orders.find(
            (o) => String(o.id) === String(id) || String(o.order_number) === String(id)
        );
        if (matched) openDrawer(matched);
    }, [id, orders, openDrawer]);

    const clearFilters = () => {
        setSearch(""); setSearchInput(""); setStatusFilter("all");
        setPaymentFilter("all"); setDateSort("desc"); setPage(1);
    };

    const handleScheduledPickupSubmit = async (pickupPayload) => {
        if (!selected.size) return;

        setBulkWorking(true);

        try {
            const orderIds = Array.from(selected);

            const pickup_payload = {
                order_ids: orderIds,
                status: "processing",
                ...pickupPayload
            };

            console.log('payload', pickup_payload)

            // One API call for the entire selected batch
            const response = await orderApi.updateOrderStatus(null, null, pickup_payload);

            if (!response?.success) {
                throw new Error(response?.message || "Pickup request failed");
            }

            setOrders((prev) =>
                prev.map((order) =>
                    orderIds.includes(order.id)
                        ? { ...order, order_status: "processing" }
                        : order
                )
            );

            setOrderDetailsMap((prev) => {
                const next = { ...prev };

                orderIds.forEach((id) => {
                    if (next[id]) {
                        next[id] = {
                            ...next[id],
                            order_status: "processing"
                        };
                    }
                });

                return next;
            });

            setDrawerOrder((prev) =>
                prev && orderIds.includes(prev.id)
                    ? { ...prev, order_status: "processing" }
                    : prev
            );

            setSelected(new Set());
            setShowPickupModal(false);

            toast.success("Pickup request created successfully!");

        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                error.message ||
                "Pickup request failed"
            );
        } finally {
            setBulkWorking(false);
        }
    };

    const fetchPickupScheduledDate = async () => {
        try {
            const { data } = await globalApi?.getPickupScheduledDate();
            setScheduledDate(data?.filter((date) => ({ "scheduled_date": date.scheduled_date, "parcel_qty": date?.parcel_qty })) || [])
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                error.message ||
                "Failed to Fetch Date"
            );
        }
    }



    return (
        <>
            <SellerSidebar />

            <div className="pd-main"
                style={{
                    display: "flex",
                    flexDirection: "column",
                    minHeight: "100vh",
                    background: "#f1f4ff",
                    // prevent horizontal scroll when sidebar overlays on mobile
                    overflow: "hidden",
                }}
            >
                <SellerNavbar />


                <div
                    style={{ backgroundColor: "#3549ff" }}
                    className="so-topbar d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3"
                >
                    {/* Title */}
                    <Stack direction="horizontal" gap={2} className="align-items-center">
                        <span className="so-topbar-title">
                            🏪 Orders Management
                        </span>
                    </Stack>

                    {/* Scheduled Pickups Accordion */}
                    <div className="position-relative">
                        <button
                            type="button"
                            onClick={() => setShowScheduledPickups((prev) => !prev)}
                            className="d-flex align-items-center gap-2 px-3 py-2 rounded-3 border"
                            style={{
                                background: "rgba(255,255,255,0.15)",
                                borderColor: "rgba(255,255,255,0.3)",
                                color: "#fff",
                                fontSize: "0.85rem",
                                fontWeight: 600,
                                width: "100%",
                                justifyContent: "space-between",
                                minWidth: "190px"
                            }}
                        >
                            <span className="d-flex align-items-center gap-2">
                                📅 Scheduled Pickups
                                <span
                                    className="rounded-pill px-2 py-1"
                                    style={{
                                        background: "rgba(255,255,255,0.2)",
                                        fontSize: "0.72rem"
                                    }}
                                >
                                    {scheduledDate?.length || 0}
                                </span>
                            </span>

                            <span
                                style={{
                                    transition: "transform 0.2s",
                                    transform: showScheduledPickups
                                        ? "rotate(180deg)"
                                        : "rotate(0deg)"
                                }}
                            >
                                ▼
                            </span>
                        </button>

                        {showScheduledPickups && (
                            <>
                                {/* Outside click overlay */}
                                <div
                                    onClick={() => setShowScheduledPickups(false)}
                                    style={{
                                        position: "fixed",
                                        inset: 0,
                                        zIndex: 1040
                                    }}
                                />

                                {/* Popup */}
                                <div
                                    className="position-absolute rounded-3 shadow-lg p-3"
                                    style={{
                                        top: "calc(100% + 10px)",
                                        left: 0,
                                        width: "min(320px, calc(100vw - 32px))",
                                        background: "#fff",
                                        color: "#212529",
                                        zIndex: 1050,
                                        maxHeight: "300px",
                                        overflowY: "auto"
                                    }}
                                >
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <strong style={{ fontSize: "0.9rem" }}>
                                            Upcoming Pickups
                                        </strong>

                                        <span
                                            className="text-muted"
                                            style={{ fontSize: "0.75rem" }}
                                        >
                                            {scheduledDate?.length || 0} Scheduled
                                        </span>
                                    </div>
                                    {console.log('scheduledDate', scheduledDate)}
                                    {scheduledDate?.length > 0 ? (
                                        <Stack gap={2}>
                                            {scheduledDate.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="d-flex justify-content-between align-items-center p-3 rounded-3"
                                                    style={{
                                                        background: "#f5f7ff",
                                                        border: "1px solid #e5e9ff"
                                                    }}
                                                >
                                                    <div className="d-flex flex-column gap-1">
                                                        <span
                                                            className="fw-semibold"
                                                            style={{ fontSize: "0.85rem" }}
                                                        >
                                                            {new Date(item.scheduled_date).toLocaleDateString(
                                                                "en-IN",
                                                                {
                                                                    day: "2-digit",
                                                                    month: "short",
                                                                    year: "numeric"
                                                                }
                                                            )}
                                                        </span>

                                                        <span
                                                            className="text-muted"
                                                            style={{ fontSize: "0.72rem" }}
                                                        >
                                                            Pickup scheduled
                                                        </span>
                                                    </div>

                                                    <span
                                                        className="rounded-pill px-3 py-2 fw-semibold"
                                                        style={{
                                                            background: "#e5eaff",
                                                            color: "#3549ff",
                                                            fontSize: "0.78rem",
                                                            whiteSpace: "nowrap"
                                                        }}
                                                    >
                                                        {FORMATED_TIME(item.pickup_time)}
                                                    </span>
                                                </div>
                                            ))}
                                        </Stack>
                                    ) : (
                                        <div className="text-center py-4">
                                            <div style={{ fontSize: "2rem" }}>📦</div>
                                            <div className="fw-semibold mt-2">
                                                No Scheduled Pickups
                                            </div>
                                            <small className="text-muted">
                                                Your upcoming pickups will appear here.
                                            </small>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Right Actions */}
                    <div className="so-topbar-right d-flex align-items-center gap-3 w-100 w-lg-auto justify-content-between justify-content-lg-end">
                        <span
                            style={{
                                color: "rgba(255,255,255,.8)",
                                fontSize: "0.8rem",
                                fontWeight: 700
                            }}
                        >
                            {orders.length} total orders
                        </span>

                        <button
                            className="so-btn-outline"
                            style={{
                                fontSize: "0.78rem",
                                padding: "6px 14px",
                                borderColor: "rgba(255,255,255,.4)",
                                color: "#fff"
                            }}
                            onClick={fetchOrders}
                        >
                            🔄 Refresh
                        </button>
                    </div>
                </div>


                {/* ── PAGE CONTENT ────────────────────────────────────────── */}
                <div className="py-4 px-4" style={{ flex: 1 }}>

                    {/* Stats */}
                    {!loading && (
                        <Row className="g-3 mb-4">
                            {STAT_DEFS.map(({ key, label, icon, bg, color }) => (
                                <Col xs={6} md={3} key={key}>
                                    <div className="so-stat so-fu">
                                        <div
                                            className="so-stat-icon"
                                            style={{ background: bg, color }}
                                        >
                                            {icon}
                                        </div>
                                        <div>
                                            <p className="so-stat-val mb-0">{stats[key]}</p>
                                            <p className="so-stat-label mb-0">{label}</p>
                                        </div>
                                    </div>
                                </Col>
                            ))}
                        </Row>
                    )}

                    {/* Error */}
                    {error && (
                        <div
                            className="so-fu"
                            style={{
                                background: "#f2f8feff",
                                border: "1.5px solid #2a5bc5ff",
                                borderRadius: 12,
                                padding: "14px 18px",
                                marginBottom: 16,
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                            }}
                        >
                            <span>⚠️</span>
                            <span
                                style={{
                                    fontWeight: 800,
                                    color: "#2926dcff",
                                    fontSize: "0.88rem",
                                }}
                            >
                                {error}
                            </span>
                            <button
                                onClick={fetchOrders}
                                style={{
                                    marginLeft: "auto",
                                    border: "none",
                                    background: "none",
                                    color: "#2926dcff",
                                    fontWeight: 800,
                                    cursor: "pointer",
                                    fontFamily: "Nunito",
                                    fontSize: "0.8rem",
                                }}
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {/* Toolbar */}
                    <div className="so-toolbar so-fu d-flex flex-wrap gap-3 align-items-center">
                        <div className="so-search-wrap flex-fill" style={{ minWidth: "250px" }}>
                            <span className="so-search-icon">🔍</span>
                            <input
                                className="so-search"
                                placeholder="Search by order # or customer name…"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                            />
                        </div>
                        <div className="d-flex flex-wrap gap-2 flex-fill flex-sm-none">
                            <select
                                className="so-select flex-fill"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >

                                <option value="all">Statuses</option>
                                {ORDER_STATUSES.map((s) => (
                                    <option key={s.value} value={s.value}>
                                        {s.icon} {s.label}
                                    </option>
                                ))}
                            </select>
                            <select
                                className="so-select flex-fill"
                                value={paymentFilter}
                                onChange={(e) => setPaymentFilter(e.target.value)}
                            >
                                <option value="all">Payments</option>
                                {PAYMENT_STATUSES.map((s) => (
                                    <option key={s.value} value={s.value}>
                                        {s.label}
                                    </option>
                                ))}
                            </select>
                            <select
                                className="so-select flex-fill"
                                value={dateSort}
                                onChange={(e) => setDateSort(e.target.value)}
                                style={{ minWidth: 120 }}
                            >
                                <option value="desc">Newest</option>
                                <option value="asc">Oldest</option>
                            </select>
                        </div>
                        <span
                            style={{
                                fontSize: "0.78rem",
                                fontWeight: 700,
                                color: "#9ca3af",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {filtered.length} of {orders.length}
                        </span>
                    </div>

                    {/* Bulk bar */}
                    {selected.size > 0 && (
                        <div className="so-bulk-bar" style={{ background: "#3549ffe5" }}>
                            <span className="so-bulk-label mt-2">
                                {selected.size} order{selected.size > 1 ? "s" : ""} selected
                                <span title="Order status cannot be changed after submitting a pickup request." className="mb-2 float-end d-flex" style={{ cursor: 'pointer', fontSize: '22px' }}><FaInfoCircle /></span>
                            </span>
                            {ORDER_STATUSES.map((status) => (
                                status?.bulk_visible &&
                                <button
                                    key={status?.value}
                                    className="so-bulk-btn"
                                    disabled={bulkWorking}
                                    onClick={() => {
                                        if (status.value === "processing") {
                                            setShowPickupModal(true);
                                            return;
                                        }

                                        setConfirm({
                                            message: `Mark ${selected.size} orders as ${status.value}?`,
                                            onConfirm: () => bulkUpdateStatus(status.value),
                                        });
                                    }}
                                >
                                    {status.label + " " + status?.icon}
                                </button>
                            ))}
                            <button
                                className="so-bulk-btn"
                                disabled={bulkWorking}
                                onClick={() =>
                                    setConfirm({
                                        message: `Cancel ${selected.size} selected order${selected.size > 1 ? "s" : ""}? This cannot be undone.`,
                                        onConfirm: () => bulkUpdateStatus("cancelled"),
                                    })
                                }
                            >
                                ❌ Cancel
                            </button>
                            <button
                                onClick={() => setSelected(new Set())}
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: "rgba(255,255,255,.7)",
                                    cursor: "pointer",
                                    fontWeight: 700,
                                    fontSize: "0.78rem",
                                    marginLeft: "auto",
                                }}
                            >
                                Clear ✕
                            </button>
                        </div>
                    )}

                    {/* Table */}
                    <div className="so-table-wrap so-fu">
                        <table className="so-table">
                            <thead>
                                <tr>
                                    <th className="center">
                                        <input
                                            type="checkbox"
                                            className="so-chk"
                                            style={{ accentColor: "#151c3c" }}
                                            checked={
                                                pagedIds.length > 0 &&
                                                pagedIds.every((id) => selected.has(id))
                                            }
                                            onChange={() => toggleAll(pagedIds)}
                                        />
                                    </th>
                                    <th>Order</th>
                                    <th>Customer</th>
                                    <th>Items</th>
                                    <th>Amount</th>
                                    <th>Payment</th>
                                    <th>Order Status</th>
                                    <th>Date</th>
                                    <th className="center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
                                ) : paged.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={9}
                                            style={{
                                                textAlign: "center",
                                                padding: "50px 20px",
                                                color: "#9ca3af",
                                            }}
                                        >
                                            <div style={{ fontSize: "2.5rem", marginBottom: 10 }}>📭</div>
                                            <p style={{ fontWeight: 800, marginBottom: 6 }}>
                                                No orders found
                                            </p>
                                            <button
                                                onClick={clearFilters}
                                                style={{
                                                    border: "none",
                                                    background: "none",
                                                    color: "#3538ffff",
                                                    fontWeight: 800,
                                                    cursor: "pointer",
                                                    fontFamily: "Nunito",
                                                    fontSize: "0.82rem",
                                                }}
                                            >
                                                Clear filters →
                                            </button>
                                        </td>
                                    </tr>
                                ) : (
                                    paged.map((order, i) => {
                                        const items = order.items || [];
                                        const visible = items.slice(0, 2);
                                        const more = items.length - 2;
                                        const custName = order.user_snapshot?.full_name || order.address_snapshot?.name || "—";
                                        const custCity = order.address_snapshot?.city || "";
                                        const payMeta = PAYMENT_METHOD_META[order.payment_method] || {
                                            icon: "💳",
                                            label: order.payment_method || "Unknown",
                                        };

                                        return (
                                            <tr
                                                key={order.id}
                                                className={selected.has(order.id) ? "selected" : ""}
                                                style={{ animationDelay: `${i * 0.03}s`, cursor: "pointer" }}
                                                onClick={() => openDrawer(order)}
                                            >
                                                <td
                                                    className="center"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        className="so-chk"
                                                        checked={selected.has(order.id)}
                                                        onChange={() => toggleSelect(order.id)}
                                                    />
                                                </td>
                                                <td>
                                                    <p className="so-order-num mb-0">
                                                        #{order.order_number}
                                                    </p>
                                                    <p className="so-order-date mb-0">
                                                        {FMT_DATE_TIME(order.created_time)}
                                                    </p>
                                                </td>
                                                <td>
                                                    <p className="so-cust-name mb-0">{custName}</p>
                                                    {custCity && (
                                                        <p className="so-cust-meta mb-0">
                                                            📍 {custCity}
                                                        </p>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="so-thumb-strip">
                                                        {visible.map((item) => {
                                                            const src = Array.isArray(item.product_image_url?.split(',')[0].replace(/[{}"\\]/g, ""))
                                                                ? item.product_image_url[0]
                                                                : item.product_image_url;
                                                            return (
                                                                <img
                                                                    key={item.id}
                                                                    src={item.product_image_url?.split(',')[0].replace(/[{}"\\]/g, "")}
                                                                    alt={item.product_title || "Product"}
                                                                    className="so-thumb"
                                                                    onError={(e) => {
                                                                        e.target.src =
                                                                            "https://placehold.co/38x38/f1f4ff/ff6b35?text=P";
                                                                    }}
                                                                />
                                                            );
                                                        })}
                                                        {more > 0 && (
                                                            <div className="so-thumb-more">+{more}</div>
                                                        )}
                                                    </div>
                                                    <p
                                                        style={{
                                                            fontSize: "0.7rem",
                                                            color: "#9ca3af",
                                                            fontWeight: 700,
                                                            marginTop: 3,
                                                            marginBottom: 0,
                                                        }}
                                                    >
                                                        {order.total_items || items.length} item
                                                        {(order.total_items || items.length) !== 1
                                                            ? "s"
                                                            : ""}
                                                    </p>
                                                </td>
                                                <td>
                                                    <p
                                                        style={{
                                                            fontWeight: 900,
                                                            fontSize: "0.9rem",
                                                            color: "#3835ffff",
                                                            marginBottom: 0,
                                                        }}
                                                    >
                                                        {fmt(order.total_amount)}
                                                    </p>
                                                </td>
                                                <td>
                                                    <div style={{ marginBottom: 3 }}>
                                                        <PayBadge status={order.payment_status} />
                                                    </div>
                                                    <p
                                                        style={{
                                                            fontSize: "0.7rem",
                                                            color: "#6b7280",
                                                            fontWeight: 700,
                                                            marginBottom: 0,
                                                        }}
                                                    >
                                                        {payMeta.icon} {payMeta.label}
                                                    </p>
                                                </td>
                                                <td onClick={(e) => e.stopPropagation()}>
                                                    <p
                                                        style={{
                                                            fontSize: "0.88rem",
                                                            fontWeight: 700,
                                                            color: "#374151",
                                                            marginBottom: 0,
                                                        }}
                                                    >
                                                        {order.order_status == 'processing' ? '📅 Pickup Scheduled' : ORDER_STATUSES.find(item => item.value === order.order_status)?.icon + " " + ORDER_STATUSES.find(item => item.value === order.order_status)?.label}
                                                    </p>
                                                </td>
                                                <td style={{ whiteSpace: "nowrap" }}>
                                                    <p
                                                        style={{
                                                            fontSize: "0.78rem",
                                                            fontWeight: 700,
                                                            color: "#374151",
                                                            marginBottom: 0,
                                                        }}
                                                    >
                                                        {fmtDate(order.created_time)}
                                                    </p>
                                                </td>
                                                <td
                                                    className="center"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <button
                                                        className="so-action-btn"
                                                        onClick={() => openDrawer(order)}
                                                    >
                                                        Details →
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {!loading && totalPages > 1 && (
                        <div className="d-flex justify-content-center align-items-center gap-2 mt-4 so-fu flex-wrap">
                            <button
                                className="so-pg-btn"
                                disabled={page === 1}
                                onClick={() => setPage((p) => p - 1)}
                            >
                                ‹ Prev
                            </button>
                            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                                const p =
                                    totalPages <= 7
                                        ? i + 1
                                        : page <= 4
                                            ? i + 1
                                            : page >= totalPages - 3
                                                ? totalPages - 6 + i
                                                : page - 3 + i;
                                return (
                                    <button
                                        key={p}
                                        className={`so-pg-btn ${page === p ? "active" : ""}`}
                                        onClick={() => setPage(p)}
                                    >
                                        {p}
                                    </button>
                                );
                            })}
                            <button
                                className="so-pg-btn"
                                disabled={page === totalPages}
                                onClick={() => setPage((p) => p + 1)}
                            >
                                Next ›
                            </button>
                            <span
                                style={{
                                    fontSize: "0.76rem",
                                    color: "#9ca3af",
                                    fontWeight: 700,
                                }}
                            >
                                Page {page} of {totalPages} · {filtered.length} orders
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* ── DRAWER & CONFIRM — outside flow, overlay everything ──────── */}
            {drawerOrder && (
                <OrderDrawer
                    order={drawerOrder}
                    onClose={() => setDrawerOrder(null)}
                    onStatusUpdate={handleStatusUpdate}
                    onPaymentUpdate={handlePaymentUpdate}
                    updating={updating}
                />
            )}

            {confirm && (
                <ConfirmDialog
                    message={confirm.message}
                    onConfirm={confirm.onConfirm}
                    onCancel={() => setConfirm(null)}
                    loading={bulkWorking}
                />
            )}
            <ScheduledPickupModal
                show={showPickupModal}
                onClose={() => setShowPickupModal(false)}
                onSubmit={handleScheduledPickupSubmit}
                selectedCount={selected.size}
                loading={bulkWorking}
            />
        </>
    );
}