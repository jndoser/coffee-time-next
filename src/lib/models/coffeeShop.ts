import { Schema, model, models } from "mongoose";

const CoffeeShopSchema = new Schema({
  title: { type: String, require: true },
  bio: { type: String, require: true },
  description: { type: String, require: true },
  images: [{ type: String, require: true }],
  owner: { type: Schema.Types.ObjectId, ref: "User" },
});

const CoffeeShop = models?.CoffeeShop || model("CoffeeShop", CoffeeShopSchema);

export default CoffeeShop;
