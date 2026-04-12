import apiConfig from '../config/axios-config';

const createAddress = async (data) => {
  try {
    const response = await apiConfig.post('/address', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Something went wrong during create address' };
  }
};

const getAllAddresses = async () => {
  try {
    const response = await apiConfig.get('/address/all');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Something went wrong during get all addresses' };
  }
};

const getAddressById = async (id) => {
  try {
    const response = await apiConfig.get(`/address/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Something went wrong during get address by id' };
  }
};

const getAddressesByUserId = async () => {
  try {
    const response = await apiConfig.get('/address');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Something went wrong during get addresses by user id' };
  }
};

const updateAddress = async (id, data) => {
  try {
    const response = await apiConfig.put(`/address/${id}`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Something went wrong during update address' };
  }
};

const deleteAddress = async (id) => {
  try {
    const response = await apiConfig.delete(`/address/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Something went wrong during delete address' };
  }
};

export default {
  createAddress,
  getAllAddresses,
  getAddressById,
  getAddressesByUserId,
  updateAddress,
  deleteAddress
};