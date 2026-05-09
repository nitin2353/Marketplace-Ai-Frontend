import apiConfig from "../config/axios-config";

const chatApi = {
    getOrCreateConversation: async (data) => {
        const res = await apiConfig.post("/chat/conversation", data);
        return res.data;
    },
    getConversations: async () => {
        const res = await apiConfig.get("/chat/conversations");
        return res.data;
    },
    getMessages: async (conversationId) => {
        const res = await apiConfig.get(`/chat/conversation/${conversationId}/messages`);
        return res.data;
    },
    sendMessage: async (conversationId, data) => {
        const res = await apiConfig.post(`/chat/conversation/${conversationId}/message`, data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return res.data;
    },
    markAsRead: async (conversationId) => {
        const res = await apiConfig.patch(`/chat/conversation/${conversationId}/read`);
        return res.data;
    },
    deleteMessage: async (messageId) => {
        const res = await apiConfig.delete(`/chat/message/${messageId}`);
        return res.data;
    },
    moderateMessage: async (data) => {
        const res = await apiConfig.post("/chat/message/moderate", data);
        return res.data;
    },
};

export default chatApi;
