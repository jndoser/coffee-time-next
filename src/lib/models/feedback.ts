import { Schema, model, models } from "mongoose";

const FeedbackSchema = new Schema({
  description: { type: String, require: true },
  numberOfUpvote: { type: Number, require: true, default: 0 },
  numberOfDownvote: { type: Number, require: true, default: 0 },
  owner: { type: Schema.Types.ObjectId, ref: "User" },
  coffeeShop: { type: Schema.Types.ObjectId, ref: "CoffeeShop" },
});

const Feedback = models?.Feedback || model("Feedback", FeedbackSchema);

export default Feedback;
