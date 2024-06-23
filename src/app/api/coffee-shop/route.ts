import connect from "@/lib/db";
import CoffeeShop from "@/lib/models/coffeeShop";
import User from "@/lib/models/user";
import { Types } from "mongoose";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const coffeeShops = CoffeeShop.find().populate("owner");
    return new NextResponse(JSON.stringify(coffeeShops), { status: 200 });
  } catch (error: any) {
    return new NextResponse("Error in fetching coffee shop " + error, {
      status: 500,
    });
  }
}

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId || !Types.ObjectId.isValid(userId)) {
      return new NextResponse(JSON.stringify({ message: "Invalid user" }), {
        status: 400,
      });
    }

    await connect();

    const user = User.findById(userId);
    if (!user) {
      return new NextResponse(
        JSON.stringify({ message: "User does not exist" }),
        { status: 400 }
      );
    }

    const body = await req.json();
    const { title, bio, description, images } = body;

    const newCoffeeShop = new CoffeeShop({
      title,
      bio,
      description,
      images,
      owner: new Types.ObjectId(userId),
    });

    await newCoffeeShop.save();

    return new NextResponse(
      JSON.stringify({
        message: "Coffee shop is created",
        coffeeShop: newCoffeeShop,
      }),
      {
        status: 201,
      }
    );
  } catch (error: any) {
    return new NextResponse("Error in creating coffee shop " + error, {
      status: 500,
    });
  }
}
