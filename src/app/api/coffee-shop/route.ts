import { getUserId } from "@/app/utils/roles";
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
    const userId = searchParams.get("userId") as string;
    const isRejected = searchParams.get("isRejected");
    const isVerified = searchParams.get("isVerified");

    const loggedInUserId = getUserId();

    if (!loggedInUserId) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    await connect();
    let filter: any = {};

    if (userId) {
      if (!Types.ObjectId.isValid(userId)) {
        return NextResponse.json(
          { message: "userId is invalid" },
          { status: 400 }
        );
      }
      const user = await User.findById(userId);
      if (!user) {
        return NextResponse.json(
          { message: "User not found" },
          { status: 404 }
        );
      }
      filter.owner = userId;
    }

    filter.isRejected = isRejected === "true";
    filter.isVerified = isVerified === "true";

    const skip = (page - 1) * limit;

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

    const coffeeShops = await CoffeeShop.aggregate([
      { $match: filter },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
        },
      },
      {
        $unwind: {
          path: "$owner",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "likecoffeeshops", // Ensure this matches the actual collection name for likes
          localField: "_id",
          foreignField: "coffeeShop",
          as: "likes",
        },
      },
      {
        $addFields: {
          likeCount: {
            $cond: {
              if: { $gt: [{ $size: "$likes" }, 0] },
              then: { $size: "$likes" },
              else: 0,
            },
          },
        },
      },
      {
        // Second lookup to check if the specific user has liked the CoffeeShop
        $lookup: {
          from: "likecoffeeshops",
          let: { coffeeShopId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$coffeeShop", "$$coffeeShopId"] },
                    { $eq: ["$user", new Types.ObjectId(loggedInUserId)] },
                  ],
                },
              },
            },
            { $limit: 1 }, // Limit to 1 to only check for existence
          ],
          as: "userLike",
        },
      },
      {
        // Determine if the user has liked the CoffeeShop
        $addFields: {
          isLiked: {
            $cond: {
              if: { $gt: [{ $size: "$userLike" }, 0] },
              then: true,
              else: false,
            },
          },
        },
      },
      {
        $project: {
          title: 1,
          bio: 1,
          address: 1,
          description: 1,
          owner: {
            email: 1,
            username: 1,
            photo: 1,
            firstName: 1,
            lastName: 1,
            role: 1,
            isRejected: 1,
          },
          isVerified: 1,
          isRejected: 1,
          images: 1,
          likeCount: 1,
          isLiked: 1,
        },
      },
    ]);

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
      isVerified: false,
      isRejected: false,
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
