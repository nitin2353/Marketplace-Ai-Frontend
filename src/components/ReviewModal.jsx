import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { toast } from "react-hot-toast";
import reviewApi from "../api/review.api";
import StarRating from "./StarRating";

export default function ReviewModal({ show, onHide, orderId, sellerId, onSuccess }) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!rating) {
            toast.error("Please select a rating.");
            return;
        }

        try {
            setSubmitting(true);
            const payload = {
                order_id: orderId,
                seller_id: sellerId,
                rating,
                comment,
            };

            const res = await reviewApi.createReview(payload);
            if (res?.success) {
                toast.success("Review submitted! Thank you for your feedback.");
                onSuccess?.();
                onHide();
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
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title className="fw-bold">Write a Review</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <div className="text-center mb-4">
                        <p className="text-muted mb-2">How was your experience?</p>
                        <div style={{ fontSize: "1.5rem" }}>
                            {[1, 2, 3, 4, 5].map((s) => (
                                <span
                                    key={s}
                                    style={{ cursor: "pointer", color: s <= rating ? "#ffc107" : "#e4e5e9" }}
                                    onClick={() => setRating(s)}
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                        <p className="mt-1 fw-bold" style={{ color: "#ffc107" }}>
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
                            style={{ borderRadius: 10, fontSize: "0.9rem" }}
                        />
                    </Form.Group>

                    <Button
                        variant="primary"
                        type="submit"
                        className="w-100 py-2 fw-bold"
                        disabled={submitting}
                        style={{ borderRadius: 10, background: "linear-gradient(135deg, #ff6b35, #f7931e)", border: "none" }}
                    >
                        {submitting ? "Submitting..." : "Submit Review"}
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
}
