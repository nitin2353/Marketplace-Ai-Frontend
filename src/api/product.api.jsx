import apiConfig from '../config/axios-config';


const getAllProducts = async () => {
  try {
    const response = await apiConfig.get('/product');
    return response
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}

const updateProduct = async (id, payload) => {
  try {
    const response = await apiConfig.put(`/product/${id}`, payload, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Something went wrong during update product' };
  }
};

const deleteProduct = async (id) => {
  try {
    const response = await apiConfig.delete(`/product/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Something went wrong during delete product' };
  }
};

const searchProduct = async (query) => {
  try {
    const response = await apiConfig.get(`product/search?q=${query}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Something went wrong during search' };
  }
};

const productSuggestions = async (query) => {
  try {
    const response = await apiConfig.get(`product/suggest?q=${query}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Something went wrong during seggestion' };
  }
};

const getProductById = async (id) => {
  try {
    const response = await apiConfig.get(`/product/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching products' };
  }
};

const createProduct = async (payload) => {
  try {
    const response = await apiConfig.post('/product/create', payload, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Something went wrong during create product' };
  }
};


export default {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProduct,
  productSuggestions
}