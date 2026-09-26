import React from "react";
import {
    Document, Page, Text, View, Image, StyleSheet,
} from "@react-pdf/renderer";
import s from '../style/InvoiceStyle'
import logo from "../assets/logo.png";

// ─── Palette ─────────────────────────────────────────────────────────────────
const ORANGE = "#000000ff";
const BLUE = "#000000ff";
const BLUE_BG = "#eef2ff";
const GREEN = "#16a34a";
const GREEN_BG = "#dcfce7";
const AMBER = "#d97706";
const AMBER_BG = "#fef3c7";
const RED = "#dc2626";
const RED_BG = "#fee2e2";
const GRAY5 = "#4b5563";
const GRAY4 = "#6b7280";
const GRAY2 = "#e5e7eb";
const GRAY = "#f3f4f6";
const DARK = "#000000";
const CM_TO_PT = `28.35`;
const BILL_WIDTH = 20 * CM_TO_PT;

// ─── Helpers ─────────────────────────────────────────────────────────────────
export const invoiceNo = (order) => {
    if (!order) return "INV-000000";
    return `INV-${(order.order_number || "").replace("ORD-", "") || order.id?.slice(0, 8).toUpperCase()}`;
};

const fmt = (n) =>
    `Rs. ${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const fmtDT = (d) =>
    d ? new Date(d).toLocaleString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit", hour12: true,
    }) : "—";

const parseImg = (raw) => {
    if (!raw) return null;
    try {
        const str = String(raw).trim();
        if (str.startsWith("{")) {
            const urls = str.slice(1, -1).match(/"([^"]+)"/g);
            if (urls?.length) return urls[0].replace(/"/g, "");
            return str.slice(1, -1).split(",")[0].trim() || null;
        }
        if (str.startsWith("[")) return JSON.parse(str)[0] || null;
        if (Array.isArray(raw)) return raw[0] || null;
        return str.split(",")[0].trim() || null;
    } catch { return null; }
};


// const getBillHeight = (items = []) => {
//     const baseHeight = 520;
//     const itemHeight = 70;
//     const notesHeight = 80;
//     const signatureHeight = 70;

//     return baseHeight + (items.length * itemHeight) + notesHeight + signatureHeight;
// };

const getBillHeight = (items = []) => {
    return 650 + (items.length * 85);
};

const oStatusColor = (s) => ({
    placed: { bg: BLUE_BG, text: BLUE },
    confirmed: { bg: BLUE_BG, text: BLUE },
    processing: { bg: AMBER_BG, text: AMBER },
    shipped: { bg: "#ede9fe", text: "#7c3aed" },
    delivered: { bg: GREEN_BG, text: GREEN },
    cancelled: { bg: RED_BG, text: RED },
    returned: { bg: RED_BG, text: RED },
    payment_failed: { bg: RED_BG, text: RED },
}[s] || { bg: GRAY2, text: GRAY5 });

const pStatusColor = (s) => ({
    paid: { bg: GREEN_BG, text: GREEN },
    pending: { bg: AMBER_BG, text: AMBER },
    failed: { bg: RED_BG, text: RED },
}[s] || { bg: GRAY2, text: GRAY5 });

const PAY_NAMES = {
    cod: "Cash on Delivery", upi: "UPI", card: "Credit / Debit Card",
    netbanking: "Net Banking", wallet: "Digital Wallet", online: "Online Payment",
};
const ORD_NAMES = {
    placed: "Order Placed", confirmed: "Confirmed", processing: "Processing",
    shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled",
    returned: "Returned", payment_failed: "Payment Failed",
};



// ─── Tiny reusables ──────────────────────────────────────────────────────────
const Badge = ({ label, bg, color }) => (
    <View style={[s.badge, { backgroundColor: bg }]}>
        <Text style={[s.badgeTxt, { color }]}>{label}</Text>
    </View>
);

const BRow = ({ label, value, color }) => (
    <View style={s.bRow}>
        <Text style={s.bLbl}>{label}</Text>
        <Text style={[s.bVal, color ? { color } : {}]}>{value || "—"}</Text>
    </View>
);

const TRow = ({ label, value, labelStyle, valStyle, noBorder }) => (
    <View style={[s.totRow, noBorder ? { borderBottomWidth: 0 } : {}]}>
        <Text style={[s.totLbl, labelStyle]}>{label}</Text>
        <Text style={[s.totVal, valStyle]}>{value}</Text>
    </View>
);

// ─── Main ────────────────────────────────────────────────────────────────────
const Invoice = ({ order = {}, qrDataUrl = null }) => {
    if (!order?.id) return (
        <Document><Page size="A4" style={s.page}>
            <Text style={{ padding: 20, color: GRAY4 }}>No order data available.</Text>
        </Page></Document>
    );

    const addr = order.address_snapshot || {};
    const user = order.user_snapshot || {};
    const items = Array.isArray(order.items) ? order.items : [];
    const seller = order.seller_info?.info || {};
    const selAdr = order.seller_info?.address || null;
    const invNo = invoiceNo(order);

    const oC = oStatusColor(order.order_status);
    const pC = pStatusColor(order.payment_status);

    const sellerName = seller.business_name || seller.name || "ShopEase Seller";
    const isCOD = order.payment_method === "cod";
    const isPaid = order.payment_status === "paid";
    const isCancelled = order.order_status === "cancelled";
    const hasNotes = order.notes?.trim() || addr.instructions?.trim();

    const billHeight = getBillHeight(items);

    return (
        <Document title={invNo} author="ShopEase" subject={`Invoice – ${order.order_number}`}>
            <Page size={{ width: BILL_WIDTH, height: billHeight }} style={s.page}>

                {/* ─── HEADER ────────────────────────────────────────────── */}
                <View style={s.header}>
                    <View style={{ justifyContent: "space-between" }}>
                        <View>
                            <View>
                                <Image src={logo} style={s.logo} />
                            </View>
                        </View>

                        <View>
                            <Text style={s.soldBy}>Sold By</Text>

                            <Text style={s.soldByName}>
                                {sellerName}
                            </Text>

                            {seller.email && (
                                <Text style={[s.soldBy, { marginTop: 2 }]}>
                                    {seller.email}
                                </Text>
                            )}

                            {seller.phone && (
                                <Text style={[s.soldBy, { marginTop: 1 }]}>
                                    +91 {seller.phone}
                                </Text>
                            )}
                        </View>
                    </View>

                    <View style={{ alignItems: "flex-end", justifyContent: "space-between" }}>
                        <View style={s.invPill}>
                            <Text style={s.invLbl}>INVOICE</Text>
                            <Text style={s.invNum}>#{invNo}</Text>
                        </View>
                        <Text style={s.brandSub}>
                                BILL OF SUPPLY
                            </Text>

                        <View style={{ alignItems: "flex-end" }}>
                            <Text style={s.invDate}>
                                Date: {fmtDate(order.created_time)}
                            </Text>

                            <Text style={[s.invDate, { marginTop: 2 }]}>
                                Order: {order.order_number}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={s.orangeBar} />

                {/* ─── META STRIP ────────────────────────────────────────── */}
                <View style={s.metaStrip}>
                    <View style={s.metaItem}>
                        <Text style={s.metaLbl}>Order Status</Text>
                        <Badge label={ORD_NAMES[order.order_status] || order.order_status} bg={oC.bg} color={oC.text} />
                    </View>
                    <View style={s.metaItem}>
                        <Text style={s.metaLbl}>Payment Method</Text>
                        <Text style={s.metaVal}>{PAY_NAMES[order.payment_method] || order.payment_method}</Text>
                    </View>
                    <View style={s.metaItem}>
                        <Text style={s.metaLbl}>Payment Status</Text>
                        <Badge label={(order.payment_status || "pending").toUpperCase()} bg={pC.bg} color={pC.text} />
                    </View>
                    <View style={s.metaItem}>
                        <Text style={s.metaLbl}>Items / Units</Text>
                        <Text style={s.metaVal}>{order.total_items} items · {order.total_quantity} units</Text>
                    </View>
                </View>

                {/* ─── PARTIES ───────────────────────────────────────────── */}
                <View style={s.parties}>
                    {/* Sold By */}
                    <View style={[s.party, s.partyDiv]}>
                        <Text style={s.partyLbl}>Sold By</Text>
                        <Text style={s.partyName}>{sellerName}</Text>
                        {seller.name && seller.business_name && <Text style={s.partyLine}>{seller.name}</Text>}
                        {seller.email && <Text style={s.partyLine}>{seller.email}</Text>}
                        {seller.phone && <Text style={s.partyLine}> +91 {seller.phone}</Text>}
                        {selAdr?.city && <Text style={s.partyLine}>{selAdr.city}, {selAdr.state}</Text>}
                    </View>

                    {/* Billed To */}
                    <View style={[s.party, s.partyDiv]}>
                        <Text style={s.partyLbl}>Billed To</Text>
                        <Text style={s.partyName}>{user.full_name || addr.name || "—"}</Text>
                        {user.email && <Text style={s.partyLine}>{user.email}</Text>}
                        {user.mobile && <Text style={s.partyLine}> +91 {user.mobile}</Text>}
                    </View>

                    {/* Shipped To */}
                    <View style={s.party}>
                        <Text style={s.partyLbl}>Shipped To</Text>
                        <Text style={s.partyName}>{addr.name || "—"}</Text>
                        {addr.address_line_1 && <Text style={s.partyLine}>{addr.address_line_1}</Text>}
                        {addr.address_line_2 && <Text style={s.partyLine}>{addr.address_line_2}</Text>}
                        {addr.city && <Text style={s.partyLine}>{addr.city} — {addr.pincode}</Text>}
                        {addr.state && <Text style={s.partyLine}>{addr.state}, {addr.country || "India"}</Text>}
                        {addr.mobile && <Text style={s.partyLine}>{addr.mobile}</Text>}
                        {addr.phone && addr.phone !== addr.mobile && <Text style={s.partyLine}>{addr.phone}</Text>}
                    </View>
                </View>

                {/* ─── ITEMS TABLE ───────────────────────────────────────── */}
                {/* Head */}
                <View style={s.tableHead}>
                    <Text style={[s.th, s.colSr]}>#</Text>
                    <View style={s.colImg} />
                    <Text style={[s.th, s.colProd]}>Product</Text>
                    <Text style={[s.th, s.colQty, { textAlign: "center" }]}>Qty</Text>
                    <Text style={[s.th, s.colUnit, { textAlign: "right" }]}>Unit Price</Text>
                    <Text style={[s.th, s.colLine, { textAlign: "right" }]}>Line Total</Text>
                </View>
                {items.map((item, i) => {
                    const tags = item.product_tag
                        ? item.product_tag.split(",").slice(0, 3).join(" · ")
                        : null;
                    const fp = item.dimension?.final_pack;
                    const hasDims = fp && (fp.weight > 0 || fp.length > 0);

                    return (
                        <View key={item.id || i} style={[s.tableRow, i % 2 === 1 ? s.rowAlt : {}]} wrap={false}>
                            <Text style={[s.td, s.colSr, { color: GRAY4 }]}>{i + 1}</Text>

                            <View style={[s.colProd, { paddingRight: 8 }]}>
                                <Text style={s.tdB}>{item.product_title || "Unnamed Product"}</Text>
                                {(item.product_brand || item.product_category) && (
                                    <Text style={s.tdSm}>
                                        {[
                                            item.product_brand && `Brand: ${item.product_brand}`,
                                            item.product_category && `Category: ${item.product_category}`,
                                        ].filter(Boolean).join("  ·  ")}
                                    </Text>
                                )}
                                {(item.variant_size || item.variant_color) && (
                                    <Text style={s.tdSm}>
                                        {[
                                            item.variant_size && `Size: ${item.variant_size}`,
                                            item.variant_color && `Color: ${item.variant_color}`,
                                        ].filter(Boolean).join("  ·  ")}
                                    </Text>
                                )}
                                {item.product_description && item.product_description !== "Test" && (
                                    <Text style={[s.tdSm, { fontStyle: "italic" }]}>
                                        {item.product_description.slice(0, 70)}{item.product_description.length > 70 ? "…" : ""}
                                    </Text>
                                )}
                                {tags && <Text style={[s.tdSm, { color: ORANGE }]}>{tags}</Text>}
                                {hasDims && (
                                    <Text style={s.tdSm}>
                                        {fp.length} × {fp.width} × {fp.height} cm · {fp.weight} kg
                                    </Text>
                                )}
                            </View>

                            <Text style={[s.tdB, s.colQty, { textAlign: "center" }]}>{item.quantity || 1}</Text>
                            <Text style={[s.tdMono, s.colUnit, { textAlign: "right", color: DARK }]}>{fmt(item.unit_price)}</Text>
                            <Text style={[s.tdMonoB, s.colLine, { textAlign: "right" }]}>{fmt(item.line_total)}</Text>
                        </View>
                    );
                })}

                {/* ─── TOTALS ────────────────────────────────────────────── */}
                <View style={s.totalsOuter}>
                    <View style={s.totalsBox}>
                        <TRow label="Subtotal" value={fmt(order.subtotal)} />
                        {Number(order.delivery_charge) > 0
                            ? <TRow label="Delivery" value={fmt(order.delivery_charge)} />
                            : <TRow label="Delivery" value="FREE" valStyle={s.totGreen} />
                        }
                        {Number(order.discount_amount) > 0 && (
                            <TRow
                                label={`Discount${order.discount_percentage ? ` (${order.discount_percentage}%)` : ""}`}
                                value={`- ${fmt(order.discount_amount)}`}
                                valStyle={s.totGreen}
                            />
                        )}
                        <View style={s.grandRow} >
                            <Text style={s.grandLbl}>
                                {isPaid ? "TOTAL PAID" : isCOD ? "TOTAL (COD)" : "TOTAL AMOUNT"}
                            </Text>
                            <Text style={s.grandVal}>{fmt(order.total_amount)}</Text>
                        </View>
                    </View>
                </View>

                {/* ─── BOTTOM DETAILS ────────────────────────────────────── */}
                <View style={s.bottomSec}>
                    <View style={s.bottomL}>
                        <Text style={s.bTitle}>Payment Details</Text>
                        <BRow label="Method" value={PAY_NAMES[order.payment_method] || order.payment_method} />
                        <BRow label="Status" value={(order.payment_status || "pending")} color={pC.ORANGE} />
                        {order.payment_gateway && order.payment_gateway !== "cod" && (
                            <BRow label="Gateway" value={order.payment_gateway} />
                        )}
                        {order.razorpay_payment_id && <BRow label="Payment ID" value={order.razorpay_payment_id} />}
                        {order.razorpay_order_id && <BRow label="Razorpay Order" value={order.razorpay_order_id} />}
                        {isCancelled && (
                            <View style={s.cancelBox}>
                                <Text style={s.cancelTxt}>⚠  This order has been CANCELLED</Text>
                                {order.modified_time && (
                                    <Text style={s.cancelDt}>Cancelled: {fmtDT(order.modified_time)}</Text>
                                )}
                            </View>
                        )}
                    </View>
                    <View style={s.bottomR}>
                        <Text style={s.bTitle}> Order Summary</Text>
                        <BRow label="Order Number" value={order.order_number} />
                        <BRow label="Order Status" value={ORD_NAMES[order.order_status] || order.order_status} color={oC.text} />
                        <BRow label="Total Items" value={`${order.total_items} products`} />
                        <BRow label="Total Units" value={`${order.total_quantity} units`} />
                        <BRow label="Placed On" value={fmtDT(order.created_time)} />
                        {order.modified_time !== order.created_time && (
                            <BRow label="Updated On" value={fmtDT(order.modified_time)} />
                        )}
                    </View>
                </View>


                <View style={s.signatureRow}>
                    <View style={s.signatureBox}>
                        <View style={s.signatureLine} />
                        <Text style={s.signatureText}>Authorized Signature</Text>
                        <Text style={s.signatureSubText}>{sellerName}</Text>
                    </View>
                </View>

                {/* ─── FOOTER ────────────────────────────────────────────── */}
                <View style={s.footer}>
                    <Text style={s.footerL}>{invNo}  ·  {fmtDT(new Date())}</Text>
                    <Text style={s.footerBrand}>SHOPEASE</Text>
                    <Text style={s.footerR}>shopease.in</Text>
                </View>


            </Page>
        </Document>
    );
};

export default Invoice;