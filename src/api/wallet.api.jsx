import API from "./axios";

export const getWallet = (seller_id) => 
    API.get(`/wallet/${seller_id}`);

export const withdraw = (data) => 
    API.post("/wallet/withdraw", data);