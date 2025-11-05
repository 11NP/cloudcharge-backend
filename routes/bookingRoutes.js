import express from "express";
import Booking from "../models/Booking.js";

const router = express.Router();

// Create booking
router.post("/", async (req, res) => {
  try {
    const { userId, stationId, startTime, endTime } = req.body;

    if (!userId || !stationId || !startTime || !endTime)
      return res.status(400).json({ message: "Missing required fields" });

    const booking = new Booking({
      user: userId,
      station: stationId,
      startTime,
      endTime,
      status: "Confirmed",
    });

    await booking.save();
    res.status(201).json(booking);
  } catch (err) {
    console.error("❌ Error creating booking:", err);
    res.status(500).json({ message: "Internal server error while creating booking" });
  }
});

// Get all bookings for a user
router.get("/user/:id", async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.params.id })
      .populate("station", "name location")
      .sort({ startTime: -1 });
    res.status(200).json(bookings);
  } catch (err) {
    console.error("❌ Error fetching bookings:", err);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
});

// Cancel booking
router.delete("/:id", async (req, res) => {
  try {
    const bookingId = req.params.id;
    const deleted = await Booking.findByIdAndDelete(bookingId);
    if (!deleted) return res.status(404).json({ message: "Booking not found" });

    res.status(200).json({ message: "✅ Booking cancelled successfully" });
  } catch (err) {
    console.error("❌ Error deleting booking:", err);
    res.status(500).json({ message: "Internal server error while cancelling booking" });
  }
});

export default router;
