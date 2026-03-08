import { Schema, model, models } from "mongoose";

const BlockSchema = new Schema(
    {
        blocker: { type: Schema.Types.ObjectId, ref: "User", required: true },
        blocked: { type: Schema.Types.ObjectId, ref: "User", required: true },
    },
    { timestamps: true }
);

// Prevent duplicate blocks
BlockSchema.index({ blocker: 1, blocked: 1 }, { unique: true });

const Block = models?.Block || model("Block", BlockSchema);
export default Block;
