import connect from "@/lib/db";
import FoodBeverage from "@/lib/models/foodBeverage";
import { Types } from "mongoose";
import { NextResponse } from "next/server";

export async function DELETE(req: Request, context: { params: any }) {
  try {
    const { foodBeverageId } = context.params;

    if (!foodBeverageId || !Types.ObjectId.isValid(foodBeverageId)) {
      return NextResponse.json(
        { message: "Invalid or missing foodBeverageId" },
        { status: 400 }
      );
    }

    await connect();
    const foodBeverage = await FoodBeverage.findById(foodBeverageId);

    if (!foodBeverage) {
      return NextResponse.json(
        { message: "Food beverage not found" },
        {
          status: 404,
        }
      );
    }

    await FoodBeverage.findByIdAndDelete(foodBeverageId);
    return new NextResponse(
      JSON.stringify({ message: "Food Beverage is deleted" }),
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Error while deleting food and beverage " + error },
      { status: 500 }
    );
  }
}
