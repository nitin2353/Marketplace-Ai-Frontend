import React, {
  useCallback, useEffect, useMemo, useRef, useState,
} from "react";
import { Badge, Col, Container, Form, Row } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import "./ChatPage.css";

// ── Config ─────────────────────────────────────────────────
const SOCKET_URL = import.meta.env.VITE_API_BASE_URL?.replace("/api/v1", "") || "http://localhost:3000";
const QUICK_EMOJI = ["👍", "❤️", "😂", "😮", "😢", "🙏", "🔥", "✅"];
const EMOJI_LIST = ["😊", "😂", "❤️", "👍", "🙌", "🔥", "✅", "📦", "🎨", "🤝", "💡", "📅", "🚀", "😮", "🙏", "👏"];

// ── Helpers ────────────────────────────────────────────────
const fmtTime = (iso) => {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
};

const fmtDate = (iso) => {
  const d = new Date(iso);
  const today = new Date();
  const yest = new Date(today); yest.setDate(yest.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yest.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const initials = (name = "") =>
  name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

// ── Avatar component ───────────────────────────────────────
const Avatar = ({ name, src, size = 30, className = "", style = {} }) => (
  <div
    className={`ch-msg-avatar ${className}`}
    style={{ width: size, height: size, fontSize: size * 0.3, ...style }}
  >
    {src ? <img src={src} alt={name} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} /> : initials(name)}
  </div>
);


export default function ChatPage() {
  const navigate = useNavigate();
  const location = useLocation();

  
  const currentUser = useMemo(() => ({
    userId: location.state?.userId || `user_${Date.now()}`,
    userName: location.state?.userName || "You",
    userAvatar: location.state?.userAvatar || "",
  }), [location.state]);

  // ── Socket ref ─────────────────────────────────────────
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  // ── UI State ───────────────────────────────────────────
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState({});   
  const [unread, setUnread] = useState({});  
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);

  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [showNewRoom, setShowNewRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");

  const [notification, setNotification] = useState(null);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const typingTimeout = useRef(null);
  const fileInputRef = useRef(null);

  // ── Initial default rooms ──────────────────────────────
  const DEFAULT_ROOMS = useMemo(() => [
    { id: "general", name: "📦 General Requirements", type: "group", lastMsg: "Welcome to the chat!" },
    { id: "design", name: "🎨 Design Discussion", type: "group", lastMsg: "" },
    { id: "customorders", name: "🛠️ Custom Orders", type: "group", lastMsg: "" },
  ], []);

  // ── Connect Socket ─────────────────────────────────────
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1200,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      toast.success("Connected to chat! 🟢", { duration: 2000 });
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("connect_error", () => {
      toast.error("Could not connect to chat server");
    });

    // ── Message events ──────────────────────────────────
    socket.on("messages:history", ({ roomId, messages: msgs }) => {
      setMessages(prev => ({ ...prev, [roomId]: msgs }));
    });

    socket.on("message:new", (msg) => {
      setMessages(prev => ({
        ...prev,
        [msg.roomId]: [...(prev[msg.roomId] || []), msg],
      }));

      // Update room last message
      setRooms(prev => prev.map(r =>
        r.id === msg.roomId ? { ...r, lastMsg: msg.text, lastTime: msg.timestamp } : r
      ));

      // Unread count for non-active room
      if (msg.senderId !== currentUser.userId) {
        setUnread(prev => ({
          ...prev,
          [msg.roomId]: activeRoom?.id === msg.roomId ? 0 : (prev[msg.roomId] || 0) + 1,
        }));

        // Show notification if in different room
        if (activeRoom?.id !== msg.roomId) {
          showNotification(msg.senderName, msg.text, msg.roomId);
        }
      }
    });

    socket.on("message:deleted", ({ messageId, updatedMsg, roomId }) => {
      setMessages(prev => ({
        ...prev,
        [roomId]: (prev[roomId] || []).map(m => m.id === messageId ? updatedMsg : m),
      }));
    });

    socket.on("message:reaction_update", ({ roomId, messageId, reactions }) => {
      setMessages(prev => ({
        ...prev,
        [roomId]: (prev[roomId] || []).map(m =>
          m.id === messageId ? { ...m, reactions } : m
        ),
      }));
    });

    socket.on("message:read_update", ({ messageIds, userId, roomId }) => {
      setMessages(prev => ({
        ...prev,
        [roomId]: (prev[roomId] || []).map(m =>
          messageIds.includes(m.id) && !m.readBy.includes(userId)
            ? { ...m, readBy: [...m.readBy, userId] }
            : m
        ),
      }));
    });

    // ── Typing ──────────────────────────────────────────
    socket.on("typing:update", ({ typingUsers: tu }) => {
      setTypingUsers(tu.filter(u => u.userId !== currentUser.userId));
    });

    // ── Room / user events ──────────────────────────────
    socket.on("room:online_users", (users) => {
      setOnlineUsers(users.filter(u => u.userId !== currentUser.userId));
    });

    socket.on("room:created", (room) => {
      setRooms(prev => [...prev, room]);
    });

    socket.on("user:joined", ({ userName }) => {
      if (userName !== currentUser.userName) {
        toast(`${userName} joined the room`, { icon: "👋", duration: 2000 });
      }
    });

    socket.on("user:left", ({ userName }) => {
      if (userName !== currentUser.userName) {
        toast(`${userName} left the room`, { icon: "👋", duration: 2000 });
      }
    });

    return () => socket.disconnect();
  }, []); // eslint-disable-line

  // ── Init rooms ─────────────────────────────────────────
  useEffect(() => {
    setRooms(DEFAULT_ROOMS);
    // Auto-join first room
    joinRoom(DEFAULT_ROOMS[0]);
  }, []); // eslint-disable-line

  // ── Auto scroll ────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeRoom]);

  // ── Mark messages as read ──────────────────────────────
  useEffect(() => {
    if (!activeRoom) return;
    setUnread(prev => ({ ...prev, [activeRoom.id]: 0 }));
    const unreadMsgIds = (messages[activeRoom.id] || [])
      .filter(m => !m.readBy?.includes(currentUser.userId))
      .map(m => m.id);
    if (unreadMsgIds.length > 0) {
      socketRef.current?.emit("message:read", {
        roomId: activeRoom.id,
        messageIds: unreadMsgIds,
        userId: currentUser.userId,
      });
    }
  }, [activeRoom, messages]); // eslint-disable-line

  // ── Join room ──────────────────────────────────────────
  const joinRoom = useCallback((room) => {
    if (activeRoom?.id === room.id) return;

    socketRef.current?.emit("room:join", {
      roomId: room.id,
      userId: currentUser.userId,
      userName: currentUser.userName,
      userAvatar: currentUser.userAvatar,
    });

    setActiveRoom(room);
    setTypingUsers([]);
    setShowEmoji(false);
    setSidebarOpen(false);

    // Init message array if empty
    setMessages(prev => ({ ...prev, [room.id]: prev[room.id] || [] }));
  }, [activeRoom, currentUser]);

  // ── Send message ───────────────────────────────────────
  const sendMessage = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || !activeRoom) return;

    socketRef.current?.emit("message:send", {
      roomId: activeRoom.id,
      senderId: currentUser.userId,
      senderName: currentUser.userName,
      senderAvatar: currentUser.userAvatar,
      text: trimmed,
      type: "text",
    });

    setText("");
    setShowEmoji(false);
    textareaRef.current?.focus();

    // Stop typing
    socketRef.current?.emit("typing:stop", {
      roomId: activeRoom.id,
      userId: currentUser.userId,
    });
    clearTimeout(typingTimeout.current);
  }, [text, activeRoom, currentUser]);

  // ── Handle key press ───────────────────────────────────
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── Typing indicator ───────────────────────────────────
  const handleTextChange = (e) => {
    setText(e.target.value);
    if (!activeRoom) return;

    socketRef.current?.emit("typing:start", {
      roomId: activeRoom.id,
      userId: currentUser.userId,
      userName: currentUser.userName,
    });

    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socketRef.current?.emit("typing:stop", {
        roomId: activeRoom.id,
        userId: currentUser.userId,
      });
    }, 1500);
  };

  // ── React to message ───────────────────────────────────
  const reactToMessage = useCallback((messageId, emoji) => {
    if (!activeRoom) return;
    socketRef.current?.emit("message:react", {
      roomId: activeRoom.id,
      messageId,
      userId: currentUser.userId,
      userName: currentUser.userName,
      emoji,
    });
  }, [activeRoom, currentUser]);

  // ── Delete message ─────────────────────────────────────
  const deleteMessage = useCallback((messageId) => {
    if (!activeRoom) return;
    socketRef.current?.emit("message:delete", {
      roomId: activeRoom.id,
      messageId,
      userId: currentUser.userId,
    });
  }, [activeRoom, currentUser]);

  // ── Create new room ────────────────────────────────────
  const createRoom = async () => {
    if (!newRoomName.trim()) return;
    try {
      const res = await fetch(`${SOCKET_URL}/api/rooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newRoomName.trim(), type: "group" }),
      });
      const room = await res.json();
      setRooms(prev => [...prev, room]);
      setNewRoomName("");
      setShowNewRoom(false);
      joinRoom(room);
      toast.success(`Room "${room.name}" created!`);
    } catch {
      toast.error("Could not create room");
    }
  };

  // ── In-app notification ────────────────────────────────
  const showNotification = (name, msg, roomId) => {
    setNotification({ name, msg, roomId });
    setTimeout(() => setNotification(null), 4000);
  };

  // ── Image upload (base64 preview) ─────────────────────
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !activeRoom) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File must be under 5 MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      socketRef.current?.emit("message:send", {
        roomId: activeRoom.id,
        senderId: currentUser.userId,
        senderName: currentUser.userName,
        senderAvatar: currentUser.userAvatar,
        text: `📎 ${file.name}`,
        type: file.type.startsWith("image/") ? "image" : "file",
        fileUrl: reader.result,
        fileName: file.name,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // ── Group messages by date ─────────────────────────────
  const groupedMessages = useMemo(() => {
    const msgs = messages[activeRoom?.id] || [];
    const groups = [];
    let currentDate = null;

    msgs.forEach((msg, i) => {
      const d = fmtDate(msg.timestamp);
      if (d !== currentDate) {
        groups.push({ type: "date", label: d, key: `date_${i}` });
        currentDate = d;
      }
      const prev = msgs[i - 1];
      const consecutive = prev && prev.senderId === msg.senderId
        && new Date(msg.timestamp) - new Date(prev.timestamp) < 120000;
      groups.push({ type: "msg", msg, consecutive });
    });

    return groups;
  }, [messages, activeRoom]);

  // ═══════════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════════
  return (
    <div className="ch-page">

      {/* ── Top bar ── */}
      <div className="ch-topbar">
        <button className="ch-topbar-back" onClick={() => navigate(-1)}>←</button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="ch-topbar-title">💬 Requirement Chat</div>
          <div className="ch-topbar-sub">Discuss your product customisation needs</div>
        </div>

        <div className="ch-topbar-status">
          <span className={`ch-status-dot ${connected ? "online" : ""}`} />
          {connected ? "Online" : "Connecting..."}
        </div>

        {/* Mobile sidebar toggle */}
        <button
          className="ch-topbar-back d-lg-none"
          onClick={() => setSidebarOpen(v => !v)}
          style={{ marginLeft: 6 }}
        >☰</button>
      </div>

      {/* ── Layout ── */}
      <div className="ch-layout">

        {/* ── SIDEBAR ── */}
        <div className={`ch-sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="ch-sidebar-header">
            <div className="ch-sidebar-title">Rooms</div>
            <div className="ch-search-wrap">
              <span className="ch-search-icon">🔍</span>
              <input className="ch-search" placeholder="Search rooms..." readOnly />
            </div>
          </div>

          <div className="ch-room-list">
            {rooms.map(room => (
              <div
                key={room.id}
                className={`ch-room-item ${activeRoom?.id === room.id ? "active" : ""}`}
                onClick={() => joinRoom(room)}
              >
                <div className="ch-room-avatar">
                  {room.name.slice(0, 2)}
                  {onlineUsers.some(u => u.roomId === room.id) && (
                    <span className="ch-room-online-dot" />
                  )}
                </div>
                <div className="ch-room-info">
                  <div className="ch-room-name">{room.name}</div>
                  <div className="ch-room-last">
                    {room.lastMsg || "No messages yet"}
                  </div>
                </div>
                <div className="ch-room-meta">
                  {room.lastTime && (
                    <span className="ch-room-time">{fmtTime(room.lastTime)}</span>
                  )}
                  {unread[room.id] > 0 && (
                    <span className="ch-room-unread">{unread[room.id]}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            className="ch-new-room-btn"
            onClick={() => setShowNewRoom(true)}
          >
            + New Room
          </button>
        </div>

        {/* ── MAIN CHAT ── */}
        <div className="ch-main">
          {activeRoom ? (
            <>
              {/* Chat header */}
              <div className="ch-chat-header">
                <div className="ch-chat-header-avatar">
                  {activeRoom.name.slice(0, 2)}
                </div>
                <div>
                  <div className="ch-chat-header-name">{activeRoom.name}</div>
                  <div className="ch-chat-header-status">
                    {onlineUsers.length > 0
                      ? `${onlineUsers.length + 1} member${onlineUsers.length > 0 ? "s" : ""} online`
                      : "Just you"}
                  </div>
                </div>
                <div className="ch-chat-header-actions">
                  <button
                    className="ch-header-action-btn"
                    title="Go to Requirements"
                    onClick={() => navigate("/requirement")}
                  >📋</button>
                  <button
                    className="ch-header-action-btn"
                    title="Members"
                  >👥</button>
                </div>
              </div>

              {/* Messages */}
              <div className="ch-messages">
                {groupedMessages.length === 0 && (
                  <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10, opacity: 0.6 }}>
                    <div style={{ fontSize: "2.5rem" }}>💬</div>
                    <div style={{ fontWeight: 800, fontSize: "0.9rem", color: "var(--muted)" }}>
                      Be the first to send a message!
                    </div>
                  </div>
                )}

                {groupedMessages.map((item) => {
                  // Date separator
                  if (item.type === "date") {
                    return (
                      <div key={item.key} className="ch-date-sep">
                        <div className="ch-date-sep-line" />
                        <div className="ch-date-sep-label">{item.label}</div>
                        <div className="ch-date-sep-line" />
                      </div>
                    );
                  }

                  const { msg, consecutive } = item;
                  const isOwn = msg.senderId === currentUser.userId;
                  const isSystem = msg.type === "system";
                  const isDeleted = msg.type === "deleted";
                  const isSeen = msg.readBy?.length > 1;

                  if (isSystem) {
                    return (
                      <div key={msg.id} style={{ textAlign: "center" }}>
                        <span className="ch-bubble system">{msg.text}</span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={msg.id}
                      className={`ch-msg-row ${isOwn ? "own" : ""} ${consecutive ? "consecutive" : ""}`}
                    >
                      {/* Avatar */}
                      {!isOwn && (
                        consecutive
                          ? <div className="ch-msg-avatar-gap" />
                          : <Avatar name={msg.senderName} src={msg.senderAvatar} />
                      )}

                      {/* Bubble area */}
                      <div className="ch-bubble-wrap">
                        {!isOwn && !consecutive && (
                          <div className="ch-msg-sender">{msg.senderName}</div>
                        )}

                        {/* Message action buttons */}
                        <div className="ch-msg-actions">
                          {QUICK_EMOJI.map(e => (
                            <button
                              key={e}
                              className="ch-msg-action-btn"
                              onClick={() => reactToMessage(msg.id, e)}
                              title={`React ${e}`}
                            >{e}</button>
                          ))}
                          {isOwn && !isDeleted && (
                            <button
                              className="ch-msg-action-btn"
                              onClick={() => deleteMessage(msg.id)}
                              title="Delete"
                              style={{ color: "var(--danger)" }}
                            >🗑️</button>
                          )}
                        </div>

                        {/* Bubble */}
                        <div className={`ch-bubble ${isOwn ? "own" : "other"} ${isDeleted ? "deleted" : ""}`}>
                          {/* Image */}
                          {msg.type === "image" && msg.fileUrl && (
                            <img
                              src={msg.fileUrl}
                              alt={msg.fileName}
                              style={{ maxWidth: "220px", borderRadius: 10, display: "block", marginBottom: msg.text ? 6 : 0 }}
                            />
                          )}

                          {/* File */}
                          {msg.type === "file" && msg.fileUrl && (
                            <a
                              href={msg.fileUrl}
                              download={msg.fileName}
                              style={{ color: isOwn ? "#fff" : "var(--p)", fontWeight: 800, fontSize: "0.82rem", textDecoration: "none" }}
                            >
                              📎 {msg.fileName}
                            </a>
                          )}

                          {/* Text */}
                          {msg.text && (
                            <span style={{ whiteSpace: "pre-wrap" }}>{msg.text}</span>
                          )}
                        </div>

                        {/* Reactions */}
                        {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                          <div className="ch-reactions">
                            {Object.entries(msg.reactions).map(([emoji, userIds]) => (
                              <button
                                key={emoji}
                                className={`ch-reaction-chip ${userIds.includes(currentUser.userId) ? "reacted" : ""}`}
                                onClick={() => reactToMessage(msg.id, emoji)}
                              >
                                {emoji} <span>{userIds.length}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Meta */}
                        <div className="ch-msg-meta">
                          <span className="ch-msg-time">{fmtTime(msg.timestamp)}</span>
                          {isOwn && (
                            <span className={`ch-msg-read ${isSeen ? "seen" : ""}`}>
                              {isSeen ? "✓✓" : "✓"}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Own avatar */}
                      {isOwn && (
                        consecutive
                          ? <div className="ch-msg-avatar-gap" />
                          : <Avatar name={currentUser.userName} src={currentUser.userAvatar} />
                      )}
                    </div>
                  );
                })}

                <div ref={messagesEndRef} />
              </div>

              {/* Typing indicator */}
              <div className="ch-typing">
                {typingUsers.length > 0 && (
                  <>
                    <div className="ch-typing-dots">
                      <span className="ch-typing-dot" />
                      <span className="ch-typing-dot" />
                      <span className="ch-typing-dot" />
                    </div>
                    <span className="ch-typing-text">
                      {typingUsers.map(u => u.userName).join(", ")}
                      {typingUsers.length === 1 ? " is" : " are"} typing...
                    </span>
                  </>
                )}
              </div>

              {/* Emoji picker */}
              {showEmoji && (
                <div className="ch-emoji-picker">
                  {EMOJI_LIST.map(e => (
                    <button
                      key={e}
                      className="ch-emoji-btn"
                      onClick={() => { setText(t => t + e); textareaRef.current?.focus(); }}
                    >{e}</button>
                  ))}
                </div>
              )}

              {/* Input area */}
              <div className="ch-input-area">
                <div className="ch-input-row">
                  <div className="ch-input-actions">
                    <button
                      className={`ch-input-action ${showEmoji ? "active" : ""}`}
                      onClick={() => setShowEmoji(v => !v)}
                      title="Emoji"
                    >😊</button>
                    <button
                      className="ch-input-action"
                      onClick={() => fileInputRef.current?.click()}
                      title="Attach file"
                    >📎</button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf,.doc,.docx"
                      style={{ display: "none" }}
                      onChange={handleFileUpload}
                    />
                  </div>

                  <textarea
                    ref={textareaRef}
                    className="ch-textarea"
                    placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
                    value={text}
                    onChange={handleTextChange}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    style={{ height: "auto" }}
                    onInput={e => {
                      e.target.style.height = "auto";
                      e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                    }}
                  />

                  <button
                    className="ch-send-btn"
                    onClick={sendMessage}
                    disabled={!text.trim() || !connected}
                    title="Send message"
                  >➤</button>
                </div>
              </div>
            </>
          ) : (
            /* No room selected */
            <div className="ch-empty">
              <div className="ch-empty-icon">💬</div>
              <div className="ch-empty-title">Select a Room to Start</div>
              <div className="ch-empty-sub">Choose a room from the sidebar to begin your discussion</div>
            </div>
          )}
        </div>

        {/* ── ONLINE PANEL ── */}
        <div className="ch-online-panel">
          <div className="ch-online-title">
            🟢 Online Now
            <Badge bg="success" pill style={{ marginLeft: 8, fontSize: "0.65rem" }}>
              {onlineUsers.length + 1}
            </Badge>
          </div>

          {/* Self */}
          <div className="ch-online-item">
            <div className="ch-online-avatar">{initials(currentUser.userName)}</div>
            <div>
              <div className="ch-online-name">{currentUser.userName} (You)</div>
            </div>
          </div>

          {onlineUsers.map(u => (
            <div key={u.userId} className="ch-online-item">
              <div className="ch-online-avatar">{initials(u.userName)}</div>
              <div>
                <div className="ch-online-name">{u.userName}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── In-app Notification ── */}
      {notification && (
        <div
          className="ch-notif-banner"
          onClick={() => {
            const room = rooms.find(r => r.id === notification.roomId);
            if (room) joinRoom(room);
            setNotification(null);
          }}
          style={{ cursor: "pointer" }}
        >
          <span className="ch-notif-icon">💬</span>
          <div className="ch-notif-content">
            <div className="ch-notif-name">{notification.name}</div>
            <div className="ch-notif-msg">{notification.msg}</div>
          </div>
        </div>
      )}

      {/* ── New Room Modal ── */}
      {showNewRoom && (
        <div className="ch-modal-overlay" onClick={() => setShowNewRoom(false)}>
          <div className="ch-modal" onClick={e => e.stopPropagation()}>
            <div className="ch-modal-title">✨ Create New Room</div>
            <label className="ch-modal-label">Room Name</label>
            <input
              className="ch-modal-input"
              placeholder="e.g. 🎁 Gift Orders, 🖼️ Art Discussion..."
              value={newRoomName}
              onChange={e => setNewRoomName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && createRoom()}
              autoFocus
            />
            <div className="ch-modal-actions">
              <button className="ch-btn-ghost" onClick={() => setShowNewRoom(false)}>Cancel</button>
              <button className="ch-btn-primary" onClick={createRoom} disabled={!newRoomName.trim()}>
                Create Room
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}