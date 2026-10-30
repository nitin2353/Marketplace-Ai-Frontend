import React, { useCallback, useEffect, useRef, useState } from "react";
import { Badge, Button, Col, Form, InputGroup, Row, Stack } from "react-bootstrap";
import { toast } from "react-hot-toast";
import { useForm } from "react-hook-form";

import addressApi from "../api/address.api";
import ConfirmModal from "./ConfirmModal";
import { useAuthWrapper } from "../helper/AuthWrapper";
import shiprocketApi from "../api/shiprocket.api";

function Label({ children, required }) {
    return (
        <label className="co-label">
            {children}
            {required && <span style={{ color: "#dc3545" }}> *</span>}
        </label>
    );
}

function SectionTitle({ icon, children }) {
    return (
        <div className="co-section-title">
            {icon && <span>{icon}</span>}
            {children}
        </div>
    );
}

function StepAddress({
    selectedAddr,
    onSelect,
    onNext,
    addresses,
    onSaveAddress
}) {
    const [addingNew, setAddingNew] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [showDelete, setShowDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [saving, setSaving] = useState(false);

    // Delivery status for each saved address.
    const [deliveryStatus, setDeliveryStatus] = useState({});

    const [checkingAddress, setCheckingAddress] = useState(false);

    const { refresh, setRefresh } = useAuthWrapper();

    // Prevent duplicate API requests for the same address during rerenders.
    const checkedAddressIds = useRef(new Set());

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        reset,
        watch,
    } = useForm({
        defaultValues: {
            name: "",
            mobile: "",
            address_line_1: "",
            address_line_2: "",
            city: "",
            state: "",
            pincode: "",
            label: "home",
            phone: "",
            country_code: "IN",
            country: "India",
            instructions: "",
        },
    });

    const labelValue = watch("label");

    // Check delivery availability for a particular address.

    const checkAddress = useCallback(async (pincode, addressId = null) => {
        const deliveryPincode = String(pincode ?? "").trim();

        if (!/^[1-9]\d{5}$/.test(deliveryPincode)) {
            if (addressId !== null) {
                setDeliveryStatus((prev) => ({
                    ...prev,
                    [addressId]: {
                        status: "error",
                        message: "Invalid PIN code",
                    },
                }));
            }

            return false;
        }

        try {
            const response = await shiprocketApi.checkDeliveryAvailability({
                pickup_postcode: deliveryPincode,
                weight: 1,
                delivery_postcode: deliveryPincode,
                cod: 0,
            });

            console.log("Shiprocket response:", response);

            // Read availability from the actual response.
            const available = response?.available;

            if (typeof available !== "boolean") {
                console.error("Invalid Shiprocket response:", response);

                if (addressId !== null) {
                    setDeliveryStatus((prev) => ({
                        ...prev,
                        [addressId]: {
                            status: "error",
                            message: "Unable to verify",
                        },
                    }));
                }

                return false;
            }

            if (addressId !== null) {
                setDeliveryStatus((prev) => ({
                    ...prev,
                    [addressId]: {
                        status: available ? "available" : "unavailable",
                        message: available
                            ? "Delivery Available"
                            : "Delivery Unavailable",
                    },
                }));
            }

            return available;
        } catch (error) {
            console.error("Delivery check failed:", error);

            if (addressId !== null) {
                setDeliveryStatus((prev) => ({
                    ...prev,
                    [addressId]: {
                        status: "error",
                        message: "Check failed",
                    },
                }));
            } else {
                toast.error("Unable to check delivery availability.");
            }

            return false;
        } finally {
            if (addressId === null) {
                setCheckingAddress(false);
            }
        }
    }, []);


    // Check each saved address once. Never call APIs from JSX.
    useEffect(() => {
        if (!Array.isArray(addresses)) {
            return;
        }

        addresses.forEach((addr) => {
            if (!addr?.id) {
                return;
            }

            const addressId = String(addr.id);

            if (checkedAddressIds.current.has(addressId)) {
                return;
            }

            checkedAddressIds.current.add(addressId);

            checkAddress(addr.pincode, addressId);
        });
    }, [addresses, checkAddress]);

    const saveAddress = async (data) => {
        try {
            setSaving(true);

            if (editingId) {
                const response = await addressApi.updateAddress(editingId, data);

                if (response?.success === false) {
                    throw new Error(
                        response?.message || "Failed to update address"
                    );
                }

                const addressId = String(editingId);

                // Allow delivery availability to be checked again.
                checkedAddressIds.current.delete(addressId);

                // Reset the previous delivery status.
                setDeliveryStatus((prev) => {
                    const updated = { ...prev };
                    delete updated[addressId];
                    return updated;
                });

                toast.success("Address updated!");
            } else {
                await onSaveAddress(data);
                toast.success("Address created!");
            }

            setAddingNew(false);
            setEditingId(null);
            reset();

            // Refresh addresses from the server.
            setRefresh((previous) => !previous);
        } catch (error) {
            console.error("Save address error:", error);
            toast.error(error?.message || "Failed to save address");
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (addr, e) => {
        e?.stopPropagation();

        setEditingId(addr.id);

        setValue("name", addr.name ?? "");
        setValue("mobile", addr.mobile ?? "");
        setValue("address_line_1", addr.address_line_1 ?? "");
        setValue("address_line_2", addr.address_line_2 ?? "");
        setValue("city", addr.city ?? "");
        setValue("state", addr.state ?? "");
        setValue("pincode", addr.pincode ?? "");
        setValue("label", addr.label ?? "home");
        setValue("phone", addr.phone ?? "");
        setValue("country_code", addr.country_code ?? "IN");
        setValue("country", addr.country ?? "India");
        setValue("instructions", addr.instructions ?? "");

        setAddingNew(true);
    };

    const handleDelete = (e) => {
        e?.stopPropagation();

        if (!selectedAddr) {
            toast.error("Please select an address first");
            return;
        }

        setShowDelete(true);
    };

    const confirmDelete = async () => {
        if (!selectedAddr?.id) {
            toast.error("Please select an address first");
            return;
        }

        try {
            setDeleting(true);

            await addressApi.deleteAddress(selectedAddr.id);

            setShowDelete(false);
            onSelect(null);

            // Allow remaining addresses to be checked if needed.
            checkedAddressIds.current.delete(String(selectedAddr.id));

            setDeliveryStatus((previous) => {
                const updated = { ...previous };
                delete updated[selectedAddr.id];
                return updated;
            });

            toast.success("Address deleted!");

            setRefresh((previous) => !previous);
        } catch (error) {
            console.error("Delete address error:", error);
            toast.error("Failed to delete address.");
        } finally {
            setDeleting(false);
        }
    };

    const cancelForm = () => {
        setAddingNew(false);
        setEditingId(null);
        reset();
    };

    const STATES = [
        "Andhra Pradesh",
        "Delhi",
        "Gujarat",
        "Karnataka",
        "Kerala",
        "Madhya Pradesh",
        "Maharashtra",
        "Punjab",
        "Rajasthan",
        "Tamil Nadu",
        "Telangana",
        "Uttar Pradesh",
        "West Bengal",
        "Other",
    ];

    return (
        <div className="co-fu">
            <SectionTitle>Delivery Address</SectionTitle>

            {/* Saved addresses */}
            <Stack gap={3} className="mb-4">
                {addresses?.map((addr) => {
                    const addressId = String(addr.id);

                    const delivery = deliveryStatus[addressId];

                    let badgeText = "Checking...";
                    let badgeColor = "secondary";

                    if (delivery?.status === "available") {
                        badgeText = "Delivery Available";
                        badgeColor = "success";
                    } else if (delivery?.status === "unavailable") {
                        badgeText = "Delivery Unavailable";
                        badgeColor = "danger";
                    } else if (delivery?.status === "error") {
                        badgeText = delivery.message || "Check Failed";
                        badgeColor = "warning";
                    } else if (delivery?.status === "checking") {
                        badgeText = "Checking...";
                    }

                    return (
                        <div
                            key={addr.id}
                            className={`co-address-card ${selectedAddr?.id === addr.id ? "selected" : ""
                                } p-4 rounded-4`}
                            style={{ background: "#e8e7f5ff" }}
                            onClick={() => { onSelect(addr) }}
                        >

                            <div className="d-flex align-items-start justify-content-between gap-2">
                                <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                                    <span>
                                        {addr.label
                                            ? addr.label.charAt(0).toUpperCase() +
                                            addr.label.slice(1).toLowerCase()
                                            : "Address"}
                                    </span>

                                    {addr.isDefault && (
                                        <span
                                            style={{
                                                fontSize: "0.62rem",
                                                fontWeight: 900,
                                                background: "#dcfce7",
                                                color: "#166534",
                                                borderRadius: 20,
                                                padding: "2px 9px",
                                                border: "1.5px solid #86efac",
                                            }}
                                        >
                                            Default
                                        </span>
                                    )}
                                    <Badge
                                        bg={badgeColor}
                                        className="float-end"
                                        title={
                                            delivery?.status === "error"
                                                ? "The serviceability result could not be verified."
                                                : undefined
                                        }
                                    >
                                        {badgeText}
                                    </Badge>

                                </div>

                                {selectedAddr?.id === addr.id && (
                                    <div className="co-address-selected-dot">
                                        ✓
                                    </div>
                                )}
                            </div>

                            <div
                                style={{
                                    fontWeight: 800,
                                    fontSize: "0.92rem",
                                    color: "#1a1a2e",
                                    marginBottom: 3,
                                }}
                            >
                                {addr.name}
                            </div>

                            <div
                                style={{
                                    fontSize: "0.84rem",
                                    color: "#6b7280",
                                    fontWeight: 600,
                                    lineHeight: 1.6,
                                }}
                            >
                                {addr.address_line_1}
                                {addr.address_line_2
                                    ? `, ${addr.address_line_2}`
                                    : ""}
                                <br />
                                {addr.city}, {addr.state} — {addr.pincode}
                                <br />
                                Mobile: {addr.mobile}
                            </div>

                            <div className="d-flex justify-content-end gap-2">
                                {selectedAddr?.id === addr.id && (
                                    <>
                                        <button
                                            type="button"
                                            className="co-btn-sm"
                                            style={{
                                                padding: "4px 8px",
                                                background: "#fff",
                                                border: "1.5px solid #e5e7eb",
                                                cursor: "pointer",
                                                borderRadius: 6,
                                            }}
                                            onClick={(e) => handleEdit(addr, e)}
                                            title="Edit address"
                                        >
                                            🖋️
                                        </button>

                                        <button
                                            type="button"
                                            className="co-btn-sm"
                                            style={{
                                                padding: "4px 8px",
                                                background: "#fff",
                                                border: "1.5px solid #e5e7eb",
                                                cursor: "pointer",
                                                borderRadius: 6,
                                            }}
                                            onClick={handleDelete}
                                            title="Delete address"
                                        >
                                            🗑️
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </Stack>

            {/* Add new address */}
            {!addingNew ? (
                <button
                    type="button"
                    className="co-btn-ghost bg-transparent border-0 mb-4"
                    onClick={() => {
                        setEditingId(null);
                        reset();
                        setAddingNew(true);
                    }}
                >
                    + Add New Address
                </button>
            ) : (
                <Form
                    onSubmit={handleSubmit(saveAddress)}
                    className="co-fu-1 p-4"
                    style={{
                        background: "#f8f9ff",
                        borderRadius: 16,
                        border: "2px solid var(--border)",
                        marginBottom: 20,
                    }}
                >
                    <div
                        style={{
                            fontWeight: 800,
                            fontSize: "0.88rem",
                            color: "#1a1a2e",
                            marginBottom: 16,
                        }}
                    >
                        {editingId ? "Edit Address" : "New Address"}
                    </div>

                    <Row className="g-3">
                        <Col sm={6}>
                            <Label required>Full Name</Label>
                            <Form.Control
                                className={`co-input ${errors.name ? "is-invalid" : ""
                                    }`}
                                {...register("name", {
                                    required: "Required",
                                })}
                                placeholder="Enter Your Name"
                            />
                            {errors.name && (
                                <div className="invalid-feedback d-block">
                                    {errors.name.message}
                                </div>
                            )}
                        </Col>

                        <Col sm={6}>
                            <Label required>Mobile Number</Label>
                            <InputGroup>
                                <InputGroup.Text
                                    style={{
                                        border: "2px solid var(--border)",
                                        borderRight: "none",
                                        borderRadius: "10px 0 0 10px",
                                        background: "#f8f9ff",
                                        fontWeight: 700,
                                        fontSize: "0.84rem",
                                    }}
                                >
                                    +91
                                </InputGroup.Text>

                                <Form.Control
                                    type="tel"
                                    maxLength={10}
                                    style={{
                                        borderRadius: "0 10px 10px 0",
                                        borderLeft: "none",
                                    }}
                                    className={`co-input ${errors.mobile ? "is-invalid" : ""
                                        }`}
                                    {...register("mobile", {
                                        required: "Required",
                                        pattern: {
                                            value: /^\d{10}$/,
                                            message: "Valid 10-digit number",
                                        },
                                    })}
                                    placeholder="0000000000"
                                />
                            </InputGroup>

                            {errors.mobile && (
                                <div className="text-danger mt-1">
                                    {errors.mobile.message}
                                </div>
                            )}
                        </Col>

                        <Col xs={12}>
                            <Label required>Address Line 1</Label>
                            <Form.Control
                                className={`co-input ${errors.address_line_1 ? "is-invalid" : ""
                                    }`}
                                {...register("address_line_1", {
                                    required: "Required",
                                })}
                                placeholder="House / Flat no., Street, Colony"
                            />
                            {errors.address_line_1 && (
                                <div className="invalid-feedback d-block">
                                    {errors.address_line_1.message}
                                </div>
                            )}
                        </Col>

                        <Col xs={12}>
                            <Label>Address Line 2</Label>
                            <Form.Control
                                className="co-input"
                                {...register("address_line_2")}
                                placeholder="Landmark, Area (optional)"
                            />
                        </Col>

                        <Col sm={4}>
                            <Label required>City</Label>
                            <Form.Control
                                className={`co-input ${errors.city ? "is-invalid" : ""
                                    }`}
                                {...register("city", {
                                    required: "Required",
                                })}
                                placeholder="Enter Your City"
                            />
                            {errors.city && (
                                <div className="invalid-feedback d-block">
                                    {errors.city.message}
                                </div>
                            )}
                        </Col>

                        <Col sm={4}>
                            <Label required>State</Label>
                            <Form.Select
                                className={`co-select ${errors.state ? "is-invalid" : ""
                                    }`}
                                {...register("state", {
                                    required: "Required",
                                })}
                            >
                                <option value="">Select state</option>
                                {STATES.map((state) => (
                                    <option key={state} value={state}>
                                        {state}
                                    </option>
                                ))}
                            </Form.Select>
                            {errors.state && (
                                <div className="invalid-feedback d-block">
                                    {errors.state.message}
                                </div>
                            )}
                        </Col>

                        <Col sm={4}>
                            <Label required>Pincode</Label>
                            <Form.Control
                                type="tel"
                                maxLength={6}
                                className={`co-input ${errors.pincode ? "is-invalid" : ""
                                    }`}
                                {...register("pincode", {
                                    required: "Required",
                                    pattern: {
                                        value: /^[1-9]\d{5}$/,
                                        message: "Valid 6-digit PIN code",
                                    },
                                })}
                                placeholder="302021"
                            />
                            {errors.pincode && (
                                <div className="invalid-feedback d-block">
                                    {errors.pincode.message}
                                </div>
                            )}
                        </Col>

                        <Col sm={4}>
                            <Label>Label</Label>
                            <div className="d-flex gap-2">
                                {["home", "office", "other"].map((label) => (
                                    <button
                                        key={label}
                                        type="button"
                                        style={{
                                            padding: "7px 16px",
                                            borderRadius: 9,
                                            border: `2px solid ${labelValue === label
                                                ? "#1346cf"
                                                : "var(--border)"
                                                }`,
                                            background:
                                                labelValue === label
                                                    ? "#c8dcff"
                                                    : "#fff",
                                            color:
                                                labelValue === label
                                                    ? "black"
                                                    : "#6b7280",
                                            fontWeight: 700,
                                            fontSize: "0.8rem",
                                            cursor: "pointer",
                                            fontFamily: "Nunito",
                                            transition: "all 0.15s",
                                        }}
                                        onClick={() =>
                                            setValue("label", label, {
                                                shouldDirty: true,
                                            })
                                        }
                                    >
                                        {label.charAt(0).toUpperCase() +
                                            label.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </Col>

                        <Col sm={6}>
                            <Label>Phone</Label>
                            <Form.Control
                                className={`co-input ${errors.phone ? "is-invalid" : ""
                                    }`}
                                {...register("phone", {
                                    pattern: {
                                        value: /^\d{10}$/,
                                        message: "Valid 10-digit number",
                                    },
                                })}
                                placeholder="0120123456"
                                maxLength={10}
                                type="tel"
                            />
                            {errors.phone && (
                                <div className="text-danger mt-1">
                                    {errors.phone.message}
                                </div>
                            )}
                        </Col>

                        <Col sm={3}>
                            <Label>Country Code</Label>
                            <Form.Control
                                className="co-input"
                                {...register("country_code")}
                                placeholder="IN"
                            />
                        </Col>

                        <Col sm={3}>
                            <Label>Country</Label>
                            <Form.Control
                                className="co-input"
                                {...register("country")}
                                placeholder="India"
                            />
                        </Col>

                        <Col xs={12}>
                            <Label>Delivery Instructions</Label>
                            <Form.Control
                                className="co-input"
                                {...register("instructions")}
                                placeholder="Ex. Call before delivery"
                            />
                        </Col>
                    </Row>

                    <div className="d-flex gap-2 mt-4">
                        <Button
                            type="submit"
                            className="eco-btn-main px-4"
                            disabled={saving}
                        >
                            {saving ? "Saving..." : "Save Address"}
                        </Button>

                        <Button
                            type="button"
                            className="px-4 rounded-4"
                            style={{
                                border: "3px solid #1859db",
                                background: "white",
                                color: "var(--text)",
                            }}
                            onClick={cancelForm}
                            disabled={saving}
                        >
                            Cancel
                        </Button>
                    </div>
                </Form>
            )}

            {/* Continue checkout */}
            {onNext && (
                <Button
                    type="button"
                    className="w-100"
                    style={{
                        background: "#3b5ff1",
                        border: "none",
                        padding: "10px 0",
                        fontWeight: 600,
                        fontSize: "1.1rem",
                        borderRadius: 10,
                    }}
                    onClick={() => {
                        if (!selectedAddr) {
                            toast.error("Please select a delivery address");
                            return;
                        }

                        const status =
                            deliveryStatus[String(selectedAddr.id)];

                        if (status?.status === "unavailable") {
                            toast.error(
                                "Delivery is not available at this address."
                            );
                            return;
                        }

                        if (
                            status?.status === "checking" ||
                            !status ||
                            status.status === "error"
                        ) {
                            toast.error(
                                "Please wait until delivery availability is verified."
                            );
                            return;
                        }

                        onNext();
                    }}
                >
                    Continue to Payment →
                </Button>
            )}

            <ConfirmModal
                show={showDelete}
                onConfirm={confirmDelete}
                onCancel={() => setShowDelete(false)}
                title="Delete Address?"
                message={`Are you sure you want to delete the address "${selectedAddr?.label}"? This action cannot be undone.`}
                loading={deleting}
            />
        </div>
    );
}

export default StepAddress;
