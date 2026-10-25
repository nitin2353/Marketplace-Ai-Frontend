import React, { useEffect, useState, useMemo, useRef } from "react";
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
import { FORMATED_DATE_TIME } from "../../helper/GlobalHelper.jsx";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

const SellerPayments = () => {
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [chartData, setChartData] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const receiptRef = useRef(null);
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


    const handlePrintReceipt = () => {
        const receiptElement = receiptRef.current;

        if (!receiptElement) {
            toast.error("Receipt content not found");
            return;
        }

        const printWindow = window.open(
            "",
            "_blank",
            "width=900,height=700"
        );

        if (!printWindow) {
            toast.error("Please allow pop-ups to print the receipt");
            return;
        }

        printWindow.document.open();
        printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>ShopEase - Payment Receipt</title>
            <meta charset="UTF-8" />
            <style>
                @page {
                    size: A4 portrait;
                    margin: 12mm;
                }

                * {
                    box-sizing: border-box;
                }

                body {
                    font-family: Arial, sans-serif;
                    color: #111827;
                    background: #ffffff;
                    margin: 0;
                    padding: 0;
                    font-size: 13px;
                }

                .receipt-print-area {
                    width: 100%;
                    padding: 10px;
                }

                .receipt-header {
                    text-align: center;
                    margin-bottom: 25px;
                    padding-bottom: 15px;
                    border-bottom: 1px solid #d1d5db;
                }

                .receipt-header h3 {
                    font-size: 26px;
                    margin: 0 0 12px;
                    font-weight: bold;
                }

                .receipt-header h5 {
                    font-size: 18px;
                    margin: 10px 0;
                }

                .receipt-header p {
                    margin: 8px 0 0;
                    color: #4b5563;
                }

                .row {
                    display: flex;
                    flex-wrap: nowrap;
                    gap: 18px;
                    align-items: stretch;
                }

                .col-md-6 {
                    width: 50%;
                    flex: 1 1 50%;
                    min-width: 0;
                }

                .receipt-section {
                    height: 100%;
                    padding: 16px;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    overflow-wrap: anywhere;
                }

                .receipt-section h6 {
                    font-size: 15px;
                    margin: 0 0 18px;
                    padding-bottom: 10px;
                    border-bottom: 1px solid #e5e7eb;
                }

                .receipt-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 12px;
                    margin-bottom: 15px;
                    line-height: 1.5;
                }

                .receipt-row span {
                    color: #4b5563;
                    flex: 0 0 42%;
                }

                .receipt-row strong {
                    flex: 1;
                    text-align: right;
                    overflow-wrap: anywhere;
                    word-break: break-word;
                }

                .receipt-total {
                    font-size: 15px;
                    color: #15803d;
                }

                hr {
                    border: 0;
                    border-top: 1px solid #d1d5db;
                    margin: 15px 0;
                }

                .receipt-footer {
                    text-align: center;
                    margin-top: 25px;
                    padding-top: 15px;
                    border-top: 1px solid #d1d5db;
                    font-weight: bold;
                }

                .receipt-section,
                .receipt-header,
                .receipt-footer,
                .receipt-row {
                    break-inside: avoid;
                }

                @media print {
                    body {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                }
            </style>
        </head>
        <body>
            ${receiptElement.outerHTML}
        </body>
        </html>
    `);
        printWindow.document.close();

        printWindow.onload = () => {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        };
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
            headers?.map(escapeCSV).join(","),
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
            render: (val) => val ? FORMATED_DATE_TIME(val) : "N/A",
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
                <Badge bg={val === '"eligible"' ? 'success' : 'warning'} className="px-2 py-1">
                    {val.toUpperCase()}
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
                                <Col md={3}>
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
                                <Col md={3}>
                                    <Card className="border-0 shadow-sm h-100 overflow-hidden" style={{ borderRadius: '15px' }}>
                                        <Card.Body className="p-4">
                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                <div className="p-3 bg-success bg-opacity-10 rounded-3 text-success">
                                                    <FaCheckCircle size={24} />
                                                </div>
                                                <div className="text-success small fw-bold">Due</div>
                                            </div>
                                            <h6 className="text-muted mb-1 text-uppercase fw-bold" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>Available Balance</h6>
                                            <h3 className="fw-bold mb-0">₹{Number(summary?.available_balance || 0).toLocaleString()}</h3>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={3}>
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
                                <Col md={3}>
                                    <Card className="border-0 shadow-sm h-100 overflow-hidden" style={{ borderRadius: '15px' }}>
                                        <Card.Body className="p-4">
                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                <div className="p-3 bg-success bg-opacity-10 rounded-3 text-danger">
                                                    <FaCheckCircle size={24} />
                                                </div>
                                                <div className="text-danger small fw-bold">Settled</div>
                                            </div>
                                            <h6 className="text-muted mb-1 text-uppercase fw-bold" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>Settlement Amount</h6>
                                            <h3 className="fw-bold mb-0">₹{Number(summary?.settlement_amount || 0).toLocaleString()}</h3>
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
                        <div ref={receiptRef} className="receipt-print-area">
                            <div className="receipt-header">
                                <h3>ShopEase</h3>
                                <hr />
                                <h5>Payment Receipt</h5>
                                <p>
                                    Order: {selectedTransaction.order_number || "N/A"}
                                </p>
                            </div>

                            <Row className="g-4">
                                <Col md={6}>
                                    <div className="receipt-section">
                                        <h6 className="fw-bold">Order Information</h6>

                                        <div className="receipt-row">
                                            <span>Order Number : </span>
                                            <strong>
                                                {selectedTransaction.order_number || "N/A"}
                                            </strong>
                                        </div>

                                        <div className="receipt-row">
                                            <span>Date : </span>
                                            <strong>
                                                {selectedTransaction.created_at
                                                    ? new Date(
                                                        selectedTransaction.created_at
                                                    ).toLocaleString("en-IN")
                                                    : "N/A"}
                                            </strong>
                                        </div>

                                        <div className="receipt-row">
                                            <span>Customer : </span>
                                            <strong>
                                                {selectedTransaction.customer_name || "N/A"}
                                            </strong>
                                        </div>

                                        <div className="receipt-row">
                                            <span>Email : </span>
                                            <strong>
                                                {selectedTransaction.customer_email || "N/A"}
                                            </strong>
                                        </div>

                                        <div className="receipt-row">
                                            <span>Payment Method : </span>
                                            <strong>
                                                {selectedTransaction.payment_method
                                                    ?.toUpperCase() || "N/A"}
                                            </strong>
                                        </div>

                                        <div className="receipt-row">
                                            <span>Shipping Address : </span>
                                            <strong>
                                                {[
                                                    selectedTransaction.address_line_1,
                                                    selectedTransaction.city,
                                                    selectedTransaction.state,
                                                    selectedTransaction.pincode
                                                ].filter(Boolean).join(", ") || "N/A"}
                                            </strong>
                                        </div>
                                    </div>
                                </Col>

                                <Col md={6}>
                                    <div className="receipt-section">
                                        <h6 className="fw-bold">Earnings Breakdown</h6>

                                        <div className="receipt-row">
                                            <span>Total Amount : </span>
                                            <strong>
                                                ₹{Number(
                                                    selectedTransaction.amount || 0
                                                ).toLocaleString("en-IN", {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                })}
                                            </strong>
                                        </div>

                                        <div className="receipt-row">
                                            <span>Platform Fee : </span>
                                            <strong>
                                                ₹{Number(
                                                    selectedTransaction.platform_fee || 0
                                                ).toLocaleString("en-IN", {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                })}
                                            </strong>
                                        </div>

                                        <div className="receipt-row">
                                            <span>Refund Amount : </span>
                                            <strong>
                                                ₹{Number(
                                                    selectedTransaction.refund_amount || 0
                                                ).toLocaleString("en-IN", {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                })}
                                            </strong>
                                        </div>

                                        <hr />

                                        <div className="receipt-row receipt-total">
                                            <span>My Earnings : </span>
                                            <strong>
                                                ₹{Number(
                                                    selectedTransaction.seller_earning || 0
                                                ).toLocaleString("en-IN", {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                })}
                                            </strong>
                                        </div>

                                        <div className="receipt-row">
                                            <span>Settlement Status : </span>
                                            <strong>
                                                {selectedTransaction.settlement_status
                                                    ?.toUpperCase() || "PENDING"}
                                            </strong>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                            <hr />
                            <div className="receipt-footer fw-bold">
                                Thank you for using ShopEase.
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button variant="secondary" onClick={() => setShowDetailModal(false)}>Close</Button>

                    <Button
                        variant="primary"
                        onClick={handlePrintReceipt}
                    >
                        <FaDownload className="me-2" />
                        Print Receipt
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default SellerPayments;
