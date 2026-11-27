import apiConfig from '../config/axios-config';
import { API_BASE_URL } from '../helper/Constraints';

const API = apiConfig.create({
    baseURL: API_BASE_URL
});

// 🔐 Token attach (auto)
API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default API;
