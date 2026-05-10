import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Stack } from "react-bootstrap";
import { FMT } from "../../helper/GlobalHelper";
import { STATUS_META, PAYMENT_METHOD_LABELS, FMT_DATE } from "../../helper/GlobalHelper";
import orderApi from "../../api/order.api";
import OrderTimeline from "./OrderTimeline";
import ReviewModal from "../../components/ReviewModal";
import ReturnRequestModal from "../../components/ReturnRequestModal";
import { getCustomerReturnRequests } from "../../api/return.api";
import "./orderpage.css";


const OrderCard = ({ order, onCancel, cancelling, setSelectedOrder, setShowCancel }) => {
    const [expanded, setExpanded] = useState(false);
    const [showReview, setShowReview] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [currentReviewItem, setCurrentReviewItem] = useState(null);
    const [orderDetails, setOrderDetails] = useState(null);
    const [returnRequests, setReturnRequests] = useState([]);
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [selectedReturnItem, setSelectedReturnItem] = useState(null);

    const status = order?.order_status || order?.status || 'placed';
    const payment = order?.payment_method || order?.payment || 'cod';
    const meta = STATUS_META[status] || STATUS_META.placed;
    const payMeta = PAYMENT_METHOD_LABELS[payment] || PAYMENT_METHOD_LABELS.cod;

    // Fetch order details when expanded (if not already loaded)
    const fetchOrderDetails = useCallback(async () => {
        if (loadingDetails) return;

        setLoadingDetails(true);
        try {
            const [itemsResponse, addressResponse] = await Promise.all([
                orderApi.getOrderItems(order.id).catch(() => ({ data: [] })),
                orderApi.getOrderAddressSnapshot(order.id).catch(() => ({ data: null }))
            ]);

            setOrderDetails({
                items: Array.isArray(itemsResponse?.data) ? itemsResponse.data : (Array.isArray(itemsResponse) ? itemsResponse : []),
                address_snapshot: addressResponse?.data || addressResponse || null
            });
        } catch (error) {
            console.error("Error fetching order details:", error);
        } finally {
            setLoadingDetails(false);
        }
    }, [order.id, loadingDetails]);

    // Handle expand/collapse
    const handleToggle = () => {
        const newExpanded = !expanded;
        setExpanded(newExpanded);
        if (newExpanded) {
            fetchOrderDetails();
            fetchReturnRequests();
        }
    };

    const fetchReturnRequests = async () => {
        try {
            const response = await getCustomerReturnRequests();
            setReturnRequests(response.data || []);
        } catch (error) {
            console.error("Error fetching return requests:", error);
        }
    };

    const handleReviewSuccess = (productId) => {
        setOrderDetails(prev => ({
            ...prev,
            items: prev.items.map(item => item.product_id === productId ? { ...item, is_reviewed: true } : item)
        }));
    };

    // Use order details if available, otherwise fallback to order data
    const items = Array.isArray(orderDetails?.items) ? orderDetails.items : (Array.isArray(order?.items) ? order.items : []);
    const addressSnapshot = orderDetails?.address_snapshot || order?.address_snapshot;

    const visItems = items.slice(0, 3);
    const moreQty = items.length - 3;

    const canCancel = ["placed", "confirmed"].includes(status);

    return (
        <div className="ord-card ord-fu" onClick={handleToggle}>

            {/* ── Header ── */}
            <div className="ord-card-header d-flex flex-column flex-sm-row justify-content-between align-items-start gap-3">
                <div>
                    <p className="ord-number mb-0"># {order.order_number}</p>
                    <p className="ord-date mb-0">{FMT_DATE(order.created_time)}</p>
                </div>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                    <span className={`ord-status ${status}`} style={{ fontSize: "0.75rem", padding: "4px 10px" }}>
                        {meta?.icon} {meta?.label}
                    </span>
                    <span className={`ord-pay-badge ${payment}`} style={{ fontSize: "0.75rem", padding: "4px 10px" }}>
                        {payMeta?.icon} {payMeta?.label}
                    </span>
                </div>
            </div>

            {/* ── Body ── */}
            <div className="ord-card-body">
                <div className="ord-img-strip">
                    {visItems.map((item, idx) => {
                        let src = "";
                        try {
                            const imgData = item.product_image_url || item.image_url || "";
                            if (Array.isArray(imgData)) {
                                src = imgData[0];
                            } else if (typeof imgData === 'string') {
                                if (imgData.startsWith('[') || imgData.startsWith('{')) {
                                    const parsed = JSON.parse(imgData);
                                    src = Array.isArray(parsed) ? parsed[0] : parsed;
                                } else {
                                    src = imgData.split(',')[0].replace(/[{}"\\]/g, "");
                                }
                            }
                        } catch (e) {
                            console.error("Image parse error", e);
                        }

                        return (
                            <img
                                key={item.id || `img-${idx}`}
                                src={src || `https://placehold.co/52x52/f1f4ff/ff6b35?text=${encodeURIComponent((item.product_title || "P").slice(0, 2))}`}
                                alt={item.product_title || "Product"}
                                className="ord-product-img"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = `https://placehold.co/52x52/f1f4ff/ff6b35?text=${encodeURIComponent((item.product_title || "P").slice(0, 2))}`;
                                }}
                            />
                        );
                    })}

                    {moreQty > 0 && (
                        <div className="ord-product-img more">+{moreQty}</div>
                    )}
                </div>

                {/* First item title + meta */}
                {items[0] && (
                    <div style={{ minWidth: 0, flex: 1 }}>
                        <p className="ord-item-title mb-1" style={{ fontSize: "clamp(0.85rem, 3vw, 0.95rem)", fontWeight: 800 }}>
                            {items[0].product_title}
                            {items.length > 1 && (
                                <span style={{ color: "#9ca3af", fontWeight: 700, fontSize: "0.8rem" }}>
                                    {" "}+ {items.length - 1} more
                                </span>
                            )}
                        </p>
                        <div className="ord-item-meta d-flex flex-wrap align-items-center gap-2" style={{ fontSize: "0.75rem" }}>
                            {items[0].variant_size && <span className="ord-meta-chip">{items[0].variant_size}</span>}
                            {items[0].variant_color && (
                                <span className="ord-color-dot" style={{ background: items[0].variant_color, width: 10, height: 10 }} />
                            )}
                            <span className="fw-bold">× {items[0].total_quantity || items[0].quantity}</span>
                            <span className="d-none d-sm-inline" style={{ color: "#d1d5db" }}>·</span>
                            <span className="d-none d-sm-inline">{payMeta?.icon} {payMeta?.label}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Expandable detail ── */}
            {expanded && (
                <div className="ord-detail" onClick={(e) => e.stopPropagation()}>
                    {loadingDetails ? (
                        <div style={{ textAlign: "center", padding: "20px" }}>
                            <div style={{ fontSize: "1.2rem", marginBottom: "10px" }}>🔄</div>
                            <p style={{ color: "#9ca3af", fontSize: "0.9rem" }}>Loading order details...</p>
                        </div>
                    ) : (
                        <Row className="g-3">
                            <Col md={6}>
                                <p style={{ fontSize: "0.75rem", fontWeight: 800, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
                                    Items ({items.length})
                                </p>

                                {items?.length > 0 ? (
                                    items.map((item) => {
                                        return (
                                            <div
                                                key={item.id}
                                                style={{
                                                    display: "flex",
                                                    gap: 10,
                                                    marginBottom: 12,
                                                    alignItems: "center"
                                                }}
                                            >
                                                <img
                                                    src={(() => {
                                                        try {
                                                            const imgData = item.product_image_url || item.image_url || "";
                                                            if (Array.isArray(imgData)) return imgData[0];
                                                            if (typeof imgData === 'string') {
                                                                if (imgData.startsWith('[') || imgData.startsWith('{')) {
                                                                    const parsed = JSON.parse(imgData);
                                                                    return Array.isArray(parsed) ? parsed[0] : parsed;
                                                                }
                                                                return imgData.split(',')[0].replace(/[{}"\\]/g, "");
                                                            }
                                                            return imgData;
                                                        } catch (e) { return ""; }
                                                    })()}
                                                    alt={item.product_title || "Product"}
                                                    style={{
                                                        width: 50,
                                                        height: 50,
                                                        borderRadius: 8,
                                                        objectFit: "cover",
                                                        border: "1.5px solid #e8eaf6",
                                                        flexShrink: 0
                                                    }}
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = `https://placehold.co/44x44/f1f4ff/ff6b35?text=${encodeURIComponent(
                                                            (item.product_title || "P").slice(0, 2)
                                                        )}`;
                                                    }}
                                                />

                                                {/* Content */}
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <p
                                                        style={{
                                                            fontSize: "0.85rem",
                                                            fontWeight: 800,
                                                            color: "#1a1a2e",
                                                            marginBottom: 1,
                                                            overflow: "hidden",
                                                            whiteSpace: "nowrap",
                                                            textOverflow: "ellipsis"
                                                        }}
                                                    >
                                                        {item.product_title || "Unnamed Product"}
                                                    </p>

                                                    <div className="ord-item-meta" style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                                                        {item.variant_size && <span>{item.variant_size}</span>}
                                                        {item.variant_color && (
                                                            <span
                                                                className="ord-color-dot"
                                                                style={{
                                                                    background: item.variant_color,
                                                                    width: 10,
                                                                    height: 10,
                                                                    borderRadius: "50%",
                                                                    display: "inline-block",
                                                                    border: "1px solid #ddd"
                                                                }}
                                                            />
                                                        )}
                                                        <span>× {item.quantity || 1}</span>
                                                        <span style={{ color: "#d1d5db" }}>·</span>
                                                        <span style={{ color: "#ff6b35", fontWeight: 900 }}>
                                                            {FMT(item.line_total || 0)}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Item specific actions */}
                                                {(status?.toLowerCase() === "delivered" || status?.toLowerCase() === "completed") && (
                                                    <div className="d-flex gap-2 ms-auto align-items-center">
                                                        {/* Return/Replace Buttons */}
                                                        {(() => {
                                                            const existingRequest = returnRequests.find(rr => rr.order_item_id === item.id && rr.status !== 'cancelled');
                                                            if (existingRequest) {
                                                                return (
                                                                    <span className="badge rounded-pill" style={{ background: "#e8eaf6", color: "#1a1a2e", padding: "6px 12px", fontSize: "0.7rem", fontWeight: 700 }}>
                                                                        {existingRequest.request_type === 'return' ? 'Return' : 'Replacement'} {existingRequest.status}
                                                                    </span>
                                                                );
                                                            }

                                                            // Check eligibility duration
                                                            const deliveredDate = new Date(order.modified_time || order.created_time);
                                                            const now = new Date();
                                                            const diffDays = Math.ceil(Math.abs(now - deliveredDate) / (1000 * 60 * 60 * 24));
                                                            const isEligible = diffDays <= (item.return_replace_duration || 0);

                                                            if (isEligible && (item.is_return || item.is_replace)) {
                                                                return (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setSelectedReturnItem(item);
                                                                            setShowReturnModal(true);
                                                                        }}
                                                                        style={{
                                                                            fontSize: "0.72rem",
                                                                            padding: "5px 10px",
                                                                            borderRadius: 20,
                                                                            border: "1px solid #1a1a2e",
                                                                            background: "transparent",
                                                                            color: "#1a1a2e",
                                                                            fontWeight: 800
                                                                        }}
                                                                    >
                                                                        Return/Replace
                                                                    </button>
                                                                );
                                                            }
                                                            return null;
                                                        })()}

                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (!item.is_reviewed) {
                                                                    setCurrentReviewItem(item);
                                                                    setShowReview(true);
                                                                }
                                                            }}
                                                            disabled={item.is_reviewed}
                                                            style={{
                                                                fontSize: "0.72rem",
                                                                padding: "5px 10px",
                                                                borderRadius: 20,
                                                                border: "none",
                                                                background: item.is_reviewed ? "#f3f4f6" : "linear-gradient(135deg, #ff6b35, #f7931e)",
                                                                color: item.is_reviewed ? "#9ca3af" : "#fff",
                                                                fontWeight: 800
                                                            }}
                                                        >
                                                            {item.is_reviewed ? "★ Reviewed" : "★ Review"}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p style={{ color: "#9ca3af", fontSize: "0.9rem", fontStyle: "italic" }}>
                                        No item details available
                                    </p>
                                )}
                            </Col>

                            {/* Timeline + Address */}
                            <Col md={6}>
                                <p style={{ fontSize: "0.75rem", fontWeight: 800, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
                                    Order Status
                                </p>
                                <OrderTimeline currentStatus={status} />

                                {addressSnapshot && (
                                    <div style={{ marginTop: 16 }}>
                                        <p style={{ fontSize: "0.75rem", fontWeight: 800, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                                            Deliver to
                                        </p>
                                        <div className="ord-addr-box">
                                            <strong>{addressSnapshot.name}</strong><br />
                                            {addressSnapshot.address_line_1}
                                            {addressSnapshot.address_line_2 ? `, ${addressSnapshot.address_line_2}` : ""}<br />
                                            {addressSnapshot.city}, {addressSnapshot.state} — {addressSnapshot.pincode}<br />
                                            📞 {addressSnapshot.mobile || addressSnapshot.phone}
                                        </div>
                                    </div>
                                )}
                            </Col>
                        </Row>
                    )}
                </div>
            )}

            {/* ── Footer ── */}
            <div className="ord-card-footer d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3" onClick={(e) => e.stopPropagation()}>
                <div>
                    <p className="ord-total-label mb-0">Total</p>
                    <p className="ord-total mb-0">{FMT(order.total_amount)}</p>
                </div>

                <div className="d-flex align-items-center gap-2 flex-wrap w-100 w-sm-auto justify-content-start justify-content-sm-end">
                    {canCancel && (
                        <button
                            className="ord-btn-cancel py-2 px-3 flex-fill flex-sm-none"
                            disabled={cancelling === order.id}
                            onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); setShowCancel(true); }}
                        >
                            {cancelling === order.id ? "Cancelling…" : "Cancel"}
                        </button>
                    )}
                    {status?.toLowerCase() === "delivered" && (
                        <button className="ord-btn-reorder py-2 px-3 flex-fill flex-sm-none" onClick={(e) => e.stopPropagation()}>
                            🔁 Reorder
                        </button>
                    )}
                    <button
                        className="ord-btn-view py-2 px-3 flex-fill flex-sm-none"
                        onClick={(e) => { e.stopPropagation(); handleToggle(); }}
                    >
                        {expanded ? "Hide Details ▲" : "View Details ▼"}
                    </button>
                </div>
            </div>

            {currentReviewItem && (
                <ReviewModal
                    show={showReview}
                    onHide={() => {
                        setShowReview(false);
                        setCurrentReviewItem(null);
                    }}
                    orderId={order.id}
                    productId={currentReviewItem.product_id}
                    sellerId={currentReviewItem.seller_id}
                    onSuccess={() => handleReviewSuccess(currentReviewItem.product_id)}
                />
            )}

            {selectedReturnItem && (
                <ReturnRequestModal
                    show={showReturnModal}
                    onHide={() => {
                        setShowReturnModal(false);
                        setSelectedReturnItem(null);
                    }}
                    item={selectedReturnItem}
                    orderId={order.id}
                    onSuccess={fetchReturnRequests}
                />
            )}
        </div>
    );
};

export default OrderCard;