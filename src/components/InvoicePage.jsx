import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import Invoice, { invoiceNo } from './Invoice'; // apna path adjust karo
import orderApi from '../api/order.api'
import styles from '../style/InvoicePage';

// ─── QR helper (qrcode.react ya koi bhi library) ───────────────────────────
// Agar aapke paas qrcode library nahi hai to:  npm install qrcode
import QRCode from 'qrcode';
import AiMarketPlaceApi from '../api/AiMarketPlaceApi';
import JWTService from '../config/jwt.config';
import { API_BASE_URL } from '../helper/Constraints';

const generateQrDataUrl = async (text) => {
    try {
        return await QRCode.toDataURL(text, {
            width: 144,
            margin: 1,
            color: { dark: '#111111', light: '#ffffff' },
        });
    } catch {
        return null;
    }
};

// ─── Tiny reusable UI pieces ────────────────────────────────────────────────
const Spinner = () => (
    <div style={styles.spinnerWrap}>
        <div style={styles.spinner} />
    </div>
);

const ErrorBox = ({ message, onRetry }) => (
    <div style={styles.errorBox}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#3549ffff" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <circle cx="12" cy="16" r="0.5" fill="#3549ffff" />
        </svg>
        <p style={styles.errorText}>{message}</p>
        {onRetry && (
            <button style={styles.retryBtn} onClick={onRetry}>
                Try Again
            </button>
        )}
    </div>
);


const InvoicePage = () => {
    const { id } = useParams();

    const [order, setOrder] = useState(null);
    const [qrUrl, setQrUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pdfReady, setPdfReady] = useState(false);
    const parms = window.location.href

    const fetchOrder = useCallback(async () => {
        setLoading(true);
        setError(null);
        setPdfReady(false);

        const p1 = parms.split('invoice/')[1].split('/')[0]
        const p2 = parms.split('invoice/')[1].split('/')[1]

        try {
            const { data } = await AiMarketPlaceApi.getOrderById(p1, p2);
            setOrder(data);
            const invNo = invoiceNo(data);
            const verifyUrl = `${API_BASE_URL}/order/invoice/${p1}/${p2}`;

            console.log("verifyUrl", verifyUrl)

            const qr = await generateQrDataUrl(verifyUrl);
            setQrUrl(qr);

            // Small delay so PDF renderer mounts cleanly
            setTimeout(() => setPdfReady(true), 100);
        } catch (err) {
            setError(err?.message || 'Error loading order');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { fetchOrder(); }, [fetchOrder]);

    // ── Derived ──
    const fileName = order ? `${invoiceNo(order)}.pdf` : 'invoice.pdf';

    // ── Render states ──
    if (loading) {
        return (
            <div style={styles.page}>
                <TopBar fileName={null} order={null} />
                <div style={styles.center}>
                    <Spinner />
                    <p style={styles.loadingText}>Loading...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.page}>
                <TopBar fileName={null} order={null} />
                <div style={styles.center}>
                    <ErrorBox message={error} onRetry={fetchOrder} />
                </div>
            </div>
        );
    }

    return (
        <div style={styles.page}>
            <TopBar fileName={fileName} order={order} qrUrl={qrUrl} />

            <div style={styles.viewerWrap}>
                {pdfReady ? (
                    <PDFViewer style={styles.viewer} showToolbar={false}>
                        <Invoice order={order} qrDataUrl={qrUrl} />
                    </PDFViewer>
                ) : (
                    <div style={styles.center}>
                        <Spinner />
                        <p style={styles.loadingText}>PDF Generating...</p>
                    </div>
                )}
            </div>
        </div>      
    );
};

// ─── Top action bar ─────────────────────────────────────────────────────────
const TopBar = ({ fileName, order, qrUrl }) => (
    <header style={styles.topBar}>
        {/* Left – branding */}
        <div style={styles.topLeft}>
            <div style={styles.logo}>SHOPEASE</div>
            <span style={styles.topSub}>Invoice Viewer</span>
        </div>

        {/* Right – actions */}
        <div style={styles.topActions}>
            {order && (
                <PDFDownloadLink
                    document={<Invoice order={order} qrDataUrl={qrUrl} />}
                    fileName={fileName}
                    style={styles.downloadBtn}
                >
                    {({ loading: l }) =>
                        l ? 'Preparing…' : (
                            <>
                                <DownloadIcon />
                                Download PDF
                            </>
                        )
                    }
                </PDFDownloadLink>
            )}

            <button style={styles.printBtn} onClick={() => window.print()}>
                <PrintIcon />
                Print
            </button>
        </div>
    </header>
);

// ─── Tiny SVG icons ─────────────────────────────────────────────────────────
const DownloadIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" style={{ marginRight: 6 }}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);

const PrintIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" style={{ marginRight: 6 }}>
        <polyline points="6 9 6 2 18 2 18 9" />
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
        <rect x="6" y="14" width="12" height="8" />
    </svg>
);


// CSS animation inject (spinner ke liye)
if (typeof document !== 'undefined') {
    const styleTag = document.getElementById('invoice-page-styles') || (() => {
        const t = document.createElement('style');
        t.id = 'invoice-page-styles';
        document.head.appendChild(t);
        return t;
    })();
    styleTag.textContent = `
        @keyframes spin { to { transform: rotate(360deg); } }
        @media print {
            header { display: none !important; }
        }
    `;
}

export default InvoicePage;