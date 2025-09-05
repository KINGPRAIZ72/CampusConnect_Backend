import express from "express";
import { auth } from "../middleware/authMiddleware.js";
import Announcement from "../models/Announcement.js";
import Event from "../models/Event.js";

const router = express.Router();

// User Dashboard
router.get("/dashboard", auth, async (req, res) => {
  const announcements = await Announcement.find({ visibility: "public" }).sort({ createdAt: -1 }).limit(5);
  const events = await Event.find({ date: { $gte: new Date() } }).sort({ date: 1 }).limit(5);
  res.json({ announcements, events });
});

// Announcements
router.get("/announcements", auth, async (req, res) => {
  const anns = await Announcement.find({ visibility: "public" });
  res.json(anns);
});

router.post("/announcements/:id/archive", auth, async (req, res) => {
  const ann = await Announcement.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { archived_by_users: req.user.id } },
    { new: true }
  );
  res.json(ann);
});

// Events
router.get("/events", auth, async (req, res) => {
  const upcoming = await Event.find({ date: { $gte: new Date() } });
  const past = await Event.find({ date: { $lt: new Date() } });
  res.json({ upcoming, past });
});

router.post("/events/:id/archive", auth, async (req, res) => {
  const event = await Event.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { archived_by_users: req.user.id } },
    { new: true }
  );
  res.json(event);
});

// User Archive
router.get("/archive/announcements", auth, async (req, res) => {
  const anns = await Announcement.find({ archived_by_users: req.user.id });
  res.json(anns);
});

router.get("/archive/events", auth, async (req, res) => {
  const events = await Event.find({ archived_by_users: req.user.id });
  res.json(events);
});

export default router;