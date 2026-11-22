
import { useEffect, useMemo, useState } from "react";

import {
    TIMELINE_STEPS,
    TIMELINE_STATUS_META,
    fetchOrderStatusByTracking
} from "../../helper/GlobalHelper";

import "./orderpage.css";

const TRACKING_REFRESH_INTERVAL = 2 * 60 * 1000;

const STATUS_ALIASES = {
    placed: "confirmed",
    shipped: "in_transit",
};

// Delhivery status mapping
const normalizeCourierStatus = (shipment) => {
    const rawStatus = String(
        shipment?.Status?.Status || ""
    ).trim().toLowerCase();

    if (!rawStatus) return null;

    if (
        rawStatus.includes("undelivered") ||
        rawStatus.includes("return to origin") ||
        rawStatus.includes("rto")
    ) {
        return null;
    }

    if (rawStatus.includes("delivered")) {
        return "delivered";
    }

    if (rawStatus.includes("out for delivery")) {
        return "out_for_delivery";
    }

    if (
        rawStatus.includes("destination hub") ||
        rawStatus.includes("reached destination") ||
        rawStatus.includes("arrived at destination")
    ) {
        return "at_destination_hub";
    }

    if (
        rawStatus.includes("in transit") ||
        rawStatus.includes("in-transit")
    ) {
        return "in_transit";
    }

    if (
        rawStatus.includes("picked up") ||
        rawStatus.includes("picked-up") ||
        rawStatus.includes("pickup done") ||
        rawStatus.includes("shipment picked")
    ) {
        return "picked_up";
    }

    if (rawStatus.includes("manifest")) {
        return "manifested";
    }

    return null;
};

// Extract Delhivery response
const extractShipments = (response) => {
    const payload = response?.data ?? response;

    if (Array.isArray(payload)) {
        return payload;
    }

    if (Array.isArray(payload?.ShipmentData)) {
        return payload.ShipmentData;
    }

    if (Array.isArray(payload?.data?.ShipmentData)) {
        return payload.data.ShipmentData;
    }

    return [];
};

// Format date
const formatTrackingDate = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "";
    }

    return parsedDate.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
};

