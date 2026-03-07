// server.js — Custom Next.js server with Socket.io WebSocket support
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const httpServer = createServer((req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
    });

    // ── Socket.io setup ──────────────────────────────────────────────
    const io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket) => {
        console.log(`[Socket.io] Client connected: ${socket.id}`);

        // Join a conversation room
        socket.on("join-conversation", (conversationId) => {
            socket.join(conversationId);
            console.log(`[Socket.io] ${socket.id} joined room: ${conversationId}`);
        });

        // Leave a conversation room
        socket.on("leave-conversation", (conversationId) => {
            socket.leave(conversationId);
        });

        // Broadcast a new message to everyone in the conversation room
        // The message is saved to the DB via the HTTP API first, then emitted here
        socket.on("send-message", (data) => {
            // Broadcast to all OTHER clients in the room (not the sender)
            socket.to(data.conversationId).emit("new-message", data);
        });

        // Typing indicator
        socket.on("typing", ({ conversationId, userId, isTyping }) => {
            socket.to(conversationId).emit("typing", { userId, isTyping });
        });

        socket.on("disconnect", () => {
            console.log(`[Socket.io] Client disconnected: ${socket.id}`);
        });
    });

    // Make `io` accessible to Next.js API routes via global
    global.io = io;

    httpServer.listen(3000, () => {
        console.log(`> Ready on http://localhost:3000`);
    });
});
