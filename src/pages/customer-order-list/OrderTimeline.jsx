
import { useCallback, useEffect, useMemo, useState } from "react";

import {
    TIMELINE_STEPS,
    TIMELINE_STATUS_META,
    fetchOrderStatusByTracking
} from "../../helper/GlobalHelper";

import "./orderpage.css";

const TRACKING_REFRESH_INTERVAL = 2 * 60 * 1000;

const JOURNEY_STAGES = [
    { key: "confirmed", label: "Order Confirmed" },
    { key: "processing", label: "Processing / Ready For Pickup" },
    { key: "manifested", label: "Manifested" },
    { key: "picked_up", label: "Picked Up" },
    { key: "in_transit", label: "In Transit" },
    { key: "at_destination_hub", label: "At Destination Hub" },
    { key: "out_for_delivery", label: "Out For Delivery" },
    { key: "delivered", label: "Delivered" }
];

const STAGE_INDEX = Object.fromEntries(
    JOURNEY_STAGES.map((stage, index) => [stage.key, index])
);

const STATUS_ALIASES = {
    placed: "confirmed",
    shipped: "in_transit",
    ready_for_pickup: "processing",
    ready_for_pickup_order: "processing",
    manifested: "manifested",
    pickedup: "picked_up",
    pickup: "picked_up",
    delivered: "delivered"
};

const CANCELLED_STATUSES = new Set([
    "cancelled",
    "payment_failed"
]);

const normalize = (value = "") =>
    String(value)
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");

const normalizeSellerStatus = (status) => {
    const value = normalize(status);

    return STATUS_ALIASES[value] || value;
};

const formatTrackingDate = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "";

    return parsedDate.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    });
};

// Extract Delhivery response safely
const extractShipments = (response) => {
    const payload = response?.data ?? response;

    if (Array.isArray(payload)) return payload;

    if (Array.isArray(payload?.ShipmentData)) {
        return payload.ShipmentData;
    }

    if (Array.isArray(payload?.data?.ShipmentData)) {
        return payload.data.ShipmentData;
    }

    return [];
};

// Delhivery shipment status
const normalizeCourierStatus = (shipment) => {
    const raw = normalize(shipment?.Status?.Status);

    if (!raw) return null;

    if (
        raw.includes("undelivered") ||
        raw.includes("returntoorigin") ||
        raw.includes("rto") ||
        raw.includes("cancelled") ||
        raw.includes("exception")
    ) {
        return null;
    }

    if (raw.includes("delivered")) return "delivered";

    if (raw.includes("outfordelivery")) {
        return "out_for_delivery";
    }

    if (
        raw.includes("destinationhub") ||
        raw.includes("reacheddestination") ||
        raw.includes("arrivedatdestination")
    ) {
        return "at_destination_hub";
    }

    if (
        raw.includes("pickedup") ||
        raw.includes("pickupdone") ||
        raw.includes("shipmentpicked")
    ) {
        return "picked_up";
    }

    if (
        raw.includes("manifest") ||
        raw.includes("datareceived")
    ) {
        return "manifested";
    }

    if (
        raw.includes("intransit") ||
        raw.includes("dispatched") ||
        raw.includes("arrivedathub") ||
        raw.includes("departedfromhub") ||
        raw.includes("shipmentarrived")
    ) {
        return "in_transit";
    }

    return null;
};

// Map individual tracking scans to journey stages
const getScanStage = (scan) => {
    const detail = scan?.ScanDetail || {};

    const value = normalize(
        `${detail.Scan || ""} ${detail.Instructions || ""}`
    );

    if (!value) return null;

    // More specific matches first
    if (
        value.includes("undelivered") ||
        value.includes("returntoorigin") ||
        value.includes("rto") ||
        value.includes("exception")
    ) {
        return null;
    }

    if (value.includes("delivered")) {
        return "delivered";
    }

    if (
        value.includes("outfordelivery") ||
        value.includes("outfordel")
    ) {
        return "out_for_delivery";
    }

    if (
        value.includes("destinationhub") ||
        value.includes("reacheddestination") ||
        value.includes("arrivedatdestination")
    ) {
        return "at_destination_hub";
    }

    if (
        value.includes("pickedup") ||
        value.includes("pickupdone") ||
        value.includes("shipmentpicked")
    ) {
        return "picked_up";
    }

    if (
        value.includes("manifest") ||
        value.includes("datareceived")
    ) {
        return "manifested";
    }

    if (
        value.includes("intransit") ||
        value.includes("dispatched") ||
        value.includes("arrivedathub") ||
        value.includes("departedfromhub") ||
        value.includes("shipmentarrived") ||
        value.includes("forwarded")
    ) {
        return "in_transit";
    }

    return null;
};

