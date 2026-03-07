import { Schema, model, models } from "mongoose";

const MatchSchema = new Schema(
    {
        userA: { type: Schema.Types.ObjectId, ref: "User", required: true },
        userB: { type: Schema.Types.ObjectId, ref: "User", required: true },
        matchScore: { type: Number, default: 0 },
        matchedAt: { type: Date, default: Date.now },
        commonShops: [{ type: Schema.Types.ObjectId, ref: "CoffeeShop" }],
        commonDrinks: [{ type: String }],
    },
    { timestamps: true }
);

// Each pair can only match once (userA < userB by convention, enforced in API)
MatchSchema.index({ userA: 1, userB: 1 }, { unique: true });

const Match = models?.Match || model("Match", MatchSchema);
export default Match;
