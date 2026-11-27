import apiConfig from '../config/axios-config';


const getAllWishlistItems = async () => {
    try {
        const response = await apiConfig.get('/wishlist');
        return response
    } catch (error) {
        console.error("Error fetching wishlist:", error);
        throw error;
    }
}


const toogleWishlist = async (id) => {
    try {
        const response = await apiConfig.post('/wishlist/toogle', id);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Something went wrong' };
    }
};

const removeAllWishlistItems = async () => {
    try {
        const response = await apiConfig.get('/wishlist/remove/all');
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Something went wrong' };
    }
};


export default { getAllWishlistItems, toogleWishlist, removeAllWishlistItems }
