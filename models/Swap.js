import mongoose from "mongoose";

const swapSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sourceStation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChargingStation",
      required: true,
    },
    destinationStation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChargingStation",
      default: null,
    },
    swappedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["Active", "Completed", "Cancelled", "Failed"], // ✅ added "Cancelled"
      default: "Active",
    },
    swapCost: {
      type: Number,
      default: 200,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Swap", swapSchema);
