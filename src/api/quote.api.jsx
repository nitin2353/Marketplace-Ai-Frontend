import API from "./axios";
import apiConfig from "../config/axios-config";

export const getQuotes = (requirement_id) => 
    apiConfig.get(`/quote/${requirement_id}`);

export const createQuote = (data) => 
    apiConfig.post("/quote", data);