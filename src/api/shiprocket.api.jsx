import apiConfig from "../config/axios-config";



const checkDeliveryAvailability = async (data) => {
    try {
        const response = await apiConfig.post("/shiprocket/services/delivery/availability", data);
        return response.data;
    } catch (error) {
        throw error.response?.data || {
            message: "Something went wrong"
        };
    }
};

export default {
  checkDeliveryAvailability
}