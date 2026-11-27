
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";
import { FaInfoCircle, FaCalendarTimes, FaSyncAlt } from "react-icons/fa";
import DatePicker from "react-datepicker";
import '../styles/schedule-pickup-modal.css'
import "react-datepicker/dist/react-datepicker.css";
import globalApi from "../api/globalApi";

// Always use Indian timezone for pickup dates
const TIME_ZONE = "Asia/Kolkata";

const formatDateIST = (date) => {
    if (!date) return "";

    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).formatToParts(date);

    const values = Object.fromEntries(
        parts.map(({ type, value }) => [type, value])
    );

    return `${values.year}-${values.month}-${values.day}`;
};

// Convert YYYY-MM-DD to local Date without UTC shifting
const parseLocalDate = (dateString) => {
    if (!dateString) return null;

    const [year, month, day] = dateString.split("-").map(Number);

    return new Date(year, month - 1, day);
};

const getToday = () => formatDateIST(new Date());

const getNextAvailableDate = (bookedDates) => {
    const date = parseLocalDate(getToday());

    // Find the first available date within the next 365 days
    for (let i = 0; i < 365; i++) {
        const formattedDate = [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, "0"),
            String(date.getDate()).padStart(2, "0")
        ].join("-");

        if (!bookedDates.has(formattedDate)) {
            return formattedDate;
        }

        date.setDate(date.getDate() + 1);
    }

    return "";
};

