// ── useSocket.js  —  Custom React hook for Socket.io ─────────────────────
// Place in: src/hooks/useSocket.js

import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";

export const useSocket = () => {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current.on("connect", () => {
      console.log("[Socket] Connected:", socketRef.current.id);
      setConnected(true);
    });

    socketRef.current.on("disconnect", () => {
      console.log("[Socket] Disconnected");
      setConnected(false);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const emit   = useCallback((event, data) => socketRef.current?.emit(event, data), []);
  const on     = useCallback((event, cb)   => { socketRef.current?.on(event, cb); }, []);
  const off    = useCallback((event, cb)   => { socketRef.current?.off(event, cb); }, []);

  return { socket: socketRef.current, connected, emit, on, off };
};