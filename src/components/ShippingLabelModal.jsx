
import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Table, Alert } from "react-bootstrap";

const ShippingLabelModal = ({
    isOpen,
    onClose,
    order = {},
    onGenerate,
}) => {
    const [productSettings, setProductSettings] = useState([]);
    const [error, setError] = useState("");

    const items = Array.isArray(order?.items) ? order.items : [];

    useEffect(() => {
        if (!isOpen) return;

        setProductSettings(
            items.map((item, index) => ({
                ...item,
                config_id:
                    item.id ||
                    item.product_id ||
                    `product-${index}`,
                total_quantity: Number(item.quantity) || 0,
                quantity_per_parcel: Math.max(
                    1,
                    Number(item.quantity) || 1
                ),
            }))
        );

        setError("");
    }, [isOpen, order]);

    const handleQuantityChange = (configId, value) => {
        const setting = productSettings.find(
            (item) => item.config_id === configId
        );

        if (!setting) return;

        const quantity = Number(value);

        if (
            value === "" ||
            !Number.isInteger(quantity) ||
            quantity < 1 ||
            quantity > setting.total_quantity
        ) {
            setProductSettings((prev) =>
                prev.map((item) =>
                    item.config_id === configId
                        ? { ...item, quantity_per_parcel: value }
                        : item
                )
            );
            return;
        }

        setProductSettings((prev) =>
            prev.map((item) =>
                item.config_id === configId
                    ? {
                        ...item,
                        quantity_per_parcel: quantity,
                    }
                    : item
            )
        );
    };

    const handleGenerate = () => {
        const invalidProduct = productSettings.find(
            (item) =>
                !Number.isInteger(Number(item.quantity_per_parcel)) ||
                Number(item.quantity_per_parcel) < 1 ||
                Number(item.quantity_per_parcel) >
                item.total_quantity
        );

        if (invalidProduct) {
            setError(
                "Please enter a valid quantity per parcel for every product."
            );
            return;
        }

        let parcelNumber = 1;
        const parcels = [];

        productSettings.forEach((item) => {
            let remainingQuantity = item.total_quantity;
            const quantityPerParcel = Number(
                item.quantity_per_parcel
            );

            while (remainingQuantity > 0) {
                const parcelQuantity = Math.min(
                    remainingQuantity,
                    quantityPerParcel
                );

                const unitPrice =
                    Number(item.unit_price ?? item.price ?? item.final_price) || 0;

                parcels.push({
                    parcel_no: parcelNumber,
                    product_id: item.product_id || item.id || null,
                    product_title:
                        item.product_title ||
                        item.title ||
                        item.name ||
                        "Product",
                    variant_color: item.variant_color || null,
                    variant_size: item.variant_size || null,
                    product_image_url: item.product_image_url || item.product_image || null,
                    quantity: parcelQuantity,
                    parcel_quantity: parcelQuantity,
                    unit_price: unitPrice,
                    parcel_gross_amount:
                        Number(
                            (unitPrice * parcelQuantity).toFixed(2)
                        ),
                });

                remainingQuantity -= parcelQuantity;
                parcelNumber += 1;
            }
        });

        const parcelConfig = {
            order_id: order.id || order.order_id || null,
            order_number: order.order_number || null,
            payment_method: order.payment_method || null,
            order_total: Number(order.total_amount ?? order.order_total) || 0,
            total_parcels: parcels.length,
            parcels,
        };

        // Parent component receives this object for the next step.
        if (typeof onGenerate === "function") {
            onGenerate(parcelConfig);
        }

        onClose?.();
    };

    const getProductName = (item) =>
        item.product_title ||
        item.title ||
        item.name ||
        "Product";

    const getParcelCount = (item) => {
        const qty = Number(item.quantity_per_parcel);

        if (
            !Number.isInteger(qty) ||
            qty < 1 ||
            qty > item.total_quantity
        ) {
            return "—";
        }

        return Math.ceil(item.total_quantity / qty);
    };

    return (
        <Modal
            show={isOpen}
            onHide={() => { }}
            centered
            size="xl"
            backdrop="static"
            keyboard={false}
        >
            {/* <Modal.Header>
                <Modal.Title>
                    Configure Shipping Parcels
                </Modal.Title>
            </Modal.Header> */}

            <Modal.Body>
                <div className="mb-3">
                    <strong>Order:</strong>{" "}
                    {order.order_number || order.id || "—"}
                    <br />
                    <strong>Total Order Amount:</strong>{" "}
                    ₹{(Number(order.total_amount) || 0).toFixed(2)}
                </div>

                <Alert variant="info">
                    Enter the maximum quantity of each product
                    that should go into one parcel. Remaining
                    quantities will automatically create additional
                    parcels.
                </Alert>

                {error && (
                    <Alert variant="danger">{error}</Alert>
                )}

                {productSettings.length > 0 ? (
                    <div className="table-responsive">
                        <Table bordered hover responsive="md">
                            <thead className="table-light">
                                <tr>
                                    <th>#</th>
                                    <th>Product</th>
                                    <th>Total Quantity</th>
                                    <th>Unit Price</th>
                                    <th>Qty Per Parcel</th>
                                    <th>Parcels Required</th>
                                </tr>
                            </thead>

                            <tbody>
                                {productSettings.map((item, index) => (
                                    <tr key={item.config_id}>
                                        <td>{index + 1}</td>

                                        <td>
                                            <div className="fw-semibold">
                                                {getProductName(item)}
                                            </div>
                                            <small className="text-muted">
                                                ID:{" "}
                                                {item.product_id ||
                                                    item.id ||
                                                    "—"}
                                            </small>
                                        </td>

                                        <td>{item.total_quantity}</td>

                                        <td>
                                            ₹
                                            {(
                                                Number(item.unit_price) || 0
                                            ).toFixed(2)}
                                        </td>

                                        <td>
                                            <Form.Control
                                                type="number"
                                                min="1"
                                                max={item.total_quantity}
                                                step="1"
                                                value={
                                                    item.quantity_per_parcel
                                                }
                                                onChange={(event) =>
                                                    handleQuantityChange(
                                                        item.config_id,
                                                        event.target.value
                                                    )
                                                }
                                                aria-label={`Quantity per parcel for ${getProductName(item)}`}
                                            />
                                            <small className="text-muted">
                                                Max: {item.total_quantity}
                                            </small>
                                        </td>

                                        <td>
                                            {getParcelCount(item)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                ) : (
                    <Alert variant="warning">
                        No products found in this order.
                    </Alert>
                )}

                <div className="text-muted small">
                    Note: This creates a separate parcel plan for
                    each product. Combining different products in
                    the same physical box is not handled here.
                </div>
            </Modal.Body>

            <Modal.Footer>
                <Button
                    variant="secondary"
                    onClick={onClose}
                >
                    Cancel
                </Button>

                <Button
                    variant="primary"
                    onClick={handleGenerate}
                    disabled={productSettings.length === 0}
                >
                    Generate Labels
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ShippingLabelModal;