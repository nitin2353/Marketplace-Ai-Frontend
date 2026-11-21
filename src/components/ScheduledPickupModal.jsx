
import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import { FaInfoCircle } from "react-icons/fa";

const getToday = () => {
    const date = new Date();
    const offset = date.getTimezoneOffset();
    return new Date(date.getTime() - offset * 60000)
        .toISOString()
        .split("T")[0];
};

const ScheduledPickupModal = ({
    show,
    onClose,
    onSubmit,
    selectedCount = 0,
    loading = false
}) => {
    const [pickupDate, setPickupDate] = useState(getToday());
    const [pickupTime, setPickupTime] = useState("11:00");
    const [expectedPackageCount, setExpectedPackageCount] =
        useState(selectedCount);

    useEffect(() => {
        if (show) {
            setPickupDate(getToday());
            setPickupTime("11:00");
            setExpectedPackageCount(selectedCount);
        }
    }, [show, selectedCount]);

    const handleSubmit = (e) => {
        e.preventDefault();

        const payload = {
            pickup_time: `${pickupTime}:00`,
            pickup_date: pickupDate,
            expected_package_count: Number(expectedPackageCount)
        };

        onSubmit(payload);
    };

    return (
        <Modal show={show} onHide={onClose} centered>
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>Schedule Pickup</Modal.Title>
                </Modal.Header>
                <Alert variant="info" className="m-3 mb-0">
                    𝐈𝐧𝐟𝒐- Please ensure all parcels scheduled for the selected day are ready for pickup together.
                </Alert>
                <Modal.Body>
                    <p>
                        Selected Orders: <strong>{selectedCount}</strong>
                    </p>

                    <Form.Group className="mb-3">
                        <Form.Label>Pickup Date</Form.Label>
                        <Form.Control
                            type="date"
                            value={pickupDate}
                            min={getToday()}
                            onChange={(e) => setPickupDate(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Pickup Time</Form.Label>
                        <Form.Control
                            type="time"
                            value={pickupTime}
                            onChange={(e) => setPickupTime(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>Expected Package Count <span><FaInfoCircle className="mb-1" title="Please enter the correct parcel quantity by counting all parcels."/></span></Form.Label>
                        <Form.Control
                            type="number"
                            min="1"
                            value={expectedPackageCount}
                            onChange={(e) =>
                                setExpectedPackageCount(e.target.value)
                            }
                            required
                        />
                    </Form.Group>
                </Modal.Body>

                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        variant="primary"
                        disabled={
                            loading ||
                            !pickupDate ||
                            !pickupTime ||
                            Number(expectedPackageCount) < 1
                        }
                    >
                        {loading ? "Submitting..." : "Submit Pickup Request"}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default ScheduledPickupModal;
