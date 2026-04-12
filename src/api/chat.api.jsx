import API from "./axios";

export const getMessages = (user1, user2) => 
    API.get(`/message/${user1}/${user2}`);

export const sendMessage = (data) => 
    API.post("/message", data);