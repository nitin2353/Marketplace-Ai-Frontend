import JsBarcode from "jsbarcode";

/**
 * Generate CODE128 barcode and return PNG Data URL.
 *
 * @param {string|number} value - Barcode number
 * @param {object} options - Optional barcode styling
 * @returns {string} PNG Data URL
 */
export const generateBarcode = (value, options = {}) => {
    const barcodeValue = String(value ?? "").trim();

    if (!barcodeValue) {
        throw new Error("Barcode value is required");
    }

    if (typeof document === "undefined") {
        throw new Error("Barcode generation requires a browser environment");
    }

    const canvas = document.createElement("canvas");

    JsBarcode(canvas, barcodeValue, {
        format: "CODE128",
        width: 2,
        height: 65,
        displayValue: true,
        fontSize: 14,
        font: "Arial",
        margin: 8,
        lineColor: "#000000",
        background: "#ffffff",
        ...options,
    });

    return canvas.toDataURL("image/png");
};
