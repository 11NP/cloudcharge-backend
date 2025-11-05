import Booking from "../models/Booking.js";
import ChargingStation from "../models/ChargingStation.js";
import User from "../models/User.js";

// ✅ Create Booking
export const createBooking = async (req, res) => {
  try {
    const { userId, stationId, startTime, endTime } = req.body;

    // 1️⃣ Validate required fields
    if (!userId || !stationId || !startTime || !endTime) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 2️⃣ Validate existence of station
    const station = await ChargingStation.findById(stationId);
    if (!station) {
      return res.status(404).json({ message: "Charging station not found" });
    }

    // 3️⃣ Check user exists (ignore if using mock user)
    const user = await User.findById(userId).catch(() => null);

    // 4️⃣ Create booking
    const booking = await Booking.create({
      user: user?._id || userId, // fallback for mock users
      station: stationId,
      startTime,
      endTime,
      status: "Confirmed",
    });

    // 5️⃣ Update station status
    station.status = "Charging";
    await station.save();

    res.status(201).json({ message: "Booking successful", booking });
  } catch (error) {
    console.error("❌ Booking error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Get Bookings by User
export const getBookingsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const bookings = await Booking.find({ user: userId })
      .populate("station", "name location status")
      .populate("user", "name email");

    if (!bookings.length) {
      return res.status(200).json([]); // send empty array, not 404
    }

    res.status(200).json(bookings);
  } catch (error) {
    console.error("❌ Fetch user bookings error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Admin / All bookings
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "name email")
      .populate("station", "name location status");
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
