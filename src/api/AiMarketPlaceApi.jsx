import apiConfig from "../config/axios-config";
// import { formateEmptyFields } from "../helper/GlobalHelper";

const getListOfUsers = async () => {
  try {
    const response = await apiConfig.get("/user");
    return response?.data || [];
  } catch (error) {``
    console.log(error);
    throw error;
  }
};


export default {getListOfUsers}