import React, { useEffect, useState } from 'react'
import './Settings.css'
import { Card, Col, Row, Form, Button } from 'react-bootstrap';
import { IoSave } from 'react-icons/io5';
import toast from 'react-hot-toast';
import JWTService from '../../config/jwt.config';
import { useForm } from 'react-hook-form';
import authApi from '../../api/authApi';
import GlobalLoader from '../../components/GlobalLoader';
import { useNavigate } from 'react-router-dom';

const Profile = ({ loading, setLoading, userProfile }) => {

    const [validated, setValidated] = useState(false);
    const navigate = useNavigate()

    const { register, handleSubmit, formState: { errors }, formState: { isDirty }, setValue, reset, watch } = useForm({
        defaultValues: {
            first_name: userProfile.first_name || "",
            last_name: userProfile.last_name || "",
            phone: userProfile.phone || "",
            gender: userProfile.gender || "",
            email: userProfile.email || ""
        }
    });


    const handleProfileSave = async (formData) => {
        setValidated(true);
        setLoading(true);
        const payload = { ...formData, name: formData.first_name + " " + formData.last_name }
        try {
            const result = await authApi.updateUser(userProfile.id, payload);
            const detail = JWTService.decodeTokenDetails()
            console.log("result", result.data.user)
            if(detail.email != result?.data.user.email){
                navigate('/auth/login')
            }
            toast.success("Profile updated successfully!");

        } catch (error) {
            toast.error(error.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="pd-settings-card">
            <Card.Header className="pd-settings-header">
                <h5>Personal Information</h5>
                <p className="text-muted">Update your profile details</p>
            </Card.Header>
            <Card.Body>
                <Form noValidate validated={validated} onSubmit={handleSubmit(handleProfileSave)}>
                    <Row className="g-3">

                        {/* First Name */}
                        <Col md={6}>
                            <Form.Group controlId="first_name">
                                <Form.Label className="fw-bold">First Name  <span className='text-danger'>*</span></Form.Label>
                                <Form.Control
                                    required
                                    type="text"
                                    {...register("first_name", { required: "Required" })}
                                    className="pd-form-control"
                                    placeholder="Enter first name"
                                />
                                <Form.Control.Feedback type="invalid">
                                    First name is required.
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        {/* Last Name */}
                        <Col md={6}>
                            <Form.Group controlId="last_name">
                                <Form.Label className="fw-bold">Last Name  <span className='text-danger'>*</span></Form.Label>
                                <Form.Control
                                    required
                                    type="text"
                                    {...register("last_name", { required: "Required" })}
                                    className="pd-form-control"
                                    placeholder="Enter last name"
                                />
                                <Form.Control.Feedback type="invalid">
                                    Last name is required.
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        {/* Email */}
                        <Col md={6}>
                            <Form.Group controlId="email">
                                <Form.Label className="fw-bold">Email  <span className='text-danger'>*</span></Form.Label>
                                <Form.Control
                                    required
                                    type="email"
                                    {...register("email", { required: "Required" })}
                                    className="pd-form-control"
                                    placeholder="Enter email"
                                />
                                <Form.Control.Feedback type="invalid">
                                    Please enter a valid email.
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        {/* Phone */}
                        <Col md={6}>
                            <Form.Group controlId="phone">
                                <Form.Label className="fw-bold">Phone <span className='text-danger'>*</span></Form.Label>
                                <Form.Control
                                    type="tel"
                                    {...register("phone", { required: "Required" })}
                                    className="pd-form-control"
                                    placeholder="Enter phone number"
                                    pattern="[0-9+\s\-]{7,15}"
                                />
                                <Form.Control.Feedback type="invalid">
                                    Please enter a valid phone number.
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        {/* Gender */}
                        <Col md={6}>
                            <Form.Group controlId="gender">
                                <Form.Label className="fw-bold">Gender <span className='text-danger'>*</span></Form.Label>
                                <Form.Select
                                    {...register("gender", { required: "Required" })}
                                    className="pd-form-control"
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>

                    </Row>

                    {/* Save Button */}
                    <div className="pd-button-group mt-4">
                        <Button
                            type="submit"
                            variant="primary"
                            className="pd-btn-save"
                            disabled={!isDirty}
                        >
                            <IoSave className="me-2" />
                            Save Changes
                        </Button>
                    </div>

                </Form>
            </Card.Body>
            {loading && <GlobalLoader />}
        </Card>
    );
};

export default Profile;