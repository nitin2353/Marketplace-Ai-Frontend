import { useEffect, useMemo, useState, useCallback } from "react";
import { Overlay, Popover } from "react-bootstrap";
import toast from "react-hot-toast";
import notificationApi from "../api/notification.api";
import JWTService from "../config/jwt.config";

// notification type meta
const getNotificationMeta = (type) => {
    switch (type) {
        case "order_placed":
            return { initials: "OP", bg: "#e0f2fe", color: "#0369a1" };
        case "order_confirmed":
            return { initials: "OC", bg: "#dcfce7", color: "#15803d" };
        case "order_shipped":
        case "order_status_update":
            return { initials: "OS", bg: "#fef9c3", color: "#a16207" };
        case "order_cancelled":
            return { initials: "OX", bg: "#fee2e2", color: "#b91c1c" };
        case "payment_successful":
        case "payment_received":
            return { initials: "PR", bg: "#f0fdf4", color: "#166534" };
        case "review_submitted":
            return { initials: "RS", bg: "#faf5ff", color: "#7e22ce" };
        case "review_received":
            return { initials: "RR", bg: "#fff7ed", color: "#c2410c" };
        case "new_order":
            return { initials: "NO", bg: "#ede7f6", color: "#534AB7" };
        case "low_stock":
        case "out_of_stock":
            return { initials: "LS", bg: "#fef2f2", color: "#dc2626" };
        default:
            return { initials: "NF", bg: "#f3f4f6", color: "#374151" };
    }
};

const formatTimeAgo = (dateString) => {
    if (!dateString) return "—";
    const now = new Date();
    const then = new Date(dateString);
    const diffMs = now - then;

    const mins = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins} min ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;

    return then.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};

function NotifItem({ notif, onRead, onDismiss, working, onUnreadChange }) {
    const [hovered, setHovered] = useState(false);
    const [unread, setUnread] = useState(false);

    useEffect(() => {
        onUnreadChange?.(unread);
    }, [unread, onUnreadChange]);

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => notif.unread && onRead(notif.id)}
            style={{
                display: "flex",
                gap: 10,
                padding: "12px 16px",
                borderBottom: "0.5px solid #f0f0f0",
                cursor: "pointer",
                position: "relative",
                background: hovered ? "#fafafa" : notif.unread ? "rgba(53, 90, 255, 0.04)" : "#fff",
                transition: "background .15s",
                opacity: working ? 0.7 : 1,
            }}
        >
            {notif.unread && (
                <div
                    style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 3,
                        background: "#356bffff",
                        borderRadius: "0 2px 2px 0",
                    }}
                />
            )}

            <div
                style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    flexShrink: 0,
                    background: notif.bg,
                    color: notif.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 600,
                }}
            >
                {notif.initials}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 600, color: "#1a1a2e" }}>
                    {notif.title}
                </p>
                <p style={{ margin: "0 0 4px", fontSize: 12, color: "#6b7280", lineHeight: 1.4 }}>
                    {notif.body}
                </p>
                <span style={{ fontSize: 11, color: "#9ca3af" }}>{notif.time}</span>
            </div>

            {notif.unread && (
                <div
                    style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: "#356bffff",
                        marginTop: 6,
                        flexShrink: 0,
                    }}
                />
            )}

            {hovered && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDismiss(notif.id);
                    }}
                    disabled={working}
                    style={{
                        position: "absolute",
                        right: 10,
                        top: 8,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#9ca3af",
                        fontSize: 13,
                        lineHeight: 1,
                        padding: 0,
                    }}
                >
                    ✕
                </button>
            )}
        </div>
    );
}

export default function NotificationPanel({
    mode = "user",
    onMarkAllRead,
    onViewAll,
    setRefreshNotify,
    refreshNotify
}) {
    const [notifs, setNotifs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [workingId, setWorkingId] = useState(null);

    const unread = useMemo(() => notifs.filter((n) => n.unread).length, [notifs]);

    const userData = JWTService.decodeTokenDetails();

    const entityId = userData?.id || userData?.user_id;

    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            const response = await notificationApi.getMyNotifications(1, 10);
            const rows = response?.data || [];

            const mapped = rows.map((n) => {
                const meta = getNotificationMeta(n.type);
                return {
                    id: n.id,
                    title: n.title,
                    body: n.body,
                    time: formatTimeAgo(n.created_at),
                    initials: meta.initials,
                    bg: meta.bg,
                    color: meta.color,
                    unread: !n.is_read,
                    type: n.type,
                };
            });

            setNotifs(mapped);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load notifications");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const markRead = async (id) => {
        try {
            setWorkingId(id);
            await notificationApi.markAsRead(id);

            setNotifs((prev) =>
                prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
            );
        } catch (error) {
            toast.error(error?.message || "Failed to mark notification as read");
        } finally {
            setWorkingId(null);
            setRefreshNotify(!refreshNotify)
        }
    };

    const dismiss = async (id) => {
        try {
            setWorkingId(id);
            await notificationApi.deleteNotification(id);

            setNotifs((prev) => prev.filter((n) => n.id !== id));
            toast.success("Notification removed");
        } catch (error) {
            toast.error(error?.message || "Failed to delete notification");
        } finally {
            setWorkingId(null);
            setRefreshNotify(!refreshNotify)
        }
    };

    const markAll = async () => {
        try {
            await notificationApi.markAllAsRead();

            setNotifs((prev) => prev.map((n) => ({ ...n, unread: false })));
            onMarkAllRead?.();
            setRefreshNotify(!refreshNotify)
            toast.success("All notifications marked as read");
        } catch (error) {
            toast.error(error?.message || "Failed to mark all as read");
        }
    };

    return (
        <div style={{ width: '100%', fontFamily: "Nunito, sans-serif", borderRadius: 12, overflow: "hidden" }}>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "13px 16px",
                    borderBottom: "0.5px solid #f0f0f0",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#1a1a2e" }}>
                        Notifications
                    </span>
                    {unread > 0 && (
                        <span
                            style={{
                                background: "#356bffff",
                                color: "#ffffffff",
                                fontSize: 11,
                                fontWeight: 700,
                                padding: "2px 7px",
                                borderRadius: 20,
                                lineHeight: 1.5,
                            }}
                        >
                            {unread}
                        </span>
                    )}
                </div>

                {unread > 0 && (
                    <button
                        onClick={markAll}
                        style={{
                            fontSize: 12,
                            color: "#356bffff",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: 0,
                            fontFamily: "Nunito, sans-serif",
                            fontWeight: 700,
                        }}
                    >
                        Mark all read
                    </button>
                )}
            </div>

            <div style={{ maxHeight: 340, overflowY: "auto" }}>
                {loading ? (
                    <div style={{ padding: "32px 16px", textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
                        Loading notifications...
                    </div>
                ) : notifs.length === 0 ? (
                    <div style={{ padding: "32px 16px", textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
                        <div style={{ fontSize: 28, marginBottom: 8 }}>🔔</div>
                        No notifications
                    </div>
                ) : (
                    notifs.map((n) => (
                        <NotifItem
                            key={n.id}
                            notif={n}
                            onRead={markRead}
                            onDismiss={dismiss}
                            working={workingId === n.id}
                        />
                    ))
                )}
            </div>

            <div
                style={{
                    padding: "10px 16px",
                    borderTop: "0.5px solid #f0f0f0",
                    textAlign: "center",
                    height: "20px"
                }}
            >

            </div>
        </div>
    );
}

