import apiConfig from '../config/axios-config';


export const getSellerDetails = async (id, signal) => {
    try {
        const response = await apiConfig.get(
            `/admin/sellers/${encodeURIComponent(id)}/details`,
            { signal }
        );

        return response.data;
    } catch (error) {
        if (
            error.name === "AbortError" ||
            error.code === "ERR_CANCELED"
        ) {
            throw error;
        }

        throw error.response?.data || {
            message: "Unable to fetch seller details.",
        };
    }
};

export const updatePaymentStatusApi = async (paymentId, status) => {
    try {
        const response = await apiConfig.patch(
            `/admin/payments/${encodeURIComponent(paymentId)}/status`,
            { status }
        );

        return response.data;
    } catch (error) {
        throw error.response?.data || {
            message: "Unable to update payment status.",
        };
    }
};

export const apiRequest = async (options = {}) => {
    try {
        const method = (options.method || "GET").toLowerCase();

        const response = await apiConfig.request({
            url: "/admin/sellers",
            method,
            data: options.body
                ? JSON.parse(options.body)
                : undefined,
            headers: options.headers || {},
            signal: options.signal,
        });

        const result = response.data;

        if (result?.success === false) {
            throw new Error(
                result.message || "Request failed."
            );
        }

        return result;
    } catch (error) {
        if (
            error.name === "AbortError" ||
            error.code === "ERR_CANCELED"
        ) {
            throw error;
        }

        throw new Error(
            error.response?.data?.message ||
            error.message ||
            "Something went wrong."
        );
    }
};