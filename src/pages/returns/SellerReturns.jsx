import React, { useState, useEffect } from "react";
import { Container, Table, Badge, Button, Modal, Form, Row, Col } from "react-bootstrap";
import { getSellerReturnRequests, updateReturnStatus, getReturnRequestById } from "../../api/return.api";
import { FMT, FMT_DATE } from "../../helper/GlobalHelper.jsx";
import SellerNavbar from "../../components/SellerNavbar.jsx";
import SellerSidebar from "../../components/SellerSidebar.jsx";
import { useNavigate, useParams } from "react-router-dom";


const SellerReturns = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [status, setStatus] = useState("");
    const [sellerResponse, setSellerResponse] = useState("");
    const [refundAmount, setRefundAmount] = useState(0);
    const [filter, setFilter] = useState("all");
    const params = useParams()
    const navigate = useNavigate();

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const response = await getSellerReturnRequests();
            setRequests(response.data || []);


            if (params.id && params.id !== "all") {
                const single = await getReturnRequestById(params.id);
                if (single.data) {
                    setSelectedRequest(single.data);
                    setStatus(single.data.status);
                    setSellerResponse(single.data.seller_response || "");
                    setRefundAmount(single.data.refund_amount || 0);
                    setShowUpdateModal(true);
                }
            }

        } catch (error) {
            console.error("Error fetching return requests:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateClick = async (req) => {
        setLoading(true);
        try {
            const detail = await getReturnRequestById(req.id);
            setSelectedRequest(detail.data);
            setStatus(detail.data.status);
            setSellerResponse(detail.data.seller_response || "");
            setRefundAmount(detail.data.refund_amount || 0);
            setShowUpdateModal(true);
        } catch (error) {
            alert("Failed to fetch request details");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateReturnStatus(selectedRequest.id, {
                status,
                seller_response: sellerResponse,
                refund_amount: refundAmount
            });
            setShowUpdateModal(false);
            fetchRequests();
        } catch (error) {
            alert(error.message || "Failed to update request");
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'requested': return 'primary';
            case 'approved': return 'success';
            case 'rejected': return 'danger';
            case 'pickup_scheduled': return 'info';
            case 'received': return 'warning';
            case 'refunded': return 'success';
            case 'replaced': return 'success';
            case 'cancelled': return 'secondary';
            default: return 'dark';
        }
    };

    const filteredRequests = filter === "all"
        ? requests
        : requests.filter(r => r.status === filter);



    return (
        <Container fluid className="p-0">
            <Row className="g-0">
                <SellerSidebar />
                <div className="pd-main" style={{ minWidth: 0 }}>
                    <SellerNavbar pageTitle="Return & Replacement Requests"/>
                    <div style={{ padding: "28px 24px 48px" }}>

                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div className="d-flex gap-2">
                            <Button
                                variant={filter === "all" ? "primary" : "outline-primary"}
                                size="sm"
                                onClick={() => setFilter("all")}
                            >
                                All
                            </Button>
                            <Button
                                variant={filter === "requested" ? "primary" : "outline-primary"}
                                size="sm"
                                onClick={() => setFilter("requested")}
                            >
                                New
                            </Button>
                            <Button
                                variant={filter === "approved" ? "primary" : "outline-primary"}
                                size="sm"
                                onClick={() => setFilter("approved")}
                            >
                                Approved
                            </Button>
                        </div>
                        <Button variant="link" onClick={fetchRequests}>Refresh</Button>
                    </div>

                    {loading && !showUpdateModal ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status"></div>
                        </div>
                    ) : filteredRequests.length === 0 ? (
                        <div className="text-center py-5 bg-white rounded shadow-sm border">
                            <p className="text-muted mb-0">No requests found</p>
                        </div>
                    ) : (
                        <div className="table-responsive bg-white p-3 rounded shadow-sm border">
                            <Table hover borderless>
                                <thead className="border-bottom">
                                    <tr>
                                        <th>Date</th>
                                        <th>Customer</th>
                                        <th>Product</th>
                                        <th>Type</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRequests.map((req) => (
                                        <tr key={req.id} className="align-middle">
                                            <td className="small">{FMT_DATE(req.created_at)}</td>
                                            <td>
                                                <div style={{ fontWeight: 600 }}>{req.customer_name}</div>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center gap-2">
                                                    <img
                                                        src={req.product_image}
                                                        alt=""
                                                        style={{ width: 35, height: 35, objectFit: "cover", borderRadius: 4 }}
                                                    />
                                                    <span className="text-truncate" style={{ maxWidth: 180, fontSize: "0.85rem" }}>{req.product_title}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <Badge bg="light" text="dark" className="text-capitalize border">
                                                    {req.request_type}
                                                </Badge>
                                            </td>
                                            <td>
                                                <Badge bg={getStatusColor(req.status)} className="text-capitalize">
                                                    {req.status.replace('_', ' ')}
                                                </Badge>
                                            </td>
                                            <td>
                                                <Button
                                                    variant="primary"
                                                    size="sm"
                                                    onClick={() => handleUpdateClick(req)}
                                                >
                                                    Manage
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    // </div>
                )}

                {/* Update Modal */}
                <Modal show={showUpdateModal} onHide={() => { navigate('/seller/returns'); setShowUpdateModal(false) }} size="xl" centered>
                    <Modal.Header closeButton>
                        <Modal.Title style={{ fontWeight: 800 }}>Manage Return/Replacement Request</Modal.Title>
                    </Modal.Header>
                    {selectedRequest && (
                        <Form onSubmit={handleUpdateSubmit}>
                            <Modal.Body>
                                <Row className="g-4">
                                    <Col lg={7}>
                                        <div className="p-3 bg-light rounded mb-4">
                                            <h6 className="fw-bold border-bottom pb-2 mb-3">Order & Product Information</h6>
                                            <Row>
                                                <Col sm={4}>
                                                    <img
                                                        src={selectedRequest.product_image}
                                                        alt=""
                                                        className="img-fluid rounded border"
                                                    />
                                                </Col>
                                                <Col sm={8}>
                                                    <p className="mb-1 fw-bold text-primary">{selectedRequest.product_title}</p>
                                                    <p className="mb-1 small"><strong>Customer:</strong> {selectedRequest.customer_name} ({selectedRequest.customer_email})</p>
                                                    <p className="mb-1 small"><strong>Variant:</strong> {selectedRequest.variant_color} {selectedRequest.variant_size}</p>
                                                    <p className="mb-1 small"><strong>Quantity:</strong> {selectedRequest.quantity}</p>
                                                    <p className="mb-0 small"><strong>Price:</strong> {FMT(selectedRequest.unit_price)} (Total: {FMT(selectedRequest.unit_price * selectedRequest.quantity)})</p>
                                                </Col>
                                            </Row>
                                        </div>

                                        <div className="mb-4">
                                            <h6 className="fw-bold">Customer's Reason</h6>
                                            <div className="p-2 border rounded bg-warning bg-opacity-10 text-warning-emphasis">
                                                <strong>{selectedRequest.reason}</strong>
                                                <p className="mb-0 mt-1 small">{selectedRequest.description || "No additional description provided."}</p>
                                            </div>
                                        </div>

                                        {selectedRequest.images && selectedRequest.images.length > 0 && (
                                            <div>
                                                <h6 className="fw-bold">Customer's Photos</h6>
                                                <div className="d-flex gap-2 flex-wrap">
                                                    {selectedRequest.images.map((img, idx) => (
                                                        <img
                                                            key={idx}
                                                            src={img}
                                                            alt=""
                                                            style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 8, cursor: "pointer" }}
                                                            onClick={() => window.open(img)}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </Col>

                                    <Col lg={5} className="border-start">
                                        <h6 className="fw-bold border-bottom pb-2 mb-3">Update Status</h6>

                                        <Form.Group className="mb-3">
                                            <Form.Label className="small fw-bold">Current Status: <Badge bg={getStatusColor(selectedRequest.status)}>{selectedRequest.status}</Badge></Form.Label>
                                            <Form.Select
                                                value={status}
                                                onChange={(e) => setStatus(e.target.value)}
                                                className="form-control-lg"
                                            >
                                                <option value="requested">Requested</option>
                                                <option value="approved">Approve Request</option>
                                                <option value="rejected">Reject Request</option>
                                                <option value="pickup_scheduled">Pickup Scheduled</option>
                                                <option value="received">Item Received</option>
                                                {selectedRequest.request_type === 'return' ? (
                                                    <option value="refunded">Refunded</option>
                                                ) : (
                                                    <option value="replaced">Replaced</option>
                                                )}
                                            </Form.Select>
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label className="small fw-bold">Seller Response</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={4}
                                                value={sellerResponse}
                                                onChange={(e) => setSellerResponse(e.target.value)}
                                                placeholder="Write your response to the customer..."
                                            />
                                        </Form.Group>

                                        {status === 'refunded' && (
                                            <Form.Group className="mb-3">
                                                <Form.Label className="small fw-bold">Refund Amount</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    value={refundAmount}
                                                    onChange={(e) => setRefundAmount(e.target.value)}
                                                />
                                                <Form.Text className="text-muted">Maximum: {FMT(selectedRequest.unit_price * selectedRequest.quantity)}</Form.Text>
                                            </Form.Group>
                                        )}

                                        <div className="bg-light p-3 rounded mt-4">
                                            <p className="small mb-0 text-muted">Updating this status will notify the customer immediately.</p>
                                        </div>
                                    </Col>
                                </Row>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={() => setShowUpdateModal(false)}>Close</Button>
                                <Button variant="primary" type="submit" style={{ fontWeight: 700 }}>
                                    Update Request
                                </Button>
                            </Modal.Footer>
                        </Form>
                    )}
                        </Modal>
                    </div>
                </div>
            </Row>
        </Container>
    );
};

export default SellerReturns;
