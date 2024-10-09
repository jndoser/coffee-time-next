import axios from "axios";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const location = searchParams.get("location");
    const radius = searchParams.get("radius");

    const serializeLocation = location?.split(",").join("%2C");
    const requestUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${serializeLocation}&radius=${radius}&type=cafe&key=${process.env.NEXT_PUBLIC_MAPS_API_KEY}`;

    const response = await axios.get(requestUrl);
    const result = response.data.results.map((place: any) => ({
      location: {
        lat: place.geometry.location.lat as number,
        lng: place.geometry.location.lng as number,
      },
      name: place.name as string,
    }));

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Error in getting nearby coffee shop " + error },
      {
        status: 500,
      }
    );
  }
}
