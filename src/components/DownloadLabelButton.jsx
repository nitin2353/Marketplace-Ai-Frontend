import React, { useEffect, useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import QRCode from "qrcode";
import ShippingLabel from "../components/ShippingLabel.jsx";
import { MdQrCodeScanner } from "react-icons/md";
import JWTService from "../config/jwt.config";
import { FRONTEND_BASE_URL } from "../helper/Constraints.jsx";


console.log('FRONTEND_BASE_URL', FRONTEND_BASE_URL)

const genQR = async (url) => {
    try {
        return await QRCode.toDataURL(url, {
            width: 160,
            margin: 1,
            color: {
                dark: "#111111",
                light: "#ffffff",
            },
        });
    } catch (error) {
        console.error("QR generation error:", error);
        return null;
    }
};

const getButtonStyle = (disabled = false) => ({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "5px",
    color: "#fff",
    background: disabled ? "#9ca3af" : "#4d4ff4",
    border: "none",
    borderRadius: "6px",
    textDecoration: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: "10px",
    height: "auto",
    fontWeight: 600,
});

export default function DownloadLabelButton({ order = {}, parcelConfig }) {
    const [qrs, setQrs] = useState({
        tracking: null,
        invoice: null,
        loading: true,
    });

    const orderId = order?.id || order?.order_id || parcelConfig?.order_id;
    const parcels = Array.isArray(parcelConfig?.parcels)
        ? parcelConfig.parcels
        : [];

    useEffect(() => {
        let isMounted = true;

        const generateQrs = async () => {
            if (!orderId || parcels.length === 0) {
                if (isMounted) {
                    setQrs({ tracking: null, invoice: null, loading: false });
                }
                return;
            }

            setQrs({ tracking: null, invoice: null, loading: true });

            try {
                const tokenDetails = JWTService.decodeTokenDetails();
                const userId = tokenDetails?.id;

                if (!userId) {
                    throw new Error("User ID not found in token");
                }

                const invoiceUrl = `${FRONTEND_BASE_URL}/order/invoice/${orderId}/${userId}`;
                const [tracking, invoice] = await Promise.all([
                    genQR(invoiceUrl),
                    genQR(invoiceUrl),
                ]);

                if (!tracking || !invoice) {
                    throw new Error("Could not create the label QR code");
                }

                if (isMounted) {
                    setQrs({ tracking, invoice, loading: false });
                }
            } catch (error) {
                console.error("Failed to generate QR codes:", error);
                if (isMounted) {
                    setQrs({ tracking: null, invoice: null, loading: false });
                }
            }
        };

        generateQrs();

        return () => {
            isMounted = false;
        };
    }, [orderId, parcelConfig?.order_number, parcels.length]);

    if (!orderId) {
        return (
            <button type="button" className="fw-bold" disabled style={getButtonStyle(true)}>
                Invalid order
            </button>
        );
    }

    if (parcels.length === 0) {
        return (
            <button type="button" className="fw-bold" disabled style={getButtonStyle(true)}>
                Configure parcels first
            </button>
        );
    }

    if (qrs.loading) {
        return (
            <button type="button" className="fw-bold" disabled style={getButtonStyle(true)}>
                Preparing labels...
            </button>
        );
    }

    if (!qrs.tracking || !qrs.invoice) {
        return (
            <button type="button" className="fw-bold" disabled style={getButtonStyle(true)}>
                QR generation failed
            </button>
        );
    }

    // Pass the exact parcel configuration into the PDF document.
    const orderWithQR = {
        ...order,
        id: order?.id || orderId,
        order_id: order?.order_id || parcelConfig?.order_id || orderId,
        order_number: order?.order_number || parcelConfig?.order_number || "ORDER",
        payment_method: order?.payment_method || parcelConfig?.payment_method || "",
        total_amount:
            order?.total_amount ??
            order?.order_total ??
            parcelConfig?.order_total ??
            0,
        order_total:
            order?.order_total ??
            parcelConfig?.order_total ??
            order?.total_amount ??
            0,
        trackingQr: qrs.tracking,
        invoiceQr: qrs.invoice,
        qrDataUrl: qrs.tracking,
        parcelConfig,
    };

    return (
        <PDFDownloadLink
            document={<ShippingLabel order={orderWithQR} />}
            fileName={`shipping-label-${orderWithQR.order_number}.pdf`}
            style={getButtonStyle(false)}
        >
            {({ loading, error }) => {
                if (error) {
                    console.error("Shipping label PDF generation failed:", error);
                    return "PDF generation failed";
                }

                return loading ? (
                    "Preparing PDF..."
                ) : (
                    <>
                        <MdQrCodeScanner style={{ marginRight: "6px" }} />
                        Download / Print Labels
                    </>
                );
            }}
        </PDFDownloadLink>
    );
}
