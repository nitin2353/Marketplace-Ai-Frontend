import React, { useState } from "react";
import { Row, Col, Form, Button, Card, Alert } from "react-bootstrap";
import { IoSave } from "react-icons/io5";
import toast from "react-hot-toast";
import authApi from "../../api/authApi.jsx";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import JWTService from "../../config/jwt.config.jsx";
import GlobalLoader from "../../components/GlobalLoader.jsx";

const Security = () => {

    const navigate = useNavigate('/auth/login')
    const [loading, setLoading] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors, isDirty },
        reset,
        watch,
    } = useForm({
        defaultValues: {
            current_password: "",
            password1: "",
            password2: "",
        },
    });

    const newPassword = watch("password1");

    const handleUpdatePassword = async (formData) => {
        try {
            if (formData.password1 !== formData.password2) {
                toast.error("New password and confirm password do not match");
                return;
            }

            if (formData.current_password === formData.password1) {
                toast.error("New password must be different from current password");
                return;
            }

            setLoading(true);

            const payload = {
                current_password: formData.current_password,
                new_password: formData.password1,
            };

            const user = JWTService.decodeTokenDetails();

            const response = await authApi.updatePassword(user.id, payload);

            if (response.success) {
                setTimeout(() => {
                    localStorage.removeItem('token')
                    navigate('/auth/login')
                    setLoading(false);
                }, 2000)
                toast.success(response?.message || "Password updated successfully");
                reset();
            }

            return

        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                error?.message ||
                "Failed to update password"
            );
        }
    };

    return (
        <Form className="pd-settings-card" onSubmit={handleSubmit(handleUpdatePassword)}>
            <Card.Header className="pd-settings-header">
                <h5>Security Settings</h5>
                <p className="text-muted">Manage your account security</p>
            </Card.Header>

            <Card.Body className="p-3">
                <Alert variant="info" className="pd-alert">
                    ℹ️ Keep your password strong and unique. Use a combination of uppercase,
                    lowercase, numbers, and special characters.
                </Alert>

                <Row className="g-3 p-3">
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label className="fw-bold">Current Password *</Form.Label>
                            <Form.Control
                                type="password"
                                {...register("current_password", {
                                    required: "Current password is required",
                                })}
                                className="pd-form-control"
                                placeholder="Enter current password"
                                isInvalid={!!errors.current_password}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.current_password?.message}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Col>

                    <Col md={6}></Col>

                    <Col md={6}>
                        <Form.Group>
                            <Form.Label className="fw-bold">New Password *</Form.Label>
                            <Form.Control
                                type="password"
                                {...register("password1", {
                                    required: "New password is required",
                                    minLength: {
                                        value: 6,
                                        message: "Password must be at least 6 characters",
                                    },
                                    pattern: {
                                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/,
                                        message:
                                            "Password must include uppercase, lowercase, number and special character",
                                    },
                                })}
                                className="pd-form-control"
                                placeholder="Enter new password"
                                isInvalid={!!errors.password1}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.password1?.message}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Col>

                    <Col md={6}>
                        <Form.Group>
                            <Form.Label className="fw-bold">Confirm Password *</Form.Label>
                            <Form.Control
                                type="password"
                                {...register("password2", {
                                    required: "Confirm password is required",
                                    validate: (value) =>
                                        value === newPassword || "Passwords do not match",
                                })}
                                className="pd-form-control"
                                placeholder="Confirm new password"
                                isInvalid={!!errors.password2}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.password2?.message}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                </Row>

                <div className="pd-button-group mt-4">
                    <Button
                        type="submit"
                        variant="danger"
                        className="pd-btn-save"
                        disabled={loading || !isDirty}
                    >
                        <IoSave /> Change Password
                    </Button>
                </div>
            </Card.Body>
            {loading && <GlobalLoader />}
        </Form>
    );
};

export default Security;