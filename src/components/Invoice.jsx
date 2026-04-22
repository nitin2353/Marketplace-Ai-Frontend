import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

const C = {
    black: '#111111',
    orange: '#ff6b35',
    green: '#22c55e',
    gray1: '#f9f9f9',
    gray2: '#f3f3f3',
    gray3: '#eeeeee',
    gray4: '#aaaaaa',
    gray5: '#555555',
    gray6: '#333333',
    white: '#ffffff',
    paid: '#dcfce7',
    paidTxt: '#166534',
};

const f = { normal: 'Helvetica', bold: 'Helvetica-Bold' };

const s = StyleSheet.create({
    page: { fontFamily: f.normal, backgroundColor: C.white, paddingBottom: 40 },

    header: {
        backgroundColor: C.black,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: 24,
        paddingVertical: 16
    },
    brand: { color: C.white, fontSize: 16, fontFamily: f.bold, letterSpacing: 1.5 },
    brandSub: { color: C.gray4, fontSize: 8, marginTop: 3, letterSpacing: 1 },
    invBadge: { backgroundColor: C.orange, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 3, alignItems: 'flex-end' },
    invBadgeLbl: { color: C.white, fontSize: 8, fontFamily: f.bold, letterSpacing: 2 },
    invBadgeNum: { color: C.white, fontSize: 12, fontFamily: f.bold, marginTop: 2 },
    invDate: { color: C.gray4, fontSize: 9, textAlign: 'right', marginTop: 5 },

    metaBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: C.gray1,
        paddingHorizontal: 24,
        paddingVertical: 8,
        borderBottom: `1pt solid ${C.gray3}`
    },
    metaTxt: { fontSize: 9, color: C.gray5 },
    metaVal: { fontSize: 9, fontFamily: f.bold, color: C.black },
    paidBadge: { backgroundColor: C.paid, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
    paidTxt: { fontSize: 8, fontFamily: f.bold, color: C.paidTxt, letterSpacing: 1 },

    parties: { flexDirection: 'row', borderBottom: `1pt solid ${C.gray3}` },
    party: { flex: 1, paddingHorizontal: 16, paddingVertical: 12 },
    partyBorder: { borderRight: `1pt dashed ${C.gray3}` },
    partyLbl: { fontSize: 7, fontFamily: f.bold, color: C.gray4, letterSpacing: 2, marginBottom: 4 },
    partyName: { fontSize: 11, fontFamily: f.bold, color: C.black, marginBottom: 2 },
    partyTxt: { fontSize: 9, color: C.gray6, lineHeight: 1.6 },

    tableHead: {
        flexDirection: 'row',
        backgroundColor: C.gray2,
        borderBottom: `1pt solid ${C.gray3}`,
        paddingHorizontal: 16,
        paddingVertical: 7
    },
    tableRow: {
        flexDirection: 'row',
        borderBottom: `0.5pt solid ${C.gray3}`,
        paddingHorizontal: 16,
        paddingVertical: 9
    },
    tableRowAlt: { backgroundColor: C.gray1 },
    th: { fontSize: 8, fontFamily: f.bold, color: C.gray5, letterSpacing: 0.5 },
    td: { fontSize: 9, color: C.gray6 },
    tdBold: { fontSize: 9, fontFamily: f.bold, color: C.black },
    tdNum: { fontFamily: 'Courier', fontSize: 9, color: C.gray6 },
    tdNumBold: { fontFamily: 'Courier-Bold', fontSize: 9, color: C.black },

    colSr: { width: 24 },
    colProd: { flex: 1 },
    colUp: { width: 72, alignItems: 'flex-end' },
    colQty: { width: 36, alignItems: 'center' },
    colTot: { width: 80, alignItems: 'flex-end' },

    subRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: 16,
        paddingVertical: 5,
        borderBottom: `0.5pt solid ${C.gray3}`
    },
    subKey: { fontSize: 9, color: C.gray5, width: 140, textAlign: 'right', marginRight: 12 },
    subVal: { fontFamily: 'Courier', fontSize: 9, color: C.gray6, width: 80, textAlign: 'right' },
    discKey: { fontSize: 9, color: C.green, width: 140, textAlign: 'right', marginRight: 12 },
    discVal: { fontFamily: 'Courier', fontSize: 9, color: C.green, width: 80, textAlign: 'right' },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        backgroundColor: C.black,
        paddingHorizontal: 16,
        paddingVertical: 10
    },
    totalKey: { fontSize: 11, fontFamily: f.bold, color: C.white, width: 140, textAlign: 'right', marginRight: 12, letterSpacing: 0.5 },
    totalVal: { fontFamily: 'Courier-Bold', fontSize: 11, color: C.white, width: 80, textAlign: 'right' },

    bottom: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 16,
        borderTop: `1pt dashed ${C.gray3}`
    },
    qrBlock: { alignItems: 'center', width: 80 },
    qrLbl: { fontSize: 7, fontFamily: f.bold, color: C.gray4, letterSpacing: 1, marginBottom: 5, textAlign: 'center' },
    qrImg: { width: 72, height: 72, border: `1pt solid ${C.gray3}` },
    qrNum: { fontSize: 7, color: C.gray4, marginTop: 4, textAlign: 'center' },
    notesBox: { flex: 1 },
    notesTitle: { fontSize: 9, fontFamily: f.bold, color: C.black, marginBottom: 3 },
    notesTxt: { fontSize: 8, color: C.gray5, lineHeight: 1.7 },

    footer: {
        backgroundColor: C.black,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 8
    },
    footerTxt: { fontSize: 8, color: C.gray4, letterSpacing: 0.5 },
});

