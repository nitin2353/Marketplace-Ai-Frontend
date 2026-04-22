import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import Invoice, { invoiceNo } from './Invoice'; // apna path adjust karo
import orderApi from '../api/order.api'

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
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ff6b35" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <circle cx="12" cy="16" r="0.5" fill="#ff6b35" />
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
            setError(err?.message || 'Order load karne mein dikkat aayi.');
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
                    <p style={styles.loadingText}>Invoice load ho rahi hai…</p>
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
                        <p style={styles.loadingText}>PDF render ho rahi hai…</p>
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

// ─── Styles (inline, no extra deps) ─────────────────────────────────────────
const styles = {
    page: {
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: '#1a1a1a',
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    },
    topBar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#111111',
        padding: '10px 24px',
        borderBottom: '1px solid #2a2a2a',
        flexShrink: 0,
        zIndex: 10,
    },
    topLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
    },
    logo: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: 700,
        letterSpacing: '2px',
    },
    topSub: {
        color: '#666',
        fontSize: 12,
        letterSpacing: '1px',
        textTransform: 'uppercase',
    },
    topActions: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
    },
    downloadBtn: {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#ff6b35',
        color: '#ffffff',
        border: 'none',
        borderRadius: 6,
        padding: '8px 16px',
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
        textDecoration: 'none',
        letterSpacing: '0.3px',
        transition: 'background 0.2s',
    },
    printBtn: {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'transparent',
        color: '#aaaaaa',
        border: '1px solid #333',
        borderRadius: 6,
        padding: '7px 14px',
        fontSize: 13,
        fontWeight: 500,
        cursor: 'pointer',
        letterSpacing: '0.3px',
    },
    viewerWrap: {
        flex: 1,
        display: 'flex',
        overflow: 'hidden',
    },
    viewer: {
        width: '100%',
        height: '100%',
        border: 'none',
    },
    center: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
    },
    spinnerWrap: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    spinner: {
        width: 40,
        height: 40,
        border: '3px solid #2a2a2a',
        borderTop: '3px solid #ff6b35',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
    },
    loadingText: {
        color: '#666',
        fontSize: 14,
        letterSpacing: '0.5px',
    },
    errorBox: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 14,
        padding: '40px 32px',
        backgroundColor: '#1e1e1e',
        borderRadius: 12,
        border: '1px solid #2a2a2a',
        maxWidth: 360,
        textAlign: 'center',
    },
    errorText: {
        color: '#aaa',
        fontSize: 14,
        lineHeight: 1.6,
        margin: 0,
    },
    retryBtn: {
        backgroundColor: '#ff6b35',
        color: '#fff',
        border: 'none',
        borderRadius: 6,
        padding: '9px 22px',
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
        letterSpacing: '0.3px',
    },
};

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