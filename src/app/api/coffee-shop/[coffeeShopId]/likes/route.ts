import { getUserId } from "@/app/utils/roles";
import connect from "@/lib/db";
import CoffeeShop from "@/lib/models/coffeeShop";
import LikeCoffeeShop from "@/lib/models/likeCoffeeShop";
import { Types } from "mongoose";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params: { coffeeShopId } }: { params: { coffeeShopId: string } }
) {
  try {
    if (!coffeeShopId || !Types.ObjectId.isValid(coffeeShopId)) {
      return NextResponse.json(
        { message: "Invalid coffeeShopId" },
        { status: 400 }
      );
    }

    const userId = getUserId();

    if (!userId) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    await connect();
    const coffeeShop = await CoffeeShop.findById(coffeeShopId);

    if (!coffeeShop) {
      return NextResponse.json(
        { message: "Coffee Shop does not exist" },
        { status: 404 }
      );
    }
    const likesCount = await LikeCoffeeShop.countDocuments({ coffeeShopId });
    const userLikesExists = await LikeCoffeeShop.exists({
      coffeeShopId,
      userId,
    });

    const data = {
      likes: likesCount,
      isLikedByUser: !!userLikesExists,
    };

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error while fetching likes " + error },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params: { coffeeShopId } }: { params: { coffeeShopId: string } }
) {
  try {
    const userId = getUserId();

    if (!userId) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    await connect();

    const newLikes = new LikeCoffeeShop({
      user: userId,
      coffeeShop: coffeeShopId,
    });
    await newLikes.save();

    return NextResponse.json({ message: "Like successfully" }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error while liking this coffee shop " + error },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params: { coffeeShopId } }: { params: { coffeeShopId: string } }
) {
  try {
    const userId = getUserId();

    if (!userId) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    await connect();

    await LikeCoffeeShop.findOneAndDelete({
      user: userId,
      coffeeShop: coffeeShopId,
    });

    return NextResponse.json(
      { message: "Unlike successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error while unlike this coffee shop " + error },
      { status: 500 }
    );
  }
}