const fmt = (n) =>
    `Rs. ${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtDate = (iso) =>
    iso
        ? new Date(iso).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
          })
        : '—';

const invoiceNo = (order) =>
    `INV-${order?.order_number?.replace('ORD-', '') || order?.id?.slice(0, 8)?.toUpperCase() || '000000'}`;

const PartyBlock = ({ label, name, lines = [], border = true }) => (
    <View style={[s.party, border && s.partyBorder]}>
        <Text style={s.partyLbl}>{label}</Text>
        <Text style={s.partyName}>{name}</Text>
        {lines.filter(Boolean).map((l, i) => (
            <Text key={i} style={s.partyTxt}>{l}</Text>
        ))}
    </View>
);

const TH = ({ style, children }) => <Text style={[s.th, style]}>{children}</Text>;

const TD = ({ style, bold, num, children }) => (
    <Text style={[num ? (bold ? s.tdNumBold : s.tdNum) : (bold ? s.tdBold : s.td), style]}>
        {children}
    </Text>
);

const safeParseImageUrls = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;

    try {
        const cleaned = String(value)
            .replace(/^\{/, '[')
            .replace(/\}$/, ']');
        return JSON.parse(cleaned);
    } catch {
        return [];
    }
};

const Invoice = ({ order = {}, qrDataUrl = null }) => {
    const addr = order?.address_snapshot || {};
    const user = order?.user_snapshot || {};
    const items = Array.isArray(order?.items) ? order.items : [];
    const sellerInfo = order?.seller_info || {};
    const invNo = invoiceNo(order);

    const sellerData = {
        name:
            sellerInfo?.business_name ||
            [sellerInfo?.first_name, sellerInfo?.last_name].filter(Boolean).join(' ') ||
            sellerInfo?.name ||
            'ShopEase Seller',
        email: sellerInfo?.email || 'support@shopease.in',
        website: 'shopease.in',
        gstin: 'GSTIN: Applied For',
        phone: sellerInfo?.phone || '—',
    };

    const paymentMethod = order?.payment_method?.toUpperCase?.() || '—';
    const paymentStatus = order?.payment_status?.toUpperCase?.() || '—';
    const isPaid = order?.payment_status === 'paid';

    return (
        <Document>
            <Page size="A4" style={s.page}>
                <View style={s.header}>
                    <View>
                        <Text style={s.brand}>SHOPEASE</Text>
                        <Text style={s.brandSub}>Tax Invoice / Bill of Supply</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <View style={s.invBadge}>
                            <Text style={s.invBadgeLbl}>INVOICE</Text>
                            <Text style={s.invBadgeNum}>#{invNo}</Text>
                        </View>
                        <Text style={s.invDate}>{fmtDate(order?.created_time)}</Text>
                    </View>
                </View>

                <View style={s.metaBar}>
                    <View style={{ flexDirection: 'row', gap: 4 }}>
                        <Text style={s.metaTxt}>Order: </Text>
                        <Text style={s.metaVal}>{order?.order_number || '—'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 4 }}>
                        <Text style={s.metaTxt}>Payment: </Text>
                        <Text style={s.metaVal}>{paymentMethod}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 4 }}>
                        <Text style={s.metaTxt}>Status: </Text>
                        {isPaid ? (
                            <View style={s.paidBadge}>
                                <Text style={s.paidTxt}>PAID</Text>
                            </View>
                        ) : (
                            <Text style={s.metaVal}>{paymentStatus}</Text>
                        )}
                    </View>
                    <View style={{ flexDirection: 'row', gap: 4 }}>
                        <Text style={s.metaTxt}>Date: </Text>
                        <Text style={s.metaVal}>{fmtDate(order?.created_time)}</Text>
                    </View>
                </View>

                <View style={s.parties}>
                    <PartyBlock
                        label="Sold By"
                        name={sellerData.name}
                        lines={[
                            sellerData.email,
                            `Mob: ${sellerData.phone}`,
                            sellerData.website,
                            sellerData.gstin,
                        ]}
                        border
                    />

                    <PartyBlock
                        label="Billed To"
                        name={user?.full_name || addr?.name || '—'}
                        lines={[
                            user?.email || '—',
                            `+91 ${user?.mobile || addr?.mobile || addr?.phone || '—'}`,
                        ]}
                        border
                    />

                    <PartyBlock
                        label="Shipped To"
                        name={addr?.name || '—'}
                        lines={[
                            [addr?.address_line_1, addr?.address_line_2].filter(Boolean).join(', '),
                            `${addr?.city || ''} — ${addr?.pincode || ''}`,
                            `${addr?.state || ''}, ${addr?.country || 'India'}`,
                            `Mob: ${addr?.mobile || addr?.phone || '—'}`,
                        ]}
                        border={false}
                    />
                </View>

                <View style={s.tableHead}>
                    <TH style={s.colSr}>#</TH>
                    <TH style={s.colProd}>Product</TH>
                    <TH style={[s.colUp, { textAlign: 'right' }]}>Unit Price</TH>
                    <TH style={[s.colQty, { textAlign: 'center' }]}>Qty</TH>
                    <TH style={[s.colTot, { textAlign: 'right' }]}>Total</TH>
                </View>

                {items.map((item, i) => {
                    const imageUrls = safeParseImageUrls(item?.product_image_url);

                    return (
                        <View key={item?.id || i} style={[s.tableRow, i % 2 === 1 && s.tableRowAlt]}>
                            <TD style={s.colSr}>{String(i + 1)}</TD>

                            <View style={s.colProd}>
                                <TD bold>{item?.product_title || '—'}</TD>

                                <TD style={{ fontSize: 8, color: '#888', marginTop: 2 }}>
                                    {[
                                        item?.variant_color && `Color: ${item.variant_color}`,
                                        item?.variant_size && `Size: ${item.variant_size}`,
                                        item?.product_brand && `Brand: ${item.product_brand}`,
                                    ].filter(Boolean).join('  |  ')}
                                </TD>

                                {item?.product_tag && (
                                    <TD style={{ fontSize: 8, color: '#aaa', marginTop: 1 }}>
                                        {item.product_tag}
                                    </TD>
                                )}

                                {imageUrls?.[0] && (
                                    <TD style={{ fontSize: 8, color: '#999', marginTop: 1 }}>
                                        Image attached
                                    </TD>
                                )}
                            </View>

                            <TD num style={[s.colUp, { textAlign: 'right' }]}>
                                {fmt(item?.unit_price)}
                            </TD>

                            <TD num style={[s.colQty, { textAlign: 'center' }]}>
                                {String(item?.quantity || 0)}
                            </TD>

                            <TD num bold style={[s.colTot, { textAlign: 'right' }]}>
                                {fmt(item?.line_total)}
                            </TD>
                        </View>
                    );
                })}

                <View style={s.subRow}>
                    <Text style={s.subKey}>Subtotal</Text>
                    <Text style={s.subVal}>{fmt(order?.subtotal)}</Text>
                </View>

                {Number(order?.discount_amount) > 0 && (
                    <View style={s.subRow}>
                        <Text style={s.discKey}>Discount</Text>
                        <Text style={s.discVal}>- {fmt(order?.discount_amount)}</Text>
                    </View>
                )}

                <View style={s.subRow}>
                    <Text style={s.subKey}>Delivery Charges</Text>
                    <Text style={s.subVal}>{fmt(order?.delivery_charge)}</Text>
                </View>

                <View style={s.subRow}>
                    <Text style={s.subKey}>Tax</Text>
                    <Text style={s.subVal}>{fmt(order?.tax_amount)}</Text>
                </View>

                <View style={s.totalRow}>
                    <Text style={s.totalKey}>
                        {isPaid ? 'TOTAL AMOUNT PAID' : 'TOTAL AMOUNT'}
                    </Text>
                    <Text style={s.totalVal}>{fmt(order?.total_amount)}</Text>
                </View>

                <View style={s.bottom}>
                    <View style={s.qrBlock}>
                        <Text style={s.qrLbl}>Scan to Verify</Text>
                        {qrDataUrl ? (
                            <Image style={s.qrImg} src={qrDataUrl} />
                        ) : (
                            <View
                                style={[
                                    s.qrImg,
                                    {
                                        backgroundColor: '#f5f5f5',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    },
                                ]}
                            >
                                <Text style={{ fontSize: 7, color: '#aaa', textAlign: 'center' }}>
                                    QR{'\n'}CODE
                                </Text>
                            </View>
                        )}
                        <Text style={s.qrNum}>{invNo}</Text>
                    </View>

                    <View style={s.notesBox}>
                        <Text style={s.notesTitle}>Payment Details</Text>
                        <Text style={s.notesTxt}>
                            Method: {paymentMethod}{'\n'}
                            Status: {paymentStatus}{'\n'}
                            Gateway: {order?.payment_gateway || '—'}{'\n'}
                            {order?.razorpay_payment_id ? `Payment ID: ${order.razorpay_payment_id}\n` : ''}
                            {order?.razorpay_order_id ? `Order ID: ${order.razorpay_order_id}\n` : ''}
                        </Text>

                        <Text style={[s.notesTitle, { marginTop: 8 }]}>Order Details</Text>
                        <Text style={s.notesTxt}>
                            Order Status: {order?.order_status || '—'}{'\n'}
                            Total Items: {order?.total_items || 0}{'\n'}
                            Total Quantity: {order?.total_quantity || 0}
                            {order?.notes ? `\nOrder Note: ${order.notes}` : ''}
                        </Text>

                        <Text style={[s.notesTitle, { marginTop: 8 }]}>Note</Text>
                        <Text style={s.notesTxt}>
                            This is a computer-generated invoice and does not require a signature.
                        </Text>
                    </View>
                </View>

                <View style={s.footer}>
                    <Text style={s.footerTxt}>
                        {sellerData.website} | {sellerData.email}
                    </Text>
                    <Text style={s.footerTxt}>Thank you for shopping with us!</Text>
                </View>
            </Page>
        </Document>
    );
};

export { invoiceNo };
export default Invoice;