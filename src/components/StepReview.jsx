// components/StepReview.jsx
import { Col, Row, Stack } from "react-bootstrap";
import { FMT } from "../helper/GlobalHelper";
import { useEffect } from "react";
import shiprocketApi from "../api/shiprocket.api";

const METHOD_LABELS = {
    card: { icon: "💳", label: "Credit / Debit Card" },
    upi: { icon: "📱", label: "UPI" },
    netbanking: { icon: "🏦", label: "Net Banking" },
    wallet: { icon: "👛", label: "Mobile Wallet" },
    cod: { icon: "💵", label: "Cash on Delivery" },
};

export default function StepReview({
    cart, address, paymentMethod,
    coupon, discount, couponMsg,
    subtotal, saved, couponSave, delivery, tax_amount, total,
    placing,
    onCouponChange, onCouponApply,
    onBack, onPlace,
    setTotalDeliveryAmount
}) {
    const method = METHOD_LABELS[paymentMethod] || {};



    useEffect(() => {
        let isCancelled = false;

        const calculateShipping = async () => {
            try {
                if (!cart?.length || !address?.pincode) return;

                const sellerWiseData = Object.create(null);
                let totalQuantity = 0;

                const paymentType =
                    paymentMethod === "cod" ? "COD" : "Pre-paid";

                // STEP 1: Group products seller-wise
                cart.forEach((item) => {
                    const product = item?.product || item;

                    const sellerId =
                        item?.seller_id || product?.seller_id;

                    const pickupPin =
                        item?.seller?.pincode ||
                        product?.seller?.pincode ||
                        item?.pincode;

                    const length = Number(
                        product?.length ??
                        product?.length_cm ??
                        0
                    );

                    const breadth = Number(
                        product?.breadth ??
                        product?.width ??
                        product?.breadth_cm ??
                        0
                    );

                    const height = Number(
                        product?.height ??
                        product?.height_cm ??
                        0
                    );

                    // Actual weight in grams (per unit)
                    const actualWeight = Number(
                        product?.weight ??
                        product?.actual_weight ??
                        0
                    );

                    // IMPORTANT: Support both quantity and qty
                    const quantity = Number(
                        item?.quantity ??
                        item?.qty ??
                        product?.quantity ??
                        1
                    );

                    if (!sellerId) {
                        throw new Error(
                            "Seller ID missing in cart product."
                        );
                    }

                    if (
                        !pickupPin ||
                        !/^\d{6}$/.test(String(pickupPin))
                    ) {
                        throw new Error(
                            `Invalid pickup pincode for seller ${sellerId}`
                        );
                    }

                    if (
                        ![
                            length,
                            breadth,
                            height,
                            actualWeight,
                            quantity
                        ].every(Number.isFinite) ||
                        length <= 0 ||
                        breadth <= 0 ||
                        height <= 0 ||
                        actualWeight <= 0 ||
                        !Number.isInteger(quantity) ||
                        quantity <= 0
                    ) {
                        throw new Error(
                            `Invalid weight, dimensions or quantity for product ${product?.id}`
                        );
                    }

                    // Use exactly the same quantity everywhere
                    totalQuantity += quantity;

                    if (!sellerWiseData[sellerId]) {
                        sellerWiseData[sellerId] = {
                            seller_id: sellerId,
                            o_pin: String(pickupPin),
                            d_pin: String(address.pincode),
                            md: "S",
                            ss: "Delivered",
                            pt: paymentType,

                            total_actual_weight: 0,

                            parcel_length: 0,
                            parcel_breadth: 0,
                            parcel_height: 0,

                            products: []
                        };
                    }

                    const seller = sellerWiseData[sellerId];

                    // STEP 2: Calculate total actual weight
                    // Unit weight * product quantity
                    seller.total_actual_weight +=
                        actualWeight * quantity;

                    // STEP 3: Calculate combined parcel dimensions
                    // Existing vertical stacking strategy preserved

                    seller.parcel_length = Math.max(
                        seller.parcel_length,
                        length
                    );

                    seller.parcel_breadth = Math.max(
                        seller.parcel_breadth,
                        breadth
                    );

                    seller.parcel_height +=
                        height * quantity;

                    // Maintain individual product details
                    seller.products.push({
                        product_id: product?.id,
                        quantity,

                        actual_weight: actualWeight,

                        total_product_weight:
                            actualWeight * quantity,

                        length,
                        breadth,
                        height,

                        total_product_height:
                            height * quantity
                    });
                });

                // STEP 4: Calculate seller-wise parcel weight
                const shippingPayload = Object.values(
                    sellerWiseData
                ).map((seller) => {
                    const {
                        parcel_length,
                        parcel_breadth,
                        parcel_height,
                        total_actual_weight
                    } = seller;

                    // Volumetric weight in grams
                    const volumetricWeight = Math.ceil(
                        (
                            parcel_length *
                            parcel_breadth *
                            parcel_height
                        ) / 5000 * 1000
                    );

                    // Actual weight in grams
                    const actualWeight = Math.ceil(
                        total_actual_weight
                    );

                    // Chargeable weight in grams
                    const chargeableWeight = Math.ceil(
                        Math.max(
                            actualWeight,
                            volumetricWeight
                        )
                    );

                    return {
                        ...seller,

                        cgm: chargeableWeight,

                        actual_weight: actualWeight,

                        volumetric_weight: volumetricWeight,

                        chargeable_weight: chargeableWeight,

                        dimensions: {
                            length: parcel_length,
                            breadth: parcel_breadth,
                            height: parcel_height
                        }
                    };
                });

                // STEP 5: Call Delhivery API seller-wise
                const shippingResponses = await Promise.all(
                    shippingPayload.map(async (payload) => {
                        try {
                            const response =
                                await shiprocketApi.calculateShippingCharges({
                                    md: payload.md,
                                    ss: payload.ss,
                                    o_pin: payload.o_pin,
                                    d_pin: payload.d_pin,
                                    cgm: payload.cgm,
                                    pt: paymentType
                                });

                            const apiResult = response?.data;

                            // Delhivery returns an array inside data
                            const quote = apiResult?.[0];

                            if (!quote) {
                                throw new Error(
                                    "Shipping quote not found from Delhivery."
                                );
                            }

                            const taxData = quote.tax_data || {};

                            const gst =
                                Number(taxData.SGST || 0) +
                                Number(taxData.CGST || 0) +
                                Number(taxData.IGST || 0);

                            return {
                                success: true,

                                seller_id: payload.seller_id,

                                parcel: {
                                    actual_weight:
                                        payload.actual_weight,

                                    volumetric_weight:
                                        payload.volumetric_weight,

                                    chargeable_weight:
                                        payload.chargeable_weight,

                                    dimensions:
                                        payload.dimensions
                                },

                                products: payload.products,

                                shipping: {
                                    shippingCharge: Number(
                                        quote.total_amount || 0
                                    ),

                                    grossAmount: Number(
                                        quote.gross_amount || 0
                                    ),

                                    chargedWeight: Number(
                                        quote.charged_weight || 0
                                    ),

                                    zone: quote.zone,

                                    status: quote.status,

                                    gst,

                                    tax_data: taxData
                                }
                            };

                        } catch (error) {
                            console.error(
                                `Shipping failed for seller ${payload.seller_id}:`,
                                error
                            );

                            return {
                                success: false,

                                seller_id: payload.seller_id,

                                error:
                                    error.response?.data ||
                                    error.message
                            };
                        }
                    })
                );

                if (isCancelled) return;

                // STEP 6: Calculate successful shipping responses
                const successfulResponses =
                    shippingResponses.filter(
                        (item) => item.success
                    );

                const totalShipping = {
                    shippingCharge: successfulResponses.reduce(
                        (sum, item) =>
                            sum + item.shipping.shippingCharge,
                        0
                    ),

                    grossAmount: successfulResponses.reduce(
                        (sum, item) =>
                            sum + item.shipping.grossAmount,
                        0
                    ),

                    chargedWeight: successfulResponses.reduce(
                        (sum, item) =>
                            sum + item.shipping.chargedWeight,
                        0
                    ),

                    gst: successfulResponses.reduce(
                        (sum, item) =>
                            sum + item.shipping.gst,
                        0
                    )
                };

                // STEP 7: Apply existing shipping discount
                // ₹49 discount per product quantity
                const shippingCost =
                    totalShipping.shippingCharge -
                    (49 * totalQuantity);

                // Existing minimum shipping charge preserved
                const finalShippingCharge =
                    shippingCost <= 49
                        ? 49
                        : shippingCost || 0;

                if (!isCancelled) {
                    setTotalDeliveryAmount({
                        ...totalShipping,
                        shippingCharge: finalShippingCharge
                    });
                }

                // Optional debugging
                console.log("Shipping Calculation:", {
                    totalQuantity,
                    sellerCount: shippingPayload.length,
                    sellerPayload: shippingPayload,
                    shippingResponses,
                    totalShipping,
                    finalShippingCharge
                });

            } catch (error) {
                if (!isCancelled) {
                    console.error(
                        "Shipping calculation error:",
                        error
                    );
                }
            }
        };

        calculateShipping();

        return () => {
            isCancelled = true;
        };

    }, [cart, address?.pincode, paymentMethod]);



    return (
        <div>
            <p className="co-section-title">📋 Review Your Order</p>
            {/* ── Address ── */}
            <div className="co-review-block">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="co-review-block-header mb-0">
                        <span>📦 Delivering to</span>
                    </div>
                    <div style={{
                        background: "var(--primary-gradient)",
                        borderRadius: 8, padding: "3px 10px",
                        fontSize: ".72rem", fontWeight: 800, color: "#ffffff"
                    }}>
                        {address?.label}
                    </div>
                </div>
                <p style={{ fontWeight: 800, fontSize: "0.9rem", color: "#1a1a2e", marginBottom: 3 }}>
                    {address?.name}
                </p>
                <p style={{ fontSize: "0.82rem", color: "#6b7280", fontWeight: 700, marginBottom: 2 }}>
                    {address?.address_line_1}
                    {address?.address_line_2 ? `, ${address.address_line_2}` : ""}
                </p>
                <p style={{ fontSize: "0.82rem", color: "#6b7280", fontWeight: 700, marginBottom: 2 }}>
                    {address?.city}, {address?.state} — {address?.pincode}
                </p>
                <p style={{ fontSize: "0.82rem", color: "#6b7280", fontWeight: 700, marginBottom: 0 }}>
                    📞 {address?.mobile || address?.phone}
                </p>
            </div>

            {/* ── Payment ── */}
            <div className="co-review-block">
                <div className="co-review-block-header">
                    <span>💳 Payment via</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <span style={{ fontSize: 22 }}>{method.icon}</span>
                    <span style={{ fontWeight: 800, fontSize: "0.9rem", color: "#1a1a2e" }}>
                        {method.label}
                    </span>
                </div>
            </div>

            {/* ── Items ── */}
            <div className="co-review-block">
                <div className="co-review-block-header">
                    <span>🛍️ {cart.length} item{cart.length !== 1 ? "s" : ""}</span>
                </div>
                {cart.map((item) => (
                    <div key={item.id} className="co-order-item">
                        <img
                            src={item.image_url?.split(',')[0].replace(/[{}"\\]/g, "")}
                            alt={item.title}
                            className="co-order-img"
                            onError={(e) => {
                                e.target.src = `https://placehold.co/52x52/f1f4ff/ff6b35?text=${encodeURIComponent((item.title || "P").slice(0, 2))}`;
                            }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p className="co-order-title mb-0">{item.title}</p>
                            <div className="co-order-meta">
                                {item.size && <span>{item.size}</span>}
                                {item.color && (
                                    <span
                                        style={{ width: 10, height: 10, borderRadius: "50%", background: item.color, border: "1px solid rgba(0,0,0,.12)", display: "inline-block" }}
                                    />
                                )}
                                <span>× {item.qty}</span>
                            </div>
                        </div>
                        <span className="co-order-price">{FMT(item.price)}</span>
                    </div>
                ))}
            </div>

            {/* ── Coupon ── */}
            <div className="co-review-block">
                <div className="co-review-block-header"><span>🏷️ Coupon</span></div>
                <div className="co-coupon-wrap">
                    <input
                        className="co-coupon-input"
                        placeholder="e.g. SAVE10"
                        value={coupon}
                        onChange={(e) => onCouponChange(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && onCouponApply()}
                    />
                    <button style={{ background: "#5a62f2ff", color: "white", width: "20%", border: "none", padding: "10px 0", fontWeight: 600, fontSize: "1.1rem", borderRadius: "10px" }} onClick={onCouponApply}>Apply</button>

                </div>
                {couponMsg && (
                    <p style={{ fontSize: "0.75rem", fontWeight: 700, marginTop: 6, color: couponMsg.type === "success" ? "#16a34a" : "#dc2626" }}>
                        {couponMsg.text}
                    </p>
                )}
                {/* <p style={{ fontSize: "0.7rem", color: "#9ca3af", fontWeight: 700, marginTop: 4 }}>
                    Try: SAVE10 · SHOP20 · FIRST50
                </p> */}
            </div>

            {/* ── Price breakdown ── */}
            <div className="co-review-block">
                <div className="co-review-block-header"><span>💰 Price Breakdown</span></div>
                {[
                    { label: "Subtotal", val: FMT(subtotal), cls: "val" },

                    ...(saved > 0
                        ? [{ label: "Discount", val: `-${FMT(saved)}`, cls: "save" }]
                        : []),

                    ...(couponSave > 0
                        ? [{ label: `Coupon (${discount}%)`, val: `-${FMT(couponSave)}`, cls: "save" }]
                        : []),

                    { label: "Delivery Base Charge", val: FMT(delivery?.grossAmount), cls: "val" },
                    { label: "GST (18%)", val: FMT(delivery?.gst), cls: "val" },
                    {
                        label: "Total Delivery Charges (GST + Base Charge)",
                        val: FMT(delivery?.shippingCharge),
                        cls: "val"
                    }
                ].map(({ label, val, cls }) => (
                    <div key={label} className="co-summary-row">
                        <span className="label">{label}</span>
                        <span className={cls}>{val}</span>
                    </div>
                ))}
                <div className="co-divider" />
                <div className="co-total-row">
                    <span className="co-total-label">Total</span>
                    <span className="co-total-val">{FMT(total)}</span>
                </div>
            </div>

            <div className="d-flex flex-sm-row gap-2 mt-4">
                <button className="co-btn-back h-100 w-25 order-2 order-sm-1" onClick={onBack}>← Back</button>

                <button className="w-75 h-100 mt-2" disabled={placing} style={{ background: "#4261ecff", color: "white", border: "none", padding: "10px 0", fontWeight: 600, fontSize: "1.1rem", borderRadius: "10px" }} onClick={() => onPlace(total)}>{placing
                    ? "Placing Order…"
                    : `✅ Place Order · ${FMT(total)}`}
                </button>
            </div>
        </div >
    );
}