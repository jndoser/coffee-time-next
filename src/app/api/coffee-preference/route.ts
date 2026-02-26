import { getUserId } from "@/app/utils/roles";
import connect from "@/lib/db";
import CoffeePreference from "@/lib/models/coffeePreference";
import { NextResponse } from "next/server";

// GET /api/coffee-preference — fetch current user's coffee preference
export async function GET() {
    try {
        const userId = getUserId();
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connect();

        const preference = await CoffeePreference.findOne({ user: userId }).lean();

        return NextResponse.json({ preference }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json(
            { message: "Error fetching preferences: " + error.message },
            { status: 500 }
        );
    }
}

// POST/PUT /api/coffee-preference — create or update coffee preference (upsert)
export async function POST(req: Request) {
    try {
        const userId = getUserId();
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connect();

        const body = await req.json();
        const {
            favoriteDrinks,
            brewMethods,
            roastLevel,
            milkPreference,
            sugarLevel,
            visitFrequency,
            preferredTime,
        } = body;

        const preference = await CoffeePreference.findOneAndUpdate(
            { user: userId },
            {
                $set: {
                    user: userId,
                    favoriteDrinks,
                    brewMethods,
                    roastLevel,
                    milkPreference,
                    sugarLevel,
                    visitFrequency,
                    preferredTime,
                },
            },
            { new: true, upsert: true }
        );

        return NextResponse.json(
            { message: "Coffee preferences saved", preference },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { message: "Error saving preferences: " + error.message },
            { status: 500 }
        );
    }
}
