import { Schema, model, models } from "mongoose";

const MessageSchema = new Schema(
    {
        conversation: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
        sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
        content: { type: String, required: true },
        type: { type: String, enum: ["text", "coffee-invite"], default: "text" },

        // For coffee-invite messages
        coffeeInvite: {
            coffeeShop: { type: Schema.Types.ObjectId, ref: "CoffeeShop" },
            shopName: { type: String },
            proposedTime: { type: Date },
            status: { type: String, enum: ["pending", "accepted", "declined"], default: "pending" },
        },

        readBy: [{ type: Schema.Types.ObjectId, ref: "User" }], // users who have read this message
    },
    { timestamps: true }
);

// Efficient pagination: get messages for a conversation ordered by time
MessageSchema.index({ conversation: 1, createdAt: -1 });

const Message = models?.Message || model("Message", MessageSchema);
export default Message;
