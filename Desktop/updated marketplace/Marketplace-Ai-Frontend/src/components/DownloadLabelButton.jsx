import React, { useState, useEffect } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import QRCode from 'qrcode';
import ShippingLabel from './ShippingLabel';
import { MdQrCodeScanner } from 'react-icons/md';
import JWTService from '../config/jwt.config';
// import { API_BASE_URL } from '../helper/Constraints';
// import { API_BASE_URL } from '../helper/Constraints';

const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:5173`;
console.log(API_BASE_URL)
const genQR = async (url) => {
    try {
        return await QRCode.toDataURL(url, {
            width: 160,
            margin: 1,
            color: { dark: '#111111', light: '#ffffff' },
        });
    } catch (error) {
        console.error('QR generation error:', error);
        return null;
    }
};

const invoiceNo = (order) =>
    `INV-${order?.order_number?.replace('ORD-', '') || order?.id?.slice(0, 8)?.toUpperCase() || '000000'}`;

export default function DownloadLabelButton({ order }) {
    const [qrs, setQrs] = useState({
        tracking: null,
        invoice: null,
        loading: true,
    });

    useEffect(() => {
        let isMounted = true;

        const generateQrs = async () => {
            if (!order?.id) {
                if (isMounted) {
                    setQrs({
                        tracking: null,
                        invoice: null,
                        loading: false,
                    });
                }
                return;
            }

            try {
                const invNo = invoiceNo(order);

                const [tracking, invoice] = await Promise.all([
                    genQR(`${API_BASE_URL}/order/invoice/${order.id}/${JWTService.decodeTokenDetails().id}`),
                ]);

                if (isMounted) {
                    setQrs({
                        tracking,
                        invoice,
                        loading: false,
                    });
                }
            } catch (error) {
                console.error('Failed to generate QR codes:', error);
                if (isMounted) {
                    setQrs({
                        tracking: null,
                        invoice: null,
                        loading: false,
                    });
                }
            }
        };

        generateQrs();

        return () => {
            isMounted = false;
        };
    }, [order?.id, order?.order_number]);

    if (!order?.id) {
        return (
            <button type="button" disabled style={{ opacity: 0.6 }}>
                Invalid order
            </button>
        );
    }

    if (qrs.loading) {
        return (
            <button type="button" disabled style={{ opacity: 0.6 }}>
                Generating QR...
            </button>
        );
    }

    const orderWithQR = {
        ...order,
        qrDataUrl: qrs.tracking,     // ShippingLabel isi field ko use kar raha hai
        trackingQr: qrs.tracking,
        invoiceQr: qrs.invoice,
    };

    return (
        <PDFDownloadLink
            document={<ShippingLabel order={orderWithQR} />}
            fileName={`label-${order?.order_number || 'order'}.pdf`}
        >
            {({ loading }) => (
                <button type="button" className='text-light' style={{ background: "transparent", border: 'none' }}>
                    {loading ? (
                        'Preparing...'
                    ) : (
                        <>
                            <MdQrCodeScanner style={{ marginRight: '6px' }} />
                            Download Shipping Label
                        </>
                    )}
                </button>
            )}
        </PDFDownloadLink>
    );
}