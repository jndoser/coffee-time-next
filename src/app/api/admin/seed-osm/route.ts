import connect from "@/lib/db";
import CoffeeShop from "@/lib/models/coffeeShop";
import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: Request) {
    try {
        await connect();

        const { lat, lng, radiusKm = 2 } = await req.json();
        if (!lat || !lng) {
            return NextResponse.json({ message: "lat and lng are required" }, { status: 400 });
        }

        // Convert km to meters for Overpass API
        const radiusM = radiusKm * 1000;

        // Overpass Request: Find all nodes tagged amenity=cafe within a radius of a center point
        // [out:json] tells it to return JSON
        // node["amenity"="cafe"](around:radiusM, lat, lng)
        const query = `
            [out:json][timeout:25];
            (
              node["amenity"="cafe"](around:${radiusM}, ${lat}, ${lng});
            );
            out body;
            >;
            out skel qt;
        `;

        const overpassUrl = "https://overpass-api.de/api/interpreter";

        console.log(`Fetching from Overpass API: ${lat}, ${lng} radius ${radiusM}m...`);
        const response = await axios.post(overpassUrl, query, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "User-Agent": "CoffeeTimeApp/1.0 (hoanglongdev533@gmail.com)"
            },
        });

        const elements = response.data.elements || [];

        const shopsToProcess = elements
            .filter((el: any) => el.type === "node" && el.tags && el.tags.name) // MUST have a name
            .map((el: any) => {
                const title = el.tags.name;
                const formattedAddress = [
                    el.tags["addr:housenumber"],
                    el.tags["addr:street"],
                    el.tags["addr:city"]
                ].filter(Boolean).join(" ");

                const address = formattedAddress || title;
                const description = "A local coffee shop discovered automatically.";
                const bio = el.tags.opening_hours ? `Hours: ${el.tags.opening_hours}` : "Seeded from OpenStreetMap.";

                return {
                    title,
                    address,
                    description,
                    bio,
                    latitude: el.lat,
                    longitude: el.lon,
                    location: {
                        type: "Point",
                        coordinates: [el.lon, el.lat], // MongoDB 2dsphere requires Longitude BEFORE Latitude
                    },
                    osmId: el.id.toString(),
                    isVerified: true,  // Display them directly
                    isRejected: false,
                    isClaimed: false,  // For later: allows actual owners to claim the profile
                    images: [
                        {
                            name: "placeholder",
                            publicId: "placeholder",
                            url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=800", // Default fancy coffee img
                        }
                    ]
                };
            });

        console.log(`Found ${shopsToProcess.length} cafes in OSM! Processing...`);

        let insertedCount = 0;
        let skippedCount = 0;

        for (const shop of shopsToProcess) {
            try {
                // Check if osmId already exists to avoid duplicates
                const existing = await CoffeeShop.findOne({ osmId: shop.osmId });
                if (!existing) {
                    await CoffeeShop.create(shop);
                    insertedCount++;
                } else {
                    skippedCount++;
                }
            } catch (err) {
                console.error("Failed to insert shop:", shop.title, err);
            }
        }

        return NextResponse.json({
            message: `Successfully processed OSM seed. Inserted: ${insertedCount}. Skipped (already existed): ${skippedCount}.`,
            totalFoundInArea: shopsToProcess.length
        }, { status: 200 });

    } catch (error: any) {
        console.error("OSM Seed Error:", error);
        return NextResponse.json({ message: "Error running Overpass API: " + error.message }, { status: 500 });
    }
}
