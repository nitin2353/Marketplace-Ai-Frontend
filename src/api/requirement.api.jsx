import API from "./axios";

export const createRequirement = (data) => 
    API.post("/requirement", data);

export const getRequirements = () => 
    API.get("/requirement");