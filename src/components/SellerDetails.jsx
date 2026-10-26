import React, { useEffect, useState } from "react";
import {
    Alert,
    Badge,
    Button,
    Card,
    Col,
    Form,
    Modal,
    Row,
    Spinner,
} from "react-bootstrap";
import DataTable from "../components/DataTable";
import { useNavigate, useParams } from "react-router-dom";
import { getSellerDetails, updatePaymentStatusApi } from "../api/admin.api";

const formatCurrency = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
        ? "—"
        : date.toLocaleString("en-IN");
};

const SellerDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [updatedPaymentStatus, setUpdatedPaymentStatus] = useState("");
    const [savingPayment, setSavingPayment] = useState(false);
    const [paymentMessage, setPaymentMessage] = useState("");

    useEffect(() => {
        const controller = new AbortController();

        const fetchDetails = async () => {
            try {
                setLoading(true);
                setError("");

                const result = await getSellerDetails(id, controller.signal);

                if (result.success === false) {
                    throw new Error(
                        result.message || "Unable to fetch seller details."
                    );
                }

                setDetails(result.data);
            } catch (err) {
                if (
                    err.name !== "AbortError" &&
                    err.code !== "ERR_CANCELED"
                ) {
                    setError(
                        err.message || "Something went wrong."
                    );
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchDetails();

        return () => controller.abort();
    }, [id]);


    const openPaymentDetails = (payment) => {
        const paymentStatus = payment.settlement_date
            ? "success"
            : String(payment.status || "pending").toLowerCase();

        setSelectedPayment({
            ...payment,
            status: paymentStatus,
        });

        setUpdatedPaymentStatus(paymentStatus);
        setPaymentMessage("");
        setShowPaymentModal(true);
    };

    const updatePaymentStatus = async () => {
        if (!selectedPayment?.id) {
            setPaymentMessage("Payment ID is missing.");
            return;
        }

        try {
            setSavingPayment(true);
            setPaymentMessage("");

            const result = await updatePaymentStatusApi(
                selectedPayment.id,
                updatedPaymentStatus
            );

            if (result.success === false) {
                throw new Error(
                    result.message || "Unable to update payment status."
                );
            }

            const updatedPayment = result.data?.payment || result.data || {};

            const isPaid = ["paid", "success", "completed"].includes(
                String(updatedPayment.status || updatedPaymentStatus).toLowerCase()
            );

            // Update payment history
            setDetails((previous) => ({
                ...previous,
                payments: (previous.payments || []).map((payment) =>
                    String(payment.id) === String(selectedPayment.id)
                        ? {
                            ...payment,
                            ...updatedPayment,
                            status: updatedPayment.status || updatedPaymentStatus,
                            seller_amount:
                                updatedPayment.seller_amount ??
                                (isPaid
                                    ? payment.seller_earning
                                    : payment.seller_amount),
                        }
                        : payment
                ),
            }));

            // Update selected payment
            setSelectedPayment((previous) => ({
                ...previous,
                ...updatedPayment,
                status: updatedPayment.status || updatedPaymentStatus,
                seller_amount:
                    updatedPayment.seller_amount ??
                    (isPaid
                        ? previous.seller_earning
                        : previous.seller_amount),
            }));

            setPaymentMessage("Payment status updated successfully.");
        } catch (err) {
            setPaymentMessage(
                err.message || "Unable to update payment status."
            );
        } finally {
            setSavingPayment(false);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center py-5">
                <Spinner animation="border" />
                <span className="ms-3">Loading seller details...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container-fluid py-4">
                <Button
                    variant="outline-secondary"
                    className="mb-3"
                    onClick={() => navigate(-1)}
                >
                    ← Back
                </Button>

                <Alert variant="danger">{error}</Alert>
            </div>
        );
    }

    if (!details?.seller) {
        return (
            <div className="container-fluid py-4">
                <Alert variant="warning">Seller not found.</Alert>
            </div>
        );
    }

    const { seller, orders = [], payments = [] } = details;

    const sellerName =
        seller.name ||
        [seller.first_name, seller.last_name]
            .filter(Boolean)
            .join(" ") ||
        "—";

    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
                <div>
                    <h3 className="mb-1">Seller Details</h3>
                    <p className="text-muted mb-0">
                        {seller.business_name || sellerName}
                    </p>
                </div>

                <Button
                    variant="outline-secondary"
                    onClick={() => navigate(-1)}
                >
                    ← Back to Sellers
                </Button>
            </div>

            {/* Seller Profile */}
            <Card className="border-0 shadow-sm rounded-4 mb-4">
                <Card.Body className="p-4">
                    <div className="d-flex justify-content-between flex-wrap gap-3 mb-3">
                        <div>
                            <h5 className="mb-1">
                                {seller.business_name || sellerName}
                            </h5>
                            <div className="text-muted">{seller.email}</div>
                        </div>

                        <Badge
                            bg={
                                String(seller.status).toLowerCase() === "active"
                                    ? "success"
                                    : "secondary"
                            }
                            className="align-self-start"
                        >
                            {seller.status || "Inactive"}
                        </Badge>
                    </div>

                    <Row className="g-3">
                        {[
                            ["Seller ID", seller.seller_id],
                            ["Seller Name", sellerName],
                            ["Email", seller.email],
                            ["Phone", seller.phone],
                            ["Gender", seller.gender],
                            ["Registered", formatDate(seller.seller_created_at)],
                            ["Business Type", seller.business_type],
                            ["Website", seller.website],
                            ["GSTIN", seller.gstin],
                            ["PAN", seller.pan],
                            ["Date of Birth", formatDate(seller.dob)],
                            ["Store Description", seller.store_description],
                            ["Address", seller.address_line_1],
                            ["City", seller.city],
                            ["State", seller.state],
                            ["Pincode", seller.pincode],
                            ["Country", seller.country],
                        ].map(([label, value]) => (
                            <Col key={label} xs={12} sm={6} lg={4}>
                                <div className="small text-muted">{label}</div>
                                <div className="fw-medium text-break">
                                    {value || "—"}
                                </div>
                            </Col>
                        ))}
                    </Row>
                </Card.Body>
            </Card>

            {/* Bank Details */}
            <Card className="border-0 shadow-sm rounded-4 mb-4">
                <Card.Body className="p-4">
                    <h5 className="mb-3">Bank Details</h5>

                    <Row className="g-3">
                        {[
                            ["Bank Name", seller.bank_name],
                            ["Account Holder", seller.account_holder],
                            ["Account Number", seller.account_number],
                            ["IFSC", seller.ifsc],
                            ["Account Type", seller.account_type],
                            ["UPI ID", seller.upi_id],
                        ].map(([label, value]) => (
                            <Col key={label} xs={12} sm={6} lg={4}>
                                <div className="small text-muted">{label}</div>
                                <div className="fw-medium text-break">
                                    {value || "—"}
                                </div>
                            </Col>
                        ))}
                    </Row>
                </Card.Body>
            </Card>

            {/* Seller Orders */}
            <Card className="border-0 shadow-sm rounded-4 mb-4">
                <Card.Body className="p-3">
                    <h5 className="mb-3">
                        Seller Orders ({orders.length})
                    </h5>

                    <DataTable
                        title="Seller Orders"
                        tableData={orders}
                        isHeader={true}
                        isSearch={true}
                        isPagination={true}
                        searchPlaceholder="Search by Order Number, Status..."
                        columns={[
                            {
                                key: "order_number",
                                label: "Order Number",
                                render: (value, row) => value || row.id || "—",
                            },
                            {
                                key: "buyer_id",
                                label: "Buyer ID",
                                render: (value) => value || "—",
                            },
                            {
                                key: "total_items",
                                label: "Items",
                                render: (value, row) =>
                                    `${value ?? 0} / ${row.total_quantity ?? 0}`,
                            },
                            {
                                key: "subtotal",
                                label: "Subtotal",
                                render: (value) => formatCurrency(value),
                            },
                            {
                                key: "discount_amount",
                                label: "Discount",
                                render: (value) => formatCurrency(value),
                            },
                            {
                                key: "delivery_charge",
                                label: "Delivery",
                                render: (value) => formatCurrency(value),
                            },
                            {
                                key: "total_amount",
                                label: "Order Total",
                                render: (value) => formatCurrency(value),
                            },
                            {
                                key: "seller_earning",
                                label: "Seller Earning",
                                render: (value) => formatCurrency(value),
                            },
                            {
                                key: "payment_status",
                                label: "Payment Status",
                                render: (value) => value || "—",
                            },
                            {
                                key: "order_status",
                                label: "Order Status",
                                render: (value) => value || "—",
                            },
                            {
                                key: "created_time",
                                label: "Order Date",
                                render: (value) => formatDate(value),
                            },
                        ]}
                    />
                </Card.Body>
            </Card>

            {/* Payment History */}
            <Card className="border-0 shadow-sm rounded-4 mb-4">
                <Card.Body className="p-3">
                    <h5 className="mb-3 d-flex align-items-center flex-wrap gap-3">
                        Payment History ({payments.length})

                        <span className="d-inline-flex align-items-center gap-1">
                            <span
                                style={{
                                    width: "10px",
                                    height: "10px",
                                    borderRadius: "50%",
                                    backgroundColor: "#ffc107",
                                    display: "inline-block",
                                }}
                            />
                            <small className="text-muted">Unpaid</small>
                        </span>

                        <span className="d-inline-flex align-items-center gap-1">
                            <span
                                style={{
                                    width: "10px",
                                    height: "10px",
                                    borderRadius: "50%",
                                    backgroundColor: "#198754",
                                    display: "inline-block",
                                }}
                            />
                            <small className="text-muted">Paid</small>
                        </span>
                    </h5>

                    <DataTable
                        tableData={payments}
                        isHeader={true}
                        isSearch={true}
                        isPagination={true}
                        searchPlaceholder="Search by Payment ID, Order Number, Status..."
                        columns={[
                            {
                                key: "id",
                                label: "Payment ID",
                                render: (value) => value || "—",
                            },
                            {
                                key: "order_number",
                                label: "Order Number",
                                render: (value, row) =>
                                    value || row.order_id || "—",
                            },
                            {
                                key: "amount",
                                label: "Amount",
                                render: (value) => formatCurrency(value),
                            },
                            {
                                key: "seller_amount",
                                label: "Seller Amount",
                                render: (value) => formatCurrency(value),
                            },
                            {
                                key: "seller_earning",
                                label: "My Earning",
                                render: (value, row) => {
                                    const isUnpaid =
                                        !row.settlement_date &&
                                        Number(row.seller_amount || 0) === 0;

                                    return (
                                        <span
                                            className="text-uppercase border rounded-1 px-2 py-1"
                                            style={{
                                                display: "inline-block",
                                                fontSize: "9px",
                                                fontWeight: 600,
                                                background: isUnpaid ? "#ffc107" : "#198754",
                                                color: isUnpaid ? "#000000" : "#ffffff",
                                                borderColor: isUnpaid ? "#ffc107" : "#198754",
                                            }}
                                        >
                                            {formatCurrency(value)}
                                        </span>
                                    );
                                },
                            },
                            {
                                key: "platform_fee",
                                label: "Platform Fee",
                                render: (value) => formatCurrency(value),
                            },
                            {
                                key: "refund_amount",
                                label: "Refund Amount",
                                render: (value) => formatCurrency(value),
                            },
                            {
                                key: "status",
                                label: "Payment Status",
                                render: (value) => value || "—",
                            },
                            {
                                key: "settlement_status",
                                label: "Settlement Status",
                                render: (value) => (
                                    <span
                                        text="light"
                                        style={{
                                            fontWeight: `${String(value).toLowerCase() == "eligible" ? 900 : 600}`,
                                            fontSize: "11px",
                                            color:
                                                String(value).toLowerCase() == "eligible"
                                                    ? "#0e821a"
                                                    : undefined,

                                        }}
                                    >
                                        {value.toUpperCase() || "N/A"}
                                    </span>
                                ),

                            },
                            {
                                key: "settlement_date",
                                label: "Settlement Date",
                                render: (value) => formatDate(value),
                            },
                            {
                                key: "created_at",
                                label: "Payment Date",
                                render: (value) => formatDate(value),
                            },
                            {
                                key: "payment_action",
                                label: "Payment Details",
                                render: (_, row) => (
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={() => openPaymentDetails(row)}
                                    >
                                        View / Update
                                    </Button>
                                ),
                            },
                        ]}
                    />
                </Card.Body>
            </Card>

            {/* Payment Details Modal */}
            <Modal
                show={showPaymentModal}
                onHide={() => {
                    if (!savingPayment) {
                        setShowPaymentModal(false);
                        setPaymentMessage("");
                    }
                }}
                centered
                size="lg"
            >
                <Modal.Header closeButton={!savingPayment}>
                    <Modal.Title>Payment Details</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {selectedPayment && (
                        <>
                            <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-4">
                                <div>
                                    <h5 className="mb-1">
                                        Payment #{selectedPayment.id}
                                    </h5>
                                    <div className="text-muted small">
                                        Order:{" "}
                                        {selectedPayment.order_number ||
                                            selectedPayment.order_id ||
                                            "—"}
                                    </div>
                                </div>

                                <Badge
                                    bg={
                                        ["paid", "success", "completed"].includes(
                                            String(selectedPayment.status || "").toLowerCase()
                                        )
                                            ? "success"
                                            : String(
                                                selectedPayment.status || ""
                                            ).toLowerCase() === "failed"
                                                ? "danger"
                                                : "warning"
                                    }
                                    text={
                                        ["pending", "processing"].includes(
                                            String(selectedPayment.status || "").toLowerCase()
                                        )
                                            ? "dark"
                                            : undefined
                                    }
                                >
                                    {selectedPayment.status || "Pending"}
                                </Badge>
                            </div>

                            <Row className="g-3 mb-4">
                                {[
                                    ["Payment ID", selectedPayment.id],
                                    [
                                        "Order Number",
                                        selectedPayment.order_number ||
                                        selectedPayment.order_id,
                                    ],
                                    [
                                        "Payment Method",
                                        selectedPayment.payment_method,
                                    ],
                                    [
                                        "Payment Amount",
                                        formatCurrency(selectedPayment.amount),
                                    ],
                                    [
                                        "Seller Earning",
                                        formatCurrency(selectedPayment.seller_earning),
                                    ],
                                    [
                                        "Seller Amount",
                                        formatCurrency(selectedPayment.seller_amount),
                                    ],
                                    [
                                        "Platform Fee",
                                        formatCurrency(selectedPayment.platform_fee),
                                    ],
                                    [
                                        "Refund Amount",
                                        formatCurrency(selectedPayment.refund_amount),
                                    ],
                                    [
                                        "Settlement Status",
                                        selectedPayment.settlement_status,
                                    ],
                                    [
                                        "Settlement Date",
                                        formatDate(selectedPayment.settlement_date),
                                    ],
                                    [
                                        "Payment Date",
                                        formatDate(selectedPayment.created_at),
                                    ],
                                ].map(([label, value]) => (
                                    <Col xs={12} sm={6} key={label}>
                                        <div className="border rounded-3 p-3 h-100">
                                            <div className="small text-muted mb-1">
                                                {label}
                                            </div>
                                            <div className="fw-semibold text-break">
                                                {value === null ||
                                                    value === undefined ||
                                                    value === ""
                                                    ? "—"
                                                    : value}
                                            </div>
                                        </div>
                                    </Col>
                                ))}
                            </Row>

                            <hr />

                            <h6 className="mb-3">Update Payment Status</h6>

                            <Form.Group className="mb-3">
                                <Form.Label>Payment Status</Form.Label>

                                <Form.Select
                                    value={updatedPaymentStatus}
                                    onChange={(event) =>
                                        setUpdatedPaymentStatus(event.target.value)
                                    }
                                    disabled={savingPayment}
                                >
                                    <option value="pending" disabled={updatedPaymentStatus == 'success' ? true : false}>Pending</option>
                                    <option value="success">Success / Paid</option>
                                </Form.Select>
                            </Form.Group>

                            {["success", "paid", "completed"].includes(
                                updatedPaymentStatus.toLowerCase()
                            ) && (
                                    <Alert variant="info">
                                        On successful payment confirmation, the backend will
                                        set the seller amount to the seller earning amount.
                                        Verify that the payment was actually completed before
                                        marking it successful.
                                    </Alert>
                                )}

                            {paymentMessage && (
                                <Alert
                                    variant={
                                        paymentMessage.toLowerCase().includes("successfully")
                                            ? "success"
                                            : "danger"
                                    }
                                    className="mb-0"
                                >
                                    {paymentMessage}
                                </Alert>
                            )}
                        </>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setShowPaymentModal(false)}
                        disabled={savingPayment}
                    >
                        Close
                    </Button>

                    <Button
                        variant="primary"
                        onClick={updatePaymentStatus}
                        disabled={
                            savingPayment ||
                            !selectedPayment ||
                            updatedPaymentStatus ===
                            String(selectedPayment.status || "pending").toLowerCase()
                        }
                    >
                        {savingPayment ? (
                            <>
                                <Spinner
                                    size="sm"
                                    animation="border"
                                    className="me-2"
                                />
                                Updating...
                            </>
                        ) : (
                            "Update Payment"
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>

        </div>
    );
};

export default SellerDetails;