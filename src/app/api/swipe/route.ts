import { getUserId } from "@/app/utils/roles";
import connect from "@/lib/db";
import CoffeePreference from "@/lib/models/coffeePreference";
import Conversation from "@/lib/models/conversation";
import Match from "@/lib/models/match";
import Swipe from "@/lib/models/swipe";
import User from "@/lib/models/user";
import { NextResponse } from "next/server";

// POST /api/swipe — record a like or pass
export async function POST(req: Request) {
    try {
        const userId = getUserId();
        if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        await connect();

        const me: any = await User.findById(userId).lean();
        if (!me) return NextResponse.json({ message: "User not found" }, { status: 404 });

        const { toUserId, action } = await req.json();
        if (!toUserId || !["like", "pass"].includes(action)) {
            return NextResponse.json({ message: "toUserId and action (like|pass) are required" }, { status: 400 });
        }
        if (toUserId === userId) {
            return NextResponse.json({ message: "Cannot swipe on yourself" }, { status: 400 });
        }

        // Upsert the swipe (idempotent in case of retry)
        await Swipe.findOneAndUpdate(
            { fromUser: userId, toUser: toUserId },
            { $set: { action } },
            { upsert: true }
        );

        // Check for mutual like → create Match
        let matched = false;
        if (action === "like") {
            const theirLike = await Swipe.findOne({
                fromUser: toUserId,
                toUser: userId,
                action: "like",
            }).lean();

            if (theirLike) {
                matched = true;

                // Calculate match score for storage
                const myPref: any = await CoffeePreference.findOne({ user: userId }).lean();
                const theirPref: any = await CoffeePreference.findOne({ user: toUserId }).lean();

                let matchScore = 0;
                const commonDrinks: string[] = [];

                if (myPref && theirPref) {
                    const myDrinks = new Set<string>(myPref.favoriteDrinks ?? []);
                    (theirPref.favoriteDrinks ?? []).forEach((d: string) => {
                        if (myDrinks.has(d)) { matchScore += 20; commonDrinks.push(d); }
                    });
                    if (myPref.roastLevel === theirPref.roastLevel) matchScore += 15;
                    const myBrews = new Set<string>(myPref.brewMethods ?? []);
                    (theirPref.brewMethods ?? []).forEach((b: string) => {
                        if (myBrews.has(b)) matchScore += 15;
                    });
                    if (myPref.preferredTime === theirPref.preferredTime) matchScore += 10;
                }

                const theirUser: any = await User.findById(toUserId).lean();
                const myHobbies = new Set<string>(me.hobbies ?? []);
                (theirUser?.hobbies ?? []).forEach((h: string) => {
                    if (myHobbies.has(h)) matchScore += 10;
                });
                if (me.lookingFor && me.lookingFor === theirUser?.lookingFor) matchScore += 10;

                // Store with canonical order (smaller ID first) to ensure uniqueness
                const [userA, userB] = [userId, toUserId].sort();
                await Match.findOneAndUpdate(
                    { userA, userB },
                    { $set: { userA, userB, matchScore: Math.min(matchScore, 100), commonDrinks, matchedAt: new Date() } },
                    { upsert: true }
                );

                // Auto-create conversation so matched users can chat immediately
                await Conversation.findOneAndUpdate(
                    { participants: { $all: [userId, toUserId], $size: 2 } },
                    { $setOnInsert: { participants: [userId, toUserId] } },
                    { upsert: true }
                );
            }
        }

        return NextResponse.json({ message: "Swipe recorded", matched }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: "Error: " + error.message }, { status: 500 });
    }
}
