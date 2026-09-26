import apiConfig from '../config/axios-config';

// CREATE REVIEW
const createReview = async (data) => {
    try {
        const isFormData = data instanceof FormData;
        const response = await apiConfig.post("/review", data, {
            headers: {
                "Content-Type": isFormData ? "multipart/form-data" : "application/json",
            },
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error creating review" };
    }
};

// GET SELLER REVIEWS
const getSellerReviews = async (sellerId) => {
    try {
        const response = await apiConfig.get(`/review/seller/${sellerId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error fetching seller reviews" };
    }
};

// GET SELLER RATING SUMMARY
const getSellerRatingSummary = async (sellerId) => {
    try {
        const response = await apiConfig.get(`/review/seller/${sellerId}/summary`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error fetching seller rating summary" };
    }
};

// GET PRODUCT REVIEWS
const getProductReviews = async (productId) => {
    try {
        const response = await apiConfig.get(`/review/product/${productId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error fetching product reviews" };
    }
};

// GET PRODUCT RATING SUMMARY
const getProductRatingSummary = async (productId) => {
    try {
        const response = await apiConfig.get(`/review/product/${productId}/summary`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error fetching product rating summary" };
    }
};

// GET USER REVIEWS
const getUserReviews = async (userId) => {
    try {
        const response = await apiConfig.get(`/review/user/${userId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error fetching user reviews" };
    }
};

// UPDATE REVIEW
const updateReview = async (reviewId, data) => {
    try {
        const response = await apiConfig.patch(`/review/${reviewId}`, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error updating review" };
    }
};

// DELETE REVIEW
const deleteReview = async (reviewId) => {
    try {
        const response = await apiConfig.delete(`/review/${reviewId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error deleting review" };
    }
};

// UPDATE SELLER REPLY
const updateSellerReply = async (reviewId, reply) => {
    try {
        const response = await apiConfig.patch(`/review/${reviewId}/reply`, { reply });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error updating reply" };
    }
};

// DELETE SELLER REPLY
const deleteSellerReply = async (reviewId) => {
    try {
        const response = await apiConfig.delete(`/review/${reviewId}/reply`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error deleting reply" };
    }
};

export default {
    createReview,
    getSellerReviews,
    getSellerRatingSummary,
    getProductReviews,
    getProductRatingSummary,
    getUserReviews,
    updateReview,
    deleteReview,
    updateSellerReply,
    deleteSellerReply,
};