function OrderTimeline({ currentStatus, order }) {
    const [parcels, setParcels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [trackingError, setTrackingError] = useState("");

    // Only one parcel expanded at a time
    const [expandedAwb, setExpandedAwb] = useState(null);

    const normalizedStatus = String(currentStatus || "")
        .trim()
        .toLowerCase();

    const sellerStatus =
        STATUS_ALIASES[normalizedStatus] || normalizedStatus;

    const isCancelled = [
        "cancelled",
        "payment_failed",
    ].includes(normalizedStatus);

    // Unique AWBs
    const orderAwbs = useMemo(() => {
        return [
            ...new Set(
                (order?.items || [])
                    .map(item =>
                        String(
                            item?.waybill || item?.awb || ""
                        ).trim()
                    )
                    .filter(Boolean)
            ),
        ];
    }, [order?.items]);

    const trackingKey = [
        order?.order_number ||
        order?.order_id ||
        order?.id ||
        "",
        orderAwbs.join(","),
    ].join("|");

    // Fetch tracking
    useEffect(() => {
        let isMounted = true;
        let timer;

        const fetchTracking = async () => {
            if (
                isCancelled ||
                !order ||
                !orderAwbs.length
            ) {
                if (isMounted) {
                    setParcels([]);
                    setLoading(false);
                    setTrackingError("");
                }
                return;
            }

            try {
                if (isMounted) {
                    setLoading(true);
                    setTrackingError("");
                }

                const response =
                    await fetchOrderStatusByTracking(order);

                const shipments = extractShipments(response);

                const shipmentMap = new Map();

                shipments.forEach((item) => {
                    const shipment = item?.Shipment || item;

                    if (shipment?.AWB) {
                        shipmentMap.set(
                            String(shipment.AWB).trim(),
                            shipment
                        );
                    }
                });
                const formattedParcels = orderAwbs.map((awb) => {
                    const shipment = shipmentMap.get(awb);

                    const courierStatus =
                        normalizeCourierStatus(shipment);

                    return {
                        awb,
                        parcelName: order.items.map(ele => ({waybill: ele.waybill, title: ele.product_title})),
                        refnum: shipment?.ReferenceNo || "",

                        status: courierStatus || sellerStatus,

                        courierStatus:
                            shipment?.Status?.Status || "",

                        location:
                            shipment?.Status?.StatusLocation || "",

                        statusDate:
                            shipment?.Status?.StatusDateTime || null,

                        expectedDelivery:
                            shipment?.ExpectedDeliveryDate || null,

                        deliveryDate:
                            shipment?.DeliveryDate || null,

                        scans: shipment?.Scans || [],

                        trackingAvailable: Boolean(shipment),
                    };
                });

                if (isMounted) {
                    setParcels(formattedParcels);
                }

            } catch (error) {
                console.error("Tracking API Error:", error);

                if (isMounted) {
                    setTrackingError(
                        "Unable to refresh shipping updates."
                    );
                }

            } finally {
                if (isMounted) {
                    setLoading(false);

                    timer = setTimeout(
                        fetchTracking,
                        TRACKING_REFRESH_INTERVAL
                    );
                }
            }
        };

        setParcels([]);
        setExpandedAwb(null);
        fetchTracking();

        return () => {
            isMounted = false;
            clearTimeout(timer);
        };
    }, [trackingKey, sellerStatus]);

    // Toggle parcel
    const toggleParcel = (awb) => {
        setExpandedAwb((previous) =>
            previous === awb ? null : awb
        );
    };

    // Timeline UI
    const renderTimeline = (status) => {
        const activeIdx = TIMELINE_STEPS.indexOf(status);

        if (activeIdx === -1) return null;

        return (
            <div className="local-timeline py-3">
                {TIMELINE_STEPS.map((step, index) => {
                    const isDone = index < activeIdx;
                    const isActive = index === activeIdx;

                    const meta = TIMELINE_STATUS_META[step];

                    if (!meta) return null;

                    return (
                        <div
                            key={step}
                            className={`timeline-step ${
                                isDone
                                    ? "done"
                                    : isActive
                                    ? "active"
                                    : ""
                            }`}
                        >
                            <div className="step-marker">
                                <div className="step-dot"></div>

                                {index < TIMELINE_STEPS.length - 1 && (
                                    <div className="step-line"></div>
                                )}
                            </div>

                            <div className="step-content">
                                <span className="step-label">
                                    {meta.label}
                                </span>

                                {isActive && (
                                    <span className="step-status">
                                        In Progress
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    // Cancelled
    if (isCancelled) {
        return (
            <div className="d-flex align-items-center gap-2 p-3 rounded-3 bg-danger bg-opacity-10 border border-danger border-opacity-10">
                <i className="fas fa-times-circle text-danger"></i>

                <span className="small fw-bold text-danger">
                    {normalizedStatus === "payment_failed"
                        ? "Payment Failed"
                        : "Order Cancelled"}
                </span>
            </div>
        );
    }

    // // Confirmed
    if (sellerStatus === "confirmed") {
        return renderTimeline("confirmed");
    }

    // No AWB
    if (!orderAwbs.length) {
        return (
            <div>
                {renderTimeline(sellerStatus)}

                {sellerStatus === "processing" && (
                    <small className="text-muted">
                        Waiting for shipment tracking details.
                    </small>
                )}
            </div>
        );
    }

    // Initial loading
    if (!parcels.length) {
        return (
            <div>
                {/* {renderTimeline(sellerStatus)} */}

                <div className="text-center py-3">
                   
                        <>
                            <div
                                className="spinner-border spinner-border-sm text-primary mb-2"
                                role="status"
                            ></div>

                            <p className="small text-muted mb-0">
                                Loading parcel tracking...
                            </p>
                        </>
                 
                </div>
            </div>
        );
    }

    // Parcel-wise accordion
    return (
        <div className="parcel-tracking-wrapper">

            <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <h6 className="fw-bold mb-1">
                        Shipment Tracking
                    </h6>

                    <small className="text-muted">
                        {parcels.length} parcels in this order
                    </small>
                </div>

                <span className="small text-muted">
                    {loading ? (
                        <span>
                            <i className="fas fa-sync-alt fa-spin me-1"></i>
                            Updating
                        </span>
                    ) : (
                        <span>
                            <i className="fas fa-check-circle text-success me-1"></i>
                            Tracking
                        </span>
                    )}
                </span>
            </div>

            {trackingError && (
                <div className="alert alert-warning py-2 small">
                    {trackingError}
                </div>
            )}

            {parcels.map((parcel, index) => {
                const isExpanded =
                    expandedAwb === parcel.awb;

                const meta =
                    TIMELINE_STATUS_META[parcel.status];

                // Latest scan first
                const scans = [...parcel.scans].sort(
                    (a, b) =>
                        new Date(
                            b?.ScanDetail?.ScanDateTime || 0
                        ) -
                        new Date(
                            a?.ScanDetail?.ScanDateTime || 0
                        )
                );

                return (
                    <div
                        key={parcel.awb}
                        className={`parcel-accordion border rounded-3 mb-3 ${
                            isExpanded
                                ? "border-primary shadow-sm"
                                : ""
                        }`}
                    >
                        {/* Parcel Header */}
                        <button
                            type="button"
                            className="w-100 border-0 bg-transparent p-3 text-start"
                            onClick={() => toggleParcel(parcel.awb)}
                            aria-expanded={isExpanded}
                        >
                            <div className="d-flex align-items-center gap-3">

                                <div
                                    className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                                    style={{
                                        width: "44px",
                                        height: "44px",
                                        background: "#f0edff",
                                        color: "#6534dc",
                                    }}
                                >
                                    <i className="fas fa-box fa-lg"></i>
                                </div>

                                <div className="flex-grow-1 overflow-hidden">
                                    <div className="d-flex justify-content-between align-items-center gap-2">
                                        <strong className="text-dark column-text-truncate">
                                          {parcel.parcelName.filter(ele => ele.waybill == parcel.awb)[0].title}
                                        </strong>

                                        <span className="badge bg-primary">
                                            {meta?.label || parcel.status}
                                        </span>
                                    </div>

                                    <small className="text-muted d-block mt-1">
                                        AWB: {parcel.awb}
                                    </small>

                                    {parcel.location && (
                                        <small className="text-muted d-block mt-1">
                                            <i className="fas fa-map-marker-alt me-1"></i>
                                            {parcel.location}
                                        </small>
                                    )}
                                </div>

                                <i
                                    className={`fas ${
                                        isExpanded
                                            ? "fa-chevron-up"
                                            : "fa-chevron-down"
                                    } text-muted`}
                                ></i>
                            </div>
                        </button>

                        {/* Expanded Parcel Details */}
                        {isExpanded && (
                            <div className="border-top p-3">

                                {!parcel.trackingAvailable && (
                                    <div className="alert alert-warning small">
                                        Courier tracking details are not available yet.
                                    </div>
                                )}

                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <strong className="small">
                                        Parcel Journey
                                    </strong>

                                    {parcel.statusDate && (
                                        <small className="text-muted">
                                            {formatTrackingDate(parcel.statusDate)}
                                        </small>
                                    )}
                                </div>

                                {renderTimeline(parcel.status)}

                                {parcel.expectedDelivery && (
                                    <div className="rounded-3 p-3 mb-3 bg-light">
                                        <small className="text-muted d-block">
                                            Expected Delivery
                                        </small>

                                        <strong>
                                            {formatTrackingDate(
                                                parcel.expectedDelivery
                                            )}
                                        </strong>
                                    </div>
                                )}

                                {/* Actual Delhivery scan history */}
                                {scans.length > 0 && (
                                    <div className="mt-3">
                                        <h6 className="small fw-bold mb-3">
                                            Tracking History
                                        </h6>

                                        {scans.map((scan, scanIndex) => {
                                            const detail =
                                                scan?.ScanDetail || {};

                                            return (
                                                <div
                                                    key={`${parcel.awb}-${scanIndex}`}
                                                    className="d-flex gap-3 mb-3"
                                                >
                                                    <div
                                                        className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center flex-shrink-0"
                                                        style={{
                                                            width: "30px",
                                                            height: "30px",
                                                        }}
                                                    >
                                                        <i className="fas fa-map-marker-alt text-primary small"></i>
                                                    </div>

                                                    <div className="flex-grow-1">
                                                        <strong className="small d-block">
                                                            {detail.Scan || "Shipment Update"}
                                                        </strong>

                                                        {detail.ScannedLocation && (
                                                            <small className="text-muted d-block">
                                                                {detail.ScannedLocation}
                                                            </small>
                                                        )}

                                                        {detail.Instructions && (
                                                            <small className="text-muted d-block">
                                                                {detail.Instructions}
                                                            </small>
                                                        )}

                                                        {detail.ScanDateTime && (
                                                            <small className="text-muted d-block mt-1">
                                                                {formatTrackingDate(
                                                                    detail.ScanDateTime
                                                                )}
                                                            </small>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {parcel.deliveryDate && (
                                    <div className="alert alert-success small mb-0">
                                        <i className="fas fa-check-circle me-2"></i>
                                        Delivered on{" "}
                                        {formatTrackingDate(
                                            parcel.deliveryDate
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default OrderTimeline;
