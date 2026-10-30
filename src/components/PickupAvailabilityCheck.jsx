import { useEffect, useState } from "react";
import { Alert, Button, Spinner } from "react-bootstrap";
import toast from "react-hot-toast";
import shiprocketApi from "../api/shiprocket.api";

export default function PickupAvailabilityCheck({
    address,
    onResult,
}) {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    // Reset verification whenever the address changes.
    useEffect(() => {
        setResult(null);
        onResult?.(null);
        // addressKey changes only when the address fields change.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        address.country,
        address.state,
        address.city,
        address.pincode,
        address.address_line_1,
    ]);

    const checkAvailability = async () => {
        if (!/^\d{6}$/.test(String(address.delivery_postcode || ""))) {
            toast.error("Please enter a valid 6-digit delivery pincode.");
            return;
        }
        setLoading(true);
        setResult(null);
        onResult?.(null);

        try {
            // These keys must match the request body expected by your backend route.
            const response = await shiprocketApi.checkDeliveryAvailability({
                pickup_postcode: address.pickup_postcode,
                weight: address.weight,
                delivery_postcode: address.delivery_postcode,
                cod: address.cod,
            });

            // Map the response field used by your backend to this boolean.
            const available = response?.available

            if (typeof available !== "boolean") {
                console.error("Unexpected pickup availability response:", response);
                throw new Error(
                    "The server response did not confirm pickup availability. Please try again."
                );
            }

            const verification = {
                available,
                checkedAt: new Date().toISOString(),
            };

            setResult(verification);
            onResult?.(verification);

            if (available) {
                toast.success("Pickup is available at this address!");
            } else {
                toast("Pickup is currently unavailable. You can still complete registration.", {
                    icon: "⚠️",
                    duration: 5000,
                    position: 'bottom-right'
                });
            }
        } catch (error) {
            console.error("Pickup availability check failed:", error);

            const message =
                error?.message ||
                error?.data?.message ||
                error?.response?.data?.message ||
                "Unable to check pickup availability. Please try again.";

            setResult({
                available: null,
                error: message,
            });

            onResult?.(null);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-3 mb-4">
            <Button
                type="button"
                variant="primary"
                className="w-100 rounded-3 fw-bold py-2"
                onClick={checkAvailability}
                disabled={loading}
            >
                {loading ? (
                    <>
                        <Spinner size="sm" className="me-2" />
                        Checking pickup availability...
                    </>
                ) : (
                    "📦 Check Pickup Availability"
                )}
            </Button>

            {result?.available === true && (
                <Alert variant="success" className="mt-3 mb-0 rounded-3">
                    <strong>✓ Pickup available</strong>
                    <div className="small mt-1">
                        Your location is eligible according to the availability check.
                        You can continue registration.
                    </div>
                </Alert>
            )}

            {result?.available === false && (
                <Alert variant="warning" className="mt-3 mb-0 rounded-3">
                    <strong>⚠ Pickup currently unavailable</strong>
                    <div className="small mt-1">
                        You can still create your seller account. Your products will remain
                        hidden from customers until pickup service becomes available at
                        your registered location.
                    </div>
                </Alert>
            )}

            {result?.error && (
                <Alert variant="danger" className="mt-3 mb-0 rounded-3">
                    <strong>Could not verify pickup availability</strong>
                    <div className="small mt-1">{result.error}</div>
                    <div className="small mt-1">
                        Please try again. An API error is not proof that pickup is unavailable.
                    </div>
                </Alert>
            )}
        </div>
    );
}