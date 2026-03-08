import { getUserId } from "@/app/utils/roles";
import connect from "@/lib/db";
import Conversation from "@/lib/models/conversation";
import Message from "@/lib/models/message";
import User from "@/lib/models/user";
import { NextResponse } from "next/server";

type Params = { params: { conversationId: string } };

// POST /api/conversations/[conversationId]/coffee-invite — send a coffee date invite
export async function POST(req: Request, { params }: Params) {
    try {
        const userId = getUserId();
        if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        await connect();

        const convo = await Conversation.findOne({ _id: params.conversationId, participants: userId });
        if (!convo) return NextResponse.json({ message: "Not found" }, { status: 404 });

        const { coffeeShopId, shopName, proposedTime } = await req.json();
        if (!shopName || !proposedTime) {
            return NextResponse.json({ message: "shopName and proposedTime are required" }, { status: 400 });
        }

        const sender = await User.findById(userId).select("firstName lastName photo").lean();

        const message = await Message.create({
            conversation: params.conversationId,
            sender: userId,
            content: `☕ Coffee date invite at ${shopName}`,
            type: "coffee-invite",
            coffeeInvite: {
                coffeeShop: coffeeShopId || undefined,
                shopName,
                proposedTime: new Date(proposedTime),
                status: "pending",
            },
            readBy: [userId],
        });

        const populatedMessage = { ...message.toObject(), sender };

        // Update conversation last message
        const otherParticipant = convo.participants.find((p: any) => p.toString() !== userId);
        await Conversation.findByIdAndUpdate(params.conversationId, {
            $set: {
                lastMessage: {
                    content: `☕ Coffee date invite at ${shopName}`,
                    sender: userId,
                    sentAt: new Date(),
                    type: "coffee-invite",
                },
                updatedAt: new Date(),
            },
            $inc: { [`unreadCount.${otherParticipant}`]: 1 },
        });

        // Emit via Socket.io
        if (global.io) {
            global.io.to(params.conversationId).emit("new-message", populatedMessage);
        }

        return NextResponse.json({ message: populatedMessage }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: "Error: " + error.message }, { status: 500 });
    }
}

// PATCH /api/conversations/[conversationId]/coffee-invite — accept or decline
export async function PATCH(req: Request, { params }: Params) {
    try {
        const userId = getUserId();
        if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        await connect();

        const { messageId, status } = await req.json();
        if (!messageId || !["accepted", "declined"].includes(status)) {
            return NextResponse.json({ message: "messageId and status (accepted|declined) required" }, { status: 400 });
        }

        // Only the RECIPIENT (not the sender) can accept/decline
        const message = await Message.findOne({
            _id: messageId,
            conversation: params.conversationId,
            "sender": { $ne: userId }, // not the sender
        });
        if (!message) return NextResponse.json({ message: "Not found or not authorized" }, { status: 404 });

        message.coffeeInvite.status = status;
        await message.save();

        const updatedMessage = await Message.findById(messageId)
            .populate("sender", "firstName lastName photo")
            .lean();

        // Emit status update via Socket.io
        if (global.io) {
            global.io.to(params.conversationId).emit("invite-updated", updatedMessage);
        }

        return NextResponse.json({ message: updatedMessage }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: "Error: " + error.message }, { status: 500 });
    }
}
