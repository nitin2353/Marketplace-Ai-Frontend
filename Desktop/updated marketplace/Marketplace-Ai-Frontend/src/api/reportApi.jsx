import apiConfig from '../config/axios-config';

// GET SELLER SUMMARY
const getSellerSummary = async (sellerId) => {
    try {
        const response = await apiConfig.get(`/report/seller-summary/${sellerId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error fetching seller summary" };
    }
};

// GET WEEKLY UNITS SOLD BY PRODUCT
const getWeeklyUnitsSold = async (productId) => {
    try {
        const response = await apiConfig.get(`/report/weekly-units/${productId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error fetching weekly units sold" };
    }
};

// GET MONTHLY SALES BY PRODUCT
const getMonthlySales = async (productId) => {
    try {
        const response = await apiConfig.get(`/report/monthly-sales/${productId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error fetching monthly sales" };
    }
};

// GET ORDER STATUS MIX BY SELLER
const getOrderStatusMix = async (sellerId) => {
    try {
        const response = await apiConfig.get(`/report/order-status-mix/${sellerId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error fetching order status mix" };
    }
};

// GET RECENT ORDERS BY PRODUCT
const getRecentOrdersByProduct = async (productId) => {
    try {
        const response = await apiConfig.get(`/report/recent-orders/${productId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error fetching recent orders" };
    }
};

const getRecentOrders = async () => {
    try {
        const response = await apiConfig.get(`/report/recent-orders`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error fetching recent orders" };
    }
};

// GET RATING BREAKDOWN BY PRODUCT
const getRatingBreakdown = async (productId) => {
    try {
        const response = await apiConfig.get(`/report/rating-breakdown/${productId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error fetching rating breakdown" };
    }
};

// OPTIONAL: GET COMPLETE PRODUCT REPORT DASHBOARD
const getProductReportDashboard = async (productId, sellerId) => {
    try {
        const [weekly, monthly, recentOrders, ratingBreakdown] = await Promise.all([
            apiConfig.get(`/report/weekly-units/${productId}`),
            apiConfig.get(`/report/monthly-sales/${productId}`),
            apiConfig.get(`/report/recent-orders/${productId}`),
            apiConfig.get(`/report/rating-breakdown/${productId}`),
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
        const response = await apiConfig.get(`/report/seller-summary/${sellerId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error fetching seller dashboard report" };
    }
};


const getRecentActivities = async () => {
    try {
        const response = await apiConfig.get("/report/recent-activities");
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error fetching recent activities" };
    }
};

export default {
    getSellerSummary,
    getWeeklyUnitsSold,
    getMonthlySales,
    getOrderStatusMix,
    getRecentOrdersByProduct,
    getRecentOrders,
    getRatingBreakdown,
    getProductReportDashboard,
    getSellerReportDashboard,
    getRecentActivities
};
