import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Row, Col, Stack } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import orderApi from "../../api/order.api";
import { useAuthWrapper } from "../../helper/AuthWrapper";
import JWTService from "../../config/jwt.config";
import "./SellerOrders.css";
import { FMT } from "../../helper/GlobalHelper";
import OrderDrawer from "../../components/OrderDrawer";
import { PAYMENT_METHOD_META } from "../../helper/Constraints";
import PayBadge from "../../components/PayBadge";
import SellerSidebar from "../../components/SellerSidebar";
import SellerNavbar from "../../components/Sellernavbar";

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
const SIDEBAR_W = 280;
const BREAKPOINT = 992; // lg breakpoint

const ORDER_STATUSES = [
    { value: "placed", label: "Placed", icon: "📋" },
    { value: "confirmed", label: "Confirmed", icon: "✅" },
    { value: "processing", label: "Processing", icon: "⚙️" },
    { value: "shipped", label: "Shipped", icon: "🚚" },
    { value: "delivered", label: "Delivered", icon: "📦" },
    { value: "cancelled", label: "Cancelled", icon: "❌" },
    { value: "payment_failed", label: "Payment Failed", icon: "⚠️" },
];

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

    // ── Responsive state ──
    const winW = useWindowWidth();
    const isDesktop = winW >= BREAKPOINT;
    const { open: sidebarOpen, toggle: toggleSidebar, close: closeSidebar } = useSidebarState(isDesktop);

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

    // ── Search debounce ──
    useEffect(() => {
        const t = setTimeout(() => setSearch(searchInput), 300);
        return () => clearTimeout(t);
    }, [searchInput]);

    // ── Fetch orders ──
    const fetchOrders = useCallback(async () => {
        setLoading(true);
        setError(null);
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
    const handleStatusUpdate = useCallback(async (orderId, newStatus) => {
        setUpdating(true);
        try {
            const data = await orderApi.updateOrderStatus(orderId, newStatus);
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
                const results = await Promise.allSettled(
                    ids.map((id) => orderApi.updateOrderStatus(id, newStatus))
                );
                const successIds = [];
                let fail = 0;
                results.forEach((r, idx) => {
                    r.status === "fulfilled" && r.value?.success
                        ? successIds.push(ids[idx])
                        : fail++;
                });
                if (successIds.length) {
                    setOrders((prev) =>
                        prev.map((o) => successIds.includes(o.id) ? { ...o, order_status: newStatus } : o)
                    );
                    setOrderDetailsMap((prev) => {
                        const next = { ...prev };
                        successIds.forEach((id) => {
                            if (next[id]) next[id] = { ...next[id], order_status: newStatus };
                        });
                        return next;
                    });
                    setDrawerOrder((prev) =>
                        prev && successIds.includes(prev.id) ? { ...prev, order_status: newStatus } : prev
                    );
                    toast.success(`${successIds.length} order${successIds.length > 1 ? "s" : ""} updated to "${newStatus}"`);
                }
                if (fail) toast.error(`${fail} order${fail > 1 ? "s" : ""} failed to update.`);
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
        return [...orders]
            .filter((o) => {
                if (statusFilter !== "all" && o.order_status !== statusFilter) return false;
                if (paymentFilter !== "all" && o.payment_status !== paymentFilter) return false;
                if (search.trim()) {
                    const q = search.toLowerCase();
                    const matchNum = String(o.order_number || "").toLowerCase().includes(q);
                    const matchCust = String(
                        o.user_snapshot?.full_name || o.address_snapshot?.name || ""
                    ).toLowerCase().includes(q);
                    if (!matchNum && !matchCust) return false;
                }
                return true;
            })
            .sort((a, b) => {
                const da = new Date(a.created_time).getTime();
                const db = new Date(b.created_time).getTime();
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
            if (o.order_status !== "cancelled") revenue += Number(o.total_amount || 0);
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

    const mainMarginLeft = isDesktop ? (sidebarOpen ? SIDEBAR_W : 0) : 0;

    return (
        <>

            <SellerSidebar
                isOpen={sidebarOpen}
                onClose={closeSidebar}
            />

            {!isDesktop && sidebarOpen && (
                <div
                    onClick={closeSidebar}
                    style={{
                        position: "fixed",
                        inset: 0,
                        backgroundColor: "rgba(0,0,0,0.45)",
                        zIndex: 1040,   // just below sidebar (1050) but above content
                        backdropFilter: "blur(2px)",
                        transition: "opacity 0.25s ease",
                    }}
                />
            )}
            <SellerNavbar />

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    minHeight: "100vh",
                    background: "#f1f4ff",
                    marginLeft: mainMarginLeft,
                    transition: "margin-left 0.3s ease",
                    // prevent horizontal scroll when sidebar overlays on mobile
                    overflow: "hidden",
                }}
            >


                <div className="so-topbar">
                    <Stack direction="horizontal" gap={2} className="align-items-center">
                        <span className="so-topbar-title">🏪 Orders Management</span>
                    </Stack>
                    <div className="so-topbar-right">
                        <span
                            style={{
                                color: "rgba(255,255,255,.8)",
                                fontSize: "0.8rem",
                                fontWeight: 700,
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
                                color: "#fff",
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
                                background: "#fef2f2",
                                border: "1.5px solid #fca5a5",
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
                                    color: "#dc2626",
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
                                    color: "#ff6b35",
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
                    <div className="so-toolbar so-fu">
                        <div className="so-search-wrap">
                            <span className="so-search-icon">🔍</span>
                            <input
                                className="so-search"
                                placeholder="Search by order # or customer name…"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                            />
                        </div>
                        <select
                            className="so-select"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Statuses</option>
                            {ORDER_STATUSES.map((s) => (
                                <option key={s.value} value={s.value}>
                                    {s.icon} {s.label}
                                </option>
                            ))}
                        </select>
                        <select
                            className="so-select"
                            value={paymentFilter}
                            onChange={(e) => setPaymentFilter(e.target.value)}
                        >
                            <option value="all">All Payments</option>
                            {PAYMENT_STATUSES.map((s) => (
                                <option key={s.value} value={s.value}>
                                    {s.label}
                                </option>
                            ))}
                        </select>
                        <select
                            className="so-select"
                            value={dateSort}
                            onChange={(e) => setDateSort(e.target.value)}
                            style={{ minWidth: 120 }}
                        >
                            <option value="desc">Newest First</option>
                            <option value="asc">Oldest First</option>
                        </select>
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
                        <div className="so-bulk-bar">
                            <span className="so-bulk-label">
                                {selected.size} order{selected.size > 1 ? "s" : ""} selected
                            </span>
                            {["confirmed", "processing", "shipped", "delivered"].map((status) => (
                                <button
                                    key={status}
                                    className="so-bulk-btn"
                                    disabled={bulkWorking}
                                    onClick={() =>
                                        setConfirm({
                                            message: `Mark ${selected.size} order${selected.size > 1 ? "s" : ""} as "${status}"?`,
                                            onConfirm: () => bulkUpdateStatus(status),
                                        })
                                    }
                                >
                                    {ORDER_STATUSES.find((s) => s.value === status)?.icon}{" "}
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
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
                                                    color: "#ff6b35",
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
                                                        {fmtDate(order.created_time)}
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
                                                            const src = Array.isArray(item.product_image_url)
                                                                ? item.product_image_url[0]
                                                                : item.product_image_url;
                                                            return (
                                                                <img
                                                                    key={item.id}
                                                                    src={src}
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
                                                            color: "#ff6b35",
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
                                                    <select
                                                        className="so-status-select"
                                                        value={order.order_status || "placed"}
                                                        onClick={(e) => e.stopPropagation()}
                                                        onChange={(e) => {
                                                            e.stopPropagation();
                                                            handleStatusUpdate(order.id, e.target.value);
                                                        }}
                                                    >
                                                        {ORDER_STATUSES.map((s) => (
                                                            <option key={s.value} value={s.value}>
                                                                {s.icon} {s.label}
                                                            </option>
                                                        ))}
                                                    </select>
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
        </>
    );
}