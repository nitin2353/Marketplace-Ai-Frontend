import API from "./axios";

// GET USER NOTIFICATIONS
const getUserNotifications = async (userId, page = 1, limit = 10) => {
    try {
        const response = await API.get(`/notification/user/${userId}?page=${page}&limit=${limit}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error fetching notifications" };
    }
};

// GET SELLER NOTIFICATIONS
const getSellerNotifications = async (sellerId, page = 1, limit = 10) => {
    try {
        const response = await API.get(`/notification/seller/${sellerId}?page=${page}&limit=${limit}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error fetching seller notifications" };
    }
};

// GET UNREAD COUNT
const getUnreadCount = async (userId) => {
    try {
        const response = await API.get(`/notification/user/${userId}/unread-count`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error fetching unread count" };
    }
};

// MARK ONE AS READ
const markAsRead = async (notificationId, userId) => {
    try {
        const response = await API.patch(`/notification/${notificationId}/user/${userId}/read`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error marking notification as read" };
    }
};

// MARK ALL AS READ
const markAllAsRead = async (userId) => {
    try {
        const response = await API.patch(`/notification/user/${userId}/read-all`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error marking all notifications as read" };
    }
};

// DELETE NOTIFICATION
const deleteNotification = async (notificationId, userId) => {
    try {
        const response = await API.delete(`/notification/${notificationId}/user/${userId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error deleting notification" };
    }
};

export default {
    getUserNotifications,
    getSellerNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
};