import React, { useState } from "react";
import { Button, Col, Form, InputGroup, Row, Stack } from "react-bootstrap";
import { toast } from "react-hot-toast";
import { useForm } from "react-hook-form";
import addressApi from "../api/address.api";
import ConfirmModal from "./ConfirmModal";
import { useAuthWrapper } from "../helper/AuthWrapper";

function Label({ children, required }) {
    return (
        <label className="co-label">
            {children} {required && <span style={{ color: "#dc3545" }}>*</span>}
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

function StepAddress({ selectedAddr, onSelect, onNext, addresses, onSaveAddress }) {
    const [addingNew, setAddingNew] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [showDelete, setShowDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [saving, setSaving] = useState(false);
    const { refresh, setRefresh } = useAuthWrapper();


    const { register, handleSubmit, formState: { errors }, setValue, reset, watch } = useForm({
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
            instructions: ""
        }
    });
    const labelValue = watch("label");

    const saveAddress = async (data) => {
        try {
            setSaving(true);
            if (editingId) {
                const response = await addressApi.updateAddress(editingId, data);
                if (!response?.success) {
                    throw new Error(response?.message || "Failed to update address");
                }
                toast.success("Address updated!");
            } else {
                onSaveAddress(data);
                toast.success("Address created!");
            }
            setAddingNew(false);
            setEditingId(null);
            reset();
            setRefresh(!refresh);
        } catch (error) {
            console.error("Save address error:", error);
            toast.error(error.message || "Failed to save address");
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (addr, e) => {
        e.stopPropagation();
        setEditingId(addr.id);
        setValue("name", addr.name);
        setValue("mobile", addr.mobile);
        setValue("address_line_1", addr.address_line_1);
        setValue("address_line_2", addr.address_line_2);
        setValue("city", addr.city);
        setValue("state", addr.state);
        setValue("pincode", addr.pincode);
        setValue("label", addr.label);
        setValue("phone", addr.phone);
        setValue("country_code", addr.country_code);
        setValue("country", addr.country);
        setValue("instructions", addr.instructions);
        setAddingNew(true);
    };

    const handleDelete = async (e) => {
        e.stopPropagation();
        if (!selectedAddr) {
            toast.error("Please select an address first");
            return;
        }
        setShowDelete(true);
    };

    const confirmDelete = async () => {
        try {
            setDeleting(true);
            await addressApi.deleteAddress(selectedAddr.id);
            setShowDelete(false);
            onSelect(null);
            toast.success("Address deleted!");
            setRefresh(!refresh);
        } catch (error) {
            toast.error("Failed to delete address.");
        } finally {
            setDeleting(false);
        }
    };




    const STATES = ["Andhra Pradesh", "Delhi", "Gujarat", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Punjab", "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh", "West Bengal", "Other"];

    return (
        <div className="co-fu">
            <SectionTitle icon="📍">Delivery Address</SectionTitle>

            {/* Saved addresses */}
            <Stack gap={3} className="mb-4">
                {addresses.map(addr => (
                    <div
                        key={addr.id}
                        className={`co-address-card ${selectedAddr?.id === addr.id ? "selected" : ""} p-4 rounded-4`}
                        style={{ background: "#f5ede7" }}
                        onClick={() => onSelect(addr)}
                    >
                        <div className="d-flex align-items-start justify-content-between gap-2">
                            <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                                <span>📌  {addr.label}</span>
                                {addr.isDefault && (
                                    <span style={{ fontSize: "0.62rem", fontWeight: 900, background: "#dcfce7", color: "#166534", borderRadius: 20, padding: "2px 9px", border: "1.5px solid #86efac" }}>
                                        Default
                                    </span>
                                )}
                            </div>
                            {selectedAddr?.id === addr.id && (
                                <div className="co-address-selected-dot">✓</div>
                            )}
                        </div>
                        <div style={{ fontWeight: 800, fontSize: "0.92rem", color: "#1a1a2e", marginBottom: 3 }}>
                            {addr.name}
                        </div>
                        <div style={{ fontSize: "0.84rem", color: "#6b7280", fontWeight: 600, lineHeight: 1.6 }}>
                            {addr.address_line_1}{addr.address_line_2 ? `, ${addr.address_line_2}` : ""}<br />
                            {addr.city}, {addr.state} — {addr.pincode}<br />
                            📞 {addr.mobile}
                        </div>
                        <div className="d-flex justify-content-end gap-2">
                            {selectedAddr?.id === addr.id && (
                                <>
                                    <button type="button" className="co-btn-sm" style={{ padding: "4px 8px", background: "#fff", border: "1.5px solid #e5e7eb", cursor: "pointer", borderRadius: 6 }} onClick={(e) => handleEdit(addr, e)} title="Edit address">🖋️</button>
                                    <button type="button" className="co-btn-sm" style={{ padding: "4px 8px", background: "#fff", border: "1.5px solid #e5e7eb", cursor: "pointer", borderRadius: 6 }} onClick={(e) => handleDelete(e)} title="Delete address">🗑️</button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </Stack>

            {/* Add new address toggle */}
            {!addingNew ? (
                <button className="co-btn-ghost bg-transparent border-0 mb-4" onClick={() => setAddingNew(true)}>
                    + Add New Address
                </button>
            ) : (
                <Form onSubmit={handleSubmit(saveAddress)} className="co-fu-1 p-4" style={{ background: "#f8f9ff", borderRadius: 16, border: "2px solid var(--border)", marginBottom: 20 }}>
                    <div style={{ fontWeight: 800, fontSize: "0.88rem", color: "#1a1a2e", marginBottom: 16 }}>{editingId ? "Edit Address" : "New Address"}</div>
                    <Row className="g-3">
                        <Col sm={6}>
                            <Label required>Full Name</Label>
                            <Form.Control className={`co-input ${errors.name ? "is-invalid" : ""}`} {...register("name", { required: "Required" })} placeholder="Rahul Sharma" />
                            {errors.name && <div className="invalid-feedback d-block" style={{ fontSize: "0.78rem" }}>{errors.name.message}</div>}
                        </Col>
                        <Col sm={6}>
                            <Label required>Mobile Number</Label>
                            <InputGroup>
                                <InputGroup.Text style={{ border: "2px solid var(--border)", borderRight: "none", borderRadius: "10px 0 0 10px", background: "#f8f9ff", fontWeight: 700, fontSize: "0.84rem" }}>+91</InputGroup.Text>
                                <Form.Control className={`co-input ${errors.mobile ? "is-invalid" : ""}`} style={{ borderRadius: "0 10px 10px 0", borderLeft: "none" }}
                                    {...register("mobile", { required: "Required", pattern: { value: /^\d{10}$/, message: "Valid 10-digit number" } })} placeholder="9876543210" maxLength={10} type="tel" />
                            </InputGroup>
                            {errors.mobile && <div className="text-danger mt-1" style={{ fontSize: "0.78rem" }}>{errors.mobile.message}</div>}
                        </Col>
                        <Col xs={12}>
                            <Label required>Address Line 1</Label>
                            <Form.Control className={`co-input ${errors.address_line_1 ? "is-invalid" : ""}`} {...register("address_line_1", { required: "Required" })} placeholder="House / Flat no., Street, Colony" />
                            {errors.address_line_1 && <div className="invalid-feedback d-block" style={{ fontSize: "0.78rem" }}>{errors.address_line_1.message}</div>}
                        </Col>
                        <Col xs={12}>
                            <Label>Address Line 2</Label>
                            <Form.Control className="co-input" {...register("address_line_2")} placeholder="Landmark, Area (optional)" />
                        </Col>
                        <Col sm={4}>
                            <Label required>City</Label>
                            <Form.Control className={`co-input ${errors.city ? "is-invalid" : ""}`} {...register("city", { required: "Required" })} placeholder="Jaipur" />
                            {errors.city && <div className="invalid-feedback d-block" style={{ fontSize: "0.78rem" }}>{errors.city.message}</div>}
                        </Col>
                        <Col sm={4}>
                            <Label required>State</Label>
                            <Form.Select className={`co-select ${errors.state ? "is-invalid" : ""}`} {...register("state", { required: "Required" })}>
                                <option value="">Select state</option>
                                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                            </Form.Select>
                            {errors.state && <div className="invalid-feedback d-block" style={{ fontSize: "0.78rem" }}>{errors.state.message}</div>}
                        </Col>
                        <Col sm={4}>
                            <Label required>Pincode</Label>
                            <Form.Control className={`co-input ${errors.pincode ? "is-invalid" : ""}`} {...register("pincode", { required: "Required", pattern: { value: /^\d{6}$/, message: "Valid 6-digit pincode" } })} placeholder="302021" maxLength={6} type="tel" />
                            {errors.pincode && <div className="invalid-feedback d-block" style={{ fontSize: "0.78rem" }}>{errors.pincode.message}</div>}
                        </Col>
                        <Col sm={4}>
                            <Label>Label</Label>
                            <div className="d-flex gap-2">
                                {["home", "office", "other"].map(l => (
                                    <button key={l} type="button"
                                        style={{ padding: "7px 16px", borderRadius: 9, border: `2px solid ${labelValue === l ? "var(--p)" : "var(--border)"}`, background: labelValue === l ? "#fff3ee" : "#fff", color: labelValue === l ? "var(--p)" : "#6b7280", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", fontFamily: "Nunito", transition: "all 0.15s" }}
                                        onClick={() => setValue("label", l)}>
                                        {l.charAt(0).toUpperCase() + l.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </Col>
                        <Col sm={6}>
                            <Label>Phone</Label>
                            <Form.Control className={`co-input ${errors.phone ? "is-invalid" : ""}`} {...register("phone", { pattern: { value: /^\d{10}$/, message: "Valid 10-digit number" } })} placeholder="0120-1234567" maxLength={10} type="tel" />
                            {errors.phone && <div className="text-danger mt-1" style={{ fontSize: "0.78rem" }}>{errors.phone.message}</div>}
                        </Col>
                        <Col sm={3}>
                            <Label>Country Code</Label>
                            <Form.Control className="co-input" {...register("country_code")} placeholder="IN" defaultValue="IN" />
                        </Col>
                        <Col sm={3}>
                            <Label>Country</Label>
                            <Form.Control className="co-input" {...register("country")} placeholder="India" defaultValue="India" />
                        </Col>
                        <Col xs={12}>
                            <Label>Delivery Instructions</Label>
                            <Form.Control className="co-input" {...register("instructions")} placeholder="Call before delivery" />
                        </Col>
                    </Row>
                    <div className="d-flex gap-2 mt-4">
                        <Button type="submit" className="co-btn-main px-4" disabled={saving}>{saving ? "Saving..." : "Save Address"}</Button>
                        <Button className="co-btn-outline" onClick={() => { setAddingNew(false); setEditingId(null); reset(); }} disabled={saving}>Cancel</Button>
                    </div>
                </Form>
            )}

            {onNext &&
                <Button className="co-btn-main w-100" onClick={() => selectedAddr ? onNext() : toast.error("Please select a delivery address")}>
                    Continue to Payment →
                </Button>}

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