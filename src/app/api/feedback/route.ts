import connect from "@/lib/db";
import CoffeeShop from "@/lib/models/coffeeShop";
import Feedback from "@/lib/models/feedback";
import User from "@/lib/models/user";
import { Types } from "mongoose";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const coffeeShopId = searchParams.get("coffeeShopId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "3");
    const searchKeywords = searchParams.get("searchKeywords") as string;
    const isHide = searchParams.get("isHide");

    if (!coffeeShopId || !Types.ObjectId.isValid(coffeeShopId)) {
      return NextResponse.json(
        { message: "coffeeShopId is empty or invalid" },
        { status: 400 }
      );
    }

    await connect();
    const coffeeShop = CoffeeShop.findById(coffeeShopId);

    if (!coffeeShop) {
      return NextResponse.json(
        { message: "Coffee Shop does exist" },
        { status: 400 }
      );
    }

    let filter: any = {};
    filter.coffeeShop = coffeeShopId;
    filter.isHide = isHide;

    if (searchKeywords) {
      filter.$or = [
        {
          description: { $regex: searchKeywords, $options: "i" },
        },
      ];
    }

    const skip = (page - 1) * limit;

    const feedbacks = await Feedback.find(filter)
      .sort({
        createdAt: "desc",
      })
      .skip(skip)
      .limit(limit)
      .populate("owner");

    const totalCount = await Feedback.countDocuments(filter);
    return NextResponse.json({ feedbacks, totalCount }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Error while fetching feedback " + error },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const coffeeShopId = searchParams.get("coffeeShopId");
    const userId = searchParams.get("userId");

    if (!coffeeShopId || !Types.ObjectId.isValid(coffeeShopId)) {
      return NextResponse.json(
        { message: "coffeeShopId is empty or invalid" },
        { status: 400 }
      );
    }

    if (!userId || !Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { message: "userId is empty or invalid" },
        { status: 400 }
      );
    }

    await connect();
    const coffeeShop = CoffeeShop.findById(coffeeShopId);

    if (!coffeeShop) {
      return NextResponse.json(
        { message: "Coffee Shop does not exist" },
        { status: 400 }
      );
    }

    const user = User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { message: "User does not exist" },
        { status: 400 }
      );
    }

    const { description, numberOfUpvote, numberOfDownvote } = await req.json();

    const newFeedback = new Feedback({
      description,
      numberOfUpvote,
      numberOfDownvote,
      owner: userId,
      coffeeShop: coffeeShopId,
      isHide: false,
    });

    await newFeedback.save();

    return NextResponse.json(
      {
        message: "Feedback is created",
        feedback: newFeedback,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Error while creating feedback " + error },
      { status: 500 }
    );
  }
}
