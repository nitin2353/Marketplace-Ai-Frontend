
import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL =
    import.meta.env.VITE_SOCKET_URL ||
    "http://localhost:3000";

export const useSocket = (token) => {
    const socketRef = useRef(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        if (!token) {
            setConnected(false);
            return;
        }

        const socket = io(SOCKET_URL, {
            autoConnect: false,
            transports: ["websocket"],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            auth: {
                token: token.startsWith("Bearer ")
                    ? token.slice(7)
                    : token,
            },
        });

        socketRef.current = socket;

        const handleConnect = () => {
            console.log("[Socket] Connected:", socket.id);
            setConnected(true);
        };

        const handleDisconnect = (reason) => {
            console.log("[Socket] Disconnected:", reason);
            setConnected(false);
        };

        const handleConnectError = (error) => {
            console.error("[Socket] Connection error:", error.message);
            setConnected(false);
        };

        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);
        socket.on("connect_error", handleConnectError);

        socket.connect();

        return () => {
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
            socket.off("connect_error", handleConnectError);
            socket.disconnect();

            if (socketRef.current === socket) {
                socketRef.current = null;
            }
        };
    }, [token]);

    const emit = useCallback((event, data, callback) => {
        if (!socketRef.current?.connected) {
            console.warn("[Socket] Not connected");
            return;
        }

        socketRef.current.emit(event, data, callback);
    }, []);

    const on = useCallback((event, callback) => {
        socketRef.current?.on(event, callback);

        return () => {
            socketRef.current?.off(event, callback);
        };
    }, []);

    const off = useCallback((event, callback) => {
        socketRef.current?.off(event, callback);
    }, []);

    return {
        socket: socketRef.current,
        connected,
        emit,
        on,
        off,
    };
};
