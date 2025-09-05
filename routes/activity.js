import express from "express";
import Activity from "../models/Activity.js";
import { auth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get("/recent",  auth , async (req, res) => {
  try {
    const activities = await Activity.find().sort({ timestamp: -1 }).limit(10);
    res.json(activities);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching activities" });
  }
});

export default router;