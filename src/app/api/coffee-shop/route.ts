import connect from "@/lib/db";
import CoffeeShop from "@/lib/models/coffeeShop";
import User from "@/lib/models/user";
import { Types } from "mongoose";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "5");
    const searchKeywords = searchParams.get("searchKeywords") as string;

    await connect();

    const skip = (page - 1) * limit;

    let filter: any = {};
    if (searchKeywords) {
      filter.$or = [
        {
          title: { $regex: searchKeywords, $options: "i" },
        },
        { bio: { $regex: searchKeywords, $options: "i" } },
        { address: { $regex: searchKeywords, $options: "i" } },
        { description: { $regex: searchKeywords, $options: "i" } },
      ];
    }

    const coffeeShops = await CoffeeShop.find(filter)
      .skip(skip)
      .limit(limit)
      .populate("owner");

    const totalCount = await CoffeeShop.countDocuments(filter);

    return NextResponse.json({ coffeeShops, totalCount }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Error in fetching coffee shop " + error },
      {
        status: 500,
      }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId || !Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { message: "Invalid user" },
        {
          status: 400,
        }
      );
    }

    await connect();

    const user = User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { message: "User does not exist" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { title, address, bio, description, images } = body;

    const newCoffeeShop = new CoffeeShop({
      title,
      address,
      bio,
      description,
      images,
      owner: new Types.ObjectId(userId),
    });

    await newCoffeeShop.save();

    return NextResponse.json(
      {
        message: "Coffee shop is created",
        coffeeShop: newCoffeeShop,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Error in creating coffee shop " + error },
      {
        status: 500,
      }
    );
  }
}
