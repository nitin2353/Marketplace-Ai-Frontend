import React, { useState } from "react";
import { Modal, Form, Button, Alert } from "react-bootstrap";
import { createReturnRequest } from "../api/return.api";

const ReturnRequestModal = ({ show, onHide, item, orderId, requestType: initialType, onSuccess }) => {
    const [requestType, setRequestType] = useState(initialType || "");
    const [reason, setReason] = useState("");
    const [description, setDescription] = useState("");
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!requestType || !reason) {
            setError("Please select request type and reason");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const formData = new FormData();
            formData.append("order_id", orderId);
            formData.append("order_item_id", item.id);
            formData.append("request_type", requestType);
            formData.append("reason", reason);
            formData.append("description", description);
            
            images.forEach((img) => {
                formData.append("images", img);
            });

            await createReturnRequest(formData);
            onSuccess();
            onHide();
        } catch (err) {
            setError(err.message || "Failed to submit request");
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + images.length > 5) {
            alert("Maximum 5 images allowed");
            return;
        }
        setImages([...images, ...files]);
    };

    const removeImage = (index) => {
        setImages(images.filter((_, i) => i !== index));
    };

    return (
        <Modal show={show} onHide={onHide} centered size="lg" className="return-modal">
            <Modal.Header closeButton>
                <Modal.Title style={{ fontWeight: 800, color: "#1a1a2e" }}>
                    Request Return or Replacement
                </Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    
                    <div className="d-flex gap-3 align-items-center mb-4 p-3 bg-light rounded">
                        <img 
                            src={item?.product_image_url || "https://placehold.co/60x60"} 
                            alt={item?.product_title}
                            style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 8 }}
                        />
                        <div>
                            <h6 className="mb-1" style={{ fontWeight: 700 }}>{item?.product_title}</h6>
                            <p className="mb-0 text-muted small">Qty: {item?.quantity}</p>
                        </div>
                    </div>

                    <Form.Group className="mb-3">
                        <Form.Label style={{ fontWeight: 700 }}>What would you like to do?</Form.Label>
                        <div className="d-flex gap-3">
                            {item?.is_return && (
                                <Form.Check
                                    type="radio"
                                    id="type-return"
                                    label="Return & Refund"
                                    name="requestType"
                                    value="return"
                                    checked={requestType === "return"}
                                    onChange={(e) => setRequestType(e.target.value)}
                                    className="custom-radio"
                                />
                            )}
                            {item?.is_replace && (
                                <Form.Check
                                    type="radio"
                                    id="type-replacement"
                                    label="Replacement"
                                    name="requestType"
                                    value="replacement"
                                    checked={requestType === "replacement"}
                                    onChange={(e) => setRequestType(e.target.value)}
                                    className="custom-radio"
                                />
                            )}
                        </div>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label style={{ fontWeight: 700 }}>Reason for {requestType || "request"}</Form.Label>
                        <Form.Select 
                            value={reason} 
                            onChange={(e) => setReason(e.target.value)}
                            required
                        >
                            <option value="">Select a reason</option>
                            <option value="Defective/Damaged">Product is defective or damaged</option>
                            <option value="Wrong Item">Received the wrong item</option>
                            <option value="Quality Issue">Quality not as expected</option>
                            <option value="Missing Parts">Missing parts or accessories</option>
                            <option value="Size/Fit Issue">Size or fit issue</option>
                            <option value="Others">Others</option>
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label style={{ fontWeight: 700 }}>Description (Optional)</Form.Label>
                        <Form.Control 
                            as="textarea" 
                            rows={3} 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Please provide more details about the issue..."
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label style={{ fontWeight: 700 }}>Images (Optional, Max 5)</Form.Label>
                        <Form.Control 
                            type="file" 
                            multiple 
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                        <div className="d-flex gap-2 mt-2 flex-wrap">
                            {images.map((img, idx) => (
                                <div key={idx} className="position-relative">
                                    <img 
                                        src={URL.createObjectURL(img)} 
                                        alt="preview" 
                                        style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 4 }}
                                    />
                                    <button 
                                        type="button"
                                        className="btn-close position-absolute top-0 end-0 bg-white"
                                        style={{ padding: 2, fontSize: "0.5rem" }}
                                        onClick={() => removeImage(idx)}
                                    ></button>
                                </div>
                            ))}
                        </div>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide} disabled={loading}>
                        Cancel
                    </Button>
                    <Button 
                        type="submit" 
                        disabled={loading}
                        style={{ background: "#1a1a2e", border: "none", fontWeight: 700 }}
                    >
                        {loading ? "Submitting..." : "Submit Request"}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default ReturnRequestModal;
