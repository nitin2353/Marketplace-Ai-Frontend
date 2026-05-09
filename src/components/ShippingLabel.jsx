import React from "react";
import { Page, Text, View, Document, Image } from "@react-pdf/renderer";
import s from "../style/Shippinglabel.styles";
import { FORMATED_DATE_TIME } from "../helper/GlobalHelper";

const MAX_QTY_PER_PARCEL = 5;
const LABELS_PER_PAGE = 2;

const safeText = (value, fallback = "—") => {
    if (value === null || value === undefined || value === "") return fallback;
    return String(value);
};

const toNumber = (value) => {
    const n = Number(value || 0);
    return Number.isFinite(n) ? n : 0;
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
            `${seller?.first_name || ""} ${seller?.last_name || ""}`.trim() ||
            seller?.name ||
            item?.seller_name ||
            "ShopEase Seller",

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

const getDiscountShare = (order = {}, amount = 0) => {
    const subtotal = toNumber(order?.subtotal);
    const discount = toNumber(order?.discount_amount);

    if (!subtotal || !discount) return 0;

    return (toNumber(amount) / subtotal) * discount;
};

const getDeliveryShare = (order = {}, amount = 0) => {
    const subtotal = toNumber(order?.subtotal);
    const delivery = toNumber(order?.delivery_charge);

    if (!subtotal || !delivery) return 0;

    return (toNumber(amount) / subtotal) * delivery;
};

const generateShipmentLabels = (order = {}) => {
    const items = Array.isArray(order?.items) ? order.items : [];
    const labels = [];

    items.forEach((item) => {
        const totalQty = toNumber(item?.quantity);
        let remainingQty = totalQty;

        while (remainingQty > 0) {
            const parcelQty = Math.min(remainingQty, MAX_QTY_PER_PARCEL);
            const unitPrice = toNumber(item?.unit_price);
            const parcelGrossAmount = unitPrice * parcelQty;
            const parcelDiscount = getDiscountShare(order, parcelGrossAmount);
            const parcelDelivery = getDeliveryShare(order, parcelGrossAmount);
            const parcelNetAmount = parcelGrossAmount - parcelDiscount + parcelDelivery;

            labels.push({
                ...item,
                parcel_quantity: parcelQty,
                parcel_gross_amount: parcelGrossAmount,
                parcel_discount: parcelDiscount,
                parcel_delivery: parcelDelivery,
                parcel_net_amount: parcelNetAmount,
                product_image: parseImageUrl(item?.product_image_url),
            });

            remainingQty -= parcelQty;
        }
    });

    return labels.map((label, index, arr) => ({
        ...label,
        parcel_no: index + 1,
        total_parcels: arr.length,
        parcel_tracking_no: `${order?.order_number || "ORD"}-P${index + 1}`,
    }));
};

const chunkArray = (arr = [], size = 1) => {
    const chunks = [];

    for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
    }

    return chunks;
};

