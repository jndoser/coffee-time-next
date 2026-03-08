import connect from "@/lib/db";
import CoffeeShop from "@/lib/models/coffeeShop";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    await connect();
    const { searchParams } = new URL(req.url);

    const locationStr = searchParams.get("location");
    const radiusStr = searchParams.get("radius");

    if (!locationStr) {
      return NextResponse.json({ message: "location is required" }, { status: 400 });
    }

    const [latStr, lngStr] = locationStr.split(",");
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const radiusM = parseInt(radiusStr || "1500", 10);

    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json([], { status: 200 }); // Prevent Mongo NaN crash if map hasn't loaded
    }

    // Mathematical bounding box instead of 2dsphere index (avoids MongoDB index errors for dirty legacy data)
    // 1 degree latitude is approx 111.32 km.
    const radiusLat = radiusM / 111320;
    const radiusLng = radiusM / (111320 * Math.cos(lat * Math.PI / 180));

    const nearbyShops = await CoffeeShop.find({
      latitude: { $gte: lat - radiusLat, $lte: lat + radiusLat },
      longitude: { $gte: lng - radiusLng, $lte: lng + radiusLng },
      isVerified: true
    })
      .limit(limit)
      .lean();

    // Map it to look similar for the frontend, but now we actually have Mongo IDs!
    const result = nearbyShops.map((shop: any) => ({
      _id: shop._id,
      location: { lat: shop.latitude, lng: shop.longitude },
      name: shop.title,
      address: shop.address,
      bio: shop.bio,
      images: shop.images,
    }));

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Error in getting nearby coffee shop: " + error },
      { status: 500 }
    );
  }
}
