"use server";

import connect from "@/lib/db";
import CoffeeShop from "@/lib/models/coffeeShop";
import FoodBeverage from "@/lib/models/foodBeverage";
import { Types } from "mongoose";

export async function fetchFoodBeverages(coffeeShopId: string) {
  try {
    if (!coffeeShopId || !Types.ObjectId.isValid(coffeeShopId)) {
      throw new Error("coffeeShopId is empty or invalid");
    }

    await connect();
    const coffeeShop = await CoffeeShop.findById(coffeeShopId);

    if (!coffeeShop) {
      throw new Error("Coffee Shop does exist");
    }

    const foodAndBeverageList = await FoodBeverage.find({
      coffeeShop: coffeeShopId,
    });
    return JSON.parse(JSON.stringify(foodAndBeverageList));
  } catch (error: any) {
    throw new Error("Error while fetching food and beverage: " + error.message);
  }
}

export async function createFoodBeverage({
  coffeeShopId,
  title,
  price,
  image,
}: {
  coffeeShopId: string;
  title: string;
  price: number;
  image: any;
}) {
  try {
    if (!coffeeShopId || !Types.ObjectId.isValid(coffeeShopId)) {
      throw new Error("coffeeShopId is empty or invalid");
    }

    await connect();
    const coffeeShop = await CoffeeShop.findById(coffeeShopId);

    if (!coffeeShop) {
      throw new Error("Coffee Shop does exist");
    }

    const newFoodBeverage = new FoodBeverage({
      title,
      price,
      image,
      coffeeShop: coffeeShopId,
    });

    await newFoodBeverage.save();

    return {
      message: "Food and Beverage is created",
      foodBeverage: JSON.parse(JSON.stringify(newFoodBeverage)),
    };
  } catch (error: any) {
    throw new Error("Error while creating food and beverage: " + error.message);
  }
}

export async function updateFoodBeverage(
  foodBeverageId: string,
  data: {
    title: string;
    price: number;
    image: any;
  }
) {
  try {
    if (!foodBeverageId || !Types.ObjectId.isValid(foodBeverageId)) {
      throw new Error("Invalid or missing foodBeverageId");
    }

    await connect();
    const foodBeverage = await FoodBeverage.findById(foodBeverageId);

    if (!foodBeverage) {
      throw new Error("Food beverage not found");
    }

    const { title, price, image } = data;

    const updatedFoodAndBeverage = await FoodBeverage.findByIdAndUpdate(
      foodBeverageId,
      { title, price, image },
      { new: true }
    );

    return {
      message: "Food and Beverage is updated",
      category: JSON.parse(JSON.stringify(updatedFoodAndBeverage)),
    };
  } catch (error: any) {
    throw new Error("Error while updating food and beverage: " + error.message);
  }
}

export async function deleteFoodBeverage(foodBeverageId: string) {
  try {
    if (!foodBeverageId || !Types.ObjectId.isValid(foodBeverageId)) {
      throw new Error("Invalid or missing foodBeverageId");
    }

    await connect();
    const foodBeverage = await FoodBeverage.findById(foodBeverageId);

    if (!foodBeverage) {
      throw new Error("Food beverage not found");
    }

    await FoodBeverage.findByIdAndDelete(foodBeverageId);
    return { message: "Food Beverage is deleted" };
  } catch (error: any) {
    throw new Error("Error while deleting food and beverage: " + error.message);
  }
}
