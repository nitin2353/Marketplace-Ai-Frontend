import axios from "axios";

const API = axios.create({
    baseURL: `${window.location.protocol}//${window.location.hostname}:3000/api/v1`
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