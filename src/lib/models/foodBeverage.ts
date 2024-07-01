import { Schema, model, models } from "mongoose";

const FoodBeverageSchema = new Schema(
  {
    title: { type: String, require: true },
    price: { type: Number, require: true },
    image: { type: String, require: true },
    coffeeShop: { type: Schema.Types.ObjectId, ref: "CoffeeShop" },
  },
  {
    timestamps: true,
  }
);

const FoodBeverage =
  models?.FoodBeverage || model("FoodBeverage", FoodBeverageSchema);

export default FoodBeverage;
