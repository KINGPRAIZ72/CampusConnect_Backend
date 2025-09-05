import express from "express";
import User from "../models/User.js";
import Event from "../models/Event.js";
import { auth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get("/metrics",  auth , async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: "active" });
    const upcomingEvents = await Event.countDocuments({ date: { $gte: new Date() } });

    res.json({ totalUsers, activeUsers, upcomingEvents });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching metrics" });
  }
});

export default router;