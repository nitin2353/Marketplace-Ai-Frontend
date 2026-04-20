import { useEffect, useMemo, useState } from "react";
import { Badge, Col, Container, Modal, Row, Table } from "react-bootstrap";
import {
    Area, AreaChart, Bar, BarChart, CartesianGrid,
    Cell, Legend, Pie, PieChart, ResponsiveContainer,
    Tooltip, XAxis, YAxis,
} from "recharts";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import SellerSidebar from "../../components/SellerSidebar";
import GlobalLoader from "../../components/GlobalLoader";
import EditProductModal from "../product/EditProductModal";
import productApi from "../../api/product.api";
import "./SellerProductDetail.css";
import reportApi from "../../api/reportApi";
import DataTable from "../../components/DataTable";
import orderApi from "../../api/order.api";
import { jwtDecode } from "jwt-decode";
import JWTService from "../../config/jwt.config";

const fmt = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
const fmtL = (n) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(1)}K` : `₹${n}`;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const ORDER_STATUSES = ["delivered", "pending", "processing", "cancelled", "returned"];
const STATUS_CLASS = { delivered: "success", pending: "warning", processing: "info", cancelled: "danger", returned: "purple" };

const buildProductSales = (sold, basePrice) => {
    const avgMonthly = sold / 12;
    return MONTHS.map((month) => ({
        month,
        units: Math.max(0, Math.round(avgMonthly * (0.5 + Math.random()))),
        revenue: 0,
    })).map((m) => ({ ...m, revenue: m.units * basePrice }));
};

// ── Dual-axis tooltip ──────────────────────────────────────
const ChartTip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="spd-tooltip">
            <p className="spd-tooltip-label">{label}</p>
            {payload.map((p) => (
                <p key={p.name} className="spd-tooltip-val" style={{ color: p.color }}>
                    {p.name}: {p.name === "revenue" ? fmtL(p.value) : p.value}
                </p>
            ))}
        </div>
    );
};

const getStatusColor = (status) => {
    switch (status) {
        case "delivered": return "success";
        case "processing": return "warning";
        case "cancelled": return "danger";
        default: return "secondary";
    }
};

export default function SellerProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImg, setActiveImg] = useState(0);
    const [activeColor, setActiveColor] = useState(0);
    const [refresh, setRefresh] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [weeklyData, setWeeklyData] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);

    const [monthlyData, setMonthlyData] = useState([]);

    useEffect(() => {
        fetchMonthlySales();
    }, []);

    const fetchMonthlySales = async () => {
        try {
            let seller = JWTService.decodeTokenDetails();

            const res = await orderApi.getSellerOrders(seller.id);

            const orders = res.data || [];

            const monthMap = {};
            orders?.forEach(item => {
                if (item.product_id == id) {
                    console.log("Item", item)
                    const date = new Date(item.created_time);
                    const month = MONTHS[date.getMonth()];
                    if (!monthMap[month]) {
                        monthMap[month] = { month, units: 0, revenue: 0 };
                    }

                    monthMap[month].units += item.total_items;
                    monthMap[month].revenue += item.subtotal;
                }
            });

            const finalData = MONTHS.map(m => monthMap[m] || {
                month: m,
                units: 0,
                revenue: 0
            });

            setMonthlyData(finalData);

        } catch (err) {
            console.error(err);
            toast.error("Failed to load monthly sales");
        }
    };

    useEffect(() => {
        const fetchWeeklyData = async () => {
            try {
                const res = await reportApi.getWeeklyUnitsSold(id);
                setWeeklyData(res.data || []);
            } catch (error) {
                console.error(error);
                toast.error("Failed to load weekly sales");
            }
        };
        if (id) fetchWeeklyData();
    }, [id]);

    useEffect(() => {
        const fetchRecentOrders = async () => {
            try {
                const res = await reportApi.getRecentOrdersByProduct(product.id);
                setRecentOrders(res.data || []);
            } catch (error) {
                console.error(error);
                toast.error("Failed to load recent orders");
            }
        };
        if (product?.id) fetchRecentOrders();
    }, [product?.id]);

    // ── Sidebar stats ──────────────────────────────────────
    const sidebarStats = product ? [
        { icon: "💰", label: "Product Revenue", val: fmtL(product.base_price * product.sold) },
        { icon: "🛒", label: "Units Sold", val: product.sold },
        { icon: "⭐", label: "Rating", val: product.rating },
    ] : [];

    // ── Fetch product ──────────────────────────────────────
    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const { data } = await productApi.getProductById(id);
                if (data?.data || data) {
                    const raw = data?.data || data;
                    setProduct({
                        ...raw,
                        base_price: Number(raw.base_price),
                        old_price: raw.old_price ? Number(raw.old_price) : null,
                        rating: Number(raw.rating),
                        tag: typeof raw.tag === "string" ? raw.tag.split(",").map(t => t.trim()) : raw.tag || [],
                        color: typeof raw.color === "string" ? raw.color.split(",").map(c => c.trim()) : raw.color || [],
                        image_url: Array.isArray(raw.image_url) ? raw.image_url : [],
                    });
                } else {
                    toast.error("Product not found");
                    navigate("/seller/products");
                }
            } catch (e) {
                console.error(e);
                toast.error("Failed to load product");
            } finally {
                setLoading(false);
            }
        })();
    }, [id, refresh]);

    // ── Delete handler ─────────────────────────────────────
    const handleDelete = async () => {
        setDeleteLoading(true);
        try {
            await productApi.deleteProduct(id);
            toast.success("Product deleted!");
            navigate("/seller/products");
        } catch {
            toast.error("Delete failed");
        } finally {
            setDeleteLoading(false);
            setDeleteModal(false);
        }
    };

    const imgCount = product?.image_url?.length || 0;
    const prevImg = () => setActiveImg((i) => (i - 1 + imgCount) % imgCount);
    const nextImg = () => setActiveImg((i) => (i + 1) % imgCount);

    // const salesData = useMemo(() => product ? buildProductSales(product.sold, product.base_price) : [], [product]);
    const salesData = monthlyData;

    const totalRev = product ? product.base_price * product.sold : 0;
    console.log("salesDatasalesData", totalRev)
    const stockPct = product ? Math.min(100, Math.round((product.stock / (product.stock + product.sold)) * 100)) : 0;
    const savingPct = product?.old_price ? Math.round(((product.old_price - product.base_price) / product.old_price) * 100) : 0;

    const ratingDist = useMemo(() => {
        if (!product) return [];
        const r = Math.round(product.rating);
        const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        const total = product.reviews || 10;
        dist[r] = Math.round(total * 0.5);
        dist[Math.max(1, r - 1)] = Math.round(total * 0.25);
        dist[Math.min(5, r + 1)] = Math.round(total * 0.15);
        dist[Math.max(1, r - 2)] = Math.round(total * 0.07);
        dist[1] = Math.max(0, total - dist[5] - dist[4] - dist[3] - dist[2]);
        return [5, 4, 3, 2, 1].map((s) => ({ star: s, count: dist[s] || 0, pct: Math.round(((dist[s] || 0) / total) * 100) }));
    }, [product]);

    // ── FIX: Use recentOrders (real API data) for pie, not fake buildOrders ──
    const statusPie = useMemo(() => {
        const map = {};
        recentOrders.forEach((o) => { map[o.status] = (map[o.status] || 0) + 1; });
        return Object.entries(map).map(([name, value]) => ({ name, value }));
    }, [recentOrders]);

    const PIE_COLORS = ["#22c55e", "#f59e0b", "#3b82f6", "#ef4444", "#8b5cf6"];
    const stockColor = product?.stock === 0 ? "var(--danger)" : product?.stock <= 10 ? "var(--warning)" : "var(--success)";

    return (
        <div className="spd-page">
            {loading && <GlobalLoader />}

            <Container fluid className="p-0">
                <Row className="g-0" style={{ minHeight: "100vh" }}>

                    {/* ── SIDEBAR ── */}
                    <Col lg={3} xl={2}>
                        <SellerSidebar stats={sidebarStats} />
                    </Col>

                    {/* ── MAIN ── */}
                    <Col lg={9} xl={10} style={{ overflowY: "auto", paddingBottom: 80 }}>

                        {/* Header */}
                        <div className="eco-hero p-3">
                            <div className="spd-header-inner">
                                <button className="spd-back-btn" onClick={() => navigate("/seller/products")}>
                                    ← Back to Products
                                </button>
                                <div className="d-flex flex-wrap align-items-start justify-content-between gap-3">
                                    <div>
                                        <h1 className="spd-header-title">{product?.title || "Loading..."}</h1>
                                        <p className="spd-header-sub">
                                            {product?.brand && <span style={{ color: "var(--p2)", fontWeight: 800 }} className="text-dark">{product.brand}</span>}
                                            {product?.category && <span style={{ color: "rgba(255,255,255,.4)" }} className="text-dark"> · {product.category}</span>}
                                        </p>
                                    </div>
                                    <div className="spd-header-actions d-none d-lg-flex">
                                        <button className="spd-action-btn ghost border-2 text-light" onClick={() => navigate(`/product/${id}`)}>👁️ View Live</button>
                                        <button className="spd-action-btn primary border-2 text-light" onClick={() => setShowEdit(true)}>✏️ Edit Product</button>
                                        <button className="spd-action-btn danger border-2 text-light" onClick={() => setDeleteModal(true)}>🗑️ Delete</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {product && (
                            <div className="p-3 p-md-4">

                                <Row className="g-3 mb-4">

                                    {/* Gallery */}
                                    <Col md={5} lg={4}>
                                        <div className="spd-card" style={{ padding: 16 }}>
                                            <div className="spd-gallery">
                                                {product.image_url.length > 0 ? (
                                                    <img src={product.image_url[activeImg]} alt={product.title} className="spd-gallery-main" />
                                                ) : (
                                                    <div className="spd-gallery-placeholder">📦</div>
                                                )}
                                                {product.discount > 0 && (
                                                    <span className="spd-gallery-badge">{product.discount}% OFF</span>
                                                )}
                                                {imgCount > 1 && (
                                                    <>
                                                        <button className="spd-gallery-nav prev" onClick={prevImg}>‹</button>
                                                        <button className="spd-gallery-nav next" onClick={nextImg}>›</button>
                                                    </>
                                                )}
                                            </div>

                                            <div className="spd-thumbs">
                                                {product.image_url.map((url, i) => (
                                                    <img key={i} src={url} alt={`thumb-${i}`}
                                                        className={`spd-thumb ${i === activeImg ? "active" : ""}`}
                                                        onClick={() => setActiveImg(i)} />
                                                ))}
                                            </div>


                                            {product.color.length > 0 && (
                                                <div className="mt-3">
                                                    <div style={{ fontSize: ".72rem", fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 8 }}>
                                                        Available Colours ({product.color.length})
                                                    </div>
                                                    <div className="d-flex gap-2 flex-wrap">
                                                        {product.color.map((c, i) => (
                                                            <div key={i} className={`spd-color-dot ${i === activeColor ? "active" : ""}`}
                                                                style={{ background: c }} title={c} onClick={() => setActiveColor(i)} />
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </Col>

                                    {/* Info + KPIs */}
                                    <Col md={7} lg={8}>
                                        <Row className="g-3 h-100">
                                            {[
                                                { icon: "💰", val: fmt(product.base_price), lbl: "Selling Price", bg: "#fff3ee", border: "#ffd3b8" },
                                                { icon: "🏷️", val: product.old_price ? fmt(product.old_price) : "—", lbl: "MRP", bg: "#f0fdf4", border: "#bbf7d0" },
                                                { icon: "🚀", val: product.sold, lbl: "Units Sold", bg: "#eff6ff", border: "#bfdbfe" },
                                                { icon: "📦", val: product.stock, lbl: "In Stock", bg: product.stock === 0 ? "var(--danger-soft)" : product.stock <= 10 ? "var(--warning-soft)" : "#f0fdf4", border: product.stock === 0 ? "#fecaca" : product.stock <= 10 ? "#fef08a" : "#bbf7d0" },
                                                { icon: "⭐", val: product.rating, lbl: "Rating", bg: "#fefce8", border: "#fef08a" },
                                                { icon: "💬", val: product.reviews || 0, lbl: "Reviews", bg: "#fdf4ff", border: "#e9d5ff" },
                                            ].map((k, i) => (
                                                <Col xs={6} sm={4} key={k.lbl}>
                                                    <div className="spd-kpi" style={{ background: k.bg, borderColor: k.border, animationDelay: `${i * 0.06}s` }}>
                                                        <div className="spd-kpi-icon">{k.icon}</div>
                                                        <div className="spd-kpi-val">{k.val}</div>
                                                        <div className="spd-kpi-lbl">{k.lbl}</div>
                                                    </div>
                                                </Col>
                                            ))}

                                            <Col xs={12}>
                                                <div className="spd-card">
                                                    <Row>
                                                        <Col>
                                                            <div className="spd-card-title">📋 Product Details</div>
                                                        </Col>
                                                        <Col className="border-1 h-3 mt-2 p-0 d-flex justify-content-end float-end">
                                                            {/* <span style={{ fontSize: "7px" }} className=" mt-0 p-4">{product.id}</span> */}
                                                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/QR_code_for_mobile_English_Wikipedia.svg/250px-QR_code_for_mobile_English_Wikipedia.svg.png" className="qr-code m-0 p-0" />
                                                        </Col>
                                                    </Row>


                                                    <div className="spd-card-sub" style={{ marginBottom: 10 }}>Core listing information</div>
                                                    {[
                                                        { key: "Brand", val: product.brand || "—" },
                                                        { key: "Category", val: product.category || "—" },
                                                        { key: "Base Price", val: fmt(product.base_price) },
                                                        { key: "MRP", val: product.old_price ? fmt(product.old_price) : "—" },
                                                        { key: "Discount", val: product.discount > 0 ? `${product.discount}%` : "No discount" },
                                                        {
                                                            key: "Stock", val: (
                                                                <span className={`spd-badge ${product.stock === 0 ? "danger" : product.stock <= 10 ? "warning" : "success"}`}>
                                                                    {product.stock === 0 ? "Out of Stock" : product.stock <= 10 ? `Low: ${product.stock}` : `${product.stock} units`}
                                                                </span>
                                                            )
                                                        },
                                                        { key: "Customizable", val: product.is_customizable ? <span className="spd-badge info">Yes</span> : <span className="spd-badge" style={{ background: "var(--border)", color: "var(--muted)" }}>No</span> },
                                                        { key: "Return Policy", val: product.is_return ? <span className="spd-badge success">↩️ {product.return_replace_duration || 7}-day return</span> : <span className="spd-badge" style={{ background: "var(--border)", color: "var(--muted)" }}>No Return</span> },
                                                        { key: "Replacement", val: product.is_replace ? <span className="spd-badge info">🔄 Available</span> : <span className="spd-badge" style={{ background: "var(--border)", color: "var(--muted)" }}>No</span> },
                                                        { key: "Total Revenue", val: <span style={{ color: "var(--p)", fontWeight: 900 }}>{fmtL(totalRev)}</span> },
                                                        { key: "Listed On", val: product.created_at ? new Date(product.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—" },
                                                    ].map(({ key, val }) => (
                                                        <div key={key} className="spd-info-row">
                                                            <span className="spd-info-key">{key}</span>
                                                            <span className="spd-info-val">{val}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>

                                {/* ── Description ── */}
                                {product.description && (
                                    <Row className="g-3 mb-4">
                                        <Col xs={12}>
                                            <div className="spd-card">
                                                <div className="spd-card-title">📝 Description</div>
                                                <div className="spd-divider" style={{ marginTop: 8 }} />
                                                <p className="spd-desc">{product.description}</p>
                                            </div>
                                        </Col>
                                    </Row>
                                )}

                                {/* ── SALES CHART ── */}
                                <Row className="g-3 mb-4">
                                    <Col lg={8}>
                                        <div className="spd-card">
                                            <div className="spd-card-title">📈 Monthly Sales Performance</div>
                                            <div className="spd-card-sub">Units sold & revenue per month (estimated)</div>
                                            <div style={{ height: 240 }}>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={salesData} margin={{ top: 10, right: 8, left: -14, bottom: 0 }}>
                                                        <defs>
                                                            <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#ff6b35" stopOpacity={0.25} />
                                                                <stop offset="95%" stopColor="#ff6b35" stopOpacity={0} />
                                                            </linearGradient>
                                                            <linearGradient id="gUnits" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f8" vertical={false} />
                                                        <XAxis
                                                            dataKey="month"
                                                            tick={{ fontSize: 10, fontFamily: "Nunito", fontWeight: 700, fill: "#9ca3af" }}
                                                            axisLine={false} tickLine={false}
                                                        />
                                                        <YAxis
                                                            yAxisId="revenue"
                                                            orientation="left"
                                                            tick={{ fontSize: 10, fontFamily: "Nunito", fontWeight: 700, fill: "#9ca3af" }}
                                                            axisLine={false} tickLine={false}
                                                            tickFormatter={fmtL}
                                                        />
                                                        <YAxis
                                                            yAxisId="units"
                                                            orientation="right"
                                                            tick={{ fontSize: 10, fontFamily: "Nunito", fontWeight: 700, fill: "#9ca3af" }}
                                                            axisLine={false} tickLine={false}
                                                            width={30}
                                                        />
                                                        <Tooltip content={<ChartTip />} />
                                                        <Legend wrapperStyle={{ fontSize: ".72rem", fontFamily: "Nunito", fontWeight: 800, paddingTop: 8 }} />
                                                        <Area
                                                            yAxisId="revenue"
                                                            type="monotone" dataKey="revenue"
                                                            stroke="#ff6b35" strokeWidth={2.5}
                                                            fill="url(#gRev)" dot={false}
                                                            activeDot={{ r: 5, fill: "#ff6b35" }}
                                                        />
                                                        <Area
                                                            yAxisId="units"
                                                            type="monotone" dataKey="units"
                                                            stroke="#3b82f6" strokeWidth={2}
                                                            fill="url(#gUnits)" dot={false}
                                                            activeDot={{ r: 4, fill: "#3b82f6" }}
                                                        />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </Col>

                                    {/* FIX: Order status pie now uses recentOrders (real API data) */}
                                    <Col lg={4}>
                                        <div className="spd-card">
                                            <div className="spd-card-title">🥧 Order Status Mix</div>
                                            <div className="spd-card-sub">
                                                {recentOrders.length > 0
                                                    ? `${recentOrders.length} orders breakdown`
                                                    : "No orders yet"}
                                            </div>
                                            {recentOrders.length === 0 ? (
                                                <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                    <span style={{ color: "var(--muted)", fontSize: ".82rem", fontWeight: 600 }}>No order data available</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <div style={{ height: 180 }}>
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <PieChart>
                                                                <Pie
                                                                    data={statusPie}
                                                                    cx="50%" cy="50%"
                                                                    innerRadius={46} outerRadius={74}
                                                                    paddingAngle={3} dataKey="value"
                                                                    labelLine={false}
                                                                >
                                                                    {statusPie.map((_, i) => (
                                                                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                                                    ))}
                                                                </Pie>
                                                                <Tooltip contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,.1)", fontFamily: "Nunito", fontSize: ".78rem" }} />
                                                            </PieChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                    <div className="d-flex flex-wrap gap-2 justify-content-center">
                                                        {statusPie.map((s, i) => (
                                                            <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                                                <div style={{ width: 8, height: 8, borderRadius: "50%", background: PIE_COLORS[i] }} />
                                                                <span style={{ fontSize: ".68rem", fontWeight: 800, color: "var(--muted)", textTransform: "capitalize" }}>
                                                                    {s.name} ({s.value})
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </Col>
                                </Row>

                                <Row className="g-3 mb-4">
                                    <Col md={5}>
                                        <div className="spd-card">
                                            <div className="spd-card-title">📊 Weekly Units Sold</div>
                                            <div className="spd-card-sub">Last 7 days estimate</div>
                                            <div style={{ height: 200 }}>
                                                <ResponsiveContainer width="100%" height="100%" className="text-light">
                                                    <BarChart data={weeklyData} margin={{ top: 5, right: 8, left: -18, bottom: 0 }}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f8" vertical={false} />
                                                        <XAxis dataKey="day" tick={{ fontSize: 10, fontFamily: "Nunito", fontWeight: 700, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                                                        <YAxis tick={{ fontSize: 10, fontFamily: "Nunito", fontWeight: 700, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                                                        <Tooltip content={<ChartTip />} />
                                                        <Bar dataKey="units" radius={[6, 6, 0, 0]} maxBarSize={30}>
                                                            {weeklyData.map((_, i) => (
                                                                <Cell key={i} fill={i === 5 || i === 6 ? "#f7931e" : "#ff6b35"} />
                                                            ))}
                                                        </Bar>
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </Col>

                                    {/* Stock health */}
                                    <Col md={3}>
                                        <div className="spd-card">
                                            <div className="spd-card-title">📦 Stock Health</div>
                                            <div className="spd-card-sub">Current inventory status</div>
                                            <div style={{ textAlign: "center", margin: "8px 0 12px" }}>
                                                <div style={{ fontFamily: "var(--font-display)", fontSize: "2.5rem", fontWeight: 800, color: stockColor, lineHeight: 1 }}>
                                                    {product.stock}
                                                </div>
                                                <div style={{ fontSize: ".72rem", fontWeight: 700, color: "var(--muted)" }}>units remaining</div>
                                            </div>
                                            <div className="spd-stock-track">
                                                <div className="spd-stock-fill" style={{
                                                    width: `${stockPct}%`,
                                                    background: product.stock === 0 ? "var(--danger)" : product.stock <= 10 ? "linear-gradient(90deg,#fbbf24,#f59e0b)" : "linear-gradient(90deg,#22c55e,#16a34a)"
                                                }} />
                                            </div>
                                            <div style={{ fontSize: ".7rem", fontWeight: 700, color: "var(--muted)", marginBottom: 14 }}>
                                                {stockPct}% of total inventory
                                            </div>
                                            <div className="spd-divider" style={{ margin: "10px 0" }} />
                                            {[
                                                { lbl: "Total Sold", val: product.sold, color: "var(--p)" },
                                                { lbl: "In Stock", val: product.stock, color: stockColor },
                                                { lbl: "Return Rate", val: `${Math.round(product.reviews > 0 ? (Math.random() * 5) : 0)}%`, color: "var(--warning)" },
                                            ].map(({ lbl, val, color }) => (
                                                <div key={lbl} style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                                                    <span style={{ fontSize: ".76rem", fontWeight: 700, color: "var(--muted)" }}>{lbl}</span>
                                                    <span style={{ fontSize: ".8rem", fontWeight: 900, color }}>{val}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </Col>

                                    {/* Rating distribution */}
                                    <Col md={4}>
                                        <div className="spd-card">
                                            <div className="spd-card-title">⭐ Rating Breakdown</div>
                                            <div className="spd-card-sub">
                                                Avg: <span style={{ color: "var(--warning)", fontWeight: 900 }}>{product.rating}</span> / 5 · {product.reviews || 0} reviews
                                            </div>
                                            <div style={{ textAlign: "center", margin: "4px 0 14px" }}>
                                                <div style={{ fontFamily: "var(--font-display)", fontSize: "2.8rem", fontWeight: 800, color: "var(--warning)", lineHeight: 1 }}>
                                                    {product.rating}
                                                </div>
                                                <div style={{ fontSize: "1rem", letterSpacing: 3, marginTop: 2 }}>
                                                    {"★".repeat(Math.round(product.rating))}
                                                    <span style={{ color: "#d1d5db" }}>{"★".repeat(5 - Math.round(product.rating))}</span>
                                                </div>
                                            </div>
                                            {ratingDist.map(({ star, count, pct }) => (
                                                <div key={star} className="spd-rating-row">
                                                    <span className="spd-rating-lbl">{star}★</span>
                                                    <div className="spd-rating-track">
                                                        <div className="spd-rating-fill" style={{ width: `${pct}%` }} />
                                                    </div>
                                                    <span className="spd-rating-cnt">{count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </Col>
                                </Row>

                                {/* ── RECENT ORDERS ── */}
                                <DataTable tableData={recentOrders} getStatusColor={getStatusColor} />

                                <Row className="g-3 mb-4">
                                    <Col md={5}>
                                        <div className="spd-card">
                                            <div className="spd-card-title">🏷️ Tags &amp; Attributes</div>
                                            <div className="spd-card-sub">Discoverability keywords</div>
                                            <div className="d-flex flex-wrap gap-2">
                                                {product.tag.length > 0
                                                    ? product.tag.map((t) => <span key={t} className="spd-tag">{t}</span>)
                                                    : <span style={{ color: "var(--muted)", fontSize: ".82rem", fontWeight: 600 }}>No tags added</span>
                                                }
                                            </div>
                                            {product.color.length > 0 && (
                                                <>
                                                    <div className="spd-divider" />
                                                    <div style={{ fontSize: ".72rem", fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 10 }}>
                                                        Colour Variants
                                                    </div>
                                                    <div className="d-flex gap-2 flex-wrap align-items-center">
                                                        {product.color.map((c, i) => (
                                                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                                                <div style={{ width: 18, height: 18, borderRadius: "50%", background: c, border: "2px solid #fff", boxShadow: "0 1px 4px rgba(0,0,0,.2)" }} />
                                                                <span style={{ fontSize: ".68rem", fontWeight: 700, color: "var(--muted)" }}>{c}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </Col>

                                    <Col md={7}>
                                        <div className="spd-card">
                                            <div className="spd-card-title">📜 Return &amp; Replacement Policy</div>
                                            <div className="spd-card-sub">Customer-facing policies for this product</div>
                                            <Row className="g-2">
                                                {[
                                                    {
                                                        icon: "↩️", bg: product.is_return ? "var(--success-soft)" : "var(--border)",
                                                        title: product.is_return ? `${product.return_replace_duration || 7}-Day Return Policy` : "No Return Policy",
                                                        desc: product.is_return
                                                            ? product.return_replace_instructions || "Customer can return the product within the specified duration."
                                                            : "This product is not eligible for return.",
                                                        enabled: product.is_return,
                                                    },
                                                    {
                                                        icon: "🔄", bg: product.is_replace ? "var(--info-soft)" : "var(--border)",
                                                        title: product.is_replace ? "Replacement Available" : "No Replacement",
                                                        desc: product.is_replace
                                                            ? `Replacement within ${product.return_replace_duration || 7} days if product is defective or damaged.`
                                                            : "This product does not have a replacement option.",
                                                        enabled: product.is_replace,
                                                    },
                                                ].map(({ icon, bg, title, desc, enabled }) => (
                                                    <Col xs={12} key={title}>
                                                        <div className="spd-policy-item" style={{ opacity: enabled ? 1 : 0.6 }}>
                                                            <div className="spd-policy-icon" style={{ background: bg }}>{icon}</div>
                                                            <div>
                                                                <div className="spd-policy-title">{title}</div>
                                                                <div className="spd-policy-desc">{desc}</div>
                                                            </div>
                                                            <span className={`spd-badge ms-auto ${enabled ? "success" : "danger"}`} style={{ flexShrink: 0 }}>
                                                                {enabled ? "Active" : "Inactive"}
                                                            </span>
                                                        </div>
                                                    </Col>
                                                ))}
                                            </Row>
                                        </div>
                                    </Col>
                                </Row>

                            </div>
                        )}
                    </Col>
                </Row>
            </Container>

            {/* ── Mobile sticky action bar ── */}
            <div className="spd-sticky-bar d-lg-none">
                <button className="spd-action-btn ghost flex-fill" style={{ justifyContent: "center" }} onClick={() => navigate(`/product/${id}`)}>👁️ View</button>
                <button className="spd-action-btn primary flex-fill" style={{ justifyContent: "center" }} onClick={() => setShowEdit(true)}>✏️ Edit</button>
                <button className="spd-action-btn danger" style={{ justifyContent: "center" }} onClick={() => setDeleteModal(true)}>🗑️</button>
            </div>

            {/* ── Edit Modal ── */}
            <EditProductModal
                show={showEdit}
                product={product}
                setRefresh={setRefresh}
                refresh={refresh}
                handleClose={() => setShowEdit(false)}
            />

            {/* ── Delete Confirm Modal ── */}
            <Modal show={deleteModal} onHide={() => !deleteLoading && setDeleteModal(false)} centered>
                <Modal.Body className="p-4 text-center" style={{ fontFamily: "Nunito" }}>
                    <div style={{ fontSize: "3rem", marginBottom: 12 }}>🗑️</div>
                    <h4 style={{ fontWeight: 900, color: "var(--text)", marginBottom: 8 }}>Delete Product?</h4>
                    <p style={{ color: "var(--muted)", fontSize: ".88rem", marginBottom: 6 }}>You are about to permanently delete:</p>
                    <p style={{ color: "var(--p)", fontWeight: 900, fontSize: ".95rem", marginBottom: 24 }}>"{product?.title}"</p>
                    <div className="d-flex gap-3">
                        <button
                            style={{ flex: 1, background: "transparent", border: "1.5px solid var(--border)", borderRadius: 12, padding: "11px", fontFamily: "Nunito", fontWeight: 800, fontSize: ".88rem", cursor: "pointer", color: "var(--muted)" }}
                            onClick={() => setDeleteModal(false)}
                            disabled={deleteLoading}
                        >Cancel</button>
                        <button
                            style={{ flex: 1, background: "linear-gradient(135deg,#ef4444,#dc2626)", border: "none", borderRadius: 12, padding: "11px", fontFamily: "Nunito", fontWeight: 900, fontSize: ".88rem", cursor: "pointer", color: "#fff", boxShadow: "0 4px 14px rgba(239,68,68,.35)" }}
                            onClick={handleDelete}
                            disabled={deleteLoading}
                        >
                            {deleteLoading ? "⏳ Deleting..." : "🗑️ Yes, Delete"}
                        </button>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
}