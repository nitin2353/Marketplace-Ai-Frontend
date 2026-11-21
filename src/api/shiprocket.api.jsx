import apiConfig from "../config/axios-config";



const checkDeliveryAvailability = async (data) => {
    try {
        const response = await apiConfig.post("/delhivery/services/check-pincode", data);
        return response.data;
    } catch (error) {
        throw error.response?.data || {
            message: "Something went wrong"
        };
    }
};



const addPickupAddress = async (data) => {
    try {
        const response = await apiConfig.post("/shiprocket/services/addpickup/address", data);
        return response.data;
    } catch (error) {
        throw error.response?.data || {
            message: "Something went wrong"
        };
    }
};


const calculateShippingCharges = async (payload) => {
  try {
    const response = await apiConfig.post("/delhivery/services/calculate/shipping", payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: "Something went wrong",
    };
  }
};

const trackDelivery = async ({ waybill, ref_ids }) => {
  try {
    console.log('waybill, ref_ids', waybill.join(','), ref_ids)
    const {data} = await apiConfig.post(`/delhivery/services/shipping/tracking?waybill=${waybill.join(',')}&ref_ids=${ref_ids}`);
    console.log('ShipmentData', ShipmentData)
    return data?.ShipmentData;
  } catch (error) {
    throw error.response?.data || {
      message: "Something went wrong",
    };
  }
};















const updatePickupAddress = async (data) => {
    try {
        const response = await apiConfig.patch("/shiprocket/services/update/pickup/address", data);
        return response.data;
    } catch (error) {
        throw error.response?.data || {
            message: "Something went wrong"
        };
    }
};

export default {
    checkDeliveryAvailability,
    addPickupAddress,
    calculateShippingCharges,
    updatePickupAddress,
    trackDelivery
}