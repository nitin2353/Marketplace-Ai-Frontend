import  { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BlobProvider } from "@react-pdf/renderer";
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
  const parms = window.location.href
  const [order, setOrder] = useState(null);
  const [qrUrl, setQrUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const autoDownloadTriggered = useRef(false);

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {

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

      const p1 = parms?.split('invoice/')[1]?.split('/')[0]
      const p2 = parms?.split('invoice/')[1]?.split('/')[1]

      const { data } = await AiMarketPlaceApi.getOrderById(
        p1,
        p2
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
    <div>
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

          // Automatically download invoice once
          if (!autoDownloadTriggered.current) {
            autoDownloadTriggered.current = true;

            setTimeout(() => {
              const link = document.createElement("a");
              link.href = url;
              link.download = fileName;
              document.body.appendChild(link);
              link.click();
              link.remove();
               navigate(-1)
            }, 300);
           
          }
        }}
      </BlobProvider>
    </div>
  );
};

export default InvoicePage;
