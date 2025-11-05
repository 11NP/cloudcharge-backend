import Swap from "../models/Swap.js";
import ChargingStation from "../models/ChargingStation.js";

// Borrow a battery (start swap)
export const borrowBattery = async (req, res) => {
  try {
    const { userId, sourceStation } = req.body;
    if (!userId || !sourceStation) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const station = await ChargingStation.findById(sourceStation);
    if (!station) return res.status(404).json({ message: "Station not found" });

    if (station.chargedBatteries <= 0) {
      return res.status(400).json({ message: "No charged batteries available" });
    }

    // ✅ New logic: swapping reduces charged, increases charging
    station.chargedBatteries -= 1;
    station.chargingBatteries = (station.chargingBatteries || 0) + 1;
    await station.save();

    const swap = await Swap.create({
      user: userId,
      sourceStation,
      swapCost: 200,
      status: "Active",
    });

    res.status(201).json({
      message: "Battery borrowed successfully",
      swap,
    });
  } catch (err) {
    console.error("❌ Borrow Error:", err);
    res.status(500).json({ message: "Server error during borrowing" });
  }
};

// Deposit a battery (complete swap)
export const depositBattery = async (req, res) => {
  try {
    const { destinationStation } = req.body;
    const { id } = req.params;

    const swap = await Swap.findById(id);
    if (!swap || swap.status !== "Active") {
      return res.status(404).json({ message: "Active swap not found" });
    }

    const destStation = await ChargingStation.findById(destinationStation);
    if (!destStation)
      return res.status(404).json({ message: "Destination station not found" });

    // ✅ Deposit: battery becomes charged again
    destStation.chargedBatteries = (destStation.chargedBatteries || 0) + 1;
    if (destStation.chargingBatteries > 0) destStation.chargingBatteries -= 1;
    await destStation.save();

    swap.destinationStation = destinationStation;
    swap.status = "Completed";
    swap.completedAt = new Date();
    await swap.save();

    res.status(200).json({
      message: "Battery deposited successfully",
      swap,
    });
  } catch (err) {
    console.error("❌ Deposit Error:", err);
    res.status(500).json({ message: "Server error during deposit" });
  }
};

// Get active swap for a user
export const getActiveSwap = async (req, res) => {
  try {
    const { userId } = req.params;
    const activeSwap = await Swap.findOne({
      user: userId,
      status: "Active",
    }).populate("sourceStation destinationStation");

    if (!activeSwap)
      return res.status(404).json({ message: "No active swap found" });

    res.status(200).json(activeSwap);
  } catch (err) {
    console.error("❌ Active Swap Error:", err);
    res.status(500).json({ message: "Error fetching active swap" });
  }
};

// Get all swaps for a user
export const getUserSwaps = async (req, res) => {
  try {
    const { userId } = req.params;
    const swaps = await Swap.find({ user: userId })
      .populate("sourceStation destinationStation")
      .sort({ createdAt: -1 });

    if (swaps.length === 0)
      return res.status(404).json({ message: "No swaps found" });

    res.status(200).json(swaps);
  } catch (err) {
    console.error("❌ User Swap Fetch Error:", err);
    res.status(500).json({ message: "Error fetching user swaps" });
  }
};