const ShippingParcelLabel = ({ order = {}, shipment = {} }) => {
    const address = order?.address_snapshot || {};
    const seller = getSellerData(order, shipment);

    const paymentMethod = String(order?.payment_method || "").toUpperCase();
    const isCOD = paymentMethod === "COD";

    const shipToAddress = [
        address?.address_line_1,
        address?.address_line_2,
    ].filter(Boolean).join(", ");

    const shipFromAddress = [
        seller?.address_line_1,
    ].filter(Boolean).join(", ");

    const orderDate = order?.created_time
        ? FORMATED_DATE_TIME(order.created_time)
        : "—";

    const qrDataUrl = order?.trackingQr || order?.qrDataUrl || null;

    const codCollectAmount = isCOD && shipment?.parcel_no === 1
        ? toNumber(order?.total_amount)
        : 0;

    const codInfoText = isCOD && shipment?.parcel_no === 1
        ? "COLLECT FULL ORDER COD"
        : isCOD
            ? "COD ASSIGNED TO PARCEL 1"
            : "PAYMENT";

    return (
        <View style={s.labelCard} wrap={false}>
            <View style={s.header}>
                <View>
                    <Text style={s.brand}>SHOPEASE</Text>
                    <Text style={s.brandSub}>EXPRESS DELIVERY</Text>
                </View>

                <View style={s.headerRight}>
                    <Text style={s.orderText}>ORDER #{safeText(order?.order_number, "")}</Text>
                    <Text style={s.parcelBadge}>
                        PARCEL {shipment?.parcel_no} OF {shipment?.total_parcels}
                    </Text>
                </View>
            </View>

            <View style={s.body}>
                <View style={s.leftArea}>
                    <View style={s.addressRow}>
                        <View style={s.addressBox}>
                            <Text style={s.sectionLabel}>SHIP TO</Text>
                            <Text style={s.nameText}>{safeText(address?.name, "")}</Text>
                            <Text style={s.addressText}>
                                {safeText(shipToAddress, "")}{"\n"}
                                {safeText(address?.city, "")} - {safeText(address?.pincode, "")}{"\n"}
                                {safeText(address?.state, "")}, {safeText(address?.country, "India")}
                            </Text>
                            <Text style={s.phoneText}>
                                Mob: {address?.mobile || address?.phone || "—"}
                            </Text>
                        </View>

                        <View style={s.addressBox}>
                            <Text style={s.sectionLabel}>SHIP FROM</Text>
                            <Text style={s.nameText}>{safeText(seller?.name, "")}</Text>
                            <Text style={s.addressText}>
                                {safeText(shipFromAddress, "")}{"\n"}
                                {safeText(seller?.city, "")} - {safeText(seller?.pincode, "")}{"\n"}
                                {safeText(seller?.state, "")}, {safeText(seller?.country, "India")}
                            </Text>
                            <Text style={s.phoneText}>Mob: {safeText(seller?.phone, "")}</Text>
                        </View>
                    </View>

                    <View style={s.productBox}>
                        <Text style={s.sectionLabel}>PRODUCT DETAILS</Text>

                        <View style={s.productRow}>
                            <View style={s.productInfo}>
                                <Text style={s.productName}>
                                    {safeText(shipment?.product_title, "Product")}
                                </Text>
                                <Text style={s.productMeta}>
                                    Product ID: {safeText(shipment?.product_id, "")}
                                </Text>
                                <Text style={s.productMeta}>
                                    Variant: {
                                        shipment?.variant_color || shipment?.variant_size
                                            ? `${shipment?.variant_color || ""} ${shipment?.variant_size || ""}`.trim()
                                            : "—"
                                    }
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={s.detailGrid}>
                        <View style={s.detailCell}>
                            <Text style={s.detailKey}>PARCEL QTY</Text>
                            <Text style={s.detailValue}>{shipment?.parcel_quantity || 0}</Text>
                        </View>

                        <View style={s.detailCell}>
                            <Text style={s.detailKey}>TOTAL QTY</Text>
                            <Text style={s.detailValue}>{shipment?.quantity || 0}</Text>
                        </View>

                        <View style={s.detailCell}>
                            <Text style={s.detailKey}>UNIT PRICE</Text>
                            <Text style={s.detailValue}>Rs. {money(shipment?.unit_price)}</Text>
                        </View>

                        <View style={s.detailCell}>
                            <Text style={s.detailKey}>PARCEL VALUE</Text>
                            <Text style={s.detailValue}>Rs. {money(shipment?.parcel_gross_amount)}</Text>
                        </View>
                    </View>

                    {/* <View style={s.priceGrid}>
                        <View style={s.priceCell}>
                            <Text style={s.priceKey}>Discount Share</Text>
                            <Text style={s.priceValue}>- Rs. {money(shipment?.parcel_discount)}</Text>
                        </View>

                        <View style={s.priceCell}>
                            <Text style={s.priceKey}>Delivery Share</Text>
                            <Text style={s.priceValue}>+ Rs. {money(shipment?.parcel_delivery)}</Text>
                        </View>

                        <View style={s.priceCell}>
                            <Text style={s.priceKey}>Net Parcel Value</Text>
                            <Text style={s.priceValue}>Rs. {money(shipment?.parcel_net_amount)}</Text>
                        </View>
                    </View> */}

                    <View style={s.noteBox}>
                        <Text style={s.noteText}>
                            Note: {order?.notes || address?.instructions || "—"}
                        </Text>
                    </View>
                </View>
                <View style={s.rightArea}>

                    {qrDataUrl ? (
                        <Image src={qrDataUrl} style={s.qrImage} />
                    ) : (
                        <View style={s.qrPlaceholder}>
                            <Text style={s.placeholderText}>QR CODE</Text>
                        </View>
                    )}

                    <View style={s.trackingBox}>
                        <Text style={s.trackingLabel}>TRACKING NO.</Text>
                        <Text style={s.trackingNo}>{safeText(shipment?.parcel_tracking_no, "")}</Text>
                    </View>

                    <View style={isCOD ? s.codAmountBox : s.prepaidAmountBox}>
                        <Text style={s.amountLabel}>{codInfoText}</Text>

                        <Text style={isCOD ? s.codAmountText : s.prepaidAmountText}>
                            {isCOD ? `Rs. ${money(codCollectAmount)}` : "PREPAID"}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={s.footer}>
                <Text style={s.footerText}>Payment: {paymentMethod || "—"}</Text>
                <Text style={s.footerText}>Order Total: Rs. {money(order?.total_amount)}</Text>
                <Text style={s.footerText}>Date: {orderDate}</Text>
                <Text style={s.footerText}>Courier: ShopEase Express</Text>
            </View>
        </View>
    );
};

const ShippingLabel = ({ order = {} }) => {
    const shipmentLabels = generateShipmentLabels(order);
    const pages = chunkArray(shipmentLabels, LABELS_PER_PAGE);

    return (
        <Document>
            {pages.length > 0 ? (
                pages.map((pageLabels, pageIndex) => (
                    <Page size={{ width: 520, height: 300 }} style={s.page}>
                        {pageLabels.map((shipment, index) => (
                            <ShippingParcelLabel
                                key={`${shipment?.id || "shipment"}-${shipment?.parcel_no}-${index}`}
                                order={order}
                                shipment={shipment}
                            />
                        ))}
                    </Page>
                ))
            ) : (
                <Page size="A4" style={s.page}>
                    <View style={s.emptyBox}>
                        <Text style={s.emptyText}>No shipment items found.</Text>
                    </View>
                </Page>
            )}
        </Document>
    );
};

export default ShippingLabel;