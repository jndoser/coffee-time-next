import { getUserId } from "@/app/utils/roles";
import connect from "@/lib/db";
import Conversation from "@/lib/models/conversation";
import Message from "@/lib/models/message";
import User from "@/lib/models/user";
import { NextResponse } from "next/server";

type Params = { params: { conversationId: string } };

// GET /api/conversations/[conversationId]/messages — paginated message history
export async function GET(req: Request, { params }: Params) {
    try {
        const userId = getUserId();
        if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get("limit") ?? "50");
        const before = searchParams.get("before"); // cursor-based pagination

        await connect();

        // Ensure user is a participant
        const convo = await Conversation.findOne({ _id: params.conversationId, participants: userId });
        if (!convo) return NextResponse.json({ message: "Not found" }, { status: 404 });

        const query: any = { conversation: params.conversationId };
        if (before) query.createdAt = { $lt: new Date(before) };

        const messages = await Message.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate("sender", "firstName lastName photo")
            .lean();

        // Mark as read — reset unread count for current user
        await Conversation.findByIdAndUpdate(params.conversationId, {
            $set: { [`unreadCount.${userId}`]: 0 },
        });

        return NextResponse.json({ messages: messages.reverse() }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: "Error: " + error.message }, { status: 500 });
    }
}

// POST /api/conversations/[conversationId]/messages — send a message
export async function POST(req: Request, { params }: Params) {
    try {
        const userId = getUserId();
        if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        await connect();

        const convo = await Conversation.findOne({ _id: params.conversationId, participants: userId });
        if (!convo) return NextResponse.json({ message: "Not found" }, { status: 404 });

        const { content, type = "text" } = await req.json();
        if (!content?.trim()) return NextResponse.json({ message: "Content required" }, { status: 400 });

        const sender = await User.findById(userId).select("firstName lastName photo").lean();

        // Save message
        const message = await Message.create({
            conversation: params.conversationId,
            sender: userId,
            content,
            type,
            readBy: [userId],
        });

        const populatedMessage = { ...message.toObject(), sender };

        // Update conversation's lastMessage + increment unread for the OTHER participant
        const otherParticipant = convo.participants.find(
            (p: any) => p.toString() !== userId
        );
        await Conversation.findByIdAndUpdate(params.conversationId, {
            $set: {
                lastMessage: { content, sender: userId, sentAt: new Date(), type },
                updatedAt: new Date(),
            },
            $inc: { [`unreadCount.${otherParticipant}`]: 1 },
        });

        // Emit via Socket.io to the conversation room (if server is available)
        if (global.io) {
            global.io.to(params.conversationId).emit("new-message", populatedMessage);
        }

        return NextResponse.json({ message: populatedMessage }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: "Error: " + error.message }, { status: 500 });
    }
}
