import API from "./axios";

export const getQuotes = (requirement_id) => 
    API.get(`/quote/${requirement_id}`);

export const createQuote = (data) => 
    API.post("/quote", data);