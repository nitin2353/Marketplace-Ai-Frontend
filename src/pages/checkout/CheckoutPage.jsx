import { useState, useEffect, useCallback } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "./checkoutpage.css";
import cartApi from "../../api/cartApi";
import orderApi from "../../api/order.api";
import GlobalHelper from "../../helper/GlobalHelper";
import GlobalLoader from "../../components/GlobalLoader";
import { useAuthWrapper } from "../../helper/AuthWrapper";
import StepAddress from "../../components/StepAddress";
import StepPayment from "../../components/StepPayment";
import StepReview from "../../components/StepReview";
import StepConfirmed from "../../components/StepConfirmed";
import OrderSummary from "../../components/OrderSummary";
import addressApi from "../../api/address.api";
import { useRazorpay } from "../../helper/useRazorpay";
import JWTService from "../../config/jwt.config";
import paymentApi from "../../api/payment.api";


const COUPONS = { SAVE10: 10, SHOP20: 20, FIRST50: 50 };
const STEPS = ["Address", "Payment", "Review", "Done"];


const calcTotals = (cart, discount) => {
    const subtotal = cart.reduce((s, i) => s + Number(i.product_price) * i.qty, 0);
    const saved = cart.reduce((s, i) => s + Math.max(0, Number(i.old_price || 0) - Number(i.price)) * i.qty, 0);
    const couponSave = (subtotal * discount / 100);
    const delivery = subtotal >= 499 ? 0 : 49;
    const total = subtotal - couponSave + delivery;
    return { subtotal, saved, couponSave, delivery, total };
};





function Stepper({ step }) {
    return (
        <div className="co-stepper co-fu">
            {STEPS.slice(0, 3).map((label, i) => (
                <div key={label} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                    <div className={`co-step ${i === step ? "active" : i < step ? "done" : ""}`}>
                        <div className="co-step-circle">{i < step ? "✓" : i + 1}</div>
                        <span className="co-step-label">{label}</span>
                    </div>
                    {i < 2 && <div className={`co-step-line ${i < step ? "done" : ""}`} />}
                </div>
            ))}
        </div>
    );
}


