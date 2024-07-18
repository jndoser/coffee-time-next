import connect from "@/lib/db";
import CoffeeShop from "@/lib/models/coffeeShop";
import User from "@/lib/models/user";
import { Types } from "mongoose";
import { NextResponse } from "next/server";

export async function GET(req: Request, context: { params: any }) {
  try {
    const { coffeeShopId } = context.params;

    if (!coffeeShopId || !Types.ObjectId.isValid(coffeeShopId)) {
      return NextResponse.json(
        { message: "Invalid coffeeShopId" },
        { status: 400 }
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

    return NextResponse.json(coffeeShop, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error while fetching coffee shop " + error },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request, context: { params: any }) {
  try {
    const { coffeeShopId } = context.params;

    if (!coffeeShopId || !Types.ObjectId.isValid(coffeeShopId)) {
      return NextResponse.json(
        { message: "Invalid coffeeShopId" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { action } = body;

    await connect();

    if (!action) {
      // If body doesn't have action field, so it means update coffee shop info
      const { searchParams } = new URL(req.url);
      const userId = searchParams.get("userId");

      if (!userId || !Types.ObjectId.isValid(userId)) {
        return NextResponse.json(
          { message: "Invalid or missing userId" },
          { status: 400 }
        );
      }

      const user = await User.findById(userId);
      if (!user) {
        return NextResponse.json(
          { message: "User not found" },
          {
            status: 404,
          }
        );
      }

      const coffeeShop = await CoffeeShop.findOne({
        _id: coffeeShopId,
        owner: userId,
      });
      if (!coffeeShop) {
        return NextResponse.json(
          { message: "Not found coffee shop" },
          { status: 404 }
        );
      }

      const { title, address, bio, description, images } = body;

      const updatedCoffeeShop = await CoffeeShop.findByIdAndUpdate(
        coffeeShopId,
        { title, address, bio, description, images },
        { new: true }
      );

      return NextResponse.json(
        {
          message: "Coffee shop is updated",
          category: updatedCoffeeShop,
        },
        {
          status: 200,
        }
      );
    } else {
      const coffeeShop = await CoffeeShop.findById(coffeeShopId);
      if (!coffeeShop) {
        return NextResponse.json(
          { message: "Not found coffee shop" },
          { status: 404 }
        );
      }
      if (!["APPROVE", "REVOKE", "REJECT"].includes(action.toUpperCase())) {
        return NextResponse.json(
          { message: "Invalid action value" },
          {
            status: 400,
          }
        );
      }

      if (action.toUpperCase() === "APPROVE") {
        const updatedCoffeeShop = await CoffeeShop.findByIdAndUpdate(
          coffeeShopId,
          { isVerified: true },
          { new: true }
        );

        return NextResponse.json(
          {
            message: "Coffee shop is approved successfully",
            category: updatedCoffeeShop,
          },
          {
            status: 200,
          }
        );
      }

      if (action.toUpperCase() === "REVOKE") {
        const updatedCoffeeShop = await CoffeeShop.findByIdAndUpdate(
          coffeeShopId,
          { isVerified: false },
          { new: true }
        );

        return NextResponse.json(
          {
            message: "Coffee shop is revoke successfully",
            category: updatedCoffeeShop,
          },
          {
            status: 200,
          }
        );
      }

      if (action.toUpperCase() === "REJECT") {
        const updatedCoffeeShop = await CoffeeShop.findByIdAndUpdate(
          coffeeShopId,
          { isRejected: true },
          { new: true }
        );

        return NextResponse.json(
          {
            message: "Coffee shop is rejected successfully",
            category: updatedCoffeeShop,
          },
          {
            status: 200,
          }
        );
      }
    }
  } catch (error) {
    return NextResponse.json(
      { message: "Error while updating coffee shop " + error },
      { status: 500 }
    );
  }
}
