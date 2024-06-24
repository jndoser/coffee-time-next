import connect from "@/lib/db";
import CoffeeShop from "@/lib/models/coffeeShop";
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
