import API from "./axios";

const chatApi = {
    getOrCreateConversation: async (data) => {
        const res = await API.post("/chat/conversation", data);
        return res.data;
    },
    getConversations: async () => {
        const res = await API.get("/chat/conversations");
        return res.data;
    },
    getMessages: async (conversationId) => {
        const res = await API.get(`/chat/conversation/${conversationId}/messages`);
        return res.data;
    },
    sendMessage: async (conversationId, data) => {
        const res = await API.post(`/chat/conversation/${conversationId}/message`, data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return res.data;
    },
    markAsRead: async (conversationId) => {
        const res = await API.patch(`/chat/conversation/${conversationId}/read`);
        return res.data;
    },
    deleteMessage: async (messageId) => {
        const res = await API.delete(`/chat/message/${messageId}`);
        return res.data;
    }
};

export default chatApi;
