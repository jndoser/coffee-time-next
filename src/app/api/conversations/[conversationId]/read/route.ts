import { getUserId } from "@/app/utils/roles";
import connect from "@/lib/db";
import Conversation from "@/lib/models/conversation";
import { NextResponse } from "next/server";

type Params = { params: { conversationId: string } };

// PATCH /api/conversations/[conversationId]/read — mark conversation as read for current user
export async function PATCH(_req: Request, { params }: Params) {
    try {
        const userId = getUserId();
        if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        await connect();

        await Conversation.findOneAndUpdate(
            { _id: params.conversationId, participants: userId },
            { $set: { [`unreadCount.${userId}`]: 0 } }
        );

        return NextResponse.json({ message: "Marked as read" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: "Error: " + error.message }, { status: 500 });
    }
}
