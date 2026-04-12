// ════════════════════════════════════════════════════════════
//  SellerDashboardHome.jsx  —  Complete Seller Analytics
//  Charts: Revenue, Orders, Category, Rating, Stock, Funnel
//  Data:   computed live from products prop + mock orders
// ════════════════════════════════════════════════════════════

import { useEffect, useMemo, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid,
  Cell, Legend, Pie, PieChart, RadialBar,
  RadialBarChart, ResponsiveContainer, Tooltip,
  XAxis, YAxis,
} from "recharts";
import { useNavigate } from "react-router-dom";
import SellerSidebar from "../../components/SellerSidebar";
import GlobalLoader from "../../components/GlobalLoader";
import productApi from "../../api/product.api";
import "./SellerDashboardHome.css";

// ── Helpers ────────────────────────────────────────────────
const fmt   = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
const fmtL  = (n) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(1)}K` : `₹${n}`;
const today = new Date();

// ── Mock order statuses (replace with real API) ───────────
const ORDER_STATUSES = ["delivered", "pending", "processing", "cancelled", "returned"];
const MOCK_ORDERS = Array.from({ length: 18 }, (_, i) => ({
  id:      `ORD-${1000 + i}`,
  product: ["Morpankh Wall Art", "Silk Dupatta", "Cotton Kurta", "Handmade Lamp", "Jute Bag"][i % 5],
  amount:  Math.floor(Math.random() * 4800 + 200),
  status:  ORDER_STATUSES[Math.floor(Math.random() * ORDER_STATUSES.length)],
  date:    new Date(today - (i * 24 * 3600000)).toLocaleDateString("en-IN"),
  qty:     Math.floor(Math.random() * 4 + 1),
}));

// ── Generate monthly revenue data ─────────────────────────
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const buildRevenueData = (products) => {
  const base = products.reduce((s, p) => s + p.base_price * p.sold, 0) / 12;
  return MONTHS.map((m, i) => ({
    month:    m,
    revenue:  Math.round(base * (0.6 + Math.random() * 0.8)),
    orders:   Math.round(20 + Math.random() * 60),
    returns:  Math.round(Math.random() * 8),
  }));
};

// ── Build weekly data ──────────────────────────────────────
const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const buildWeeklyData = (products) => {
  const base = products.reduce((s, p) => s + p.base_price * p.sold, 0) / 52 / 7;
  return DAYS.map((d) => ({
    day:     d,
    revenue: Math.round(base * (0.5 + Math.random())),
    orders:  Math.round(3 + Math.random() * 12),
    visitors:Math.round(50 + Math.random() * 200),
  }));
};

// ── Custom Tooltip ─────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#1a1a2e", border: "none", borderRadius: 10,
      padding: "10px 14px", boxShadow: "0 4px 20px rgba(0,0,0,.3)",
    }}>
      <p style={{ color: "rgba(255,255,255,.6)", fontSize: ".72rem", fontWeight: 700, margin: "0 0 6px" }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color, fontSize: ".8rem", fontWeight: 900, margin: "2px 0" }}>
          {p.name}: {p.name === "revenue" ? fmtL(p.value) : p.value}
        </p>
      ))}
    </div>
  );
};

// ── Pie custom label ───────────────────────────────────────
const RADIAN = Math.PI / 180;
const PieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
  if (percent < 0.06) return null;
  const r  = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x  = cx + r * Math.cos(-midAngle * RADIAN);
  const y  = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central"
      style={{ fontSize: ".65rem", fontWeight: 900, fontFamily: "Nunito" }}>
      {(percent * 100).toFixed(0)}%
    </text>
  );
};

// ══════════════════════════════════════════════════════════
export default function SellerDashboardHome() {
  const navigate = useNavigate();
  const [products, setProducts]   = useState([]);
  const [loading,  setLoading]    = useState(true);
  const [period,   setPeriod]     = useState("monthly"); // monthly | weekly
  const [refresh,  setRefresh]    = useState(false);

  // ── Sidebar stats (shared with SellerProducts) ──────────
  const totalRevenue  = products.reduce((s, p) => s + p.base_price * p.sold, 0);
  const avgRating     = products.length
    ? (products.reduce((s, p) => s + Number(p.rating), 0) / products.length).toFixed(1)
    : "0.0";

  const sidebarStats = [
    { icon: "📦", label: "Total Products", val: products.length },
    { icon: "💰", label: "Total Revenue",  val: `₹${(totalRevenue / 100000).toFixed(1)}L` },
    { icon: "⭐", label: "Avg Rating",     val: avgRating },
  ];

  // ── Fetch products ──────────────────────────────────────
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await productApi.getAllProducts();
        if (data?.data) {
          setProducts(
            data.data.map((p) => ({
              ...p,
              base_price: Number(p.base_price),
              old_price:  p.old_price ? Number(p.old_price) : null,
              rating:     Number(p.rating),
              tag:   typeof p.tag   === "string" ? p.tag.split(",").map(t => t.trim())   : [],
              color: typeof p.color === "string" ? p.color.split(",").map(c => c.trim()) : [],
              image_url: Array.isArray(p.image_url) ? p.image_url : [],
            }))
          );
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [refresh]);

  // ── Derived chart data ──────────────────────────────────
  const chartData   = useMemo(() =>
    period === "monthly" ? buildRevenueData(products) : buildWeeklyData(products),
    [products, period]
  );

  const xKey = period === "monthly" ? "month" : "day";

  // ── KPI cards ───────────────────────────────────────────
  const outOfStock  = products.filter(p => p.stock === 0).length;
  const lowStock    = products.filter(p => p.stock > 0 && p.stock <= 10).length;
  const totalSold   = products.reduce((s, p) => s + p.sold, 0);
  const totalOrders = MOCK_ORDERS.length;
  const deliveredPct= Math.round((MOCK_ORDERS.filter(o => o.status === "delivered").length / totalOrders) * 100);

  const KPIS = [
    {
      icon: "💰", iconBg: "#fff3ee", iconColor: "#ff6b35",
      label: "Total Revenue", value: fmtL(totalRevenue),
      delta: "+18%", trend: "up", sub: "vs last month",
      border: "#ffd3b8",
    },
    {
      icon: "🛒", iconBg: "#f0fdf4", iconColor: "#22c55e",
      label: "Total Orders", value: totalOrders,
      delta: "+12%", trend: "up", sub: `${deliveredPct}% delivered`,
      border: "#bbf7d0",
    },
    {
      icon: "📦", iconBg: "#eff6ff", iconColor: "#3b82f6",
      label: "Total Products", value: products.length,
      delta: "+3", trend: "up", sub: `${outOfStock} out of stock`,
      border: "#bfdbfe",
    },
    {
      icon: "🚀", iconBg: "#fdf4ff", iconColor: "#8b5cf6",
      label: "Units Sold", value: totalSold.toLocaleString(),
      delta: "+9%", trend: "up", sub: "lifetime total",
      border: "#e9d5ff",
    },
    {
      icon: "⭐", iconBg: "#fefce8", iconColor: "#f59e0b",
      label: "Avg Rating", value: avgRating,
      delta: "+0.2", trend: "up", sub: `${products.reduce((s,p)=>s+p.reviews,0).toLocaleString()} reviews`,
      border: "#fef08a",
    },
    {
      icon: "⚠️", iconBg: "#fef2f2", iconColor: "#ef4444",
      label: "Low / Out Stock", value: `${lowStock} / ${outOfStock}`,
      delta: outOfStock > 0 ? "Action!" : "OK", trend: outOfStock > 0 ? "down" : "flat",
      sub: "needs restock",
      border: "#fecaca",
    },
  ];

  // ── Top products by revenue ─────────────────────────────
  const topProducts = useMemo(() =>
    [...products]
      .sort((a, b) => (b.base_price * b.sold) - (a.base_price * a.sold))
      .slice(0, 5),
    [products]
  );

  const maxRev = topProducts[0]
    ? topProducts[0].base_price * topProducts[0].sold
    : 1;

  // ── Category breakdown ──────────────────────────────────
  const categoryData = useMemo(() => {
    const map = {};
    products.forEach(p => {
      const cat = p.category || "Other";
      map[cat] = (map[cat] || 0) + p.base_price * p.sold;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [products]);

  const PIE_COLORS = ["#ff6b35","#f7931e","#3b82f6","#22c55e","#8b5cf6"];

  // ── Stock health radial data ────────────────────────────
  const stockData = [
    { name: "Healthy",    value: products.filter(p => p.stock > 10).length,       fill: "#22c55e" },
    { name: "Low Stock",  value: products.filter(p => p.stock > 0 && p.stock <= 10).length, fill: "#f59e0b" },
    { name: "Out",        value: outOfStock,                                        fill: "#ef4444" },
  ];

  // ── Rating distribution ─────────────────────────────────
  const ratingDist = useMemo(() => {
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    products.forEach(p => {
      const r = Math.round(Number(p.rating));
      if (dist[r] !== undefined) dist[r]++;
    });
    const total = products.length || 1;
    return [5, 4, 3, 2, 1].map(star => ({
      star, count: dist[star], pct: Math.round((dist[star] / total) * 100),
    }));
  }, [products]);

  // ── Activity feed ───────────────────────────────────────
  const ACTIVITIES = [
    { icon: "🛒", bg: "#f0fdf4", title: "New order received",        sub: "ORD-1018 · Morpankh Art · ₹980",    time: "2m ago" },
    { icon: "⭐", bg: "#fefce8", title: "New 5-star review",          sub: "Silk Dupatta · 'Excellent quality!'", time: "18m ago" },
    { icon: "⚠️", bg: "#fef2f2", title: "Low stock alert",           sub: "Handmade Lamp · only 3 left",         time: "1h ago" },
    { icon: "↩️", bg: "#f5f3ff", title: "Return request",            sub: "ORD-1009 · Cotton Kurta",             time: "3h ago" },
    { icon: "📦", bg: "#eff6ff", title: "Product published",         sub: "Bamboo Wall Clock · now live",        time: "5h ago" },
    { icon: "💰", bg: "#fff3ee", title: "Payout processed",          sub: "₹24,300 credited to bank",            time: "1d ago" },
    { icon: "🚀", bg: "#fdf4ff", title: "Product trending",          sub: "Morpankh Art · Top 10 in Feather",    time: "2d ago" },
  ];

  // ── Insights ────────────────────────────────────────────
  const INSIGHTS = useMemo(() => [
    {
      icon: "🔥", bg: "#fff3ee", border: "#ffd3b8",
      title: "Best Seller",
      desc: topProducts[0]
        ? `"${topProducts[0].title}" has generated ${fmt(topProducts[0].base_price * topProducts[0].sold)} revenue with ${topProducts[0].sold} units sold.`
        : "Add products to see insights",
    },
    {
      icon: "⚠️", bg: "#fef2f2", border: "#fecaca",
      title: "Restock Needed",
      desc: outOfStock > 0
        ? `${outOfStock} product${outOfStock > 1 ? "s are" : " is"} out of stock. Restock to avoid losing sales.`
        : "All products are well stocked! Great job. 🎉",
    },
    {
      icon: "💡", bg: "#eff6ff", border: "#bfdbfe",
      title: "Boost Tip",
      desc: `Products with 5+ images sell ${Math.round(30 + Math.random() * 20)}% more. Add more photos to your listings.`,
    },
  ], [topProducts, outOfStock]);

  // ════════════════════════════════════════════════════════
  return (
    <div className="sdh-page">
      {loading && <GlobalLoader />}

      <Container fluid className="p-0">
        <Row className="g-0" style={{ minHeight: "100vh" }}>

          {/* ── SIDEBAR ── */}
          <Col lg={3} xl={2}>
            <SellerSidebar stats={sidebarStats} />
          </Col>

          {/* ── MAIN ── */}
          <Col lg={9} xl={10} style={{ overflowY: "auto" }}>

            {/* Header */}
            <div className="sdh-header">
              <div className="sdh-header-inner d-flex flex-wrap align-items-center justify-content-between gap-3">
                <div>
                  <h1 className="sdh-header-title">📊 Seller Dashboard</h1>
                  <p className="sdh-header-sub">Track your sales, inventory, and growth in real-time</p>
                </div>
                <div className="d-flex flex-column align-items-end gap-2">
                  <span className="sdh-header-date">
                    📅 {today.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  </span>
                  <div className="sdh-period-tabs">
                    {["weekly", "monthly"].map(p => (
                      <button key={p} className={`sdh-period-tab ${period === p ? "active" : ""}`}
                        onClick={() => setPeriod(p)}>
                        {p === "weekly" ? "7 Days" : "12 Months"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 p-md-4">

              {/* ── KPI CARDS ── */}
              <Row className="g-3 mb-4">
                {KPIS.map((k, i) => (
                  <Col xs={6} md={4} xl={2} key={k.label}>
                    <div className="sdh-kpi-card" style={{ borderColor: k.border, animationDelay: `${i * 0.06}s` }}>
                      <div className="sdh-kpi-icon-wrap" style={{ background: k.iconBg }}>
                        <span>{k.icon}</span>
                      </div>
                      <div className="sdh-kpi-label">{k.label}</div>
                      <div className="sdh-kpi-value">{k.value}</div>
                      <div>
                        <span className={`sdh-kpi-delta ${k.trend}`}>
                          {k.trend === "up" ? "↑" : k.trend === "down" ? "↓" : "→"} {k.delta}
                        </span>
                      </div>
                      <div className="sdh-kpi-sub">{k.sub}</div>
                    </div>
                  </Col>
                ))}
              </Row>

              {/* ── REVENUE + ORDERS CHART ── */}
              <Row className="g-3 mb-4">
                <Col xl={8}>
                  <div className="sdh-card">
                    <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-1">
                      <div>
                        <div className="sdh-card-title">📈 Revenue & Orders</div>
                        <div className="sdh-card-sub">
                          {period === "monthly" ? "Monthly breakdown for the year" : "Daily breakdown for this week"}
                        </div>
                      </div>
                      <div style={{ fontSize: ".78rem", fontWeight: 800, color: "var(--muted)" }}>
                        Total: <span style={{ color: "var(--p)" }}>{fmtL(totalRevenue)}</span>
                      </div>
                    </div>

                    <div className="sdh-chart-wrap" style={{ height: 280 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                          <defs>
                            <linearGradient id="gradRev" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%"  stopColor="#ff6b35" stopOpacity={0.25} />
                              <stop offset="95%" stopColor="#ff6b35" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="gradOrd" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.2} />
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f8" vertical={false} />
                          <XAxis dataKey={xKey} tick={{ fontSize: 11, fontFamily: "Nunito", fontWeight: 700, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 10, fontFamily: "Nunito", fontWeight: 700, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={fmtL} />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend wrapperStyle={{ fontSize: ".75rem", fontFamily: "Nunito", fontWeight: 800, paddingTop: 10 }} />
                          <Area type="monotone" dataKey="revenue" stroke="#ff6b35" strokeWidth={2.5} fill="url(#gradRev)" dot={false} activeDot={{ r: 5, fill: "#ff6b35" }} />
                          <Area type="monotone" dataKey="orders"  stroke="#3b82f6" strokeWidth={2}   fill="url(#gradOrd)" dot={false} activeDot={{ r: 4, fill: "#3b82f6" }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </Col>

                {/* Category Pie */}
                <Col xl={4}>
                  <div className="sdh-card">
                    <div className="sdh-card-title">🥧 Revenue by Category</div>
                    <div className="sdh-card-sub">Top {categoryData.length} categories</div>

                    {categoryData.length > 0 ? (
                      <>
                        <div className="sdh-chart-wrap" style={{ height: 180 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={categoryData} cx="50%" cy="50%"
                                innerRadius={48} outerRadius={80}
                                paddingAngle={3} dataKey="value"
                                labelLine={false} label={PieLabel}>
                                {categoryData.map((_, i) => (
                                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(v) => fmtL(v)} contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,.15)", fontFamily: "Nunito", fontSize: ".8rem" }} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="mt-2">
                          {categoryData.map((c, i) => (
                            <div key={c.name} className="sdh-cat-pill">
                              <span className="sdh-cat-dot" style={{ background: PIE_COLORS[i] }} />
                              <span className="sdh-cat-name">{c.name}</span>
                              <span className="sdh-cat-val">{fmtL(c.value)}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div style={{ textAlign: "center", padding: "30px 0", color: "var(--muted)", fontSize: ".85rem", fontWeight: 700 }}>
                        No products yet
                      </div>
                    )}
                  </div>
                </Col>
              </Row>

              {/* ── BAR CHART (Orders) + STOCK RADIAL ── */}
              <Row className="g-3 mb-4">
                <Col md={7}>
                  <div className="sdh-card">
                    <div className="sdh-card-title">🛒 Orders Overview</div>
                    <div className="sdh-card-sub">Orders vs Returns — {period === "monthly" ? "Monthly" : "Weekly"}</div>
                    <div className="sdh-chart-wrap" style={{ height: 220 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }} barGap={4}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f8" vertical={false} />
                          <XAxis dataKey={xKey} tick={{ fontSize: 10, fontFamily: "Nunito", fontWeight: 700, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 10, fontFamily: "Nunito", fontWeight: 700, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend wrapperStyle={{ fontSize: ".72rem", fontFamily: "Nunito", fontWeight: 800 }} />
                          <Bar dataKey="orders"  fill="#ff6b35" radius={[5,5,0,0]} maxBarSize={28} />
                          <Bar dataKey="returns" fill="#e8eaf6" radius={[5,5,0,0]} maxBarSize={28} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </Col>

                {/* Stock health radial */}
                <Col md={5}>
                  <div className="sdh-card">
                    <div className="sdh-card-title">📦 Stock Health</div>
                    <div className="sdh-card-sub">{products.length} products total</div>
                    <div className="sdh-chart-wrap" style={{ height: 180 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="90%"
                          data={stockData} startAngle={180} endAngle={0}>
                          <RadialBar minAngle={10} dataKey="value" cornerRadius={6} label={false} background={{ fill: "#f3f4f6" }} />
                          <Legend iconSize={10} wrapperStyle={{ fontSize: ".72rem", fontFamily: "Nunito", fontWeight: 800, bottom: 0 }} />
                          <Tooltip contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,.1)", fontFamily: "Nunito", fontSize: ".8rem" }} />
                        </RadialBarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="d-flex justify-content-around mt-2">
                      {stockData.map(s => (
                        <div key={s.name} style={{ textAlign: "center" }}>
                          <div style={{ fontSize: "1.1rem", fontWeight: 900, color: s.fill }}>{s.value}</div>
                          <div style={{ fontSize: ".65rem", fontWeight: 700, color: "var(--muted)" }}>{s.name}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Col>
              </Row>

              {/* ── TOP PRODUCTS + RATINGS ── */}
              <Row className="g-3 mb-4">
                <Col md={7}>
                  <div className="sdh-card">
                    <div className="sdh-card-title">🏆 Top Products by Revenue</div>
                    <div className="sdh-card-sub">Best performing listings</div>

                    {topProducts.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "30px 0", color: "var(--muted)", fontSize: ".85rem" }}>
                        No products yet
                      </div>
                    ) : (
                      topProducts.map((p, i) => (
                        <div key={p.id} className="sdh-top-product"
                          onClick={() => navigate(`/seller/product/${p.id}`)}
                          style={{ cursor: "pointer" }}>
                          <div className={`sdh-top-product-rank ${i === 1 ? "silver" : i === 2 ? "bronze" : ""}`}>
                            {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                          </div>
                          {p.image_url[0]
                            ? <img src={p.image_url[0]} alt={p.title} className="sdh-top-product-img" />
                            : <div className="sdh-top-product-img-placeholder">📦</div>
                          }
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="sdh-top-product-name">{p.title}</div>
                            <div className="sdh-top-product-meta">⭐ {p.rating} · {p.sold} sold · Stock: {p.stock}</div>
                            <div className="sdh-progress-bar-wrap">
                              <div className="sdh-progress-bar-fill"
                                style={{ width: `${((p.base_price * p.sold) / maxRev) * 100}%` }} />
                            </div>
                          </div>
                          <div className="sdh-top-product-revenue">
                            <div className="sdh-top-product-rev-val">{fmtL(p.base_price * p.sold)}</div>
                            <div className="sdh-top-product-rev-units">{p.sold} units</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Col>

                {/* Rating distribution */}
                <Col md={5}>
                  <div className="sdh-card">
                    <div className="sdh-card-title">⭐ Rating Distribution</div>
                    <div className="sdh-card-sub">
                      Avg: <span style={{ color: "var(--warning)", fontWeight: 900 }}>{avgRating}</span> / 5
                    </div>

                    {/* Big avg display */}
                    <div style={{ textAlign: "center", margin: "8px 0 16px" }}>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: "3rem", fontWeight: 800, color: "var(--warning)", lineHeight: 1 }}>
                        {avgRating}
                      </div>
                      <div style={{ fontSize: "1.2rem", letterSpacing: 2 }}>
                        {"★".repeat(Math.round(avgRating))}{"☆".repeat(5 - Math.round(avgRating))}
                      </div>
                      <div style={{ fontSize: ".72rem", color: "var(--muted)", fontWeight: 700 }}>
                        {products.reduce((s, p) => s + (p.reviews || 0), 0).toLocaleString()} total reviews
                      </div>
                    </div>

                    {ratingDist.map(({ star, count, pct }) => (
                      <div key={star} className="sdh-rating-row">
                        <span className="sdh-rating-label">{star}★</span>
                        <div className="sdh-rating-bar">
                          <div className="sdh-rating-bar-fill" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="sdh-rating-count">{count}</span>
                      </div>
                    ))}
                  </div>
                </Col>
              </Row>

              {/* ── RECENT ORDERS + ACTIVITY ── */}
              <Row className="g-3 mb-4">
                <Col md={7}>
                  <div className="sdh-card">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <div>
                        <div className="sdh-card-title">📋 Recent Orders</div>
                        <div className="sdh-card-sub">Last {MOCK_ORDERS.slice(0, 8).length} orders</div>
                      </div>
                      <button
                        style={{ background: "none", border: "1.5px solid var(--border)", borderRadius: 8, padding: "5px 12px", fontSize: ".75rem", fontWeight: 800, color: "var(--muted)", cursor: "pointer", fontFamily: "Nunito" }}
                        onClick={() => navigate("/seller/orders")}
                      >
                        View All →
                      </button>
                    </div>

                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr>
                            {["Order ID", "Product", "Qty", "Amount", "Status", "Date"].map(h => (
                              <th key={h} style={{ fontSize: ".68rem", fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".04em", padding: "6px 8px", textAlign: "left", borderBottom: "1.5px solid var(--border)", whiteSpace: "nowrap" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {MOCK_ORDERS.slice(0, 8).map(o => (
                            <tr key={o.id} style={{ transition: "background .12s" }}
                              onMouseEnter={e => e.currentTarget.style.background = "#fafbff"}
                              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                              <td style={{ padding: "9px 8px", fontSize: ".78rem", fontWeight: 900, color: "var(--text)" }}>{o.id}</td>
                              <td style={{ padding: "9px 8px", fontSize: ".75rem", fontWeight: 700, color: "var(--muted)", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.product}</td>
                              <td style={{ padding: "9px 8px", fontSize: ".78rem", fontWeight: 800, textAlign: "center" }}>{o.qty}</td>
                              <td style={{ padding: "9px 8px", fontSize: ".8rem", fontWeight: 900, color: "var(--p)" }}>{fmt(o.amount)}</td>
                              <td style={{ padding: "9px 8px" }}><span className={`sdh-status ${o.status}`}>{o.status}</span></td>
                              <td style={{ padding: "9px 8px", fontSize: ".72rem", color: "var(--muted)", fontWeight: 700, whiteSpace: "nowrap" }}>{o.date}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </Col>

                {/* Activity feed */}
                <Col md={5}>
                  <div className="sdh-card">
                    <div className="sdh-card-title">🔔 Recent Activity</div>
                    <div className="sdh-card-sub">Latest events on your store</div>
                    {ACTIVITIES.map((a, i) => (
                      <div key={i} className="sdh-activity-item" style={{ animationDelay: `${i * 0.05}s` }}>
                        <div className="sdh-activity-dot" style={{ background: a.bg }}>{a.icon}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="sdh-activity-title">{a.title}</div>
                          <div className="sdh-activity-sub">{a.sub}</div>
                        </div>
                        <div className="sdh-activity-time">{a.time}</div>
                      </div>
                    ))}
                  </div>
                </Col>
              </Row>

              {/* ── INSIGHTS ── */}
              <Row className="g-3 mb-2">
                <Col xs={12}>
                  <div className="sdh-card">
                    <div className="sdh-card-title">💡 Smart Insights</div>
                    <div className="sdh-card-sub">Recommendations based on your store data</div>
                    <Row className="g-3 mt-1">
                      {INSIGHTS.map((ins) => (
                        <Col md={4} key={ins.title}>
                          <div className="sdh-insight" style={{ background: ins.bg, borderColor: ins.border }}>
                            <span className="sdh-insight-icon">{ins.icon}</span>
                            <div>
                              <div className="sdh-insight-title">{ins.title}</div>
                              <div className="sdh-insight-desc">{ins.desc}</div>
                            </div>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </div>
                </Col>
              </Row>

              <div style={{ height: 32 }} />
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}