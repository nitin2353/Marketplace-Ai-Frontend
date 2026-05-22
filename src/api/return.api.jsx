import apiConfig from '../config/axios-config';

export const createReturnRequest = async (formData) => {
    try {
        const response = await apiConfig.post('/returns', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getCustomerReturnRequests = async () => {
    try {
        const response = await apiConfig.get('/returns/customer');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getSellerReturnRequests = async () => {
    try {
        const response = await apiConfig.get('/returns/seller');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getReturnRequestById = async (id) => {
    try {
        const response = await apiConfig.get(`/returns/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const updateReturnStatus = async (id, data) => {
    try {
        const response = await apiConfig.patch(`/returns/${id}/status`, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const cancelReturnRequest = async (id) => {
    try {
        const response = await apiConfig.patch(`/returns/${id}/cancel`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
