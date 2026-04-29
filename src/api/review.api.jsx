import API from "./axios";

// CREATE REVIEW
const createReview = async (data) => {
    try {
        const response = await API.post("/review", data);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error creating review" };
    }
};

// GET SELLER REVIEWS
const getSellerReviews = async (sellerId) => {
    try {
        const response = await API.get(`/review/seller/${sellerId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error fetching seller reviews" };
    }
};

// GET SELLER RATING SUMMARY
const getSellerRatingSummary = async (sellerId) => {
    try {
        const response = await API.get(`/review/seller/${sellerId}/summary`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error fetching seller rating summary" };
    }
};

// GET PRODUCT REVIEWS
const getProductReviews = async (productId) => {
    try {
        const response = await API.get(`/review/product/${productId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error fetching product reviews" };
    }
};

// GET PRODUCT RATING SUMMARY
const getProductRatingSummary = async (productId) => {
    try {
        const response = await API.get(`/review/product/${productId}/summary`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error fetching product rating summary" };
    }
};

// GET USER REVIEWS
const getUserReviews = async (userId) => {
    try {
        const response = await API.get(`/review/user/${userId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error fetching user reviews" };
    }
};

// UPDATE REVIEW
const updateReview = async (reviewId, data) => {
    try {
        const response = await API.patch(`/review/${reviewId}`, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error updating review" };
    }
};

// DELETE REVIEW
const deleteReview = async (reviewId, userId) => {
    try {
        const response = await API.delete(`/review/${reviewId}/user/${userId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error deleting review" };
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
};