import React from "react";
import {
    Page,
    Text,
    View,
    Document,
    Image,
} from "@react-pdf/renderer";

import s from "../style/Shippinglabel.styles";
import { FORMATED_DATE_TIME } from "../helper/GlobalHelper";

const MAX_QTY_PER_PARCEL = 5;
const LABELS_PER_PAGE = 2;

const safeText = (value, fallback = "—") => {
    if (value === null || value === undefined || value === "") {
        return fallback;
    }

    return String(value);
};

const toNumber = (value) => {
    const number = Number(value ?? 0);
    return Number.isFinite(number) ? number : 0;
};

const money = (value) => toNumber(value).toFixed(2);

const parseImageUrl = (value) => {
    if (!value) return null;

    try {
        const parsed = JSON.parse(value);

        if (Array.isArray(parsed)) return parsed[0] || null;
        if (typeof parsed === "string") return parsed;

        if (parsed && typeof parsed === "object") {
            return Object.values(parsed)[0] || null;
        }
    } catch {
        return String(value)
            .replace(/[{}"]/g, "")
            .split(",")[0]
            .trim();
    }

    return null;
};

const getSellerData = (order = {}, item = {}) => {
    const seller = order?.seller_info || {};

    return {
        name:
            seller?.business_name ||
            item?.seller_business_name ||
            `${seller?.first_name || ""} ${seller?.last_name || ""
                }`.trim() ||
            seller?.name ||
            item?.seller_name ||
            "FlashiBuy Seller",

        phone:
            seller?.phone ||
            seller?.mobile ||
            item?.seller_phone ||
            "—",

        email:
            seller?.email ||
            item?.seller_email ||
            "—",

        address_line_1: seller?.address_line_1 || "",
        city: seller?.city || "",
        state: seller?.state || "",
        pincode: seller?.pincode || "",
        country: seller?.country || "India",
    };
};

/*
 * Modal parcel configuration ko use karta hai.
 * Agar configuration nahi mili, tabhi old automatic
 * quantity splitting use hoti hai.
 */

const roundMoney = (value) =>
    Math.round((toNumber(value) + Number.EPSILON) * 100) / 100;

const allocateAmount = (amount, weights) => {
    const totalCents = Math.round(toNumber(amount) * 100);
    const totalWeight = weights.reduce(
        (sum, weight) => sum + Math.max(0, toNumber(weight)),
        0
    );

    let allocatedCents = 0;

    return weights.map((weight, index) => {
        // Give the final parcel the remaining cents so rounding
        // never makes the sum different from the order amount.
        if (index === weights.length - 1) {
            return (totalCents - allocatedCents) / 100;
        }

        const cents =
            totalWeight > 0
                ? Math.round(
                    totalCents *
                    Math.max(0, toNumber(weight)) /
                    totalWeight
                )
                : Math.round(totalCents / weights.length);

        allocatedCents += cents;

        return cents / 100;
    });
};

const generateShipmentLabels = (order = {}) => {
    const parcelConfig = order?.parcelConfig;

    let parcels = [];

    // 1. Use parcel selections from ShippingLabelModal.
    if (
        Array.isArray(parcelConfig?.parcels) &&
        parcelConfig.parcels.length > 0
    ) {
        parcels = parcelConfig.parcels.map((parcel, index) => {
            const quantity = toNumber(
                parcel.parcel_quantity ?? parcel.quantity
            );

            const unitPrice = toNumber(parcel.unit_price);

            return {
                ...parcel,
                id:
                    parcel.id ||
                    parcel.product_id ||
                    `parcel-${index + 1}`,
                product_id: parcel.product_id || parcel.id || null,
                product_title:
                    parcel.product_title ||
                    parcel.title ||
                    parcel.name ||
                    "Product",
                parcel_quantity: quantity,
                quantity,
                unit_price: unitPrice,
                parcel_gross_amount: roundMoney(
                    unitPrice * quantity
                ),
                product_image: parseImageUrl(
                    parcel.product_image_url || parcel.product_image
                ),
                parcel_no:
                    toNumber(parcel.parcel_no) || index + 1,
                parcel_tracking_no:
                    parcel.parcel_tracking_no ||
                    `${order?.order_number || "ORD"}-P${toNumber(parcel.parcel_no) || index + 1}`,
            };
        });
    } else {
        // 2. Backward-compatible automatic splitting.
        const items = Array.isArray(order?.items)
            ? order.items
            : [];

        items.forEach((item) => {
            let remainingQty = toNumber(item?.quantity);
            const unitPrice = toNumber(item?.unit_price);

            while (remainingQty > 0) {
                const quantity = Math.min(
                    remainingQty,
                    MAX_QTY_PER_PARCEL
                );

                parcels.push({
                    ...item,
                    parcel_quantity: quantity,
                    quantity,
                    unit_price: unitPrice,
                    parcel_gross_amount: roundMoney(
                        unitPrice * quantity
                    ),
                    product_image: parseImageUrl(
                        item?.product_image_url ||
                        item?.product_image
                    ),
                });

                remainingQty -= quantity;
            }
        });
    }

    if (parcels.length === 0) return [];

    // 3. Calculate each parcel's gross product value.
    const grossAmounts = parcels.map((parcel) =>
        roundMoney(
            parcel.parcel_gross_amount ??
            toNumber(parcel.unit_price) *
            toNumber(parcel.parcel_quantity ?? parcel.quantity)
        )
    );

    const subtotal = roundMoney(
        grossAmounts.reduce((sum, amount) => sum + amount, 0)
    );

    // 4. Read order-level discount and delivery charges.
    // discount_amount is assumed to be a currency amount, not a percentage.
    const discountPercentage = toNumber(order.discount_percentage);

    const orderDiscount = roundMoney(
        order.discount_amount !== undefined &&
            order.discount_amount !== null
            ? order.discount_amount
            : subtotal * discountPercentage / 100
    );

    // Supports common field names; use the field your API actually returns.
    const orderDelivery = roundMoney(
        order.delivery_charge ??
        order.delivery_amount ??
        order.shipping_charge ??
        order.delivery_charges ??
        0
    );

    const orderTax = roundMoney(
        order.tax_amount ??
        order.tax ??
        0
    );

    // Prevent discount from exceeding the product subtotal.
    const safeDiscount = Math.min(
        Math.max(0, orderDiscount),
        subtotal
    );

    // 5. Allocate each order-level amount proportionally.
    const discounts = allocateAmount(safeDiscount, grossAmounts);
    const deliveries = allocateAmount(orderDelivery, grossAmounts);
    const taxes = allocateAmount(orderTax, grossAmounts);

    // 6. Calculate each parcel's final value and COD amount.
    return parcels.map((parcel, index) => {
        const gross = grossAmounts[index];
        const discount = discounts[index];
        const delivery = deliveries[index];
        const tax = taxes[index];

        const netAmount = roundMoney(
            gross - discount + delivery + tax
        );

        return {
            ...parcel,
            parcel_no:
                toNumber(parcel.parcel_no) || index + 1,
            total_parcels: parcels.length,
            parcel_gross_amount: gross,
            parcel_discount: discount,
            parcel_delivery: delivery,
            parcel_tax: tax,
            parcel_net_amount: netAmount,
            parcel_tracking_no:
                parcel.parcel_tracking_no ||
                `${order?.order_number || "ORD"}-P${index + 1}`,
        };
    });
};

const logo = '../../public/Light-logo.png'

const chunkArray = (array = [], size = 1) => {
    const chunks = [];

    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }

    return chunks;
};

const ShippingParcelLabel = ({
    order = {},
    shipment = {},
}) => {
    const address = order?.address_snapshot || {};
    const seller = getSellerData(order, shipment);

    const paymentMethod = String(
        order?.payment_method || ""
    ).toUpperCase();

    const isCOD = paymentMethod === "COD";

    const shipToAddress = [
        address?.address_line_1,
        address?.address_line_2,
    ]
        .filter(Boolean)
        .join(", ");

    const shipFromAddress = [
        seller?.address_line_1,
    ]
        .filter(Boolean)
        .join(", ");

    const orderDate = order?.created_time
        ? FORMATED_DATE_TIME(order.created_time)
        : "—";


    const qrDataUrl =
        order?.trackingQr ||
        order?.qrDataUrl ||
        null;

    /*
     * Parcel-wise COD.
     * Confirm that your courier supports parcel-wise COD
     * before using these amounts for actual collection.
     */
    const codCollectAmount = isCOD
        ? toNumber(shipment?.parcel_net_amount)
        : 0;

    const codInfoText = isCOD
        ? "COLLECT PARCEL COD"
        : "PAYMENT";

    return (
        <View style={s.labelCard} wrap={false}>
            <View style={s.header}>
                <View>
                    <Image
                        src={logo}
                        style={{
                            ...s.logo,
                            width: "90px",
                            height: "auto",
                        }}
                    />
                    {/* <Text style={s.brand}>FlashiBuy</Text> */}
                    <Text style={s.brandSub}>
                        EXPRESS DELIVERY
                    </Text>
                </View>

                <View style={s.headerRight}>
                    <Text style={s.orderText}>
                        ORDER #{safeText(order?.order_number, "")}
                    </Text>

                    <Text style={s.parcelBadge}>
                        PARCEL {shipment?.parcel_no} OF{" "}
                        {shipment?.total_parcels}
                    </Text>
                </View>
            </View>

            <View style={s.body}>
                <View style={s.leftArea}>
                    <View style={s.addressRow}>
                        <View style={s.addressBox}>
                            <Text style={s.sectionLabel}>
                                DELIVER TO
                            </Text>

                            <Text style={s.nameText}>
                                {safeText(address?.name, "")}
                            </Text>

                            <Text style={s.addressText}>
                                {safeText(shipToAddress, "")}
                                {"\n"}
                                {safeText(address?.city, "")} -{" "}
                                {safeText(address?.pincode, "")}
                                {"\n"}
                                {safeText(address?.state, "")},{" "}
                                {safeText(address?.country, "India")}
                            </Text>

                            <Text style={s.phoneText}>
                                Mob:{" "}
                                {address?.mobile ||
                                    address?.phone ||
                                    "—"}
                            </Text>
                        </View>

                        <View style={s.addressBox}>
                            <Text style={s.sectionLabel}>
                                SHIP FROM (RETURN IF NOT DELIVER)
                            </Text>

                            <Text style={s.nameText}>
                                {safeText(seller?.name, "")}
                            </Text>

                            <Text style={s.addressText}>
                                {safeText(shipFromAddress, "")}
                                {"\n"}
                                {safeText(seller?.city, "")} -{" "}
                                {safeText(seller?.pincode, "")}
                                {"\n"}
                                {safeText(seller?.state, "")},{" "}
                                {safeText(seller?.country, "India")}
                            </Text>
                        </View>
                    </View>

                    <View style={s.productBox}>
                        <Text style={s.sectionLabel}>
                            PRODUCT DETAILS
                        </Text>

                        <View style={s.productRow}>
                            <View style={s.productInfo}>
                                <Text style={s.productName}>
                                    {safeText(
                                        shipment?.product_title?.slice(0, 90),
                                        "Product"
                                    )}
                                </Text>

                                <Text style={s.productMeta}>
                                    Product ID:{" "}
                                    {safeText(shipment?.product_id, "")}
                                </Text>

                                <Text style={s.productMeta}>
                                    Variant:{" "}
                                    {shipment?.variant_color ||
                                        shipment?.variant_size
                                        ? `${shipment?.variant_color || ""
                                            } ${shipment?.variant_size || ""
                                            }`.trim()
                                        : "—"}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={s.detailGrid}>
                        <View style={s.detailCell}>
                            <Text style={s.detailKey}>
                                PARCEL NUMBER
                            </Text>
                            <Text style={s.detailValue}>
                                {shipment?.parcel_no || 1}
                            </Text>
                        </View>

                        <View style={s.detailCell}>
                            <Text style={s.detailKey}>
                                PARCEL QTY
                            </Text>
                            <Text style={s.detailValue}>
                                {shipment?.parcel_quantity ??
                                    shipment?.quantity ??
                                    0}
                            </Text>
                        </View>

                        <View style={s.detailCell}>
                            <Text style={s.detailKey}>
                                UNIT PRICE
                            </Text>
                            <Text style={s.detailValue}>
                                Rs. {money(shipment?.unit_price)}
                            </Text>
                        </View>

                        <View style={s.detailCell}>
                            <Text style={s.detailKey}>
                                PARCEL VALUE
                            </Text>
                            <Text style={s.detailValue}>
                                Rs. {money(
                                    shipment?.parcel_gross_amount
                                )}
                            </Text>
                        </View>


                        {toNumber(shipment?.parcel_discount) > 0 && (
                            <View style={s.detailCell}>
                                <Text style={s.detailKey}>DISCOUNT</Text>
                                <Text style={s.detailValue}>
                                    - Rs. {money(shipment.parcel_discount)}
                                </Text>
                            </View>
                        )}

                        {toNumber(shipment?.parcel_delivery) > 0 && (
                            <View style={s.detailCell}>
                                <Text style={s.detailKey}>DELIVERY</Text>
                                <Text style={s.detailValue}>
                                    Rs. {money(shipment.parcel_delivery)}
                                </Text>
                            </View>
                        )}



                    </View>

                    <View style={s.noteBox}>
                        <Text style={s.noteText}>
                            Note:{" "}
                            {order?.notes ||
                                address?.instructions ||
                                "—"}
                        </Text>
                    </View>
                </View>

                <View style={s.rightArea}>
                    {qrDataUrl ? (
                        <Image
                            src={qrDataUrl}
                            style={s.qrImage}
                        />
                    ) : (
                        <View style={s.qrPlaceholder}>
                            <Text style={s.placeholderText}>
                                QR CODE
                            </Text>
                        </View>
                    )}

                    <View style={s.trackingBox}>
                        <Text style={s.trackingLabel}>
                            TRACKING NO.
                        </Text>

                        <Text style={s.trackingNo}>
                            {safeText(
                                shipment?.parcel_tracking_no,
                                ""
                            )}
                        </Text>
                    </View>

                    <View
                        style={
                            isCOD
                                ? s.codAmountBox
                                : s.prepaidAmountBox
                        }
                    >
                        <Text style={s.amountLabel}>
                            {codInfoText}
                        </Text>

                        <Text
                            style={
                                isCOD
                                    ? s.codAmountText
                                    : s.prepaidAmountText
                            }
                        >
                            {isCOD
                                ? `Rs. ${money(codCollectAmount)}`
                                : "PREPAID"}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={s.footer}>
                <Text style={s.footerText}>
                    Payment: {paymentMethod || "—"}
                </Text>

                <Text style={s.footerText}>
                    Order Total: Rs. {money(
                        order?.total_amount ??
                        order?.order_total ??
                        order?.parcelConfig?.order_total
                    )}
                </Text>

                <Text style={s.footerText}>
                    Date: {order?.created_time
                        ? FORMATED_DATE_TIME(order.created_time)
                        : "—"}
                </Text>

                <Text style={s.footerText}>
                    Courier: FlashiBuy Express
                </Text>
            </View>
        </View>
    );
};

const ShippingLabel = ({ order = {} }) => {
    const shipmentLabels = generateShipmentLabels(order);
    const pages = chunkArray(
        shipmentLabels,
        LABELS_PER_PAGE
    );

    return (
        <Document>
            {pages.length > 0 ? (
                pages.map((pageLabels, pageIndex) => (
                    <Page
                        key={`page-${pageIndex}`}
                        size={{ width: 520, height: 300 }}
                        style={s.page}
                    >
                        {pageLabels.map((shipment, index) => (
                            <ShippingParcelLabel
                                key={`${shipment?.id || "shipment"}-${shipment?.parcel_no
                                    }-${index}`}
                                order={order}
                                shipment={shipment}
                            />
                        ))}
                    </Page>
                ))
            ) : (
                <Page size="A4" style={s.page}>
                    <View style={s.emptyBox}>
                        <Text style={s.emptyText}>
                            No shipment items found.
                        </Text>
                    </View>
                </Page>
            )}
        </Document>
    );
};

export default ShippingLabel;

