import { Schema, model, models } from "mongoose";

const FoodBevarageSchema = new Schema(
  {
    title: { type: String, require: true },
    price: { type: Number, require: true },
    coffeeShop: { type: Schema.Types.ObjectId, ref: "CoffeeShop" },
  },
  {
    timestamps: true,
  }
);

const FoodBevarage =
  models?.FoodBevarage || model("FoodBevarage", FoodBevarageSchema);

export default FoodBevarage;
