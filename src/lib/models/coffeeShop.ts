import { Schema, model, models } from "mongoose";

const CoffeeShopSchema = new Schema({
  title: { type: String, require: true },
  address: { type: String, require: true },
  bio: { type: String, require: true },
  description: { type: String, require: true },
  images: [
    {
      name: { type: String, require: true },
      publicId: { type: String, require: true },
      url: { type: String, require: true },
    },
  ],
  owner: { type: Schema.Types.ObjectId, ref: "User" },
  isVerified: { type: Boolean, require: true },
  isRejected: { type: Boolean, require: true },
});

const CoffeeShop = models?.CoffeeShop || model("CoffeeShop", CoffeeShopSchema);

export default CoffeeShop;
