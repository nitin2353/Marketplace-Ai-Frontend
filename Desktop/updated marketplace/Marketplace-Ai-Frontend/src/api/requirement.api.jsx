import apiConfig from '../config/axios-config';

export const createRequirement = (data) => 
    apiConfig.post("/requirement", data);

export const getRequirements = () => 
    apiConfig.get("/requirement");
