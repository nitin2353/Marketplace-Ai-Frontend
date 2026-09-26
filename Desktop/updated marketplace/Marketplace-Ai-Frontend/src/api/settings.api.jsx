import apiConfig from '../config/axios-config';

// ── User Profile APIs ─────────────────────────────────────────────────────
const getUserProfile = async () => {
  try {
    const response = await apiConfig.get('/user/profile');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch user profile' };
  }
};

const updateUserProfile = async (data) => {
  try {
    const response = await apiConfig.put('/user/profile', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update user profile' };
  }
};

// ── Security APIs ─────────────────────────────────────────────────────────
const changePassword = async (data) => {
  try {
    const response = await apiConfig.post('/user/change-password', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to change password' };
  }
};

// ── Notification Preference APIs ──────────────────────────────────────────
const getNotificationPreferences = async () => {
  try {
    const response = await apiConfig.get('/user/notification-preferences');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch notification preferences' };
  }
};

const updateNotificationPreferences = async (data) => {
  try {
    const response = await apiConfig.put('/user/notification-preferences', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update notification preferences' };
  }
};

// ── Privacy Settings APIs ─────────────────────────────────────────────────
const getPrivacySettings = async () => {
  try {
    const response = await apiConfig.get('/user/privacy-settings');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch privacy settings' };
  }
};

const updatePrivacySettings = async (data) => {
  try {
    const response = await apiConfig.put('/user/privacy-settings', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update privacy settings' };
  }
};

// ── Address APIs ──────────────────────────────────────────────────────────
const getUserAddresses = async () => {
  try {
    const response = await apiConfig.get('/address');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch addresses' };
  }
};

const createAddress = async (data) => {
  try {
    const response = await apiConfig.post('/address', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create address' };
  }
};

const updateAddress = async (id, data) => {
  try {
    const response = await apiConfig.put(`/address/${id}`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update address' };
  }
};

const deleteAddress = async (id) => {
  try {
    const response = await apiConfig.delete(`/address/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete address' };
  }
};

const setDefaultAddress = async (id) => {
  try {
    const response = await apiConfig.post(`/address/${id}/set-default`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to set default address' };
  }
};

export default {
  getUserProfile,
  updateUserProfile,
  changePassword,
  getNotificationPreferences,
  updateNotificationPreferences,
  getPrivacySettings,
  updatePrivacySettings,
  getUserAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
