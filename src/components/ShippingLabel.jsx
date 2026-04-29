import React from 'react';
import { Page, Text, View, Document, Image } from '@react-pdf/renderer';
import s from '.././style/Shippinglabel.styles';
import GlobalHelper, { FORMATED_DATE_TIME } from '../helper/GlobalHelper';

const ShippingLabel = ({ order = {} }) => {
    console.log("order", order)
    const addressSnapshot = order?.address_snapshot || {};
    const sellerInfo = order?.seller_info || {};
    const sellerAddress = sellerInfo?.address || {};
    const sellerMeta = sellerInfo?.info || {};

    const paymentMethod = order?.payment_method
        ? String(order.payment_method).toUpperCase()
        : '';

    const getPackageDimension = (items = []) => {
        if (!Array.isArray(items) || items.length === 0) {
            return { dimensions: "—", weight: "—" };
        }

        let totalWeight = 0;
        let maxLength = 0;
        let maxWidth = 0;
        let totalHeight = 0;
        let hasDimensions = false;

        items.forEach((item) => {
            const qty = Number(item.quantity || 1);

            const d = item.dimension?.final_pack || item.dimension || {};

            const length = Number(d.length || 0);
            const width = Number(d.width || 0);
            const height = Number(d.height || 0);
            const weight = Number(d.weight || 0);

            if (length > 0 || width > 0 || height > 0 || weight > 0) {
                hasDimensions = true;
            }

            maxLength = Math.max(maxLength, length);
            maxWidth = Math.max(maxWidth, width);
            totalHeight += height;
            totalWeight += weight;
        });

        if (!hasDimensions) {
            return { dimensions: "—", weight: "—" };
        }

        return {
            dimensions: `${maxLength}×${maxWidth}×${totalHeight} cm`,
            weight: `${totalWeight.toFixed(2)} kg`
        };
    };

    const shipToAddress = [
        addressSnapshot?.address_line_1,
        addressSnapshot?.address_line_2,
    ]
        .filter(Boolean)
        .join(', ');

    const packageInfo = getPackageDimension(order?.items || []);

    const o = {
        orderNo: order?.order_number || '',
        shipTo: {
            name: addressSnapshot?.name || '',
            address: shipToAddress || '',
            city: addressSnapshot?.city || '',
            state: addressSnapshot?.state || '',
            pincode: addressSnapshot?.pincode || '',
            phone: addressSnapshot?.phone || '',
            mobile: addressSnapshot?.mobile || '',
        },
        deliveryNote: order?.notes || "",

        shipFrom: order?.shipFrom || {
            name: sellerMeta?.business_name || '',
            address: sellerAddress?.address_line_1 || '',
            city: sellerAddress?.city || '',
            state: sellerAddress?.state || '',
            pincode: sellerAddress?.pincode || '',
            phone: sellerMeta?.phone || '',
        },
        product: {
            name: order?.product_title || order?.items?.[0]?.product_title || '',
            qty: order?.total_quantity || 1,
            weight: packageInfo.weight,
            dimensions: packageInfo.dimensions,
            orderDate: order?.created_time ? FORMATED_DATE_TIME(order.created_time) : '',
            courier: 'ShopEase Express',
        },
        payment: paymentMethod,
        amount: order?.subtotal || 0,
        qrDataUrl: order?.qrDataUrl || null,
        website: order?.website || 'shopease.in',
        supportEmail: order?.supportEmail || 'support@shopease.in',
    };

    const isCOD = o.payment === 'COD';

    return (
        <Document>
            <Page
                size={{ width: 510, height: 310 }}
                style={s.page}
                orientation="portrait"
            >
                <View style={s.header}>
                    <Text style={s.headerBrand}>SHOPEASE</Text>
                    <Text style={s.headerMeta}>
                        ORDER #{o.orderNo}{'\n'}
                    </Text>
                </View>

                <View style={s.expressBand}>
                    <Text style={s.expressTxt}>EXPRESS DELIVERY</Text>
                </View>

                <View style={s.body}>
                    <View style={s.leftCol}>
                        <View style={s.addrRow}>
                            <View style={s.addrBox}>
                                <Text style={s.secLabel}>Ship To</Text>
                                <Text style={s.nameText}>{o.shipTo.name}</Text>
                                <Text style={s.addrText}>
                                    Address: {o.shipTo.address}{'\n'}
                                    {o.shipTo.city} — {o.shipTo.pincode}{'\n'}
                                    {o.shipTo.state}, India
                                </Text>
                                <Text style={s.phoneText}>
                                    Mob: {o.shipTo.phone || o.shipTo.mobile}
                                </Text>
                            </View>

                            <View style={s.addrBox}>
                                <Text style={s.secLabel}>Ship From</Text>
                                <Text style={s.nameText}>{o.shipFrom.name}</Text>
                                <Text style={s.addrText}>
                                    {o.shipFrom.address}{'\n'}
                                    {o.shipFrom.city} — {o.shipFrom.pincode}{'\n'}
                                    {o.shipFrom.state}, India
                                </Text>
                                <Text style={s.phoneText}>Mob: {o.shipFrom.phone}</Text>
                            </View>

                        </View>
                        <View>
                            <Text style={s.addrText}>
                                Delivery Note: {o.deliveryNote}
                            </Text>
                        </View>

                        <View style={s.dashedDivider} />

                        <Text style={s.secLabel}>Product Details</Text>
                        <Text style={s.productName}>{o.product.name}</Text>

                        <View style={s.detailGrid}>
                            <View style={s.detailCell}>
                                <Text style={s.detailKey}>Qty</Text>
                                <Text style={s.detailVal}>{o.product.qty}</Text>
                            </View>
                            <View style={s.detailCell}>
                                <Text style={s.detailKey}>Weight</Text>
                                <Text style={s.detailVal}>{o.product.weight}</Text>
                            </View>
                            <View style={s.detailCell}>
                                <Text style={s.detailKey}>Dimensions</Text>
                                <Text style={s.detailVal}>{o.product.dimensions}</Text>
                            </View>
                            <View style={s.detailCell}>
                                <Text style={s.detailKey}>Order Date</Text>
                                <Text style={s.detailVal}>{o.product.orderDate}</Text>
                            </View>
                            <View style={s.detailCell}>
                                <Text style={s.detailKey}>Payment</Text>
                                <Text style={s.detailVal}>{o.payment}</Text>
                            </View>
                            <View style={s.detailCell}>
                                <Text style={s.detailKey}>Courier</Text>
                                <Text style={s.detailVal}>{o.product.courier}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={s.rightCol}>
                        <View style={{ alignItems: 'center' }}>
                            <Text style={s.qrLabel}>Scan to Track</Text>
                            {o.qrDataUrl ? (
                                <Image style={s.qrImage} src={o.qrDataUrl} />
                            ) : (
                                <View
                                    style={[
                                        s.qrImage,
                                        {
                                            backgroundColor: '#f0f0f0',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        },
                                    ]}
                                >
                                    <Text
                                        style={{
                                            fontSize: 7,
                                            color: '#aaa',
                                            textAlign: 'center',
                                        }}
                                    >
                                        QR{'\n'}CODE
                                    </Text>
                                </View>
                            )}
                        </View>
                        <View style={{ alignItems: 'center' }}>
                            <Text style={s.collectLabel}>Collect</Text>
                            <Text style={s.collectSmall}>Amount (Rs.)</Text>
                            <Text style={s.collectAmt}>
                                {isCOD ? Number(o.amount || 0).toFixed(2) : 'PREPAID'}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={s.footer}>
                    {isCOD ? (
                        <View style={s.codBadge}>
                            <Text style={s.codBadgeTxt}>CASH ON DELIVERY</Text>
                        </View>
                    ) : (
                        <View style={s.prepaidBadge}>
                            <Text style={s.prepaidBadgeTxt}>PREPAID</Text>
                        </View>
                    )}
                    <Text style={s.footerMid}>
                        {o.website} | {o.supportEmail}
                    </Text>
                    <Text style={s.footerRight}>Packed with care</Text>
                </View>
            </Page>
        </Document>
    );
};

export default ShippingLabel;