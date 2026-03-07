import { getUserId } from "@/app/utils/roles";
import connect from "@/lib/db";
import CoffeePreference from "@/lib/models/coffeePreference";
import Swipe from "@/lib/models/swipe";
import User from "@/lib/models/user";
import { NextResponse } from "next/server";

// GET /api/discover — returns ranked list of potential matches
export async function GET() {
    try {
        const userId = getUserId();
        if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        await connect();

        const me: any = await User.findById(userId).lean();
        if (!me) return NextResponse.json({ message: "User not found" }, { status: 404 });

        const myPref: any = await CoffeePreference.findOne({ user: userId }).lean();

        // Get IDs I've already swiped on (like OR pass)
        const swipedDocs = await Swipe.find({ fromUser: userId }, "toUser").lean();
        const swipedIds = swipedDocs.map((s: any) => s.toUser.toString());

        // Fetch candidates: exclude myself + already swiped
        // Note: we do NOT hard-filter by isProfileComplete so new users are still visible
        const candidates: any[] = await User.find({
            _id: { $ne: userId, $nin: swipedIds },
        })
            .select("_id firstName lastName photo bio gender lookingFor hobbies isOpenToMeet lastActiveAt profilePhotos dateOfBirth")
            .lean();

        // Fetch all their preferences in one query
        const candidateIds = candidates.map((c) => c._id);
        const prefs: any[] = await CoffeePreference.find({ user: { $in: candidateIds } }).lean();
        const prefMap = new Map(prefs.map((p) => [p.user.toString(), p]));

        // ── Match Scoring ──────────────────────────────────────────────────────
        const scored = candidates.map((candidate) => {
            const theirPref = prefMap.get(candidate._id.toString());
            let score = 0;
            const commonDrinks: string[] = [];

            if (myPref && theirPref) {
                // +20 each shared favorite drink
                const myDrinks = new Set<string>(myPref.favoriteDrinks ?? []);
                (theirPref.favoriteDrinks ?? []).forEach((d: string) => {
                    if (myDrinks.has(d)) { score += 20; commonDrinks.push(d); }
                });

                // +15 same roast level
                if (myPref.roastLevel && myPref.roastLevel === theirPref.roastLevel) score += 15;

                // +15 shared brew methods
                const myBrews = new Set<string>(myPref.brewMethods ?? []);
                (theirPref.brewMethods ?? []).forEach((b: string) => {
                    if (myBrews.has(b)) score += 15;
                });

                // +10 same preferred time
                if (myPref.preferredTime && myPref.preferredTime === theirPref.preferredTime) score += 10;

                // +5 same visit frequency
                if (myPref.visitFrequency && myPref.visitFrequency === theirPref.visitFrequency) score += 5;
            }

            // +10 each shared hobby
            const myHobbies = new Set<string>(me.hobbies ?? []);
            (candidate.hobbies ?? []).forEach((h: string) => {
                if (myHobbies.has(h)) score += 10;
            });

            // +10 same looking-for intent
            if (me.lookingFor && me.lookingFor === candidate.lookingFor) score += 10;

            // +25 bonus — currently open to meet
            if (candidate.isOpenToMeet) score += 25;

            return {
                user: candidate,
                preference: theirPref ?? null,
                matchScore: Math.min(score, 100),
                commonDrinks,
            };
        });

        // Sort by match score descending
        scored.sort((a, b) => b.matchScore - a.matchScore);

        return NextResponse.json({ candidates: scored }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: "Error: " + error.message }, { status: 500 });
    }
}
