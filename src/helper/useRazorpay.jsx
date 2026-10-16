import { useCallback } from "react";

const RAZORPAY_SDK = "https://checkout.razorpay.com/v1/checkout.js";

function loadScript(src) {
    return new Promise((resolve) => {
        if (document.querySelector(`script[src="${src}"]`)) {
            resolve(true);
            return;
        }

        const script = document.createElement("script");
        script.src = src;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
}

export function useRazorpay() {
    const initiatePayment = useCallback(async ({
        key,
        amount,
        currency = "INR",
        order_id,
        name = "MarketPlace",
        description = "Secure Order Payment",
        image = "",
        prefill = {},
        theme = { color: "#2563eb" },
        onSuccess,
        onFailure,
    }) => {
        const loaded = await loadScript(RAZORPAY_SDK);

        if (!loaded) {
            console.error("Razorpay SDK failed to load.");
            onFailure?.("SDK load failed");
            return;
        }

        if (!key) {
            onFailure?.("Razorpay key is missing");
            return;
        }

        if (!amount) {
            onFailure?.("Amount is missing");
            return;
        }

        if (!order_id) {
            onFailure?.("Razorpay order_id is missing");
            return;
        }

        const options = {
            key,
            amount, // backend se already paise me aa raha hai
            currency,
            order_id,
            name,
            description,
            image,
            prefill: {
                name: prefill.name || "",
                email: prefill.email || "",
                contact: prefill.contact || "",
            },
            theme,
            modal: {
                ondismiss: () => {
                    onFailure?.("Payment dismissed by user");
                },
            },
            handler: (response) => {
                console.log("RAW RAZORPAY SUCCESS RESPONSE:", response);
                onSuccess?.(response);
            },
        };

        console.log("RAZORPAY OPTIONS:", options);

        const rzp = new window.Razorpay(options);

        rzp.on("payment.failed", (response) => {
            console.error("Razorpay payment.failed:", response);
            onFailure?.(
                response?.error?.description ||
                response?.error?.reason ||
                "Payment failed"
            );
        });

        rzp.open();
    }, []);

    return { initiatePayment };
}