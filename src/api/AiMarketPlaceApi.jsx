import apiConfig from "../config/axios-config";
import API from "./axios";
// import { formateEmptyFields } from "../helper/GlobalHelper";

const getListOfUsers = async () => {
  try {
    const response = await apiConfig.get("/user");
    return response?.data || [];
  } catch (error) {
    ``
    console.log(error);
    throw error;
  }
};

const getOrderById = async (orderId, id) => {
  try {
    const response = await API.get(`/global/order/invoice-generate/${orderId}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Error fetching order" };
  }
};


export default { getListOfUsers, getOrderById }