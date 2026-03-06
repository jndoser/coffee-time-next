import { getUserId } from "@/app/utils/roles";
import connect from "@/lib/db";
import Checkin from "@/lib/models/checkin";
import User from "@/lib/models/user";
import { NextResponse } from "next/server";

// GET /api/checkin — fetch my current active check-in
export async function GET() {
    try {
        const userId = getUserId();
        if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        await connect();
        const dbUser: any = await User.findById(userId).lean();
        if (!dbUser) return NextResponse.json({ message: "User not found" }, { status: 404 });

        const now = new Date();
        const checkin = await Checkin.findOne({
            user: dbUser._id,
            expiresAt: { $gt: now },
        })
            .populate("coffeeShop", "title address")
            .lean();

        return NextResponse.json({ checkin }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: "Error: " + error.message }, { status: 500 });
    }
}

// POST /api/checkin — check in at a coffee shop (or update existing)
export async function POST(req: Request) {
    try {
        const userId = getUserId();
        if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        await connect();
        const dbUser: any = await User.findById(userId).lean();
        if (!dbUser) return NextResponse.json({ message: "User not found" }, { status: 404 });

        const { coffeeShopId, isOpenToMeet } = await req.json();
        if (!coffeeShopId) {
            return NextResponse.json({ message: "coffeeShopId is required" }, { status: 400 });
        }

        const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now

        // Upsert: one active check-in per user per shop
        const checkin = await Checkin.findOneAndUpdate(
            { user: dbUser._id, coffeeShop: coffeeShopId },
            {
                $set: {
                    user: dbUser._id,
                    coffeeShop: coffeeShopId,
                    isOpenToMeet: !!isOpenToMeet,
                    checkedInAt: new Date(),
                    expiresAt,
                },
            },
            { new: true, upsert: true }
        );

        // Also update the global isOpenToMeet flag on the user
        await User.findByIdAndUpdate(dbUser._id, { isOpenToMeet: !!isOpenToMeet });

        return NextResponse.json({ message: "Checked in!", checkin }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: "Error: " + error.message }, { status: 500 });
    }
}

// DELETE /api/checkin — check out (remove active check-in)
export async function DELETE(req: Request) {
    try {
        const userId = getUserId();
        if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        await connect();
        const dbUser: any = await User.findById(userId).lean();
        if (!dbUser) return NextResponse.json({ message: "User not found" }, { status: 404 });

        const { coffeeShopId } = await req.json();
        await Checkin.findOneAndDelete({ user: dbUser._id, coffeeShop: coffeeShopId });
        await User.findByIdAndUpdate(dbUser._id, { isOpenToMeet: false });

        return NextResponse.json({ message: "Checked out!" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: "Error: " + error.message }, { status: 500 });
    }
}
