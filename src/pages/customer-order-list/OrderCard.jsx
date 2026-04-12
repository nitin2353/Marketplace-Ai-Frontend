import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Stack } from "react-bootstrap";
import { FMT } from "../../helper/GlobalHelper";
import { STATUS_META, PAYMENT_METHOD_LABELS, FMT_DATE } from "../../helper/GlobalHelper";
import orderApi from "../../api/order.api";
import OrderTimeline from "./OrderTimeline";
import "./orderpage.css";


const OrderCard = ({ order, onCancel, cancelling, setSelectedOrder, setShowCancel }) => {
    const navigate = useNavigate();
    const [expanded, setExpanded] = useState(false);
    const [orderDetails, setOrderDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const status = order.order_status || "placed";
    const payment = order.payment_status || "pending";
    const meta = STATUS_META[status] || STATUS_META.placed;
    const payMeta = PAYMENT_METHOD_LABELS[order.payment_method] || { icon: "💳", label: order.payment_method };

    useEffect(() => {
        fetchOrderDetails();
    })


    // Fetch order details when expanded (if not already loaded)
    const fetchOrderDetails = useCallback(async () => {
        if (orderDetails || loadingDetails) return;

        setLoadingDetails(true);
        try {
            const [itemsResponse, addressResponse] = await Promise.all([
                orderApi.getOrderItems(order.id).catch(() => ({ data: [] })),
                orderApi.getOrderAddressSnapshot(order.id).catch(() => ({ data: null }))
            ]);

            setOrderDetails({
                items: itemsResponse?.data || [],
                address_snapshot: addressResponse?.data || null
            });
        } catch (error) {
            console.error("Error fetching order details:", error);
            setOrderDetails({
                items: [],
                address_snapshot: null
            });
        } finally {
            setLoadingDetails(false);
        }
    }, [order.id, orderDetails, loadingDetails]);

    // Handle expand/collapse
    const handleToggle = () => {
        const newExpanded = !expanded;
        setExpanded(newExpanded);
        if (newExpanded && !orderDetails) {
            fetchOrderDetails();
        }
    };

    // Use order details if available, otherwise fallback to order data
    const items = orderDetails?.items || order.items || [];
    const addressSnapshot = orderDetails?.address_snapshot || order.address_snapshot;

    const visItems = items.slice(0, 3);
    const moreQty = items.length - 3;

    const canCancel = ["placed", "confirmed"].includes(status);

    return (
        <div className="ord-card ord-fu" onClick={handleToggle}>

            {/* ── Header ── */}
            <div className="ord-card-header">
                <div>
                    <p className="ord-number mb-0"># {order.order_number}</p>
                    <p className="ord-date  mb-0">{FMT_DATE(order.created_time)}</p>
                </div>
                <Stack direction="horizontal" gap={2} className="align-items-center flex-wrap">
                    <span className={`ord-status ${status}`}>
                        {meta.icon} {meta.label}
                    </span>
                    <span className={`ord-pay-badge ${payment}`}>
                        {payment === "paid" ? "✔ Paid" : payment === "failed" ? "✕ Failed" : payment === "refunded" ? "↩ Refunded" : "⏳ Pending"}
                    </span>
                </Stack>
            </div>

            {/* ── Body ── */}
            <div className="ord-card-body">
                {/* Product image strip */}
                <div className="ord-img-strip">
                    {visItems.map((item) => {
                        const img = Array.isArray(item.product_image_url)
                            ? item.product_image_url[0]
                            : item.product_image_url.replace(/[{}"]/g, '');
                        return (
                            <img
                                key={item.id}
                                src={img || `https://placehold.co/52x52/f1f4ff/ff6b35?text=${encodeURIComponent((item.product_title || "P").slice(0, 2))}`}
                                alt={item.product_title || "Product"}
                                className="ord-product-img"
                                onError={(e) => {
                                    e.target.onerror = null; // 🔥 prevent infinite loop
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
                    <div>
                        <p className="ord-item-title mb-0">
                            {items[0].product_title}
                            {items.length > 1 && (
                                <span style={{ color: "#9ca3af", fontWeight: 700 }}>
                                    {" "}+ {items.length - 1} more
                                </span>
                            )}
                        </p>
                        <div className="ord-item-meta">
                            {items[0].variant_size && <span>{items[0].variant_size}</span>}
                            {items[0].variant_color && (
                                <span className="ord-color-dot" style={{ background: items[0].variant_color }} />
                            )}
                            <span>× {items[0].quantity}</span>
                            <span style={{ color: "#d1d5db" }}>·</span>
                            <span>{payMeta.icon} {payMeta.label}</span>
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
                            {/* All items */}
                            {/* <Col md={6}>
                                <p style={{ fontSize: "0.75rem", fontWeight: 800, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
                                    Items ({items.length})
                                </p>
                                {items.length > 0 ? items.map((item) => (
                                    <div key={item.id} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "center" }}>
                                        <img
                                            src={Array.isArray(item.product_image_url) ? item.product_image_url[0] : item.product_image_url}
                                            alt={item.product_title}
                                            style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover", border: "1.5px solid #e8eaf6", flexShrink: 0 }}
                                            onError={(e) => { e.target.src = ``; }}
                                        />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontSize: "0.82rem", fontWeight: 800, color: "#1a1a2e", marginBottom: 1, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                                                {item.product_title}
                                            </p>
                                            <div className="ord-item-meta">
                                                {item.variant_size && <span>{item.variant_size}</span>}
                                                {item.variant_color && <span className="ord-color-dot" style={{ background: item.variant_color }} />}
                                                <span>× {item.quantity}</span>
                                                <span style={{ color: "#d1d5db" }}>·</span>
                                                <span style={{ color: "#ff6b35", fontWeight: 900 }}>{FMT(item.line_total)}</span>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <p style={{ color: "#9ca3af", fontSize: "0.9rem", fontStyle: "italic" }}>
                                        No item details available
                                    </p>
                                )}
                            </Col> */}
                            <Col md={6}>
                                <p
                                    style={{
                                        fontSize: "0.75rem",
                                        fontWeight: 800,
                                        color: "#9ca3af",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.05em",
                                        marginBottom: 10
                                    }}
                                >
                                </p>

                                {items?.length > 0 ? (
                                    items.map((item) => {
                                        const img = Array.isArray(item.product_image_url)
                                            ? item.product_image_url[0]
                                            : item.product_image_url.replace(/[{}"]/g, '');
                                        return (
                                            <div
                                                key={item.id}
                                                style={{
                                                    display: "flex",
                                                    gap: 10,
                                                    marginBottom: 10,
                                                    alignItems: "center"
                                                }}
                                            >
                                                {/* Image */}
                                                <img
                                                    src={
                                                        img ||
                                                        `https://placehold.co/44x44/f1f4ff/ff6b35?text=${encodeURIComponent(
                                                            (item.product_title || "P").slice(0, 2)
                                                        )}`
                                                    }
                                                    alt={item.product_title || "Product"}
                                                    style={{
                                                        width: 44,
                                                        height: 44,
                                                        borderRadius: 8,
                                                        objectFit: "cover",
                                                        border: "1.5px solid #e8eaf6",
                                                        flexShrink: 0
                                                    }}
                                                    onError={(e) => {
                                                        e.target.onerror = null; // 🔥 prevent loop
                                                        e.target.src = `https://placehold.co/44x44/f1f4ff/ff6b35?text=${encodeURIComponent(
                                                            (item.product_title || "P").slice(0, 2)
                                                        )}`;
                                                    }}
                                                />

                                                {/* Content */}
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <p
                                                        style={{
                                                            fontSize: "0.82rem",
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

                                                        {/* Size */}
                                                        {item.variant_size && <span>{item.variant_size}</span>}

                                                        {/* Color */}
                                                        {item.variant_color && (
                                                            <span
                                                                className="ord-color-dot"
                                                                style={{
                                                                    background: item.variant_color,
                                                                    width: 12,
                                                                    height: 12,
                                                                    borderRadius: "50%",
                                                                    display: "inline-block",
                                                                    border: "1px solid #ddd"
                                                                }}
                                                            />
                                                        )}

                                                        {/* Quantity */}
                                                        <span>× {item.quantity || 1}</span>

                                                        {/* Separator */}
                                                        <span style={{ color: "#d1d5db" }}>·</span>

                                                        {/* Price */}
                                                        <span style={{ color: "#ff6b35", fontWeight: 900 }}>
                                                            {FMT(item.line_total || 0)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p
                                        style={{
                                            color: "#9ca3af",
                                            fontSize: "0.9rem",
                                            fontStyle: "italic"
                                        }}
                                    >
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
            <div className="ord-card-footer" onClick={(e) => e.stopPropagation()}>
                <div>
                    <p className="ord-total-label mb-0">Total</p>
                    <p className="ord-total mb-0">{FMT(order.total_amount)}</p>
                </div>

                <Stack direction="horizontal" gap={2} className="flex-wrap">
                    {canCancel && (
                        <button
                            className="ord-btn-cancel"
                            disabled={cancelling === order.id}
                            onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); setShowCancel(true); }}
                        >
                            {cancelling === order.id ? "Cancelling…" : "Cancel"}
                        </button>
                    )}
                    {status === "delivered" && (
                        <button className="ord-btn-reorder" onClick={(e) => e.stopPropagation()}>
                            🔁 Reorder
                        </button>
                    )}
                    <button
                        className="ord-btn-view"
                        onClick={(e) => { e.stopPropagation(); handleToggle(); }}
                    >
                        {expanded ? "Hide Details ▲" : "View Details ▼"}
                    </button>
                </Stack>
            </div>
        </div>
    );
}


export default OrderCard;