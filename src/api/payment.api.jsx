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

// Get seller payment summary
const getSellerSummary = async () => {
    try {
        const response = await apiConfig.get("/payment/seller/summary");
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to fetch payment summary" };
    }
};

// Get seller transactions
const getSellerTransactions = async (params) => {
    try {
        const response = await apiConfig.get("/payment/seller/transactions", { params });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to fetch transactions" };
    }
};

// Get seller chart data
const getSellerChartData = async () => {
    try {
        const response = await apiConfig.get("/payment/seller/chart-data");
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to fetch chart data" };
    }
};

// Get specific transaction detail
const getSellerTransactionById = async (id) => {
    try {
        const response = await apiConfig.get(`/payment/seller/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to fetch transaction detail" };
    }
};

export default {
    createRazorpayOrder,
    verifyAndCreateOrder,
    getPaymentByOrderId,
    getSellerSummary,
    getSellerTransactions,
    getSellerChartData,
    getSellerTransactionById
};