import { getUserId } from "@/app/utils/roles";
import connect from "@/lib/db";
import Match from "@/lib/models/match";
import User from "@/lib/models/user";
import { NextResponse } from "next/server";

// GET /api/matches — get all current matches for the logged-in user
export async function GET() {
    try {
        const userId = getUserId();
        if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        await connect();

        const matches = await Match.find({
            $or: [{ userA: userId }, { userB: userId }],
        })
            .populate("userA", "firstName lastName photo bio isOpenToMeet lastActiveAt")
            .populate("userB", "firstName lastName photo bio isOpenToMeet lastActiveAt")
            .sort({ matchedAt: -1 })
            .lean();

        // Return each match with a "them" field pointing to the other user
        const formatted = matches.map((m: any) => {
            const them = m.userA._id.toString() === userId ? m.userB : m.userA;
            return {
                _id: m._id,
                them,
                matchScore: Math.min(m.matchScore ?? 0, 100),
                commonDrinks: m.commonDrinks,
                matchedAt: m.matchedAt,
            };
        });

        return NextResponse.json({ matches: formatted }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: "Error: " + error.message }, { status: 500 });
    }
}
