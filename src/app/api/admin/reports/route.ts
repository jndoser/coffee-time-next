import connect from "@/lib/db";
import Report from "@/lib/models/report";
import { NextResponse } from "next/server";

// GET /api/admin/reports — list all reports for admin review
export async function GET() {
    try {
        await connect();
        const reports = await Report.find()
            .sort({ createdAt: -1 })
            .populate("reporter", "firstName lastName photo email")
            .populate("reported", "firstName lastName photo email")
            .lean();

        return NextResponse.json({ reports }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: "Error: " + error.message }, { status: 500 });
    }
}

// PATCH /api/admin/reports — update report status
export async function PATCH(req: Request) {
    try {
        await connect();
        const { reportId, status } = await req.json();
        if (!reportId || !["reviewed", "dismissed"].includes(status)) {
            return NextResponse.json({ message: "reportId and valid status required" }, { status: 400 });
        }

        const report = await Report.findByIdAndUpdate(
            reportId,
            { $set: { status } },
            { new: true }
        ).lean();

        return NextResponse.json({ report }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: "Error: " + error.message }, { status: 500 });
    }
}
