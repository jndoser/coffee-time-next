import { getUserId } from "@/app/utils/roles";
import connect from "@/lib/db";
import Block from "@/lib/models/block";
import { NextResponse } from "next/server";

// GET /api/block — list IDs the current user has blocked
export async function GET() {
    try {
        const userId = getUserId();
        if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        await connect();
        const blocks = await Block.find({ blocker: userId }).select("blocked").lean();
        const blockedIds = blocks.map((b: any) => b.blocked.toString());

        return NextResponse.json({ blockedIds }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: "Error: " + error.message }, { status: 500 });
    }
}

// POST /api/block — block a user
export async function POST(req: Request) {
    try {
        const userId = getUserId();
        if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const { targetUserId } = await req.json();
        if (!targetUserId) return NextResponse.json({ message: "targetUserId required" }, { status: 400 });
        if (targetUserId === userId) return NextResponse.json({ message: "Cannot block yourself" }, { status: 400 });

        await connect();
        await Block.findOneAndUpdate(
            { blocker: userId, blocked: targetUserId },
            { blocker: userId, blocked: targetUserId },
            { upsert: true }
        );

        return NextResponse.json({ message: "User blocked" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: "Error: " + error.message }, { status: 500 });
    }
}

// DELETE /api/block — unblock a user
export async function DELETE(req: Request) {
    try {
        const userId = getUserId();
        if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const { targetUserId } = await req.json();
        if (!targetUserId) return NextResponse.json({ message: "targetUserId required" }, { status: 400 });

        await connect();
        await Block.findOneAndDelete({ blocker: userId, blocked: targetUserId });

        return NextResponse.json({ message: "User unblocked" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: "Error: " + error.message }, { status: 500 });
    }
}
