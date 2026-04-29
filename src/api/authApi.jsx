import apiConfig from "../config/axios-config";

// ------------------ AUTH ------------------

const signupCustomer = async (data) => {
  try {
    const response = await apiConfig.post("/auth/customer/register", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: "Something went wrong during customer registration",
    };
  }
};

const signupSeller = async (data) => {
  try {
    const response = await apiConfig.post("/auth/seller/register", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: "Something went wrong during seller registration",
    };
  }
};

const register = async (data) => {
  try {
    const response = await apiConfig.post("/auth/register", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: "Something went wrong during registration",
    };
  }
};

const userLogin = async (data) => {
  try {
    const response = await apiConfig.post("/auth/login", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: "Something went wrong during login",
    };
  }
};

// ------------------ USER / PROFILE ------------------

const getProfile = async () => {
  try {
    const response = await apiConfig.get("/auth/profile");
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: "Something went wrong while fetching profile",
    };
  }
};

const getAllUsers = async () => {
  try {
    const response = await apiConfig.get("/auth/users");
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: "Something went wrong while fetching users",
    };
  }
};

const getUserById = async (id) => {
  try {
    const response = await apiConfig.get(`/auth/users/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: "Something went wrong while fetching user",
    };
  }
};

const updateUser = async (id, data) => {
  try {
    const response = await apiConfig.put(`/auth/users/${id}`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: "Something went wrong while updating user",
    };
  }
};

const updatePassword = async (id, data) => {
  try {
    const response = await apiConfig.put(`/auth/password/users/${id}`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: "Something went wrong while updating password",
    };
  }
};

const deleteUser = async (id) => {
  try {
    const response = await apiConfig.delete(`/auth/users/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: "Something went wrong while deleting user",
    };
  }
};

const changePassword = async (data) => {
  try {
    const response = await apiConfig.patch("/auth/change-password", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Error updating password" };
  }
};

const deactivateAccount = async () => {
  try {
    const response = await apiConfig.post("/auth/deactivate-account");
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Error deactivating account" };
  }
};

const deleteAccount = async () => {
  try {
    const response = await apiConfig.delete("/auth/delete-account");
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Error deleting account" };
  }
};

export default {
  signupCustomer,
  signupSeller,
  register,
  userLogin,
  getProfile,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updatePassword,
  changePassword,
  deactivateAccount,
  deleteAccount
};