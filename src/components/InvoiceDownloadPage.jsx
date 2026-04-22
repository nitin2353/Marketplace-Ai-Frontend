import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PDFDownloadLink } from '@react-pdf/renderer';
import QRCode from 'qrcode';
import Invoice, { invoiceNo } from './Invoice';
import orderApi from '../api/order.api';
import { API_BASE_URL } from '../helper/Constraints';
import AiMarketPlaceApi from '../api/AiMarketPlaceApi';

const BASE_URL = `http://192.168.6.179:5173`; 

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
                alert('done')
                const {data} = await AiMarketPlaceApi.getOrderById(id);
                
                const orderData = data?.data;

                const qrUrl = `${BASE_URL}/invoice/${invoiceNo(orderData)}`;

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
                    setError(err.message || 'Something went wrong');
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
            setError('Order id is missing in params');
        }

        return () => {
            mounted = false;
        };
    }, [id]);

    if (loading) {
        return <div>Loading invoice...</div>;
    }

    if (error) {
        return <div style={{ color: 'red' }}>{error}</div>;
    }

    // if (!order) {
    //     return <div>No order found</div>;
    // }

    return (
        <div style={{ padding: '20px' }}>
            <h2>Invoice Ready</h2>
            <p>Order No: {order?.order_number}</p>

            <PDFDownloadLink
                document={<Invoice order={order} qrDataUrl={qrDataUrl} />}
                fileName={`${order?.order_number || 'invoice'}.pdf`}
            >   
            </PDFDownloadLink>
        </div>
    );
};

export default InvoiceDownloadPage;