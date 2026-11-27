import React, { useState, useEffect } from "react";
import { Table, Badge, Button, Modal } from "react-bootstrap";
import { getCustomerReturnRequests, cancelReturnRequest } from "../../api/return.api";
import { FMT, FMT_DATE } from "../../helper/GlobalHelper";

const CustomerReturnsList = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showDetail, setShowDetail] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const response = await getCustomerReturnRequests();
            setRequests(response.data || []);
        } catch (error) {
            console.error("Error fetching return requests:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm("Are you sure you want to cancel this request?")) return;
        try {
            await cancelReturnRequest(id);
            fetchRequests();
        } catch (error) {
            alert(error.message || "Failed to cancel request");
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

    return (
        <div className="returns-list-container">
            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                </div>
            ) : requests.length === 0 ? (
                <div className="text-center py-5 bg-light rounded">
                    <div style={{ fontSize: "3rem" }}>📦</div>
                    <h5 className="mt-3">No return requests found</h5>
                    <p className="text-muted">You haven't requested any returns or replacements yet.</p>
                </div>
            ) : (
                <div className="table-responsive">
                    <Table hover borderless>
                        <thead className="border-bottom">
                            <tr>
                                <th>Date</th>
                                <th>Product</th>
                                <th>Type</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map((req) => (
                                <tr key={req.id} className="align-middle">
                                    <td className="small">{FMT_DATE(req.created_at)}</td>
                                    <td>
                                        <div className="d-flex align-items-center gap-2">
                                            <img 
                                                src={req.product_image || "https://placehold.co/40x40"} 
                                                alt="" 
                                                style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 4 }}
                                            />
                                            <span className="text-truncate" style={{ maxWidth: 150, fontWeight: 600 }}>{req.product_title}</span>
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
                                        <div className="d-flex gap-2">
                                            <Button 
                                                variant="outline-primary" 
                                                size="sm"
                                                onClick={() => { setSelectedRequest(req); setShowDetail(true); }}
                                            >
                                                View
                                            </Button>
                                            {req.status === 'requested' && (
                                                <Button 
                                                    variant="outline-danger" 
                                                    size="sm"
                                                    onClick={() => handleCancel(req.id)}
                                                >
                                                    Cancel
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            )}

            {/* Detail Modal */}
            <Modal show={showDetail} onHide={() => setShowDetail(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title style={{ fontWeight: 800 }}>Request Details</Modal.Title>
                </Modal.Header>
                {selectedRequest && (
                    <Modal.Body>
                        <div className="row">
                            <div className="col-md-6">
                                <h6 className="fw-bold mb-3">Item Details</h6>
                                <div className="d-flex gap-3 mb-4">
                                    <img 
                                        src={selectedRequest.product_image} 
                                        alt="" 
                                        style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8 }}
                                    />
                                    <div>
                                        <p className="mb-1 fw-bold">{selectedRequest.product_title}</p>
                                        <p className="mb-0 text-muted small">Type: {selectedRequest.request_type}</p>
                                        <p className="mb-0 text-muted small">Status: <Badge bg={getStatusColor(selectedRequest.status)}>{selectedRequest.status}</Badge></p>
                                    </div>
                                </div>
                                
                                <h6 className="fw-bold mb-2">Customer Reason</h6>
                                <p className="p-2 bg-light rounded small mb-3">{selectedRequest.reason}</p>
                                
                                {selectedRequest.description && (
                                    <>
                                        <h6 className="fw-bold mb-2">Description</h6>
                                        <p className="p-2 bg-light rounded small mb-3">{selectedRequest.description}</p>
                                    </>
                                )}
                            </div>
                            <div className="col-md-6 border-start">
                                <h6 className="fw-bold mb-3">Timeline</h6>
                                <div className="timeline-small">
                                    <div className="mb-3 d-flex gap-3">
                                        <div className="text-primary">●</div>
                                        <div>
                                            <p className="mb-0 fw-bold small">Requested</p>
                                            <p className="mb-0 text-muted extra-small">{FMT_DATE(selectedRequest.created_at)}</p>
                                        </div>
                                    </div>
                                    {selectedRequest.status !== 'requested' && selectedRequest.status !== 'cancelled' && (
                                        <div className="mb-3 d-flex gap-3">
                                            <div className="text-success">●</div>
                                            <div>
                                                <p className="mb-0 fw-bold small">{selectedRequest.status.replace('_', ' ')}</p>
                                                <p className="mb-0 text-muted extra-small">{FMT_DATE(selectedRequest.updated_at)}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {selectedRequest.seller_response && (
                                    <div className="mt-4">
                                        <h6 className="fw-bold mb-2">Seller Response</h6>
                                        <p className="p-2 bg-info bg-opacity-10 border border-info rounded small text-info-emphasis">
                                            {selectedRequest.seller_response}
                                        </p>
                                    </div>
                                )}

                                {selectedRequest.refund_amount > 0 && (
                                    <div className="mt-3">
                                        <h6 className="fw-bold mb-1">Refund Amount</h6>
                                        <p className="h5 text-success fw-bold">{FMT(selectedRequest.refund_amount)}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {selectedRequest.images && selectedRequest.images.length > 0 && (
                            <div className="mt-4">
                                <h6 className="fw-bold mb-2">Attached Images</h6>
                                <div className="d-flex gap-2 flex-wrap">
                                    {selectedRequest.images.map((img, idx) => (
                                        <img 
                                            key={idx} 
                                            src={img} 
                                            alt="" 
                                            style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 8, cursor: "pointer" }}
                                            onClick={() => window.open(img)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </Modal.Body>
                )}
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDetail(false)}>Close</Button>
                </Modal.Footer>
            </Modal>
            <style>{`
                .timeline-small { position: relative; padding-left: 10px; border-left: 1px solid #eee; margin-left: 5px; }
                .extra-small { font-size: 0.7rem; }
            `}</style>
        </div>
    );
};

export default CustomerReturnsList;
