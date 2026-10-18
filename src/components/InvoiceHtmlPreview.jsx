
import React from 'react';
import { invoiceNo } from './Invoice';

const money = (value) =>
    `Rs. ${Number(value || 0).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

const InvoiceHtmlPreview = ({ order = {} }) => {
    const items = Array.isArray(order.items) ? order.items : [];
    const seller = order.seller_info?.info || {};
    const address = order.address_snapshot || {};
    const user = order.user_snapshot || {};

    const total =
        Number(order.subtotal || 0) +
        Number(order.delivery_charge || 0) -
        Number(order.discount_amount || 0);

    const styles = {
        card: {
            width: '100%',
            maxWidth: 760,
            margin: '0 auto',
            padding: 'clamp(14px, 4vw, 32px)',
            boxSizing: 'border-box',
            background: '#fff',
            color: '#222',
            fontFamily: 'Arial, sans-serif',
            fontSize: 14,
            lineHeight: 1.5,
            overflowWrap: 'anywhere',
        },
        section: {
            padding: '14px 0',
            borderBottom: '1px solid #e5e7eb',
        },
        heading: {
            fontSize: 18,
            fontWeight: 700,
            marginBottom: 8,
        },
        muted: { color: '#666', fontSize: 12 },
        tableWrap: { width: '100%', overflowX: 'auto' },
        table: {
            width: '100%',
            minWidth: 440,
            borderCollapse: 'collapse',
            textAlign: 'left',
        },
        cell: {
            padding: '10px 6px',
            borderBottom: '1px solid #eee',
            verticalAlign: 'top',
        },
    };

    if (!order.id) {
        return <p style={{ padding: 20 }}>No order data available.</p>;
    }

    return (
        <article style={styles.card}>
            <header style={{
                ...styles.section,
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12,
            }}>
                <div>
                    <h2 style={{ margin: 0 }}>SHOPEASE</h2>
                    <div style={styles.muted}>BILL OF SUPPLY</div>
                    <p>
                        <b>Seller:</b>{' '}
                        {seller.business_name || seller.name || 'ShopEase Seller'}
                    </p>
                </div>

                <div>
                    <b>INVOICE</b>
                    <div>{invoiceNo(order)}</div>
                    <div style={styles.muted}>
                        Order: {order.order_number || '—'}
                    </div>
                    <div style={styles.muted}>
                        Date: {order.created_time
                            ? new Date(order.created_time).toLocaleDateString('en-IN')
                            : '—'}
                    </div>
                </div>
            </header>

            <section style={styles.section}>
                <div style={styles.heading}>Billed To</div>
                <div>{user.full_name || address.name || '—'}</div>
                <div>{user.email || ''}</div>
                <div>{user.mobile || address.mobile || ''}</div>
            </section>

            <section style={styles.section}>
                <div style={styles.heading}>Shipping Address</div>
                <div>{address.name || '—'}</div>
                <div>{address.address_line_1 || ''}</div>
                <div>{address.address_line_2 || ''}</div>
                <div>
                    {[address.city, address.state, address.pincode]
                        .filter(Boolean).join(', ')}
                </div>
                <div>{address.mobile || ''}</div>
            </section>

            <section style={styles.section}>
                <div style={styles.heading}>Order Items</div>

                <div style={styles.tableWrap}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                {['Product', 'Qty', 'Unit Price', 'Total'].map(
                                    (label) => (
                                        <th key={label} style={styles.cell}>
                                            {label}
                                        </th>
                                    )
                                )}
                            </tr>
                        </thead>

                        <tbody>
                            {items.map((item, index) => (
                                <tr key={item.id || index}>
                                    <td style={styles.cell}>
                                        <b>{item.product_title || 'Unnamed Product'}</b>
                                        <div style={styles.muted}>
                                            {[
                                                item.product_brand,
                                                item.variant_size,
                                                item.variant_color,
                                            ].filter(Boolean).join(' · ')}
                                        </div>
                                    </td>
                                    <td style={styles.cell}>
                                        {item.quantity || 1}
                                    </td>
                                    <td style={styles.cell}>
                                        {money(item.unit_price)}
                                    </td>
                                    <td style={styles.cell}>
                                        {money(item.line_total)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <section style={{ ...styles.section, textAlign: 'right' }}>
                <p>Subtotal: {money(order.subtotal)}</p>
                <p>Delivery: {
                    Number(order.delivery_charge) > 0
                        ? money(order.delivery_charge)
                        : 'FREE'
                }</p>

                {Number(order.discount_amount) > 0 && (
                    <p>Discount: -{money(order.discount_amount)}</p>
                )}

                <h2 style={{ marginBottom: 0 }}>
                    Total: {money(total)}
                </h2>
                <div style={styles.muted}>
                    Payment: {order.payment_method || '—'} · {
                        order.payment_status || 'pending'
                    }
                </div>
            </section>

            <footer style={{
                paddingTop: 18,
                textAlign: 'center',
                ...styles.muted,
            }}>
                Thank you for shopping with ShopEase.
                <br />
                shopease.in
            </footer>
        </article>
    );
};

export default InvoiceHtmlPreview;
