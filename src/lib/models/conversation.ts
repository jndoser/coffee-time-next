import { Schema, model, models } from "mongoose";

const ConversationSchema = new Schema(
    {
        // Exactly 2 participants (matched users)
        participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],

        // Snapshot of the last message for quick list rendering
        lastMessage: {
            content: { type: String },
            sender: { type: Schema.Types.ObjectId, ref: "User" },
            sentAt: { type: Date },
            type: { type: String, enum: ["text", "coffee-invite"], default: "text" },
        },

        // Tracks unread counts per participant: { userId: count }
        unreadCount: { type: Map, of: Number, default: {} },
    },
    { timestamps: true }
);

// Fast lookup of conversations for a user
ConversationSchema.index({ participants: 1 });
// Unique pair — only one conversation per matched pair
ConversationSchema.index({ participants: 1 }, { unique: false });

const Conversation = models?.Conversation || model("Conversation", ConversationSchema);
export default Conversation;
