import express from "express";
import mongoose from "mongoose";
import Swap from "../models/Swap.js";
import ChargingStation from "../models/ChargingStation.js";

const router = express.Router();

// 🔋 Borrow battery (start swap)
router.post("/", async (req, res) => {
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

    station.chargedBatteries -= 1;
    station.chargingBatteries = (station.chargingBatteries || 0) + 1;
    await station.save();

    const swap = await Swap.create({
      user: userId,
      sourceStation,
      swapCost: 200,
      status: "Active",
      swappedAt: new Date(),
    });

    const populatedSwap = await Swap.findById(swap._id)
      .populate("sourceStation destinationStation");

    res.status(201).json({
      message: "Battery borrowed successfully",
      swap: populatedSwap,
    });
  } catch (err) {
    console.error("❌ Borrow Error:", err);
    res.status(500).json({ message: "Server error during borrowing" });
  }
});

// 🔁 Deposit battery (complete swap)
router.put("/:id/deposit", async (req, res) => {
  try {
    const { destinationStation } = req.body;
    const { id } = req.params;

    const swap = await Swap.findById(id);
    if (!swap || swap.status !== "Active") {
      return res.status(404).json({ message: "Active swap not found" });
    }

    const dest = await ChargingStation.findById(destinationStation);
    if (!dest)
      return res.status(404).json({ message: "Destination station not found" });

    dest.chargedBatteries = (dest.chargedBatteries || 0) + 1;
    if (dest.chargingBatteries > 0) dest.chargingBatteries -= 1;
    await dest.save();

    swap.destinationStation = destinationStation;
    swap.status = "Completed";
    swap.completedAt = new Date();
    await swap.save();

    const populatedSwap = await Swap.findById(swap._id)
      .populate("sourceStation destinationStation");

    res.status(200).json({
      message: "Battery deposited successfully",
      swap: populatedSwap,
    });
  } catch (err) {
    console.error("❌ Deposit Error:", err);
    res.status(500).json({ message: "Server error during deposit" });
  }
});

// ❌ Cancel an active swap
router.patch("/:id/cancel", async (req, res) => {
  try {
    const { id } = req.params;
    const swap = await Swap.findById(id);

    if (!swap) {
      return res.status(404).json({ message: "Swap not found" });
    }

    if (swap.status !== "Active") {
      return res.status(400).json({ message: "Only active swaps can be cancelled" });
    }

    if (swap.sourceStation) {
      const source = await ChargingStation.findById(swap.sourceStation);
      if (source) {
        source.chargedBatteries += 1;
        if (source.chargingBatteries > 0) source.chargingBatteries -= 1;
        await source.save();
      }
    }

    swap.status = "Cancelled";
    swap.cancelledAt = new Date();
    await swap.save();

    const populatedSwap = await Swap.findById(swap._id)
      .populate("sourceStation destinationStation");

    res.status(200).json({
      message: "Swap cancelled successfully",
      swap: populatedSwap,
    });
  } catch (err) {
    console.error("❌ Cancel Swap Error:", err);
    res.status(500).json({ message: "Server error while cancelling swap" });
  }
});

// 🔍 Get active swap for user
router.get("/active/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const activeSwap = await Swap.findOne({
      user: userId,
      status: "Active",
    }).populate("sourceStation destinationStation");

    if (!activeSwap)
      return res.status(404).json({ message: "No active swap" });

    res.status(200).json(activeSwap);
  } catch (err) {
    console.error("❌ Active Swap Error:", err);
    res.status(500).json({ message: "Error fetching active swap" });
  }
});

// 📜 Get all swaps for a user
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const swaps = await Swap.find({ user: userId })
      .populate("sourceStation destinationStation")
      .sort({ createdAt: -1 });

    if (!swaps.length)
      return res.status(404).json({ message: "No swaps found" });

    res.status(200).json(swaps);
  } catch (err) {
    console.error("❌ User Swap Fetch Error:", err);
    res.status(500).json({ message: "Error fetching user swaps" });
  }
});

export default router;