const getSortedScans = (scans = []) => {
    if (!Array.isArray(scans)) return [];

    return scans
        .filter(scan => scan?.ScanDetail)
        .map((scan, index) => ({
            ...scan,
            _originalIndex: index
        }))
        .sort((a, b) => {
            const dateA = new Date(
                a.ScanDetail?.ScanDateTime || 0
            ).getTime();

            const dateB = new Date(
                b.ScanDetail?.ScanDateTime || 0
            ).getTime();

            return dateB - dateA;
        });
};

function ParcelJourney({
    parcel,
    orderStatus,
    expandedStages,
    onToggleStage
}) {
    const scans = useMemo(
        () => getSortedScans(parcel.scans),
        [parcel.scans]
    );

    const groupedScans = useMemo(() => {
        const groups = Object.fromEntries(
            JOURNEY_STAGES.map(stage => [stage.key, []])
        );

        scans.forEach(scan => {
            const stage = getScanStage(scan);

            if (stage && groups[stage]) {
                groups[stage].push(scan);
            }
        });

        return groups;
    }, [scans]);

    // Find the furthest confirmed tracking stage
    const scanStages = scans
        .map(getScanStage)
        .filter(Boolean);

    const latestScanStage = scanStages.reduce(
        (latest, stage) =>
            STAGE_INDEX[stage] > STAGE_INDEX[latest]
                ? stage
                : latest,
        scanStages[0] || null
    );

    const courierStatus = normalizeCourierStatus({
        Status: { Status: parcel.courierStatus }
    });

    const sellerStatus = normalizeSellerStatus(orderStatus);

    const effectiveStatus =
        courierStatus ||
        latestScanStage ||
        sellerStatus;

    const currentIndex =
        STAGE_INDEX[effectiveStatus] ?? -1;

    const exceptionalStatus = normalize(
        parcel.courierStatus
    );

    const hasException =
        exceptionalStatus.includes("undelivered") ||
        exceptionalStatus.includes("returntoorigin") ||
        exceptionalStatus.includes("exception") ||
        exceptionalStatus === "rto";

    return (
        <div className="parcel-journey">

            {JOURNEY_STAGES.map((stage, index) => {
                const stageScans = groupedScans[stage.key];

                const isCompleted =
                    currentIndex >= 0 &&
                    index < currentIndex;

                const isCurrent =
                    index === currentIndex;

                const isExpanded =
                    Boolean(expandedStages[stage.key]);

                const hasScans = stageScans.length > 0;

                const collapseId =
                    `journey-${parcel.awb}-${stage.key}`;

                return (
                    <div
                        key={stage.key}
                        className="d-flex gap-3 position-relative journey-stage"
                    >
                        {/* Timeline marker */}
                        <div className="d-flex flex-column align-items-center">
                            <div
                                className={`journey-marker ${isCompleted
                                    ? "completed"
                                    : isCurrent
                                        ? "current"
                                        : "pending"
                                    }`}
                            >
                                <i className={`fas ${isCompleted || (
                                    isCurrent &&
                                    stage.key === "delivered"
                                )
                                    ? "fa-check"
                                    : "fa-circle"
                                    }`} />
                            </div>

                            {index !== JOURNEY_STAGES.length - 1 && (
                                <div
                                    className={`journey-line ${isCompleted
                                        ? "completed"
                                        : ""
                                        }`}
                                />
                            )}
                        </div>

                        {/* Stage content */}
                        <div className="flex-grow-1 pb-3 min-w-0 cursor-pointer"
                            onClick={() =>
                                onToggleStage(stage.key)
                            }
                        >

                            <div className="d-flex align-items-center justify-content-between gap-2">

                                <div className="min-w-0">
                                    <strong className="small">
                                        {stage.label}
                                    </strong>

                                    {isCurrent && (
                                        <span className="ms-2 badge bg-primary">
                                            Current
                                        </span>
                                    )}
                                </div>

                                {hasScans && (
                                    <button
                                        type="button"
                                        className="journey-toggle"
                                        aria-expanded={isExpanded}
                                        aria-controls={collapseId}
                                        aria-label={`${isExpanded ? "Hide" : "Show"
                                            } ${stage.label} tracking details`}
                                    >


                                        <i className={`fas ms-2 ${isExpanded
                                            ? "fa-chevron-up"
                                            : "fa-chevron-down"
                                            }`} />
                                    </button>
                                )}
                            </div>

                            <small className="text-muted d-block mt-1">
                                {hasScans
                                    ? `${stageScans.length} tracking ${stageScans.length === 1
                                        ? "update"
                                        : "updates"
                                    }`
                                    : isCompleted
                                        ? "Completed"
                                        : isCurrent
                                            ? "In progress"
                                            : "Awaiting update"}
                            </small>

                            {/* Stage scan accordion */}
                            {hasScans && isExpanded && (
                                <div
                                    id={collapseId}
                                    className="rounded-3 border p-3 mt-2 bg-light"
                                >
                                    {stageScans.map((scan, scanIndex) => {
                                        const detail =
                                            scan.ScanDetail || {};

                                        return (
                                            <div
                                                key={`${parcel.awb}-${scan._originalIndex}`}
                                                className={
                                                    scanIndex !== stageScans.length - 1
                                                        ? "border-bottom pb-3 mb-3"
                                                        : ""
                                                }
                                            >
                                                <strong className="small d-block">
                                                    {detail.Scan ||
                                                        "Shipment Update"}
                                                </strong>

                                                {detail.ScannedLocation && (
                                                    <small className="text-muted d-block mt-1">
                                                        <i className="fas fa-map-marker-alt me-1" />
                                                        {detail.ScannedLocation}
                                                    </small>
                                                )}

                                                {detail.Instructions && (
                                                    <small className="text-muted d-block mt-1">
                                                        {detail.Instructions}
                                                    </small>
                                                )}

                                                {detail.ScanDateTime && (
                                                    <small className="text-muted d-block mt-2">
                                                        <i className="far fa-clock me-1" />
                                                        {formatTrackingDate(
                                                            detail.ScanDateTime
                                                        )}
                                                    </small>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}

            {hasException && (
                <div className="alert alert-warning small mt-2 mb-3">
                    <i className="fas fa-exclamation-triangle me-2" />
                    {parcel.courierStatus}
                </div>
            )}

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

            {parcel.deliveryDate && (
                <div className="alert alert-success small mb-0">
                    <i className="fas fa-check-circle me-2" />
                    Delivered on{" "}
                    {formatTrackingDate(parcel.deliveryDate)}
                </div>
            )}
        </div>
    );
}

function OrderTimeline({ currentStatus, order }) {
    const [parcels, setParcels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [trackingError, setTrackingError] = useState("");

    const [expandedAwb, setExpandedAwb] = useState(null);
    const [expandedStages, setExpandedStages] = useState({});

    const normalizedStatus = normalize(currentStatus);

    const sellerStatus =
        STATUS_ALIASES[normalizedStatus] || normalizedStatus;

    const isCancelled = CANCELLED_STATUSES.has(normalizedStatus);

    const orderItems = useMemo(
        () => Array.isArray(order?.items) ? order.items : [],
        [order?.items]
    );

    const orderAwbs = useMemo(() => {
        return [
            ...new Set(
                orderItems
                    .map(item =>
                        String(
                            item?.waybill ||
                            item?.awb ||
                            ""
                        ).trim()
                    )
                    .filter(Boolean)
            )
        ];
    }, [orderItems]);

    const trackingKey = useMemo(
        () => [
            order?.order_number ||
            order?.order_id ||
            order?.id ||
            "",
            orderAwbs.join(",")
        ].join("|"),
        [
            order?.order_number,
            order?.order_id,
            order?.id,
            orderAwbs
        ]
    );

    const fetchTracking = useCallback(async (signal) => {
        if (
            isCancelled ||
            !order ||
            !orderAwbs.length
        ) {
            setParcels([]);
            setTrackingError("");
            return;
        }

        setLoading(true);
        setTrackingError("");

        try {
            const response =
                await fetchOrderStatusByTracking(order);

            if (signal.aborted) return;

            const shipments = extractShipments(response);

            const shipmentMap = new Map();

            shipments.forEach(item => {
                const shipment = item?.Shipment || item;

                const awb = String(
                    shipment?.AWB || ""
                ).trim();

                if (awb) {
                    shipmentMap.set(awb, shipment);
                }
            });

            const formattedParcels = orderAwbs.map(awb => {
                const shipment = shipmentMap.get(awb);

                const item = orderItems.find(
                    product =>
                        String(
                            product?.waybill ||
                            product?.awb ||
                            ""
                        ).trim() === awb
                );

                return {
                    awb,
                    parcelName:
                        item?.product_title ||
                        item?.title ||
                        "Shipment Parcel",

                    refnum: shipment?.ReferenceNo || "",

                    status:
                        normalizeCourierStatus(shipment) ||
                        sellerStatus,

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

                    scans: Array.isArray(shipment?.Scans)
                        ? shipment.Scans
                        : [],

                    trackingAvailable: Boolean(shipment)
                };
            });

            if (!signal.aborted) {
                setParcels(formattedParcels);
            }

        } catch (error) {
            if (!signal.aborted) {
                console.error("Tracking API Error:", error);

                setTrackingError(
                    "Unable to refresh shipping updates. Please try again."
                );
            }
        } finally {
            if (!signal.aborted) {
                setLoading(false);
            }
        }
    }, [
        trackingKey,
        sellerStatus,
        isCancelled,
        order,
        orderItems,
        orderAwbs
    ]);

    // Controlled polling with cleanup
    useEffect(() => {
        const controller = new AbortController();

        let timer;

        const refresh = async () => {
            await fetchTracking(controller.signal);

            if (!controller.signal.aborted) {
                timer = setTimeout(
                    refresh,
                    TRACKING_REFRESH_INTERVAL
                );
            }
        };

        setParcels([]);
        setExpandedAwb(null);
        setExpandedStages({});

        refresh();

        return () => {
            controller.abort();
            clearTimeout(timer);
        };
    }, [fetchTracking]);

    const toggleParcel = (awb) => {
        setExpandedAwb(previous =>
            previous === awb ? null : awb
        );

        setExpandedStages({});
    };

    const toggleStage = (stageKey) => {
        setExpandedStages(previous => ({
            ...previous,
            [stageKey]: !previous[stageKey]
        }));
    };

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
                            className={`timeline-step ${isDone
                                ? "done"
                                : isActive
                                    ? "active"
                                    : ""
                                }`}
                        >
                            <div className="step-marker">
                                <div className="step-dot" />

                                {index < TIMELINE_STEPS.length - 1 && (
                                    <div className="step-line" />
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

    // Cancelled and payment failed
    if (isCancelled) {
        return (
            <div className="d-flex align-items-center gap-2 p-3 rounded-3 bg-danger bg-opacity-10 border border-danger border-opacity-10">
                <i className="fas fa-times-circle text-danger" />

                <span className="small fw-bold text-danger">
                    {normalizedStatus === "paymentfailed"
                        ? "Payment Failed"
                        : "Order Cancelled"}
                </span>
            </div>
        );
    }

    // No parcel AWB yet
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
    if (!parcels.length && loading) {
        return (
            <div className="text-center py-3">
                <div
                    className="spinner-border spinner-border-sm text-primary mb-2"
                    role="status"
                />

                <p className="small text-muted mb-0">
                    Loading parcel tracking...
                </p>
            </div>
        );
    }

    return (
        <div className="parcel-tracking-wrapper">

            <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <h6 className="fw-bold mb-1">
                        Shipment Tracking
                    </h6>

                    <small className="text-muted">
                        {orderAwbs.length} parcels in this order
                    </small>
                </div>

                <span className="small text-muted">
                    {loading ? (
                        <>
                            <i className="fas fa-sync-alt fa-spin me-1" />
                            Updating
                        </>
                    ) : (
                        <>
                            <i className="fas fa-check-circle text-success me-1" />
                            Tracking
                        </>
                    )}
                </span>
            </div>

            {trackingError && (
                <div className="alert alert-warning py-2 small">
                    {trackingError}
                </div>
            )}

            {parcels.length === 0 && (
                <div className="alert alert-info small">
                    Courier tracking information is not available yet.
                    Your order status is still being maintained.
                </div>
            )}

            {parcels.map(parcel => {
                const isExpanded =
                    expandedAwb === parcel.awb;

                const meta =
                    TIMELINE_STATUS_META[parcel.status];

                return (
                    <div
                        key={parcel.awb}
                        className={`parcel-accordion border rounded-3 mb-3 ${isExpanded
                            ? "border-primary shadow-sm"
                            : ""
                            }`}
                    >
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
                                        width: 44,
                                        height: 44,
                                        background: "#f0edff",
                                        color: "#6534dc"
                                    }}
                                >
                                    <i className="fas fa-box fa-lg" />
                                </div>

                                <div className="flex-grow-1 overflow-hidden">
                                    <div className="d-flex justify-content-between align-items-center gap-2">
                                        <strong className="text-dark column-text-truncate">
                                            {parcel.parcelName}
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
                                            <i className="fas fa-map-marker-alt me-1" />
                                            {parcel.location}
                                        </small>
                                    )}
                                </div>

                                <i
                                    className={`fas ${isExpanded
                                        ? "fa-chevron-up"
                                        : "fa-chevron-down"
                                        } text-muted`}
                                />
                            </div>
                        </button>

                        {isExpanded && (
                            <div className="border-top p-3">

                                {!parcel.trackingAvailable && (
                                    <div className="alert alert-warning small">
                                        Courier tracking details are not available yet.
                                    </div>
                                )}

                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <strong className="small">
                                        Parcel Journey
                                    </strong>

                                    {parcel.statusDate && (
                                        <small className="text-muted">
                                            {formatTrackingDate(
                                                parcel.statusDate
                                            )}
                                        </small>
                                    )}
                                </div>

                                <ParcelJourney
                                    parcel={parcel}
                                    orderStatus={sellerStatus}
                                    expandedStages={expandedStages}
                                    onToggleStage={toggleStage}
                                />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default OrderTimeline;
