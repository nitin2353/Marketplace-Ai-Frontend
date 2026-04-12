import API from "./axios";

export const createReview = (data) => 
    API.post("/review", data);