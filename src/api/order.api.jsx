import API from "./axios";

// CREATE ORDER
const createOrder = async (data) => {
    try {
        const response = await API.post("/order", data);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error creating order" };
    }
};

const buyNow = async (data) => {
    try {
        const response = await API.post("/order/buy-now", data);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error processing buy now" };
    }
};

const getCustomerOrders = async (userId) => {
    try {
        const response = await API.get(`/order/customer/${userId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error fetching customer orders" };
    }
};

const getCustomerOrderById = async (userId, orderId) => {
    try {
        const response = await API.get(`/order/customer/${userId}/${orderId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error fetching customer order" };
    }
};

const getSellerOrders = async (sellerId) => {
    try {
        const response = await API.get(`/order/seller/${sellerId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error fetching seller orders" };
    }
};

const getSellerOrderById = async (sellerId, orderId) => {
    try {
        const response = await API.get(`/order/seller/${sellerId}/${orderId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error fetching seller order" };
    }
};

const getOrderById = async (orderId) => {
    try {
        const response = await API.get(`/order/${orderId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error fetching order" };
    }
};

// GET ORDER ITEMS
const getOrderItems = async (orderId) => {
    try {
        const response = await API.get(`/order/${orderId}/items`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error fetching order items" };
    }
};

// GET ORDER ADDRESS SNAPSHOT
const getOrderAddressSnapshot = async (orderId) => {
    try {
        const response = await API.get(`/order/${orderId}/address-snapshot`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error fetching order address snapshot" };
    }
};

// GET ORDER USER SNAPSHOT
const getOrderUserSnapshot = async (orderId) => {
    try {
        const response = await API.get(`/order/${orderId}/user-snapshot`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error fetching order user snapshot" };
    }
};

// UPDATE ORDER STATUS
const updateOrderStatus = async (orderId, status) => {
    try {
        const response = await API.patch(`/order/${orderId}/status`, { status });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error updating order status" };
    }
};

// UPDATE PAYMENT STATUS
const updatePaymentStatus = async (orderId, paymentStatus) => {
    try {
        const response = await API.patch(`/order/${orderId}/payment-status`, { paymentStatus });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error updating payment status" };
    }
};

// VERIFY ORDER PAYMENT
const verifyOrderPayment = async (orderId, paymentData) => {
    try {
        const response = await API.patch(`/order/${orderId}/verify-payment`, paymentData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error verifying payment" };
    }
};

// CANCEL ORDER
const cancelOrder = async (orderId, cancelData) => {
    try {
        const response = await API.patch(`/order/${orderId}/cancel`, cancelData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error cancelling order" };
    }
};

// LEGACY FUNCTIONS (for backward compatibility)
const getAllOrders = async () => {
    try {
        const response = await API.get("/order");
        return response.data;
    } catch (error) {
        console.error("Error fetching all orders:", error);
        throw error.response?.data || { message: "Error fetching orders" };
    }
};

const getUserOrders = async () => {
    try {
        const response = await API.get("/order/user");
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error fetching user orders" };
    }
};

export default {
    createOrder,
    buyNow,
    getCustomerOrders,
    getCustomerOrderById,
    getSellerOrders,
    getSellerOrderById,
    getOrderById,
    getOrderItems,
    getOrderAddressSnapshot,
    getOrderUserSnapshot,
    updateOrderStatus,
    updatePaymentStatus,
    verifyOrderPayment,
    cancelOrder,
    // Legacy functions
    getAllOrders,
    getUserOrders,
};