export default function CheckoutPage() {
    const navigate = useNavigate();
    const { user, refresh } = useAuthWrapper();
    const { initiatePayment } = useRazorpay();


    const [cart, setCart] = useState([]);
    const [cartLoading, setCartLoading] = useState(true);

    const [addresses, setAddresses] = useState([]);
    const [selectedAddr, setSelectedAddr] = useState(null);


    const [paymentMethod, setPayment] = useState("");

    const [discount, setDiscount] = useState(0);
    const [couponMsg, setCouponMsg] = useState(null);


    const [step, setStep] = useState(0);   // 0=Address 1=Payment 2=Review 3=Done
    const [placing, setPlacing] = useState(false);
    const [orderId, setOrderId] = useState("");

    const { coupon, setCoupon } = useAuthWrapper();


    const { subtotal, saved, couponSave, delivery, total } = calcTotals(cart, discount);


    const fetchCart = useCallback(async () => {
        setCartLoading(true);
        try {
            const { data } = await cartApi.getAllCart();
            const rows = data?.success && Array.isArray(data.data) ? data.data : [];
            setCart(rows.map(GlobalHelper.API_FIELDS_MAP["cart"]));
        } catch (err) {
            console.error("Cart fetch error:", err);
            toast.error("Failed to load cart items.");
            setCart([]);
        } finally {
            setCartLoading(false);
        }
    }, []);

    const applyAddressList = useCallback((list, user) => {
        if (!list?.length) return;
        setAddresses(list);
        const def = list.find((a) => a.isDefault) || list[0];
        setSelectedAddr(def);
    }, []);

    const loadAddresses = useCallback(async () => {
        try {
            const res = await addressApi.getAddressesByUserId();
            if (res?.success && Array.isArray(res.data)) {
                applyAddressList(res.data);
            } else {
                setAddresses([]);
                setSelectedAddr(null);
            }
        } catch (err) {
            console.error("Address fetch error:", err);
            setAddresses([]);
            setSelectedAddr(null);
        }
    }, [applyAddressList]);


    useEffect(() => {
        fetchCart();
        loadAddresses();
    }, [fetchCart, loadAddresses, refresh]);


    const saveAddress = useCallback(async (newAddress) => {
        try {
            const res = await addressApi.createAddress(newAddress);
            if (!res?.success) throw new Error(res?.message || "Failed to save address.");
            toast.success("Address saved!");
            loadAddresses(); // Reload from server
        } catch (err) {
            toast.error(err.message || "Failed to save address.");
        }
    }, [loadAddresses]);


    const applyCoupon = useCallback(() => {
        const code = coupon.trim().toUpperCase() || "";
        if (COUPONS[code]) {
            console.log("Applying coupon:", code, "for discount:", COUPONS[code]);
            setDiscount(COUPONS[code]);
            setCouponMsg({ type: "success", text: `✅ ${COUPONS[code]}% off applied!` });
        } else {
            setDiscount(0);
            setCouponMsg({ type: "error", text: "❌ Invalid coupon code." });
        }
    }, [coupon]);

    const handleCouponChange = useCallback((v) => {
        setCoupon(v);
        setCouponMsg(null);
    }, []);



    const buildCartPayload = () =>
        cart.map((item) => ({
            product_id: item.product_id,
            cart_id: item.id,
            quantity: item.qty,
            price: item.price,
            variant_id: item.variant_id || null,
        }));

    // Shared: after successful order
    const onOrderSuccess = useCallback(async (id) => {
        setOrderId(id || `ORD-${Date.now().toString().slice(-8)}`);
        setStep(3);
        toast.success("🎉 Order placed successfully!");
        try { await cartApi.allRemoveFromCart(); } catch { /* non-critical */ }
    }, []);


    const placeCODOrder = async () => {
        try {
            if (!selectedAddr?.id) {
                throw new Error("Please select an address.");
            }

            applyCoupon();

            const payload = {
                address: selectedAddr,
                address_id: selectedAddr?.id,
                payment_method: "cod",
                cart_items: buildCartPayload(),
                coupon_code: discount > 0 ? coupon : null,
                discount_percentage: discount,
                total_amount: total,
                subtotal_amount: subtotal,
                discount_amount: couponSave,
                delivery_charge: delivery,
                notes: selectedAddr?.instructions || null,
            };

            console.log("COD Order Payload:", payload);

            const res = await orderApi.createOrder(payload);

            if (res?.success) {
                await onOrderSuccess(res.data?.order_id);
            } else {
                throw new Error(res?.message || "Failed to place COD order.");
            }
        } catch (error) {
            console.error("COD ORDER ERROR:", error);
            toast.error(error?.message || "Failed to place COD order");
        }
    };

    const placeOnlineOrder = async () => {
        try {
            if (!selectedAddr?.id) {
                throw new Error("Please select an address.");
            }

            applyCoupon();

            const userData = JWTService.decodeTokenDetails();

            const createOrderPayload = {
                address_id: selectedAddr?.id,
                payment_method: paymentMethod,
                delivery_charge: delivery,
                coupon_code: discount > 0 ? coupon.trim() : null,
                discount_percentage: discount,
                subtotal_amount: subtotal,
                notes: selectedAddr?.instructions || null,
            };


            const paymentOrderRes = await paymentApi.createRazorpayOrder(createOrderPayload);

            if (!paymentOrderRes?.success) {
                throw new Error(paymentOrderRes?.message || "Failed to create Razorpay order.");
            }
            console.log("Razorpay Order Response:", paymentOrderRes);
            const paymentOrderData = paymentOrderRes.data;
            // STEP 2: Open Razorpay checkout
            await initiatePayment({
                key: paymentOrderData.key,
                amount: paymentOrderData.total_amount + 999,
                currency: paymentOrderData.currency,
                order_id: paymentOrderData.razorpay_order_id,
                name: "ShopEase",
                description: `Order of ${cart.length} item(s)`,
                prefill: {
                    name: selectedAddr?.name,
                    email: userData?.email,
                    contact: selectedAddr?.mobile || selectedAddr?.phone,
                },
                onSuccess: async (paymentData) => {
                    try {
                        console.log("Payment successful:", paymentData);

                        // STEP 3: Verify payment and create final order
                        const verifyPayload = {
                            address_id: selectedAddr?.id,
                            payment_method: paymentMethod,
                            payment_id: paymentData.razorpay_payment_id,
                            payment_order_id: paymentData.razorpay_order_id,
                            payment_signature: paymentData.razorpay_signature,
                            coupon_code: discount > 0 ? coupon : null,
                            discount_percentage: discount,
                            total_amount: total,
                            subtotal_amount: subtotal,
                            discount_amount: couponSave,
                            delivery_charge: delivery,
                            notes: selectedAddr?.instructions || null,
                        };

                        console.log("Verify And Create Order Payload:", verifyPayload);

                        const verifyRes = await paymentApi.verifyAndCreateOrder(verifyPayload);

                        if (verifyRes?.success) {
                            toast.success("Payment successful and order created");
                            await onOrderSuccess(verifyRes.data?.order_id);
                        } else {
                            throw new Error(
                                verifyRes?.message || "Payment verified but order creation failed."
                            );
                        }
                    } catch (error) {
                        console.error("VERIFY AND CREATE ORDER ERROR:", error);
                        toast.error(error?.message || "Order creation failed after payment.");
                    }
                },
                onFailure: (reason) => {
                    console.error("Razorpay payment failed:", reason);
                    toast.error("Payment failed. Please try again.");
                },
            });

        } catch (error) {
            console.error("ONLINE ORDER ERROR:", error);
            toast.error(error?.message || "Failed to initiate online payment");
        }
    };


    const placeOrder = useCallback(async () => {
        if (!selectedAddr) { toast.error("Please select a delivery address."); return; }
        if (!paymentMethod) { toast.error("Please select a payment method."); return; }

        setPlacing(true);
        try {
            if (paymentMethod === "cod") {
                await placeCODOrder();
            } else {
                await placeOnlineOrder();
            }
        } catch (err) {
            console.error("Order placement error:", err);
            toast.error(err?.response?.data?.message || err?.message || "Failed to place order.");
        } finally {
            setPlacing(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedAddr, paymentMethod, cart, total, coupon, discount]);


    return (
        <div style={{ minHeight: "100vh", background: "var(--bg)" }}>

            {/* Topbar */}
            <div className="co-topbar">
                <button
                    className="pt-1 d-flex align-itme-center fw-bold rounded-2 border-0 text-white" 
                    style={{height: "35px", padding: "0 12px", fontSize: "0.9rem", fontWeight: 900, background: "linear-gradient(135deg, var(--p), var(--p2)) !important",} }
                    onClick={() => step > 0 ? setStep((s) => s - 1) : navigate(-1)}
                >
                    ←
                </button>
                <span className="co-topbar-brand text-dark" onClick={() => navigate("/")}>
                    🛍️ ShopEase
                </span>
                <span style={{ color: "rgba(255,255,255,.8)", fontWeight: 700, fontSize: "0.98rem" }} className="text-dark">
                    Checkout 🔒
                </span>
            </div>

            <Container className="py-4">

                {/* Loading */}
                {cartLoading ? (
                    <div className="d-flex justify-content-center py-5">
                        <GlobalLoader />
                    </div>

                ) : cart.length === 0 ? (

                    /* Empty cart */
                    <div className="text-center py-5">
                        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🛒</div>
                        <h4 className="mb-3">Your cart is empty</h4>
                        <p className="text-muted mb-4">Add some items before checkout.</p>
                        <Button className="co-btn-main px-4" onClick={() => navigate("/dashboard")}>
                            Continue Shopping
                        </Button>
                    </div>

                ) : (
                    <>
                        {/* Step bar */}
                        {step < 3 && <Stepper step={step} />}

                        <Row className="g-4">

                            {/* ── Active step ── */}
                            <Col lg={step === 3 ? 12 : 8}>
                                <div className="co-card p-4">

                                    {step === 0 && (
                                        <StepAddress
                                            selectedAddr={selectedAddr}
                                            addresses={addresses}
                                            onSelect={setSelectedAddr}
                                            onSaveAddress={saveAddress}
                                            onNext={() => setStep(1)}
                                        />
                                    )}

                                    {step === 1 && (
                                        <StepPayment
                                            selected={paymentMethod}
                                            onSelect={setPayment}
                                            onNext={() => setStep(2)}
                                            onBack={() => setStep(0)}
                                        />
                                    )}

                                    {step === 2 && (
                                        <StepReview
                                            cart={cart}
                                            address={selectedAddr}
                                            paymentMethod={paymentMethod}
                                            coupon={coupon}
                                            discount={discount}
                                            couponMsg={couponMsg}
                                            subtotal={subtotal}
                                            saved={saved}
                                            couponSave={couponSave}
                                            delivery={delivery}
                                            total={total}
                                            placing={placing}
                                            onCouponChange={handleCouponChange}
                                            onCouponApply={applyCoupon}
                                            onBack={() => setStep(1)}
                                            onPlace={placeOrder}
                                        />
                                    )}

                                    {step === 3 && (
                                        <StepConfirmed
                                            orderId={orderId}
                                            total={total}
                                            address={selectedAddr}
                                            paymentMethod={paymentMethod}
                                            cart={cart}
                                        />
                                    )}
                                </div>
                            </Col>

                            {step < 3 && (
                                <Col lg={4} className="co-fu-1">
                                    <OrderSummary
                                        cart={cart}
                                        coupon={coupon}
                                        discount={discount}
                                        couponMsg={couponMsg}
                                        subtotal={subtotal}
                                        saved={saved}
                                        couponSave={couponSave}
                                        delivery={delivery}
                                        total={total}
                                        onCouponChange={handleCouponChange}
                                        onCouponApply={applyCoupon}
                                    />
                                </Col>
                            )}

                        </Row>
                    </>
                )}
            </Container>
        </div>
    );
}