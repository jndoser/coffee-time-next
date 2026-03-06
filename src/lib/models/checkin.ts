import { Schema, model, models } from "mongoose";

const CheckinSchema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        coffeeShop: { type: Schema.Types.ObjectId, ref: "CoffeeShop", required: true },
        isOpenToMeet: { type: Boolean, default: false },
        checkedInAt: { type: Date, default: Date.now },
        expiresAt: {
            type: Date,
            default: () => new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
        },
    },
    { timestamps: true }
);

// Index for fast shop-based lookup, filtering expired and open-to-meet
CheckinSchema.index({ coffeeShop: 1, isOpenToMeet: 1, expiresAt: 1 });
// A user can only have one active check-in per shop
CheckinSchema.index({ user: 1, coffeeShop: 1 }, { unique: true });

const Checkin = models?.Checkin || model("Checkin", CheckinSchema);
export default Checkin;
