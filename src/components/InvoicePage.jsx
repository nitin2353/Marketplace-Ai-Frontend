
import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { BlobProvider, PDFDownloadLink } from "@react-pdf/renderer";
import Invoice, { invoiceNo } from "./Invoice";
import styles from "../style/InvoicePage";
import QRCode from "qrcode";
import AiMarketPlaceApi from "../api/AiMarketPlaceApi";
import { API_BASE_URL } from "../helper/Constraints";

const generateQrDataUrl = async (text) => {
  try {
    return await QRCode.toDataURL(text, {
      width: 144,
      margin: 1,
      color: { dark: "#111111", light: "#ffffff" },
    });
  } catch (error) {
    console.error("QR generation failed:", error);
    return null;
  }
};

const Spinner = () => (
  <div style={styles.spinnerWrap}>
    <div style={styles.spinner} />
  </div>
);

const ErrorBox = ({ message, onRetry }) => (
  <div style={styles.errorBox}>
    <p style={styles.errorText}>{message}</p>
    {onRetry && (
      <button style={styles.retryBtn} onClick={onRetry}>
        Try Again
      </button>
    )}
  </div>
);

const InvoicePage = () => {
  const { id, sellerId } = useParams();

  const [order, setOrder] = useState(null);
  const [qrUrl, setQrUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Supports routes such as /invoice/:id/:sellerId
      // If your route uses different parameter names,
      // update these values to match your route definition.
      const urlParts = window.location.pathname
        .split("/")
        .filter(Boolean);

      const invoiceIndex = urlParts.lastIndexOf("invoice");
      const firstId = id || urlParts[invoiceIndex + 1];
      const secondId =
        sellerId || urlParts[invoiceIndex + 2];

      if (!firstId || !secondId) {
        throw new Error("Invoice URL is missing required IDs.");
      }

      const { data } = await AiMarketPlaceApi.getOrderById(
        firstId,
        secondId
      );

      setOrder(data);

      const verifyUrl =
        `${API_BASE_URL}/order/invoice/${firstId}/${secondId}`;

      const qr = await generateQrDataUrl(verifyUrl);
      setQrUrl(qr);
    } catch (err) {
      console.error("Invoice loading failed:", err);
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Error loading order."
      );
    } finally {
      setLoading(false);
    }
  }, [id, sellerId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.center}>
          <Spinner />
          <p style={styles.loadingText}>Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={styles.page}>
        <div style={styles.center}>
          <ErrorBox
            message={error || "Order data is unavailable."}
            onRetry={fetchOrder}
          />
        </div>
      </div>
    );
  }

  const fileName = `${invoiceNo(order)}.pdf`;

  return (
    <div style={pageStyles.page}>
      <header style={pageStyles.toolbar}>
        <div>
          <strong style={pageStyles.brand}>SHOPEASE</strong>
          <div style={pageStyles.subtitle}>Invoice Preview</div>
        </div>

        <div style={pageStyles.actions}>
          <PDFDownloadLink
            document={<Invoice order={order} qrDataUrl={qrUrl} />}
            fileName={fileName}
            style={pageStyles.download}
          >
            {({ loading: generating }) =>
              generating ? "Preparing..." : "Download PDF"
            }
          </PDFDownloadLink>
        </div>
      </header>

      <div style={pageStyles.viewer}>
        <BlobProvider
          document={<Invoice order={order} qrDataUrl={qrUrl} />}
        >
          {({ url, loading: generating, error: pdfError }) => {
            if (generating) {
              return (
                <div style={styles.center}>
                  <Spinner />
                  <p style={styles.loadingText}>
                    Generating PDF...
                  </p>
                </div>
              );
            }

            if (pdfError || !url) {
              return (
                <div style={styles.center}>
                  <ErrorBox
                    message="Unable to generate PDF. Please try again."
                  />
                </div>
              );
            }

            return (
              <div style={pageStyles.preview}>
                <div style={pageStyles.mobileActions}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={pageStyles.openButton}
                  >
                    Open PDF
                  </a>

                  <a
                    href={url}
                    download={fileName}
                    style={pageStyles.download}
                  >
                    Download
                  </a>
                </div>

                <iframe
                  src={url}
                  title="ShopEase Invoice"
                  style={pageStyles.iframe}
                />
              </div>
            );
          }}
        </BlobProvider>
      </div>
    </div>
  );
};

const pageStyles = {
  page: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100dvh",
    minHeight: "500px",
    overflow: "hidden",
    background: "#f1f5f9",
    fontFamily: "Arial, sans-serif",
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "12px",
    padding: "14px 20px",
    background: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
  },
  brand: {
    fontSize: "18px",
    color: "#111827",
  },
  subtitle: {
    marginTop: "4px",
    fontSize: "13px",
    color: "#6b7280",
  },
  actions: {
    display: "flex",
    gap: "8px",
  },
  download: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 14px",
    borderRadius: "7px",
    background: "#111827",
    color: "#ffffff",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: 600,
  },
  viewer: {
    flex: 1,
    minHeight: 0,
    padding: "12px",
  },
  preview: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100%",
    gap: "8px",
  },
  mobileActions: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  openButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 14px",
    borderRadius: "7px",
    background: "#2563eb",
    color: "#ffffff",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: 600,
  },
  iframe: {
    flex: 1,
    width: "100%",
    minHeight: "300px",
    border: "none",
    borderRadius: "8px",
    background: "#ffffff",
  },
};

export default InvoicePage;
