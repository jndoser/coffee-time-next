import { getUserId } from "@/app/utils/roles";
import connect from "@/lib/db";
import User from "@/lib/models/user";
import CoffeePreference from "@/lib/models/coffeePreference";
import { Types } from "mongoose";
import { NextResponse } from "next/server";

// GET /api/profile/[userId] — fetch a specific user's public profile
export async function GET(
    _req: Request,
    { params }: { params: { userId: string } }
) {
    try {
        const loggedInUserId = getUserId();
        if (!loggedInUserId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { userId } = params;

        if (!Types.ObjectId.isValid(userId)) {
            return NextResponse.json({ message: "Invalid userId" }, { status: 400 });
        }

        await connect();

        const user = await User.findById(userId)
            .select(
                "firstName lastName username photo bio gender lookingFor hobbies favoriteQuote profilePhotos isProfileComplete isOpenToMeet lastActiveAt"
            )
            .lean();

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const preference = await CoffeePreference.findOne({ user: userId }).lean();

        return NextResponse.json({ user, preference }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json(
            { message: "Error fetching profile: " + error.message },
            { status: 500 }
        );
    }
}
