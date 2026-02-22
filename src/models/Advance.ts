import mongoose, { Schema } from "mongoose";

const advanceSchema = new Schema(
    {
        staffId: {
            type: Schema.Types.ObjectId,
            ref: "Staff",
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        reason: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ["Pending", "Deducted"],
            default: "Pending",
        },
    },
    {
        timestamps: true,
    }
);

const Advance = mongoose.models.Advance || mongoose.model("Advance", advanceSchema);

export default Advance;
