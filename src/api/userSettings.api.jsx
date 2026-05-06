import API from "./axios";

// GET USER PROFILE
const getProfile = async (userId) => {
    try {
        const response = await API.get(`/user/profile/${userId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error fetching profile" };
    }
};

// UPDATE USER PROFILE (supports avatar)
const updateProfile = async (userId, formData) => {
    try {
        const response = await API.put(`/user/profile/${userId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error updating profile" };
    }
};

// UPDATE STORE INFO
const updateStore = async (userId, data) => {
    try {
        const response = await API.put(`/user/store/${userId}`, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error updating store info" };
    }
};

// UPDATE PAYMENT INFO
const updatePayment = async (userId, data) => {
    try {
        const response = await API.put(`/user/payment/${userId}`, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error updating payment info" };
    }
};

// GET NOTIFICATION PREFERENCES
const getNotificationPrefs = async () => {
    try {
        const response = await API.get(`/user/notification-preferences`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error fetching notification preferences" };
    }
};

// UPDATE NOTIFICATION PREFERENCES
const updateNotificationPrefs = async (prefs) => {
    try {
        const response = await API.put(`/user/notification-preferences`, prefs);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error updating notification preferences" };
    }
};

// EXPORT ALL
export default {
    getProfile,
    updateProfile,
    updateStore,
    updatePayment,
    getNotificationPrefs,
    updateNotificationPrefs
};
