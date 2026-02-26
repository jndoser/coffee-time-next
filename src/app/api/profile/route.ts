import { getUserId } from "@/app/utils/roles";
import connect from "@/lib/db";
import User from "@/lib/models/user";
import CoffeePreference from "@/lib/models/coffeePreference";
import { NextResponse } from "next/server";

// GET /api/profile — fetch current user's dating profile
export async function GET() {
    try {
        const userId = getUserId();
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connect();

        const user = await User.findById(userId).lean();
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

// PUT /api/profile — update current user's dating profile
export async function PUT(req: Request) {
    try {
        const userId = getUserId();
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connect();

        const body = await req.json();
        const {
            bio,
            dateOfBirth,
            gender,
            lookingFor,
            hobbies,
            favoriteQuote,
            profilePhotos,
            isOpenToMeet,
        } = body;

        // Check if enough fields are filled to mark profile as complete
        const isProfileComplete = Boolean(bio && gender && lookingFor && hobbies?.length > 0);

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    bio,
                    dateOfBirth,
                    gender,
                    lookingFor,
                    hobbies,
                    favoriteQuote,
                    profilePhotos,
                    isOpenToMeet,
                    isProfileComplete,
                    lastActiveAt: new Date(),
                },
            },
            { new: true }
        );

        return NextResponse.json(
            { message: "Profile updated", user: updatedUser },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { message: "Error updating profile: " + error.message },
            { status: 500 }
        );
    }
}
