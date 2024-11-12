import { model, models, Schema } from "mongoose";

const LikeCoffeeShopSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  coffeeShop: { type: Schema.Types.ObjectId, ref: "CoffeeShop" },
});

const LikeCoffeeShop =
  models?.LikeCoffeeShop || model("LikeCoffeeShop", LikeCoffeeShopSchema);

export default LikeCoffeeShop;
