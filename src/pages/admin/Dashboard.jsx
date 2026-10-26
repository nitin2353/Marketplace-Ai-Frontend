import {
    Alert,
    Badge,
    Button,
    Form,
    Modal,
    Spinner,
    Stack,
} from "react-bootstrap";
import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../../components/DataTable";
import { apiRequest, updateSellerStatusApi } from "../../api/admin.api";
import JWTService from "../../config/jwt.config";
import toast from "react-hot-toast";


const formatCurrency = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleDateString("en-IN");
};

const getStatusColor = (status) => {
    switch (String(status || "").toLowerCase()) {
        case "active":
        case "paid":
        case "success":
        case "completed":
            return "success";

        case "inactive":
        case "cancelled":
        case "canceled":
            return "secondary";

        case "pending":
            return "warning";

        case "rejected":
        case "failed":
        case "overdue":
            return "danger";

        default:
            return "info";
    }
};




const Dashboard = () => {
    const [sellers, setSellers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedSeller, setSelectedSeller] = useState(null);
    const [paymentAmount, setPaymentAmount] = useState("");
    const navigate = useNavigate();



    const financialOverview = useMemo(() => {
        const totals = sellers.reduce(
            (acc, seller) => {
                acc.totalRevenue += Number(seller.total_revenue || 0);
                acc.totalDiscount += Number(
                    seller.total_discount_amount || 0
                );
                acc.platformFees += Number(
                    seller.total_platform_fee || 0
                );
                acc.totalPaid += Number(seller.total_paid_amount || 0);
                acc.pendingBalance += Number(
                    seller.pending_balance || 0
                );
                acc.refunds += Number(seller.refunded_amount || 0);
                acc.availableBalance += Number(
                    seller.available_balance || 0
                );
                acc.totalOrders += Number(seller.total_orders || 0);
                acc.paidOrders += Number(seller.paid_orders || 0);
                acc.pendingOrders += Number(seller.pending_orders || 0);

                return acc;
            },
            {
                totalRevenue: 0,
                totalDiscount: 0,
                platformFees: 0,
                totalPaid: 0,
                pendingBalance: 0,
                refunds: 0,
                availableBalance: 0,
                totalOrders: 0,
                paidOrders: 0,
                pendingOrders: 0,
            }
        );

        return totals;
    }, [sellers]);



    const overviewCards = [
        {
            title: "Total Sales",
            value: formatCurrency(financialOverview.totalRevenue),
            description: "Sales recorded for sellers",
            color: "primary",
        },
        {
            title: "Total Discount Given",
            value: formatCurrency(financialOverview.totalDiscount),
            description: "Discount recorded on orders",
            color: "warning",
        },
        {
            title: "Platform Earnings ( - discount)",
            value: formatCurrency(financialOverview.platformFees - financialOverview.totalDiscount),
            description: "Platform fees / commission",
            color: "success",
        },
        {
            title: "Paid to Sellers",
            value: formatCurrency(financialOverview.totalPaid),
            description: "Payments recorded by admin",
            color: "info",
        },
        {
            title: "Pending Seller Payments",
            value: formatCurrency(financialOverview.pendingBalance),
            description: "Outstanding seller balance",
            color: "danger",
        },
        {
            title: "Total Refunds",
            value: formatCurrency(financialOverview.refunds),
            description: "Refund amount recorded",
            color: "secondary",
        },
        {
            title: "Available Seller Balance",
            value: formatCurrency(financialOverview.availableBalance),
            description: "Balance available to sellers",
            color: "dark",
        },
        {
            title: "Total Orders",
            value: financialOverview.totalOrders.toLocaleString("en-IN"),
            description: `${financialOverview.paidOrders} paid · ${financialOverview.pendingOrders} pending`,
            color: "primary",
        },
    ];

    const fetchSellers = useCallback(async (showRefresh = false) => {
        try {
            if (showRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const response = await apiRequest();
            const sellerList = Array.isArray(response.data)
                ? response.data
                : [];

            setSellers(
                sellerList.map((seller) => ({
                    ...seller,

                    // Payment fields should come from your database.
                    // Defaults below are only for missing fields.
                    total_paid_amount: Number(seller.total_paid_amount || 0),
                    last_paid_date: seller.last_paid_date || null,
                    payment_status: seller.payment_status || "Pending",
                    next_payment_due_date:
                        seller.next_payment_due_date || null,
                }))
            );
        } catch (err) {
            setError(err.message || "Unable to fetch sellers.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [apiRequest]);

    useEffect(() => {
        fetchSellers();
    }, [fetchSellers]);

    const updateSellerStatus = async (seller, newStatus) => {
        try {
            setError("");
            setSuccessMessage("");
            const sellerId = seller.seller_id || seller.id;

            await updateSellerStatusApi(sellerId, newStatus.toLowerCase())
               

            setSellers((previous) =>
                previous.map((item) =>
                    (item.seller_id || item.id) === sellerId
                        ? { ...item, status: newStatus.toLowerCase() }
                        : item
                )
            );

            setSuccessMessage("Seller status updated successfully.");
        } catch (err) {
            setError(err.message || "Unable to update seller status.");
        }
    };

    const openPaymentModal = (seller) => {
        setSelectedSeller(seller);
        setPaymentAmount("");
        setShowPaymentModal(true);
    };

    const savePayment = async () => {
        if (!selectedSeller) return;

        const amount = Number(paymentAmount);

        if (!Number.isFinite(amount) || amount <= 0) {
            setError("Please enter a valid payment amount.");
            return;
        }

        const sellerId =
            selectedSeller.seller_id || selectedSeller.id;

        try {
            setSaving(true);
            setError("");
            setSuccessMessage("");

            const response = await apiRequest(
                `/sellers/${encodeURIComponent(sellerId)}/payment`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        amount,
                    }),
                }
            );

            const updatedPayment = response.data || {};

            setSellers((previous) =>
                previous.map((seller) => {
                    const currentId = seller.seller_id || seller.id;

                    if (currentId !== sellerId) return seller;

                    return {
                        ...seller,
                        ...updatedPayment,
                    };
                })
            );

            setShowPaymentModal(false);
            setSelectedSeller(null);
            setPaymentAmount("");

            setSuccessMessage("Payment recorded successfully.");
        } catch (err) {
            setError(
                err.message ||
                "Unable to save payment. Check the backend payment endpoint."
            );
        } finally {
            setSaving(false);
        }
    };

    const columns = [
        {
            key: "seller_id",
            label: "Seller ID",
            render: (value, row) => {
                const sellerId = value || row.id;

                return (
                    <button
                        type="button"
                        className="btn btn-link p-0 text-nowrap fw-semibold"
                        onClick={() =>
                            navigate(
                                `/admin/sellers/${encodeURIComponent(sellerId)}`
                            )
                        }
                        title="View seller details"
                    >
                        {sellerId}
                    </button>
                );
            },
        },
        {
            key: "business_name",
            label: "Business Name",
            render: (value) => value || "—",
        },
        {
            key: "name",
            label: "Seller Name",
            render: (value, row) =>
                value ||
                [row.first_name, row.last_name].filter(Boolean).join(" ") ||
                "—",
        },
        {
            key: "email",
            label: "Email",
            render: (value) => value || "—",
        },
        {
            key: "phone",
            label: "Phone",
            render: (value) => value || "—",
        },
        {
            key: "status",
            label: "Seller Status",
            render: (value, row) => (
                <Form.Select
                    size="sm"
                    value={String(value || "inactive").toLowerCase()}
                    onChange={(event) =>
                        updateSellerStatus(row, event.target.value)
                    }
                    style={{ minWidth: "115px" }}
                    aria-label={`Status for ${row.business_name || row.seller_id}`}
                >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </Form.Select>
            ),
        },
        {
            key: "seller_created_at",
            label: "Created At",
            render: (value) => formatDate(value),
        },
        {
            key: "total_revenue",
            label: "Total Revenue",
            render: (value) => formatCurrency(value),
        },
        {
            key: "today_earning",
            label: "Today Earning",
            render: (value) => formatCurrency(value),
        },
        {
            key: "monthly_earning",
            label: "Monthly Earning",
            render: (value) => formatCurrency(value),
        },
        {
            key: "total_discount_amount",
            label: "Total Discount",
            render: (value) => formatCurrency(value),
        },
        {
            key: "available_balance",
            label: "Available Balance",
            render: (value) => formatCurrency(value),
        }
    ];

    return (
        <div className="container-fluid py-4">
            {!loading && (
                <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                        <div>
                            <h4 className="mb-1">Platform Financial Overview</h4>
                            <p className="text-muted mb-0">
                                Overview of sales, discounts, earnings and seller payments.
                            </p>
                        </div>
                            <Button className="float-end" onClick={() => {JWTService.clearTokenDetails(); toast.success("Logout Successfully"); navigate('/admin/login')}}>Logout</Button>
                    </div>

                    <div className="row g-3">
                        {overviewCards.map((card) => (
                            <div
                                className="col-12 col-sm-6 col-xl-3"
                                key={card.title}
                            >
                                <div className="card h-100 shadow-sm border-0">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-start gap-2">
                                            <div>
                                                <p className="text-muted small mb-2">
                                                    {card.title}
                                                </p>

                                                <h4 className="fw-bold mb-2 text-break">
                                                    {card.value}
                                                </h4>
                                            </div>

                                            <span
                                                className={`badge text-bg-${card.color}`}
                                            >
                                                {card.title === "Platform Earnings"
                                                    ? "Earnings"
                                                    : card.title === "Total Discount Given"
                                                        ? "Discount"
                                                        : card.title === "Pending Seller Payments"
                                                            ? "Due"
                                                            : "Overview"}
                                            </span>
                                        </div>

                                        <small className="text-muted">
                                            {card.description}
                                        </small>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <Stack
                direction="horizontal"
                className="justify-content-between align-items-center flex-wrap gap-3 mb-4"
            >
                <div>
                    <h3 className="mb-1">Seller Admin Dashboard</h3>
                    <p className="text-muted mb-0">
                        Manage sellers, earnings, payment tracking, and status.
                    </p>
                </div>

                <Button
                    variant="outline-primary"
                    onClick={() => fetchSellers(true)}
                    disabled={loading || refreshing}
                >
                    {refreshing ? (
                        <>
                            <Spinner
                                size="sm"
                                animation="border"
                                className="me-2"
                            />
                            Refreshing...
                        </>
                    ) : (
                        "Refresh Sellers"
                    )}
                </Button>
            </Stack>



            {error && (
                <Alert
                    variant="danger"
                    dismissible
                    onClose={() => setError("")}
                >
                    {error}
                </Alert>
            )}

            {successMessage && (
                <Alert
                    variant="success"
                    dismissible
                    onClose={() => setSuccessMessage("")}
                >
                    {successMessage}
                </Alert>
            )}

            {loading ? (
                <div className="d-flex justify-content-center align-items-center py-5">
                    <Spinner animation="border" role="status" />
                    <span className="ms-3">Loading sellers...</span>
                </div>
            ) : (
                <DataTable
                    title="Sellers"
                    tableData={sellers}
                    columns={columns}
                    isSearch={true}
                    isHeader={true}
                    isPagination={true}
                    searchPlaceholder="Search by seller, business, email, status..."
                    getStatusColor={getStatusColor}
                />
            )}

            <Modal
                show={showPaymentModal}
                onHide={() => {
                    if (!saving) setShowPaymentModal(false);
                }}
                centered
            >
                <Modal.Header closeButton={!saving}>
                    <Modal.Title>Record Seller Payment</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <p className="mb-3">
                        <strong>Seller:</strong>{" "}
                        {selectedSeller?.business_name ||
                            selectedSeller?.name ||
                            selectedSeller?.seller_id ||
                            "—"}
                    </p>

                    <Form.Group>
                        <Form.Label>Payment Amount (₹)</Form.Label>
                        <Form.Control
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={paymentAmount}
                            onChange={(event) =>
                                setPaymentAmount(event.target.value)
                            }
                            placeholder="Enter payment amount"
                            disabled={saving}
                        />
                    </Form.Group>
                </Modal.Body>

                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setShowPaymentModal(false)}
                        disabled={saving}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="primary"
                        onClick={savePayment}
                        disabled={saving}
                    >
                        {saving ? "Saving..." : "Save Payment"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Dashboard;