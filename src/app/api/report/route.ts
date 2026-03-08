import { getUserId } from "@/app/utils/roles";
import connect from "@/lib/db";
import Report from "@/lib/models/report";
import { NextResponse } from "next/server";

// POST /api/report — report a user
export async function POST(req: Request) {
    try {
        const userId = getUserId();
        if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const { targetUserId, reason, details } = await req.json();
        if (!targetUserId || !reason) {
            return NextResponse.json({ message: "targetUserId and reason are required" }, { status: 400 });
        }
        if (targetUserId === userId) {
            return NextResponse.json({ message: "Cannot report yourself" }, { status: 400 });
        }

        await connect();
        const report = await Report.create({
            reporter: userId,
            reported: targetUserId,
            reason,
            details: details ?? "",
        });

        return NextResponse.json({ message: "Report submitted", report }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: "Error: " + error.message }, { status: 500 });
    }
}
