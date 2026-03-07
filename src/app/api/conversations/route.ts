import { getUserId } from "@/app/utils/roles";
import connect from "@/lib/db";
import Conversation from "@/lib/models/conversation";
import User from "@/lib/models/user";
import { NextResponse } from "next/server";

// GET /api/conversations — list all conversations for the logged-in user
export async function GET() {
    try {
        const userId = getUserId();
        if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        await connect();

        const conversations = await Conversation.find({ participants: userId })
            .populate("participants", "firstName lastName photo isOpenToMeet lastActiveAt")
            .populate("lastMessage.sender", "firstName")
            .sort({ updatedAt: -1 })
            .lean();

        // Shape the response: add "them" (the other participant) + unread count for current user
        const formatted = conversations.map((c: any) => {
            const them = c.participants.find((p: any) => p._id.toString() !== userId);
            const unread = c.unreadCount?.[userId] ?? 0;
            return {
                _id: c._id,
                them,
                lastMessage: c.lastMessage,
                unread,
                updatedAt: c.updatedAt,
            };
        });

        return NextResponse.json({ conversations: formatted }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: "Error: " + error.message }, { status: 500 });
    }
}

// POST /api/conversations — create or find conversation between two users
export async function POST(req: Request) {
    try {
        const userId = getUserId();
        if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const { otherUserId } = await req.json();
        if (!otherUserId) return NextResponse.json({ message: "otherUserId required" }, { status: 400 });

        await connect();

        // Find existing or create new
        let conversation = await Conversation.findOne({
            participants: { $all: [userId, otherUserId], $size: 2 },
        }).lean();

        if (!conversation) {
            conversation = await Conversation.create({ participants: [userId, otherUserId] });
        }

        return NextResponse.json({ conversation }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: "Error: " + error.message }, { status: 500 });
    }
}
