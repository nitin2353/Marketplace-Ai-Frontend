import apiConfig from "../config/axios-config";

// Create Razorpay order before opening checkout
const createRazorpayOrder = async (data) => {
    try {
        const response = await apiConfig.post("/payment/create-order", data);
        return response.data;
    } catch (error) {
        throw error.response?.data || {
            message: "Something went wrong during create payment order"
        };
    }
};

// Verify payment and create final order
const verifyAndCreateOrder = async (data) => {
    try {
        const response = await apiConfig.post("/payment/verify-and-create-order", data);
        return response.data;
    } catch (error) {
        throw error.response?.data || {
            message: "Something went wrong during verify payment and create order"
        };
    }
};

// Get payment details by final order id
const getPaymentByOrderId = async (orderId) => {
    try {
        const response = await apiConfig.get(`/payment/order/${orderId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || {
            message: "Something went wrong while fetching payment details"
        };
    }
};

export default {
    createRazorpayOrder,
    verifyAndCreateOrder,
    getPaymentByOrderId
};