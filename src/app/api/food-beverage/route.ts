import connect from "@/lib/db";
import CoffeeShop from "@/lib/models/coffeeShop";
import FoodBevarage from "@/lib/models/foodBevarage";
import { Types } from "mongoose";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const coffeeShopId = searchParams.get("coffeeShopId");

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

    const foodAndBeverageList = await FoodBevarage.find({
      coffeeShop: coffeeShopId,
    });
    return NextResponse.json(foodAndBeverageList, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Error while fetching food and beverage " + error },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const coffeeShopId = searchParams.get("coffeeShopId");

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

    const { title, price } = await req.json();

    const newFoodBeverage = new FoodBevarage({
      title,
      price,
      coffeeShop: coffeeShopId,
    });

    await newFoodBeverage.save();

    return NextResponse.json(
      {
        message: "Food and Beverage is created",
        foodBeverage: newFoodBeverage,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Error while creating food and beverage " + error },
      { status: 500 }
    );
  }
}
