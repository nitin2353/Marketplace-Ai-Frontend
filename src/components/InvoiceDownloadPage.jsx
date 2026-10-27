
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PDFDownloadLink } from '@react-pdf/renderer';
import QRCode from 'qrcode';
import Invoice, { invoiceNo } from './Invoice';
import { FRONTEND_BASE_URL } from '../helper/Constraints';
import AiMarketPlaceApi from '../api/AiMarketPlaceApi';

const BASE_URL = FRONTEND_BASE_URL;

const InvoiceDownloadPage = () => {
    const { id } = useParams();

    const [order, setOrder] = useState(null);
    const [qrDataUrl, setQrDataUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let mounted = true;

        const fetchOrder = async () => {
            try {
                setLoading(true);
                setError('');

                const { data } =
                    await AiMarketPlaceApi.getOrderById(id);

                const orderData = data?.data;

                if (!orderData) {
                    throw new Error('Order not found');
                }

                const qrUrl =
                    `${BASE_URL}/invoice/${invoiceNo(orderData)}`;

                const qr = await QRCode.toDataURL(qrUrl, {
                    width: 180,
                    margin: 1,
                    color: {
                        dark: '#111111',
                        light: '#ffffff',
                    },
                });

                if (mounted) {
                    setOrder(orderData);
                    setQrDataUrl(qr);
                }
            } catch (err) {
                console.error('Invoice fetch error:', err);

                if (mounted) {
                    setError(
                        err.message || 'Unable to load invoice'
                    );
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        if (id) {
            fetchOrder();
        } else {
            setLoading(false);
            setError('Order ID is missing');
        }

        return () => {
            mounted = false;
        };
    }, [id]);

    if (loading) {
        return (
            <div style={{ padding: 24, color: '#fff' }}>
                Loading invoice...
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: 24, color: 'red' }}>
                {error}
            </div>
        );
    }

    if (!order) {
        return <div>Order not found.</div>;
    }

    const invoiceDocument = (
        <Invoice order={order} qrDataUrl={qrDataUrl} />
    );

    return (
        <div
            style={{
                minHeight: '100vh',
                background: '#252525',
                color: '#fff',
            }}
        >
            {/* Header */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 12,
                    padding: '16px',
                    background: '#111',
                }}
            >
                <div>
                    <strong style={{ letterSpacing: 2 }}>
                        FlashiBuy
                    </strong>
                    <div style={{ fontSize: 12, color: '#aaa' }}>
                        INVOICE VIEWER
                    </div>
                </div>

                <PDFDownloadLink
                    document={invoiceDocument}
                    fileName={`${order.order_number || 'invoice'}.pdf`}
                    style={{
                        background: '#ff6835',
                        color: '#fff',
                        textDecoration: 'none',
                        padding: '12px 18px',
                        borderRadius: 8,
                        fontWeight: 600,
                    }}
                >
                    {({ loading: pdfLoading }) =>
                        pdfLoading
                            ? 'Preparing PDF...'
                            : 'Download PDF'
                    }
                </PDFDownloadLink>

                <button
                    onClick={() => window.print()}
                    style={{
                        padding: '12px 18px',
                        border: '1px solid #555',
                        borderRadius: 8,
                        background: '#222',
                        color: '#fff',
                        cursor: 'pointer',
                    }}
                >
                    Print
                </button>
            </div>

            {/* Responsive PDF preview */}

            {/* Responsive HTML Invoice Preview */}
            <div
                style={{
                    width: '100%',
                    padding: '12px',
                    boxSizing: 'border-box',
                    background: '#f1f1f1',
                    minHeight: '100vh',
                }}
            >
                <Invoice order={order} />
            </div>

        </div>
    );
};

export default InvoiceDownloadPage;
