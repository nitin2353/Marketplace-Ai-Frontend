import API from "./axios";

// GET SELLER SUMMARY
const getSellerSummary = async (sellerId) => {
    try {
        const response = await API.get(`/report/seller-summary/${sellerId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error fetching seller summary" };
    }
};

// GET WEEKLY UNITS SOLD BY PRODUCT
const getWeeklyUnitsSold = async (productId) => {
    try {
        const response = await API.get(`/report/weekly-units/${productId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error fetching weekly units sold" };
    }
};

// GET MONTHLY SALES BY PRODUCT
const getMonthlySales = async (productId) => {
    try {
        const response = await API.get(`/report/monthly-sales/${productId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error fetching monthly sales" };
    }
};

// GET ORDER STATUS MIX BY SELLER
const getOrderStatusMix = async (sellerId) => {
    try {
        const response = await API.get(`/report/order-status-mix/${sellerId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error fetching order status mix" };
    }
};

// GET RECENT ORDERS BY PRODUCT
const getRecentOrdersByProduct = async (productId) => {
    try {
        const response = await API.get(`/report/recent-orders/${productId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error fetching recent orders" };
    }
};

// GET RATING BREAKDOWN BY PRODUCT
const getRatingBreakdown = async (productId) => {
    try {
        const response = await API.get(`/report/rating-breakdown/${productId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error fetching rating breakdown" };
    }
};

// OPTIONAL: GET COMPLETE PRODUCT REPORT DASHBOARD
const getProductReportDashboard = async (productId, sellerId) => {
    try {
        const [weekly, monthly, recentOrders, ratingBreakdown] = await Promise.all([
            API.get(`/report/weekly-units/${productId}`),
            API.get(`/report/monthly-sales/${productId}`),
            API.get(`/report/recent-orders/${productId}`),
            API.get(`/report/rating-breakdown/${productId}`),
        ]);

        return {
            success: true,
            data: {
                weeklyUnits: weekly.data?.data || [],
                monthlySales: monthly.data?.data || [],
                recentOrders: recentOrders.data?.data || [],
                ratingBreakdown: ratingBreakdown.data?.data || {},
            }
        };
    } catch (error) {
        throw error.response?.data || { message: "Error fetching product report dashboard" };
    }
};

// OPTIONAL: GET SELLER REPORT DASHBOARD
const getSellerReportDashboard = async (sellerId) => {
    try {
        const response = await API.get(`/report/seller-summary/${sellerId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error fetching seller dashboard report" };
    }
};

export default {
    getSellerSummary,
    getWeeklyUnitsSold,
    getMonthlySales,
    getOrderStatusMix,
    getRecentOrdersByProduct,
    getRatingBreakdown,
    getProductReportDashboard,
    getSellerReportDashboard,
};