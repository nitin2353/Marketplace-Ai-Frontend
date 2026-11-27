import apiConfig from '../config/axios-config';

export const getWallet = (seller_id) => 
    apiConfig.get(`/wallet/${seller_id}`);

export const withdraw = (data) => 
    apiConfig.post("/wallet/withdraw", data);
