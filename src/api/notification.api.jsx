import API from "./axios";

// GET MY NOTIFICATIONS (Authenticated User)
const getMyNotifications = async (page = 1, limit = 10) => {
    try {
        const response = await API.get(`/notification?page=${page}&limit=${limit}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error fetching notifications" };
    }
};

// GET UNREAD COUNT
const getUnreadCount = async () => {
    try {
        const response = await API.get(`/notification/unread-count`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error fetching unread count" };
    }
};

// MARK ONE AS READ
const markAsRead = async (notificationId) => {
    try {
        const response = await API.patch(`/notification/${notificationId}/read`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error marking notification as read" };
    }
};

// MARK ALL AS READ
const markAllAsRead = async () => {
    try {
        const response = await API.patch(`/notification/mark-all-read`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error marking all notifications as read" };
    }
};

// DELETE NOTIFICATION
const deleteNotification = async (notificationId) => {
    try {
        const response = await API.delete(`/notification/${notificationId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error deleting notification" };
    }
};

export default {
    getMyNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
};