import { Schema, model, models } from "mongoose";

const SwipeSchema = new Schema(
    {
        fromUser: { type: Schema.Types.ObjectId, ref: "User", required: true },
        toUser: { type: Schema.Types.ObjectId, ref: "User", required: true },
        action: { type: String, enum: ["like", "pass"], required: true },
    },
    { timestamps: true }
);

// A user can only swipe once on each other user
SwipeSchema.index({ fromUser: 1, toUser: 1 }, { unique: true });
// Fast lookup of "who has this user already swiped on?"
SwipeSchema.index({ fromUser: 1, action: 1 });

const Swipe = models?.Swipe || model("Swipe", SwipeSchema);
export default Swipe;
