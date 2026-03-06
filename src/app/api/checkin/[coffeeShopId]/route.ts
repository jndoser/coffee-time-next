import connect from "@/lib/db";
import Checkin from "@/lib/models/checkin";
import { NextResponse } from "next/server";

// GET /api/checkin/[coffeeShopId] — get active check-ins at a specific shop
export async function GET(
    _req: Request,
    { params }: { params: { coffeeShopId: string } }
) {
    try {
        const { coffeeShopId } = params;
        if (!coffeeShopId) {
            return NextResponse.json({ message: "coffeeShopId is required" }, { status: 400 });
        }

        await connect();

        const now = new Date();
        const checkins = await Checkin.find({
            coffeeShop: coffeeShopId,
            expiresAt: { $gt: now },
        })
            .populate("user", "firstName lastName photo username isOpenToMeet")
            .sort({ isOpenToMeet: -1, checkedInAt: -1 }) // open-to-meet first
            .lean();

        return NextResponse.json({ checkins }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: "Error: " + error.message }, { status: 500 });
    }
}
