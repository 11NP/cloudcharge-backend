import mongoose from "mongoose";

const chargingStationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      required: true,
    },
    address: { type: String },
  },
  pricePerKwh: { type: Number, required: true },
  status: {
    type: String,
    enum: ["Available", "Charging", "Unavailable"],
    default: "Available",
  },
  connectors: [
    {
      type: {
        type: String,
        enum: ["CCS", "Type 2"],
      },
      powerKw: Number,
    },
  ],

  // 🔋 Battery swapping support
  totalBatteries: { type: Number, default: 10 },
  chargedBatteries: { type: Number, default: 6 },
  emptyBatteries: { type: Number, default: 4 },
  chargingBatteries: { type: Number, default: 0 },

});

chargingStationSchema.index({ location: "2dsphere" });

export default mongoose.model("ChargingStation", chargingStationSchema);
