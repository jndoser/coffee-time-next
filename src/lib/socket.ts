import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
    if (!socket) {
        socket = io(window.location.origin, { path: "/socket.io" });
    }
    return socket;
}

export function useSocket(conversationId: string | null) {
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        const s = getSocket();
        socketRef.current = s;

        if (conversationId) {
            s.emit("join-conversation", conversationId);
        }

        return () => {
            if (conversationId) {
                s.emit("leave-conversation", conversationId);
            }
        };
    }, [conversationId]);

    return socketRef.current ?? getSocket();
}
