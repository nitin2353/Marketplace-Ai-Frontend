import apiConfig from "../config/axios-config";


const getCategories = async (data) => {
  try {
    const response = await apiConfig.get("/global/product/category");
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: "Something went wrong",
    };
  }
};

export default {
    getCategories   
}
