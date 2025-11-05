// server/controllers/stationController.js
import ChargingStation from "../models/ChargingStation.js";

// ✅ Get all charging stations
export const getStations = async (req, res) => {
  try {
    const stations = await ChargingStation.find();
    res.status(200).json(stations);
  } catch (error) {
    console.error("Error fetching stations:", error);
    res.status(500).json({ message: "Server error while fetching stations." });
  }
};

// ✅ Get a single charging station by ID
export const getStationById = async (req, res) => {
  try {
    const station = await ChargingStation.findById(req.params.id);
    if (!station) {
      return res.status(404).json({ message: "Station not found." });
    }
    res.status(200).json(station);
  } catch (error) {
    console.error("Error fetching station by ID:", error);
    res.status(500).json({ message: "Server error while fetching station." });
  }
};
