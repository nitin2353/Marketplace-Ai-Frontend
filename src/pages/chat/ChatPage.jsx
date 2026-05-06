import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import chatApi from '../../api/chat.api';
import JWTService from '../../config/jwt.config';
import Toolbar from '../../components/Toolbar';
import toast from 'react-hot-toast';
import { IoSend, IoAttach, IoChatbubblesOutline, IoTrashOutline, IoClose, IoDocumentTextOutline, IoDownloadOutline } from 'react-icons/io5';
import './Chat.css';
import { Col, Row } from 'react-bootstrap';

const ChatPage = () => {
    const { conversationId } = useParams();
    const navigate = useNavigate();
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(false);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const user = JWTService.decodeTokenDetails();
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchConversations();
        const interval = setInterval(fetchConversations, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        let interval;
        if (conversationId) {
            fetchMessages(conversationId);
            const active = conversations.find(c => c.id === conversationId);
            if (active) setActiveConversation(active);

            // Polling for new messages
            interval = setInterval(() => {
                fetchMessages(conversationId, true); // true for silent fetch
            }, 5000);
        }
        return () => clearInterval(interval);
    }, [conversationId, conversations]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchConversations = async () => {
        setLoading(true);
        try {
            const res = await chatApi.getConversations();
            if (res.status) {
                setConversations(res.data);
                if (conversationId) {
                    const active = res.data.find(c => c.id === conversationId);
                    if (active) setActiveConversation(active);
                }
            }
        } catch (error) {
            console.error("Error fetching conversations:", error);
            toast.error("Failed to load conversations");
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (id, silent = false) => {
        if (!silent) setMessagesLoading(true);
        try {
            const res = await chatApi.getMessages(id);
            if (res.status) {
                // Only update if message count changed to avoid flickering
                setMessages(prev => {
                    if (prev.length !== res.data.length) {
                        return res.data;
                    }
                    return prev;
                });
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        } finally {
            if (!silent) setMessagesLoading(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                toast.error("File size exceeds 10MB limit");
                return;
            }
            setSelectedFile(file);
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setFilePreview(reader.result);
                };
                reader.readAsDataURL(file);
            } else {
                setFilePreview(null);
            }
        }
    };

    const removeSelectedFile = () => {
        setSelectedFile(null);
        setFilePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if ((!newMessage.trim() && !selectedFile) || !conversationId) return;

        setSending(true);
        try {
            const formData = new FormData();
            if (newMessage.trim()) formData.append('message', newMessage);
            if (selectedFile) formData.append('attachment', selectedFile);

            const res = await chatApi.sendMessage(conversationId, formData);
            if (res.status) {
                setMessages([...messages, { ...res.data, sender_name: user.name }]);
                setNewMessage("");
                removeSelectedFile();
                // Update last message in sidebar
                setConversations(prev => prev.map(c =>
                    c.id === conversationId ? { ...c, last_message: newMessage || "Sent an attachment", updated_at: new Date().toISOString() } : c
                ));
            }
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error(error.response?.data?.message || "Failed to send message");
        } finally {
            setSending(false);
        }
    };

    const handleDeleteMessage = async (messageId) => {
        if (!window.confirm("Are you sure you want to delete this message?")) return;

        try {
            const res = await chatApi.deleteMessage(messageId);
            if (res.status) {
                setMessages(messages.filter(m => m.id !== messageId));
                toast.success("Message deleted");
            }
        } catch (error) {
            console.error("Error deleting message:", error);
            toast.error("Failed to delete message");
        }
    };

    const formatTime = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="chat-page-wrapper" >
            {/* <Toolbar isSearch={false} isSideBar={false} /> */}
            <div className="chat-container" style={{ height: "100vh" }}>
                {/* Sidebar */}
                <div className={`chat-sidebar ${"d-flex"}`}>
                    <div className="chat-sidebar-header">
                        <button
                            className="chat-back-btn"
                            onClick={() => navigate('/')}
                        >
                            ←
                        </button>

                        <h2>Messages</h2>
                    </div>

                    <div className="conversation-list">
                        {loading ? (
                            <div className="p-4 text-center">Loading...</div>
                        ) : conversations.length === 0 ? (
                            <div className="p-4 text-center text-muted">No conversations yet</div>
                        ) : (
                            conversations.map((conv) => (
                                <div
                                    key={conv.id}
                                    className={`conversation-item ${conversationId === conv.id ? "active" : ""}`}
                                    onClick={() => navigate(`/chat/${conv.id}`)}
                                >
                                    <div className="user-avatar">
                                        {conv.other_user_name?.charAt(0).toUpperCase()}
                                    </div>

                                    <div className="conversation-info">
                                        <div className="conversation-name">
                                            <span>{conv.other_user_name}</span>
                                            <small>
                                                {conv.updated_at
                                                    ? new Date(conv.updated_at).toLocaleDateString([], {
                                                        month: "short",
                                                        day: "numeric",
                                                    })
                                                    : ""}
                                            </small>
                                        </div>

                                        <div className="conversation-last-msg">
                                            {conv.last_message || "Start a conversation"}
                                        </div>
                                    </div>

                                    {conv.unread_count > 0 && (
                                        <div className="unread-badge">{conv.unread_count}</div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Main Chat */}
                <div className={`chat-main ${!conversationId ? 'd-none d-md-flex' : 'd-flex'}`}>
                    {conversationId ? (
                        <>
                            <div className="chat-header">
                                <div className="chat-header-user">
                                    <button
                                        style={{ border: "1px solid white" }}
                                        className="d-md-none border-0 bg-transparent me-2 fs-4 text-white fw-bold rounded-circle"
                                        onClick={() => navigate('/chat')}
                                    >
                                        ←
                                    </button>
                                    <div className="user-avatar">
                                        {activeConversation?.other_user_name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="chat-header-info">
                                        <h3 className="mb-0 fs-6">{activeConversation?.other_user_name}</h3>
                                    </div>
                                </div>
                            </div>

                            {activeConversation?.product_id && (
                                <div className="product-context">
                                    <img
                                        src={activeConversation.product_image || "https://placehold.co/40x40"}
                                        alt="product"
                                        className="product-context-img"
                                    />
                                    <div className="product-context-info">
                                        <h4>{activeConversation.product_title}</h4>
                                        <p>Product Inquiry</p>
                                    </div>
                                </div>
                            )}

                            <div className="chat-messages">
                                {messagesLoading ? (
                                    <div className="text-center py-4">Loading messages...</div>
                                ) : (
                                    messages.map((msg, index) => (
                                        <div
                                            key={msg.id || index}
                                            className={`message-bubble ${msg.sender_id === user.id ? 'message-sent' : 'message-received'}`}
                                        >
                                            {msg.sender_id === user.id && (
                                                <button
                                                    className="delete-msg-btn"
                                                    onClick={() => handleDeleteMessage(msg.id)}
                                                    title="Delete message"
                                                >
                                                    <IoTrashOutline />
                                                </button>
                                            )}
                                            {msg.attachment_url && (
                                                <div className="message-attachment">
                                                    {msg.attachment_type?.startsWith('image/') ? (
                                                        <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer">
                                                            <img src={msg.attachment_url} alt="attachment" className="chat-img-preview" />
                                                        </a>
                                                    ) : (
                                                        <div className="file-attachment-card">
                                                            <div className="file-icon">
                                                                <IoDocumentTextOutline />
                                                            </div>
                                                            <div className="file-info">
                                                                <span className="file-name text-truncate">{msg.attachment_name || 'File'}</span>
                                                                <span className="file-size">{(msg.attachment_size / 1024).toFixed(1)} KB</span>
                                                            </div>
                                                            <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer" className="file-download-btn">
                                                                <IoDownloadOutline />
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            {msg.message && <div className="message-text">{msg.message}</div>}
                                            <span className="message-time">{formatTime(msg.created_at)}</span>
                                        </div>
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            <form className="chat-input-area" onSubmit={handleSendMessage}>
                                {selectedFile && (
                                    <div className="attachment-preview-bar">
                                        {filePreview ? (
                                            <div className="img-preview-container">
                                                <img src={filePreview} alt="preview" />
                                                <button type="button" className="remove-preview" onClick={removeSelectedFile}>
                                                    <IoClose />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="file-preview-container">
                                                <IoDocumentTextOutline className="fs-3" />
                                                <span className="ms-2 text-truncate" style={{ maxWidth: "150px" }}>
                                                    {selectedFile.name}
                                                </span>
                                                <button type="button" className="remove-preview" onClick={removeSelectedFile}>
                                                    <IoClose />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="chat-input-row">
                                    <div className="chat-input-wrap">
                                        <input
                                            type="text"
                                            className="chat-input"
                                            placeholder={selectedFile ? "Add a caption..." : "Type your message..."}
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            disabled={sending}
                                        />

                                        <input
                                            type="file"
                                            hidden
                                            ref={fileInputRef}
                                            onChange={handleFileSelect}
                                            accept="image/*,.pdf,.doc,.docx,.txt"
                                        />

                                        <button
                                            type="button"
                                            className="attach-btn"
                                            title="Attach file"
                                            onClick={() => fileInputRef.current.click()}
                                            disabled={sending}
                                        >
                                            <IoAttach />
                                        </button>
                                    </div>

                                    <button
                                        type="submit"
                                        className="send-btn"
                                        disabled={sending || (!newMessage.trim() && !selectedFile)}
                                    >
                                        {sending ? (
                                            <div className="spinner-border spinner-border-sm" role="status"></div>
                                        ) : (
                                            <IoSend />
                                        )}
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="chat-empty">
                            <div className="chat-empty-icon">
                                <IoChatbubblesOutline />
                            </div>
                            <h3>Select a conversation to start chatting</h3>
                            <p>All your customization requests will appear here</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
