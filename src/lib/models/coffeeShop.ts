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

  // Location Data
  latitude: { type: Number },
  longitude: { type: Number },
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], default: [0, 0] }, // [longitude, latitude] required for 2dsphere index!
  },
  osmId: { type: String, unique: true, sparse: true }, // OpenStreetMap ID to prevent duplicates
  isClaimed: { type: Boolean, default: false }, // Feature: True when a real boss claims it
});

CoffeeShopSchema.index({ location: "2dsphere" });

const CoffeeShop = models?.CoffeeShop || model("CoffeeShop", CoffeeShopSchema);

export default CoffeeShop;
