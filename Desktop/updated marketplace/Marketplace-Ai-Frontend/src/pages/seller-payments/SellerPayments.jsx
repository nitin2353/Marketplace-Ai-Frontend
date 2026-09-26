import React, { useEffect, useState, useMemo } from "react";
import { Col, Container, Row, Card, Badge, Button, Modal, Form } from "react-bootstrap";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, BarChart, Bar
} from "recharts";
import { FaDownload, FaFilter, FaEye, FaArrowUp, FaArrowDown, FaWallet, FaCheckCircle, FaClock, FaUndo } from "react-icons/fa";
import SellerSidebar from "../../components/SellerSidebar.jsx";
import SellerNavbar from "../../components/SellerNavbar.jsx";
import DataTable from "../../components/DataTable";
import paymentApi from "../../api/payment.api";
import GlobalLoader from "../../components/GlobalLoader";
import toast from "react-hot-toast";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

const SellerPayments = () => {
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [chartData, setChartData] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    // Filters
    const [filters, setFilters] = useState({
        status: "",
        settlement_status: "",
        payment_method: "",
        start_date: "",
        end_date: ""
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [summaryRes, transRes, chartRes] = await Promise.all([
                paymentApi.getSellerSummary(),
                paymentApi.getSellerTransactions(filters),
                paymentApi.getSellerChartData()
            ]);

            setSummary(summaryRes.data);

            // Map data for DataTable compatibility
            const mappedTransactions = (transRes.data || []).map(t => ({
                ...t,
                id: t.id, // Keep original ID
                order_id: t.order_id, // For search compatibility
                buyer: t.customer_name,
                status: t.payment_status || 'pending'
            }));

            setTransactions(mappedTransactions);
            setChartData(chartRes.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load payment data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filters]);

    const handleViewDetail = async (id) => {
        try {
            const res = await paymentApi.getSellerTransactionById(id);
            console.log("res.data", res.data)
            setSelectedTransaction(res.data);
            setShowDetailModal(true);
        } catch (err) {
            toast.error("Failed to load transaction details");
        }
    };

    const handleExportCSV = () => {
        if (!Array.isArray(transactions) || transactions.length === 0) {
            toast.error("No transactions available to export");
            return;
        }

        const escapeCSV = (value) => {
            if (value === null || value === undefined) return "";

            const str = String(value).replace(/"/g, '""');

            return `"${str}"`;
        };

        const formatDate = (value) => {
            if (!value) return "";
            const d = new Date(value);
            return Number.isNaN(d.getTime()) ? "" : d.toLocaleString("en-IN");
        };

        const headers = [
            "Order Number",
            "Date",
            "Customer",
            "Payment Method",
            "Amount",
            "Platform Fee",
            "Seller Earning",
            "Payment Status",
            "Settlement Status",
        ];

        const rows = transactions.map((t) => [
            t?.order_number || "",
            formatDate(t?.created_time || t?.created_at),
            t?.customer_name || t?.buyer || "",
            String(t?.payment_method || "").toUpperCase(),
            Number(t?.amount || 0).toFixed(2),
            Number(t?.platform_fee || 0).toFixed(2),
            Number(t?.seller_earning || 0).toFixed(2),
            String(t?.payment_status || t?.status || "").toUpperCase(),
            String(t?.settlement_status || "").toUpperCase(),
        ]);

        const csvContent = [
            headers.map(escapeCSV).join(","),
            ...rows.map((row) => row.map(escapeCSV).join(",")),
        ].join("\n");

        const blob = new Blob(["\uFEFF" + csvContent], {
            type: "text/csv;charset=utf-8;",
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = `seller_transactions_${Date.now()}.csv`;
        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success("CSV downloaded successfully");
    };
    const columns = [
        {
            label: "Order Number",
            key: "order_number",
            sortable: true,
            render: (val) => <span className="fw-bold text-primary">{val}</span>
        },
        {
            label: "Date",
            key: "created_time",
            render: (val) => val ? new Date(val).toLocaleDateString() : "N/A",
            sortable: true
        },
        { label: "Customer", key: "customer_name" },
        {
            label: "Method",
            key: "payment_method",
            render: (val) => <Badge bg="light" text="dark" className="text-uppercase border">{val || 'N/A'}</Badge>
        },
        {
            label: "Amount",
            key: "amount",
            render: (val) => <span className="fw-bold">₹{Number(val || 0).toLocaleString()}</span>,
            sortable: true
        },
        {
            label: "My Earning",
            key: "seller_earning",
            render: (val) => <span className="text-success fw-bold">₹{Number(val || 0).toLocaleString()}</span>,
            sortable: true
        },
        {
            label: "Settlement",
            key: "settlement_status",
            render: (val) => (
                <Badge bg={val === 'paid' ? 'success' : 'warning'} className="px-2 py-1">
                    {val === 'paid' ? 'Settled' : 'Pending'}
                </Badge>
            )
        },
        {
            label: "Action",
            key: "id",
            render: (val, row) => (
                <Button variant="outline-primary" size="sm" onClick={() => handleViewDetail(row.id)}>
                    <FaEye />
                </Button>
            )
        }
    ];


    const monthlyRevenueData = useMemo(() => {
        const data = Array.isArray(chartData?.monthly_revenue)
            ? chartData.monthly_revenue
            : [];

        return data.map((item) => ({
            label: item.label || item.month || "N/A",
            value: Number(item.value || item.earning || item.revenue || 0),
        }));
    }, [chartData]);

    const paymentMethodData = useMemo(() => {
        const data = Array.isArray(chartData?.payment_methods)
            ? chartData.payment_methods
            : [];

        return data
            .map((item) => ({
                name: String(item.name || item.payment_method || "Unknown").toUpperCase(),
                value: Number(item.value || item.count || item.total || 0),
            }))
            .filter((item) => item.value > 0);
    }, [chartData]);

    const formatCurrency = (value) => {
        const n = Number(value || 0);

        if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
        if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;

        return `₹${n}`;
    };

    if (loading && !summary) return <GlobalLoader />;

    return (
        <div className="sdh-page">
            <Container fluid className="p-0">
                <Row className="g-0">
                    <SellerSidebar />
                    <Col xs={12} className="pd-main">
                        <SellerNavbar pageTitle="Payments & Earnings" />

                        <div className="p-3 p-md-4">
                            {/* Summary Cards */}
                            <Row className="g-3 mb-4">
                                <Col md={4}>
                                    <Card className="border-0 shadow-sm h-100 overflow-hidden" style={{ borderRadius: '15px' }}>
                                        <Card.Body className="p-4">
                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                <div className="p-3 bg-primary bg-opacity-10 rounded-3 text-primary">
                                                    <FaWallet size={24} />
                                                </div>
                                                <Badge bg="success" className="rounded-pill px-2 py-1">
                                                    <FaArrowUp /> 12%
                                                </Badge>
                                            </div>
                                            <h6 className="text-muted mb-1 text-uppercase fw-bold" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>Total Revenue</h6>
                                            <h3 className="fw-bold mb-0">₹{Number(summary?.total_revenue || 0).toLocaleString()}</h3>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={4}>
                                    <Card className="border-0 shadow-sm h-100 overflow-hidden" style={{ borderRadius: '15px' }}>
                                        <Card.Body className="p-4">
                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                <div className="p-3 bg-success bg-opacity-10 rounded-3 text-success">
                                                    <FaCheckCircle size={24} />
                                                </div>
                                                <div className="text-success small fw-bold">Settled</div>
                                            </div>
                                            <h6 className="text-muted mb-1 text-uppercase fw-bold" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>Available Balance</h6>
                                            <h3 className="fw-bold mb-0">₹{Number(summary?.available_balance || 0).toLocaleString()}</h3>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={4}>
                                    <Card className="border-0 shadow-sm h-100 overflow-hidden" style={{ borderRadius: '15px' }}>
                                        <Card.Body className="p-4">
                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                <div className="p-3 bg-warning bg-opacity-10 rounded-3 text-warning">
                                                    <FaClock size={24} />
                                                </div>
                                                <div className="text-warning small fw-bold">Processing</div>
                                            </div>
                                            <h6 className="text-muted mb-1 text-uppercase fw-bold" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>Pending Payouts</h6>
                                            <h3 className="fw-bold mb-0">₹{Number(summary?.pending_balance || 0).toLocaleString()}</h3>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                {/* <Col md={3}>
                                    <Card className="border-0 shadow-sm h-100 overflow-hidden" style={{ borderRadius: '15px' }}>
                                        <Card.Body className="p-4">
                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                <div className="p-3 bg-danger bg-opacity-10 rounded-3 text-danger">
                                                    <FaUndo size={24} />
                                                </div>
                                                <div className="text-danger small fw-bold">Returned</div>
                                            </div>
                                            <h6 className="text-muted mb-1 text-uppercase fw-bold" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>Refunded Amount</h6>
                                            <h3 className="fw-bold mb-0">₹{Number(summary?.refunded_amount || 0).toLocaleString()}</h3>
                                        </Card.Body>
                                    </Card>
                                </Col> */}
                            </Row>

                            {/* Charts Row */}
                            <Row className="g-3 mb-4">
                                <Col lg={8}>
                                    <Card className="border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                                        <Card.Body className="p-4">
                                            <h5 className="fw-bold mb-4">Earnings Overview</h5>
                                            <div style={{ height: '300px' }}>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart
                                                        data={monthlyRevenueData}
                                                        margin={{ top: 10, right: 20, left: 5, bottom: 5 }}
                                                    >
                                                        <defs>
                                                            <linearGradient id="colorEarning" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                                                            </linearGradient>
                                                        </defs>

                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />

                                                        <XAxis
                                                            dataKey="label"
                                                            axisLine={false}
                                                            tickLine={false}
                                                            tick={{ fill: "#64748b", fontSize: 11 }}
                                                        />

                                                        <YAxis
                                                            axisLine={false}
                                                            tickLine={false}
                                                            tick={{ fill: "#64748b", fontSize: 11 }}
                                                            tickFormatter={formatCurrency}
                                                            width={45}
                                                        />

                                                        <Tooltip
                                                            cursor={{ stroke: "#3b82f6", strokeWidth: 1 }}
                                                            contentStyle={{
                                                                borderRadius: "12px",
                                                                border: "1px solid #e5e7eb",
                                                                boxShadow: "0 8px 24px rgba(15,23,42,0.12)",
                                                            }}
                                                            formatter={(value) => [
                                                                `₹${Number(value || 0).toLocaleString("en-IN")}`,
                                                                "Earnings",
                                                            ]}
                                                        />

                                                        <Area
                                                            type="monotone"
                                                            dataKey="value"
                                                            stroke="#3b82f6"
                                                            strokeWidth={3}
                                                            fill="url(#colorEarning)"
                                                            dot={{ r: 4, strokeWidth: 2 }}
                                                            activeDot={{ r: 6 }}
                                                        />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col lg={4}>
                                    <Card className="border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                                        <Card.Body className="p-4">
                                            <h5 className="fw-bold mb-4">Payment Methods</h5>
                                            <div style={{ height: '300px' }}>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                                                        <Pie
                                                            data={paymentMethodData}
                                                            cx="50%"
                                                            cy="45%"
                                                            innerRadius={55}
                                                            outerRadius={82}
                                                            paddingAngle={4}
                                                            dataKey="value"
                                                            nameKey="name"
                                                        >
                                                            {paymentMethodData.map((entry, index) => (
                                                                <Cell
                                                                    key={`cell-${index}`}
                                                                    fill={COLORS[index % COLORS.length]}
                                                                />
                                                            ))}
                                                        </Pie>

                                                        <Tooltip
                                                            formatter={(value, name) => [
                                                                Number(value || 0).toLocaleString("en-IN"),
                                                                name,
                                                            ]}
                                                            contentStyle={{
                                                                borderRadius: "12px",
                                                                border: "1px solid #e5e7eb",
                                                                boxShadow: "0 8px 24px rgba(15,23,42,0.12)",
                                                            }}
                                                        />

                                                        <Legend
                                                            verticalAlign="bottom"
                                                            height={45}
                                                            iconType="circle"
                                                            formatter={(value) => (
                                                                <span style={{ color: "#475569", fontSize: 12 }}>
                                                                    {value}
                                                                </span>
                                                            )}
                                                        />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>

                            {/* Filters & Transactions */}
                            <Card className="border-0 shadow-sm overflow-hidden" style={{ borderRadius: '15px' }}>
                                <Card.Header className="bg-white p-4 border-0">
                                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                                        <h5 className="fw-bold mb-0">Transaction History</h5>
                                        <div className="d-flex gap-2">
                                            <Button variant="outline-primary" onClick={handleExportCSV}>
                                                <FaDownload className="me-2" /> Export CSV
                                            </Button>
                                        </div>
                                    </div>

                                    <Row className="mt-4 g-2">
                                        <Col md={3}>
                                            <Form.Select
                                                value={filters.payment_method}
                                                onChange={(e) => setFilters({ ...filters, payment_method: e.target.value })}
                                                className="border-0 shadow-sm"
                                            >
                                                <option value="">All Payment Methods</option>
                                                <option value="cod">Cash On Delivery (COD)</option>
                                                <option value="wallet">Wallet</option>
                                                <option value="upi">UPI / Online</option>
                                                <option value="netbanking">Net Banking</option>
                                                <option value="card">Card Payment</option>
                                            </Form.Select>
                                        </Col>
                                        <Col md={3}>
                                            <Form.Select
                                                value={filters.settlement_status}
                                                onChange={(e) => setFilters({ ...filters, settlement_status: e.target.value })}
                                            >
                                                <option value="">All Settlement Status</option>
                                                <option value="pending">Pending</option>
                                                <option value="paid">Settled</option>
                                            </Form.Select>
                                        </Col>
                                        <Col md={3}>
                                            <Form.Control
                                                type="date"
                                                placeholder="Start Date"
                                                value={filters.start_date}
                                                onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                                            />
                                        </Col>
                                        <Col md={3}>
                                            <Form.Control
                                                type="date"
                                                placeholder="End Date"
                                                value={filters.end_date}
                                                onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                                            />
                                        </Col>
                                    </Row>
                                </Card.Header>
                                <Card.Body className="p-0">
                                    <DataTable
                                        tableData={transactions}
                                        columns={columns}
                                        isSearch={true}
                                        searchPlaceholder="Search by order customer name..."
                                    />
                                </Card.Body>
                            </Card>
                        </div>
                    </Col>
                </Row>
            </Container>
            {/* Detail Modal */}
            <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} centered size="lg">
                <Modal.Header closeButton className="border-0">
                    <Modal.Title className="fw-bold">Transaction Details</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    {selectedTransaction && (
                        <Row className="g-4">
                            <Col md={6}>
                                <div className="mb-4">
                                    <label className="text-muted small text-uppercase fw-bold mb-1">Order Information</label>
                                    <div className="h5 fw-bold mb-0">{selectedTransaction.order_number}</div>
                                    <div className="text-muted small">{new Date(selectedTransaction.created_at).toLocaleString()}</div>
                                </div>
                                <div className="mb-4">
                                    <label className="text-muted small text-uppercase fw-bold mb-1">Customer</label>
                                    <div className="fw-bold">{selectedTransaction.customer_name}</div>
                                    <div className="text-muted small">{selectedTransaction.customer_email}</div>
                                </div>
                                <div>
                                    <label className="text-muted small text-uppercase fw-bold mb-1">Shipping Address</label>
                                    <div className="small">
                                        {selectedTransaction.address_line_1}<br />
                                        {selectedTransaction.city}, {selectedTransaction.state} - {selectedTransaction.pincode}
                                    </div>
                                </div>
                            </Col>
                            <Col md={6} className="bg-light p-4 rounded-4">
                                <label className="text-muted small text-uppercase fw-bold mb-3">Earnings Breakdown</label>
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Total Amount</span>
                                    <span className="fw-bold">₹{Number(selectedTransaction.amount).toLocaleString()}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-2 text-danger">
                                    <span>Platform Fee (10%)</span>
                                    <span>- ₹{Number(selectedTransaction.platform_fee).toLocaleString()}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-3 text-danger">
                                    <span>Refund Amount</span>
                                    <span>- ₹{Number(selectedTransaction.refund_amount || 0).toLocaleString()}</span>
                                </div>
                                <hr />
                                <div className="d-flex justify-content-between h4 fw-bold text-success mb-0">
                                    <span>My Earnings</span>
                                    <span>₹{Number(selectedTransaction.seller_earning).toLocaleString()}</span>
                                </div>

                                <div className="mt-4 pt-3 border-top">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className="small text-muted">Settlement Status</span>
                                        <Badge bg={selectedTransaction.settlement_status === 'paid' ? 'success' : 'warning'}>
                                            {selectedTransaction.settlement_status?.toUpperCase()}
                                        </Badge>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    )}
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button variant="secondary" onClick={() => setShowDetailModal(false)}>Close</Button>
                    <Button variant="primary" onClick={() => window.print()}>Print Receipt</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default SellerPayments;
