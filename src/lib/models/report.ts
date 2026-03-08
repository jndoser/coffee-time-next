import { Schema, model, models } from "mongoose";

const ReportSchema = new Schema(
    {
        reporter: { type: Schema.Types.ObjectId, ref: "User", required: true },
        reported: { type: Schema.Types.ObjectId, ref: "User", required: true },
        reason: {
            type: String,
            enum: ["spam", "harassment", "fake-profile", "inappropriate-content", "other"],
            required: true,
        },
        details: { type: String, maxlength: 500 },
        status: { type: String, enum: ["pending", "reviewed", "dismissed"], default: "pending" },
    },
    { timestamps: true }
);

const Report = models?.Report || model("Report", ReportSchema);
export default Report;
