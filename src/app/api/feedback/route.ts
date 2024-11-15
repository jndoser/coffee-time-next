import { getUserId } from "@/app/utils/roles";
import connect from "@/lib/db";
import CoffeeShop from "@/lib/models/coffeeShop";
import Feedback from "@/lib/models/feedback";
import User from "@/lib/models/user";
import { Types } from "mongoose";
import { NextResponse } from "next/server";

export interface FeedbacksPage {
  feedbacks: any[];
  nextCursor: string | null;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const coffeeShopId = searchParams.get("coffeeShopId");
    const limit = 5;
    const searchKeywords = searchParams.get("searchKeywords") as string;
    const isHide = searchParams.get("isHide");
    const cursor = searchParams.get("cursor");

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

    const queryOptions = cursor
      ? { ...filter, _id: { $lt: new Types.ObjectId(cursor) } }
      : filter;

    const feedbacks = await Feedback.find(queryOptions)
      .sort({
        createdAt: "desc",
      })
      .limit(limit + 1)
      .populate("owner");

    const hasNextPage = feedbacks.length > limit;
    const nextCursor = hasNextPage ? feedbacks[limit - 1]._id.toString() : null;

    const feedbackData = feedbacks.slice(0, limit);

    const response = {
      feedbacks: feedbackData,
      nextCursor,
    } as FeedbacksPage;

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Error while fetching feedback " + error },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { coffeeShopId, description, numberOfUpvote, numberOfDownvote } =
      await req.json();

    if (!coffeeShopId || !Types.ObjectId.isValid(coffeeShopId)) {
      return NextResponse.json(
        { message: "coffeeShopId is empty or invalid" },
        { status: 400 }
      );
    }

    const userId = getUserId();

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

    const newFeedback = new Feedback({
      description,
      numberOfUpvote,
      numberOfDownvote,
      owner: userId,
      coffeeShop: coffeeShopId,
      isHide: false,
    });

    await newFeedback.save();

    // Populate the owner field
    const populatedFeedback = await Feedback.findById(newFeedback._id).populate(
      "owner"
    );

    return NextResponse.json(populatedFeedback, { status: 201 });
  } catch (error: any) {
    console.log("error: ", error);
    return NextResponse.json(
      { message: "Error while creating feedback " + error },
      { status: 500 }
    );
  }
}
