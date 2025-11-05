// server/routes/stationRoutes.js
import express from "express";
import { getStations, getStationById } from "../controllers/stationController.js";

const router = express.Router();

// ✅ Route to get all stations
router.get("/", getStations);

// ✅ Route to get a station by ID
router.get("/:id", getStationById);

export default router;
