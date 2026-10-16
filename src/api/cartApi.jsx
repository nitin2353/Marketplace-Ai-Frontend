  import apiConfig from '../config/axios-config';


const getAllCart = async () => {
  try {
    const response = await apiConfig.get('/cart');
    return response
  } catch (error) {
    console.error("Error fetching cart:", error);
    throw error;
  }
}

const updateCart = async (id, payload) => {
  try {
    const response = await apiConfig.put(`/cart/${id}`, payload)
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Something went wrong during update cart' };
  }
};

const deleteCart = async (id) => {
  try {
    const response = await apiConfig.delete(`/cart/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Something went wrong during delete cart' };
  }
};

const allRemoveFromCart = async () => {
  try {
    const response = await apiConfig.delete(`/cart`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Something went wrong during delete cart' };
  }
};


const createCart = async (payload) => {
  try {
    const response = await apiConfig.post('/cart/create', payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Something went wrong during create cart' };
  }
};


export default { getAllCart, updateCart, deleteCart, createCart, allRemoveFromCart }