const ScheduledPickupModal = ({
    show,
    onClose,
    onSubmit,
    selectedCount = 0,
    loading = false,
    getBookedPickupDates
}) => {
    const [pickupDate, setPickupDate] = useState(getToday());
    const [pickupTime, setPickupTime] = useState("11:00");

    const [expectedPackageCount, setExpectedPackageCount] =
        useState(selectedCount);

    const [bookedDates, setBookedDates] = useState([]);
    const [datesLoading, setDatesLoading] = useState(false);
    const [datesError, setDatesError] = useState("");

    // Fetch already scheduled pickup dates
    const fetchBookedDates = useCallback(async () => {
        if (typeof getBookedPickupDates !== "function") {
            setDatesError("Pickup date service is not configured.");
            return;
        }

        setDatesLoading(true);
        setDatesError("");

        try {
            const response = await getBookedPickupDates();

            const rows =
                response?.data ??
                response?.data?.bookedDates ??
                response?.bookedDates ??
                [];

            if (!Array.isArray(rows)) {
                throw new Error("Invalid booked dates response.");
            }

            const dates = rows
                .map((item) => {
                    const scheduledDate =
                        typeof item === "string"
                            ? item
                            : item?.scheduled_date;

                    if (!scheduledDate) return null;

                    const parsedDate = new Date(scheduledDate);

                    if (Number.isNaN(parsedDate.getTime())) {
                        return null;
                    }

                    return formatDateIST(parsedDate);
                })
                .filter(Boolean);

            const uniqueDates = [...new Set(dates)];

            setBookedDates(uniqueDates);

            // If today's date is already booked, select the next available date
            setPickupDate((currentDate) => {
                if (uniqueDates.includes(currentDate)) {
                    return getNextAvailableDate(new Set(uniqueDates));
                }

                return currentDate;
            });
        } catch (error) {
            console.error("Booked pickup dates error:", error);

            setDatesError(
                error?.response?.data?.message ||
                error?.message ||
                "Unable to fetch scheduled pickup dates."
            );
        } finally {
            setDatesLoading(false);
        }
    }, [getBookedPickupDates]);

    useEffect(() => {
        if (show) {
            setPickupDate(getToday());
            setPickupTime("11:00");
            setExpectedPackageCount(selectedCount);

            fetchBookedDates();
        }
    }, [show, selectedCount, fetchBookedDates]);


    const bookedDatesSet = useMemo(
        () => new Set(bookedDates),
        [bookedDates]
    );

    const handleSubmit = (e) => {
        e.preventDefault();

        if (datesLoading || datesError || !pickupDate || !pickupTime) {
            return;
        }

        // Prevent duplicate pickup date selection
        const packageCount = Number(expectedPackageCount);

        if (!Number.isInteger(packageCount) || packageCount < 1) {
            return;
        }

        const payload = {
            pickup_time: `${pickupTime}:00`,
            pickup_date: pickupDate,
            expected_package_count: packageCount
        };

        onSubmit(payload);
    };

    const selectedDateObject = parseLocalDate(pickupDate);

    return (
        <Modal show={show} onHide={onClose} centered>
            <Form onSubmit={handleSubmit}>

                <Modal.Header closeButton>
                    <Modal.Title>Schedule Pickup</Modal.Title>
                </Modal.Header>

                <Alert variant="info" className="mx-3 mt-3 mb-0">
                    <strong>Info:</strong> Please ensure all parcels
                    scheduled for the selected day are ready for pickup
                    together.
                </Alert>

                <Modal.Body>
                    <p>
                        Selected Orders: <strong>{selectedCount}</strong>
                    </p>

                    {/* Pickup Date */}
                    <Form.Group className="mb-3">
                        <div className="d-flex align-items-center justify-content-between">
                            <Form.Label className="mb-2">
                                Pickup Date <span title="You can add your remaining parcels to the same existing pickup date."><FaInfoCircle /></span>
                            </Form.Label>

                            <Button
                                type="button"
                                variant="link"
                                size="sm"
                                className="text-decoration-none p-0 mb-2"
                                onClick={fetchBookedDates}
                                disabled={datesLoading}
                            >
                                <FaSyncAlt className={datesLoading ? "fa-spin" : ""} />
                                {" "}Refresh
                            </Button>
                        </div>

                        {datesLoading ? (
                            <div className="border rounded p-3 text-center">
                                <Spinner
                                    animation="border"
                                    size="sm"
                                    className="me-2"
                                />
                                Loading available pickup dates...
                            </div>
                        ) : datesError ? (
                            <Alert variant="danger" className="mb-2">
                                {datesError}

                                <div className="mt-2">
                                    <Button
                                        size="sm"
                                        variant="outline-danger"
                                        onClick={fetchBookedDates}
                                    >
                                        Retry
                                    </Button>
                                </div>
                            </Alert>
                        ) : (
                            <>

                                <DatePicker
                                    selected={selectedDateObject}
                                    onChange={(date) => {
                                        if (date) {
                                            setPickupDate(formatDateIST(date));
                                        }
                                    }}
                                    minDate={parseLocalDate(getToday())}
                                    dateFormat="dd-MM-yyyy"
                                    placeholderText="Select pickup date"
                                    className="form-control w-100"
                                    wrapperClassName="w-100"
                                    calendarClassName="pickup-calendar"
                                    dayClassName={(date) => {
                                        const formattedDate = [
                                            date.getFullYear(),
                                            String(date.getMonth() + 1).padStart(2, "0"),
                                            String(date.getDate()).padStart(2, "0")
                                        ].join("-");

                                        return bookedDatesSet.has(formattedDate)
                                            ? "booked-pickup-date"
                                            : undefined;
                                    }}
                                    required
                                    autoComplete="off"
                                />


                                <div className="d-flex align-items-center gap-3 mt-2 flex-wrap">
                                    <small className="text-success">
                                        <span className="me-1">●</span>
                                        Available
                                    </small>

                                    <small className="can-request">
                                        <FaCalendarTimes className="me-1 mb-1" />
                                        Requested
                                    </small>
                                </div>

                                {bookedDates.length > 0 && (
                                    <small className="text-muted d-block mt-2">
                                        {bookedDates.length} pickup date(s)
                                        already scheduled.
                                    </small>
                                )}
                            </>
                        )}
                    </Form.Group>

                    {/* Pickup Time */}
                    <Form.Group className="mb-3">
                        <Form.Label>Pickup Time</Form.Label>

                        <Form.Control
                            type="time"
                            value={pickupTime}
                            onChange={(e) =>
                                setPickupTime(e.target.value)
                            }
                            required
                        />
                    </Form.Group>

                    {/* Expected Package Count */}
                    <Form.Group>
                        <Form.Label>
                            Expected Package Count{" "}
                            <FaInfoCircle
                                className="mb-1 text-muted"
                                title="Please enter the correct parcel quantity by counting all parcels."
                            />
                        </Form.Label>

                        <Form.Control
                            type="number"
                            min="1"
                            step="1"
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
                            datesLoading ||
                            !!datesError ||
                            !pickupDate ||
                            !pickupTime ||
                            !Number.isInteger(Number(expectedPackageCount)) ||
                            Number(expectedPackageCount) < 1
                        }
                    >
                        {loading
                            ? "Submitting..."
                            : "Submit Pickup Request"}
                    </Button>
                </Modal.Footer>

            </Form>
        </Modal>
    );
};

export default ScheduledPickupModal;
