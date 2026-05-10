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
import SellerNavbar from "../../components/SellerNavbar";
import DataTable from "../../components/DataTable";
import reportApi from "../../api/reportApi";
import orderApi from "../../api/order.api";
import toast from "react-hot-toast";
import { timeAgo, activityMeta } from "../../helper/Constraints";
import JWTService from "../../config/jwt.config";

// ── Formatters ─────────────────────────────────────────────────────────────────
const fmt = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
const fmtL = (n) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(1)}K` : `₹${n}`;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const PIE_COLORS = ["#3b82f6", "#60a5fa", "#93c5fd", "#2563eb", "#1d4ed8"];

// ── Custom Tooltip ─────────────────────────────────────────────────────────────
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

// ── Pie Label ──────────────────────────────────────────────────────────────────
const RADIAN = Math.PI / 180;
const PieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.06) return null;
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central"
      style={{ fontSize: ".65rem", fontWeight: 900, fontFamily: "Nunito" }}>
      {(percent * 100).toFixed(0)}%
    </text>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
export default function SellerDashboardHome() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [period, setPeriod] = useState("monthly");


  // ── Real chart data state ──
  const [monthlyChartData, setMonthlyChartData] = useState(
    MONTHS.map(m => ({ month: m, revenue: 0, orders: 0, returns: 0 }))
  );
  const [weeklyChartData, setWeeklyChartData] = useState(
    DAYS.map(d => ({ day: d, revenue: 0, orders: 0, returns: 0 }))
  );

  // ── Derived values ──
  const totalRevenue = products.reduce((s, p) => s + p.base_price * p.sold, 0);
  const avgRating = products.length
    ? (products.reduce((s, p) => s + Number(p.rating), 0) / products.length).toFixed(1)
    : "0.0";
  const outOfStock = products.filter(p => p.stock === 0).length;
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= 10).length;
  const totalSold = products.reduce((s, p) => s + p.sold, 0);

  const sidebarStats = [
    { icon: "📦", label: "Total Products", val: products.length },
    { icon: "💰", label: "Total Revenue", val: `₹${(totalRevenue / 100000).toFixed(1)}L` },
    { icon: "⭐", label: "Avg Rating", val: avgRating },
  ];

  // ── Fetch Products ──
  useEffect(() => {
    (async () => {
      setLoading(true);
      fetchRecentOrders();
      fetchActivity();
      try {
        const { data } = await productApi.getAllProducts();
        if (data?.data) {
          setProducts(
            data.data.map((p) => ({
              ...p,
              base_price: Number(p.base_price),
              old_price: p.old_price ? Number(p.old_price) : null,
              rating: Number(p.rating),
              reviews: Number(p.reviews || 0),
              sold: Number(p.sold || 0),
              stock: Number(p.stock || 0),
              tag: typeof p.tag === "string" ? p.tag.split(",").map(t => t.trim()).filter(Boolean) : (p.tag || []),
              color: typeof p.color === "string" ? p.color.split(",").map(c => c.trim()).filter(Boolean) : (p.color || []),
              image_url: Array.isArray(p.image_url) ? p.image_url : [],
            }))
          );
        }
      } catch (e) {
        console.error(e);
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Fetch Real Chart Data from Orders API ──
  useEffect(() => {
    (async () => {
      setChartLoading(true);
      try {
        const seller = JWTService.decodeTokenDetails();
        const res = await orderApi.getSellerOrders(seller.id);
        const orders = res.data || [];

        // ── Build Monthly Data ──────────────────────────────
        const monthMap = {};
        MONTHS.forEach(m => { monthMap[m] = { month: m, revenue: 0, orders: 0, returns: 0 }; });

        orders.forEach(order => {
          const date = new Date(order.created_time);
          const month = MONTHS[date.getMonth()];

          // Only current year
          if (date.getFullYear() !== new Date().getFullYear()) return;

          monthMap[month].orders += 1;
          monthMap[month].revenue += Number(order.subtotal || 0);
          if (order.status === "returned" || order.status === "cancelled") {
            monthMap[month].returns += 1;
          }
        });
        setMonthlyChartData(MONTHS.map(m => monthMap[m]));

        // ── Build Weekly Data (last 7 days) ────────────────
        const today = new Date();
        const weekMap = {};
        DAYS.forEach(d => { weekMap[d] = { day: d, revenue: 0, orders: 0, returns: 0 }; });

        orders.forEach(order => {
          const date = new Date(order.created_time);
          const diffDays = Math.floor((today - date) / (1000 * 60 * 60 * 24));
          if (diffDays > 6) return; // only last 7 days

          const dayName = DAYS[date.getDay()];
          weekMap[dayName].orders += 1;
          weekMap[dayName].revenue += Number(order.subtotal || 0);
          if (order.status === "returned" || order.status === "cancelled") {
            weekMap[dayName].returns += 1;
          }
        });
        setWeeklyChartData(DAYS.map(d => weekMap[d]));

      } catch (err) {
        console.error(err);
        toast.error("Failed to load chart data");
      } finally {
        setChartLoading(false);
      }
    })();
  }, []);

  // ── Fetch Recent Orders ──
  const fetchRecentOrders = async () => {
    try {
      const res = await reportApi.getRecentOrders();
      setRecentOrders((res.data || []).slice(0, 5));
    } catch (error) {
      console.error(error);
      toast.error("Failed to load recent orders");
    }
  };

  // ── Fetch Activity ──
  const fetchActivity = async () => {
    try {
      const res = await reportApi.getRecentActivities();
      setRecentActivity(res.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load recent activity");
    }
  };

  // ── Active Chart Data ──
  const chartData = period === "monthly" ? monthlyChartData : weeklyChartData;
  const xKey = period === "monthly" ? "month" : "day";

  // ── Chart summary stats ──
  const chartTotalRevenue = chartData.reduce((s, d) => s + d.revenue, 0);
  const chartTotalOrders = chartData.reduce((s, d) => s + d.orders, 0);
  const chartTotalReturns = chartData.reduce((s, d) => s + d.returns, 0);

  // ── KPI Cards ──
  const KPIS = [
    {
      icon: "💰", iconBg: "#fff3ee", label: "Total Revenue",
      value: fmtL(totalRevenue), delta: "+18%", trend: "up",
      sub: "vs last month", border: "#ffd3b8",
    },
    {
      icon: "🛒", iconBg: "#f0fdf4", label: "Total Orders",
      value: chartTotalOrders || recentOrders.length, delta: "+12%", trend: "up",
      sub: `${chartTotalReturns} returns`, border: "#bbf7d0",
    },
    {
      icon: "📦", iconBg: "#eff6ff", label: "Total Products",
      value: products.length, delta: "+3", trend: "up",
      sub: `${outOfStock} out of stock`, border: "#bfdbfe",
    },
    {
      icon: "🚀", iconBg: "#fdf4ff", label: "Units Sold",
      value: totalSold.toLocaleString(), delta: "+9%", trend: "up",
      sub: "lifetime total", border: "#e9d5ff",
    },
    {
      icon: "⭐", iconBg: "#fefce8", label: "Avg Rating",
      value: avgRating, delta: "+0.2", trend: "up",
      sub: `${products.reduce((s, p) => s + p.reviews, 0).toLocaleString()} reviews`,
      border: "#fef08a",
    },
    {
      icon: "⚠️", iconBg: "#fef2f2", label: "Low / Out Stock",
      value: `${lowStock} / ${outOfStock}`,
      delta: outOfStock > 0 ? "Action!" : "OK",
      trend: outOfStock > 0 ? "down" : "flat",
      sub: "needs restock", border: "#fecaca",
    },
  ];

  // ── Category Breakdown ──
  const categoryData = useMemo(() => {
    const map = {};

    products.forEach((p) => {
      const category = p?.category || "Other";

      if (!map[category]) {
        map[category] = {
          name: category,
          value: 0,
          ids: [],
        };
      }

      map[category].value +=
        Number(p?.base_price || 0) * Number(p?.sold || 0);

      if (p?.id) {
        map[category].ids.push(p.id);
      }
    });

    console.log("map", map);

    return Object.values(map)
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [products]);

  console.log("map", categoryData)

  // ── Stock Health ──
  const stockData = [
    { name: "Healthy", value: products.filter(p => p.stock > 15).length, fill: "#22c55e" },
    { name: "Low Stock", value: products.filter(p => p.stock > 0 && p.stock <= 15).length, fill: "#f59e0b" },
    { name: "Out", value: outOfStock, fill: "#ef4444" },
  ];

  // ── Rating Distribution ──
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

  // ── Top Products ──
  const topProducts = useMemo(() =>
    [...products]
      .sort((a, b) => (b.base_price * b.sold) - (a.base_price * a.sold))
      .slice(0, 5),
    [products]
  );
  const maxRev = topProducts[0] ? topProducts[0].base_price * topProducts[0].sold : 1;

  // ── Insights ──
  const INSIGHTS = useMemo(() => [
    {
      icon: "🔥", bg: "#fff3ee", border: "#ffd3b8",
      title: "Best Seller",
      desc: topProducts[0]
        ? `"${topProducts[0].title}" generated ${fmt(topProducts[0].base_price * topProducts[0].sold)} with ${topProducts[0].sold} units sold.`
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
      desc: `Products with 5+ images sell 30–50% more. Add more photos to your listings.`,
    },
  ], [topProducts, outOfStock]);

  // ── Activity ──
  const ACTIVITIES = recentActivity.map(item => ({
    icon: activityMeta[item.type]?.icon || "📌",
    id: item.id,
    type: activityMeta[item.type]?.type,
    bg: activityMeta[item.type]?.bg || "#f3f4f6",
    title: item.title,
    sub: item.sub,
    time: timeAgo(item.created_time),
  }));


  const handleCategoryClick = (type) => {
    navigate("/seller/products", {
      state: { category: type },
    });
  };


  // ════════════════════════════════════════════════════════
  return (
    <div className="sdh-page">
      {loading && <GlobalLoader />}

      <Container fluid className="p-0">
        <Row className="g-0" style={{ minHeight: "100vh" }}>
          {/* ── SIDEBAR ── */}
          <SellerSidebar stats={sidebarStats} />

          {/* ── MAIN ── */}
          <Col xs={12} className="pd-main" style={{ overflowY: "auto" }}>
            <SellerNavbar pageTitle="Dashboard" />
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


              <Row className="g-3 mb-4">
                <Col xl={8}>
                  <div className="sdh-card">

                    {/* Card Header */}
                    <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-3">
                      <div>
                        <div className="sdh-card-title">📈 Revenue & Orders</div>
                        <div className="sdh-card-sub">
                          {period === "monthly"
                            ? `${new Date().getFullYear()} — monthly breakdown`
                            : "Last 7 days — daily breakdown"}
                        </div>
                      </div>

                      {/* Period toggle + summary */}
                      <div className="d-flex align-items-center gap-3 flex-wrap">
                        {/* Summary chips */}
                        <div className="d-flex gap-2">
                          <div className="sdh-chart-chip orange">
                            <span>💰</span>
                            <span>{fmtL(chartTotalRevenue)}</span>
                          </div>
                          <div className="sdh-chart-chip blue">
                            <span>🛒</span>
                            <span>{chartTotalOrders} orders</span>
                          </div>
                          {chartTotalReturns > 0 && (
                            <div className="sdh-chart-chip red">
                              <span>↩️</span>
                              <span>{chartTotalReturns} returns</span>
                            </div>
                          )}
                        </div>

                        {/* Toggle buttons */}
                        <div className="sdh-period-toggle">
                          <button
                            className={period === "monthly" ? "active" : ""}
                            onClick={() => setPeriod("monthly")}
                          >
                            Monthly
                          </button>
                          <button
                            className={period === "weekly" ? "active" : ""}
                            onClick={() => setPeriod("weekly")}
                          >
                            Weekly
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Chart */}
                    {chartLoading ? (
                      <div className="sdh-chart-loading">
                        <div className="sdh-chart-skeleton">
                          {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="sdh-skel-bar" style={{ height: `${30 + Math.random() * 60}%`, animationDelay: `${i * 0.08}s` }} />
                          ))}
                        </div>
                        <p className="sdh-chart-loading-text">Loading chart data…</p>
                      </div>
                    ) : (
                      <div className="sdh-chart-wrap" style={{ height: 280 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                            <defs>
                              <linearGradient id="gradRev" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                              </linearGradient>
                              <linearGradient id="gradOrd" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f8" vertical={false} />
                            <XAxis
                              dataKey={xKey}
                              tick={{ fontSize: 11, fontFamily: "Nunito", fontWeight: 700, fill: "#9ca3af" }}
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
                              yAxisId="orders"
                              orientation="right"
                              tick={{ fontSize: 10, fontFamily: "Nunito", fontWeight: 700, fill: "#9ca3af" }}
                              axisLine={false} tickLine={false}
                              width={30}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                              wrapperStyle={{ fontSize: ".75rem", fontFamily: "Nunito", fontWeight: 800, paddingTop: 10 }}
                            />
                            <Area
                              yAxisId="revenue"
                              type="monotone" dataKey="revenue"
                              stroke="var(--primary)" strokeWidth={2.5}
                              fill="url(#gradRev)" dot={false}
                              activeDot={{ r: 5, fill: "var(--primary)" }}
                            />
                            <Area
                              yAxisId="orders"
                              type="monotone" dataKey="orders"
                              stroke="#3b82f6" strokeWidth={2}
                              fill="url(#gradOrd)" dot={false}
                              activeDot={{ r: 4, fill: "#3b82f6" }}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    {/* Zero-data message */}
                    {!chartLoading && chartTotalRevenue === 0 && chartTotalOrders === 0 && (
                      <div className="sdh-chart-empty">
                        <span style={{ fontSize: "1.8rem" }}>📊</span>
                        <p>No {period === "monthly" ? "data for this year" : "orders in the last 7 days"} yet.</p>
                        <span style={{ fontSize: ".78rem", color: "var(--muted)" }}>Orders will appear here once placed.</span>
                      </div>
                    )}
                  </div>
                </Col>

                {/* ── Category Pie ── */}
                <Col xl={4}>
                  <div className="sdh-card">
                    <div className="sdh-card-title">🥧 Revenue by Category</div>
                    <div className="sdh-card-sub">Top {categoryData.length} categories</div>
                    {console.log("categoryData", categoryData)}
                    {categoryData.length > 0 ? (
                      <>
                        <div className="sdh-chart-wrap" style={{ height: 180 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={categoryData} cx="50%" cy="50%"
                                onClick={(ele) => handleCategoryClick(ele.name)}
                                style={{cursor:'pointer'}}
                                innerRadius={48} outerRadius={80}
                                paddingAngle={3} dataKey="value"
                                labelLine={false} label={PieLabel}
                              >
                                {categoryData.map((_, i) => (
                                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip
                                formatter={(v) => fmtL(v)}
                                contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,.15)", fontFamily: "Nunito", fontSize: ".8rem" }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="mt-2">
                          {categoryData.map((c, i) => (
                            <div key={c.name} className="sdh-cat-pill" style={{ cursor: 'pointer' }} onClick={() => handleCategoryClick(c.name)}>
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

              {/* ── BAR CHART + STOCK RADIAL ── */}
              <Row className="g-3 mb-4">
                <Col md={7}>
                  <div className="sdh-card">
                    <div className="sdh-card-title">🛒 Orders &amp; Returns Overview</div>
                    <div className="sdh-card-sub">
                      {period === "monthly" ? "Monthly" : "Weekly"} — Orders vs Returns
                    </div>
                    <div className="sdh-chart-wrap" style={{ height: 220 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }} barGap={4}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f8" vertical={false} />
                          <XAxis dataKey={xKey} tick={{ fontSize: 10, fontFamily: "Nunito", fontWeight: 700, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 10, fontFamily: "Nunito", fontWeight: 700, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend wrapperStyle={{ fontSize: ".72rem", fontFamily: "Nunito", fontWeight: 800 }} />
                          <Bar dataKey="orders" fill="var(--primary)" radius={[5, 5, 0, 0]} maxBarSize={28} />
                          <Bar dataKey="returns" fill="#e8eaf6" radius={[5, 5, 0, 0]} maxBarSize={28} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </Col>

                {/* Stock Health Radial */}
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
                      <div style={{ textAlign: "center", padding: "30px 0", color: "var(--muted)", fontSize: ".85rem" }}>No products yet</div>
                    ) : (
                      topProducts.map((p, i) => (
                        <div key={p.id} className="sdh-top-product" onClick={() => navigate(`/seller/product/${p.id}`)} style={{ cursor: "pointer" }}>
                          <div className={`sdh-top-product-rank ${i === 1 ? "silver" : i === 2 ? "bronze" : ""}`}>
                            {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                          </div>
                          {p.image_url[0]
                            ? <img src={p.image_url[0]} alt={p.title} className="sdh-top-product-img" />
                            : <div className="sdh-top-product-img-placeholder">📦</div>}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="sdh-top-product-name">{p.title}</div>
                            <div className="sdh-top-product-meta">⭐ {p.rating} · {p.sold} sold · Stock: {p.stock}</div>
                            <div className="sdh-progress-bar-wrap">
                              <div className="sdh-progress-bar-fill" style={{ width: `${((p.base_price * p.sold) / maxRev) * 100}%` }} />
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

                <Col md={5}>
                  <div className="sdh-card">
                    <div className="sdh-card-title">⭐ Rating Distribution</div>
                    <div className="sdh-card-sub">Avg: <span style={{ color: "var(--warning)", fontWeight: 900 }}>{avgRating}</span> / 5</div>
                    <div style={{ textAlign: "center", margin: "8px 0 16px" }}>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: "3rem", fontWeight: 800, color: "var(--warning)", lineHeight: 1 }}>{avgRating}</div>
                      <div style={{ fontSize: "1.2rem", letterSpacing: 2 }}>
                        {"★".repeat(Math.round(avgRating))}{"☆".repeat(5 - Math.round(avgRating))}
                      </div>
                      <div style={{ fontSize: ".72rem", color: "var(--muted)", fontWeight: 700 }}>
                        {products.reduce((s, p) => s + (p.review_count || 0), 0).toLocaleString()} total reviews
                      </div>
                    </div>
                    {console.log("ratingDist", ratingDist)}
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
                        <div className="sdh-card-sub">Last {recentOrders.length} orders</div>
                      </div>
                      <button
                        style={{ background: "none", border: "1.5px solid var(--border)", borderRadius: 8, padding: "5px 12px", fontSize: ".75rem", fontWeight: 800, color: "var(--muted)", cursor: "pointer", fontFamily: "Nunito" }}
                        onClick={() => navigate("/seller/orders")}
                      >
                        View All →
                      </button>
                    </div>
                    <div className="mt-2">
                      <DataTable isSearch={false} tableData={recentOrders} isHeader={false} />
                    </div>
                  </div>
                </Col>

                <Col md={5}>
                  <div className="sdh-card">
                    <div className="sdh-card-title">🔔 Recent Activity</div>
                    <div className="sdh-card-sub">Latest events on your store</div>
                    {ACTIVITIES.slice(0, 5).map((a, i) => (
                      <div key={i} className="sdh-activity-item" style={{ animationDelay: `${i * 0.05}s`, backgroundColor: "" }} onClick={() => navigate(`/seller/${a.type}/${a.id}`)}>
                        <div className="sdh-activity-dot" style={{ background: a.bg }}>{a.icon}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="sdh-activity-title">{a.title}</div>
                          <div className="sdh-activity-sub" style={{ color: "#196df3ff", cursor: 'pointer' }}>{a.sub}</div>
                        </div>
                        <div className="sdh-activity-time">{a.time}</div>
                      </div>
                    ))}
                    {ACTIVITIES.length === 0 && (
                      <div style={{ textAlign: "center", padding: "20px 0", color: "var(--muted)", fontSize: ".82rem", fontWeight: 600 }}>
                        No recent activity
                      </div>
                    )}
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