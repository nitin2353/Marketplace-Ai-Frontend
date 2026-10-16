import React, { useState, useRef } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { toast } from "react-hot-toast";
import reviewApi from "../api/review.api";

export default function ReviewModal({ show, onHide, orderId, productId, sellerId, onSuccess }) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [images, setImages] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const fileInputRef = useRef();

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (images.length + files.length > 5) {
            toast.error("You can only upload up to 5 images.");
            return;
        }

        const newImages = [...images, ...files];
        setImages(newImages);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews([...previews, ...newPreviews]);
    };

    const removeImage = (index) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);

        const newPreviews = [...previews];
        URL.revokeObjectURL(newPreviews[index]);
        newPreviews.splice(index, 1);
        setPreviews(newPreviews);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!rating) {
            toast.error("Please select a rating.");
            return;
        }

        try {
            setSubmitting(true);
            const formData = new FormData();
            formData.append("order_id", orderId);
            formData.append("product_id", productId);
            formData.append("seller_id", sellerId);
            formData.append("rating", rating);
            formData.append("comment", comment);

            images.forEach((image) => {
                formData.append("images", image);
            });

            const res = await reviewApi.createReview(formData);
            if (res?.success) {
                toast.success("Review submitted! Thank you for your feedback.");
                onSuccess?.();
                onHide();
                // Reset state
                setRating(5);
                setComment("");
                setImages([]);
                setPreviews([]);
            } else {
                throw new Error(res?.message || "Failed to submit review.");
            }
        } catch (error) {
            toast.error(error.message || "Something went wrong.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered size="lg">
            <Modal.Header closeButton style={{ borderBottom: "none" }}>
                <Modal.Title className="fw-bold">Write a Review</Modal.Title>
            </Modal.Header>
            <Modal.Body className="pt-0">
                <Form onSubmit={handleSubmit}>
                    <div className="text-center mb-4 p-3" style={{ background: "#f8f9fa", borderRadius: 15 }}>
                        <p className="text-muted mb-2 small fw-bold text-uppercase">How was your experience?</p>
                        <div style={{ fontSize: "2rem" }}>
                            {[1, 2, 3, 4, 5].map((s) => (
                                <span
                                    key={s}
                                    style={{ cursor: "pointer", color: s <= rating ? "#ffc107" : "#dee2e6", transition: "0.2s" }}
                                    onClick={() => setRating(s)}
                                    className="px-1 star-hover"
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                        <p className="mt-1 fw-bold" style={{ color: "#ffc107", fontSize: "1.1rem" }}>
                            {rating === 5 ? "Excellent" : rating === 4 ? "Good" : rating === 3 ? "Average" : rating === 2 ? "Poor" : "Terrible"}
                        </p>
                    </div>

                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold small">Your Comment</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Share your experience with this product and seller..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            style={{ borderRadius: 12, fontSize: "0.9rem", border: "2px solid #eee", padding: "12px" }}
                        />
                    </Form.Group>

                    <Form.Group className="mb-4">
                        <Form.Label className="fw-bold small">Add Photos (Max 5)</Form.Label>
                        <div className="d-flex flex-wrap gap-2">
                            {previews.map((src, idx) => (
                                <div key={idx} style={{ position: "relative", width: 80, height: 80 }}>
                                    <img
                                        src={src}
                                        alt="preview"
                                        style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10, border: "2px solid #eee" }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(idx)}
                                        style={{
                                            position: "absolute",
                                            top: -5,
                                            right: -5,
                                            background: "#ff4d4d",
                                            color: "#fff",
                                            border: "none",
                                            borderRadius: "50%",
                                            width: 20,
                                            height: 20,
                                            fontSize: "0.7rem",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                                        }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                            {images.length < 5 && (
                                <div
                                    onClick={() => fileInputRef.current.click()}
                                    style={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: 10,
                                        border: "2px dashed #ccc",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "pointer",
                                        color: "#999",
                                        background: "#fafafa"
                                    }}
                                >
                                    <span style={{ fontSize: "1.2rem" }}>+</span>
                                    <span style={{ fontSize: "0.6rem", fontWeight: "bold" }}>UPLOAD</span>
                                </div>
                            )}
                        </div>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            style={{ display: "none" }}
                        />
                    </Form.Group>

                    <Button
                        variant="primary"
                        type="submit"
                        className="w-100 py-3 fw-bold mt-2"
                        disabled={submitting}
                        style={{
                            borderRadius: 12,
                            border: "none",
                            boxShadow: "0 4px 15px #90afffff",
                            fontSize: "1rem"
                        }}
                    >
                        {submitting ? "Submitting Review..." : "Submit Review"}
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
}
