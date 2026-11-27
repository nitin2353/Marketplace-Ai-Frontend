import API from "./axios";
import apiConfig from "../config/axios-config";


export const getMessages = (user1, user2) => 
    apiConfig.get(`/message/${user1}/${user2}`);

export const sendMessage = (data) => 
    apiConfig.post("/message", data);