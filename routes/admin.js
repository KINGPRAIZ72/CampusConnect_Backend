import express from "express";
import { auth, adminOnly } from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import Announcement from "../models/Announcement.js";
import Event from "../models/Event.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { logAdminActivity } from "../middleware/activityLoggerMiddleware.js";

const router = express.Router();

// Example: Dashboard endpoint
router.get(
  "/metrics",
  verifyToken,
  logAdminActivity("Viewed dashboard"),
  async (req, res) => {
    // Your existing metrics logic
    res.json({ totalUsers: 10, activeUsers: 5, upcomingEvents: 3 });
  }
);


// Admin Dashboard
router.get("/dashboard", auth, adminOnly, async (req, res) => {
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ updatedAt: { $gte: new Date(Date.now() - 30*24*60*60*1000) } });
  const upcomingEvents = await Event.countDocuments({ date: { $gte: new Date() } });
  const recentLogins = await User.find().sort({ updatedAt: -1 }).limit(5);
  const upcomingEventsList = await Event.find({ date: { $gte: new Date() } }).sort({ date: 1 }).limit(5);

  res.json({ totalUsers, activeUsers, upcomingEvents, recentLogins, upcomingEventsList });
});

// Announcements CRUD
router.post("/announcements", auth, adminOnly, async (req, res) => {
  const ann = new Announcement({ ...req.body, created_by: req.user.id });
  await ann.save();
  res.json(ann);
});

router.put("/announcements/:id", auth, adminOnly, async (req, res) => {
  const ann = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(ann);
});

router.delete("/announcements/:id", auth, adminOnly, async (req, res) => {
  await Announcement.findByIdAndDelete(req.params.id);
  res.json({ msg: "Deleted" });
});

// Events CRUD
router.post("/events", auth, adminOnly, async (req, res) => {
  const event = new Event({ ...req.body, created_by: req.user.id });
  await event.save();
  res.json(event);
});

router.put("/events/:id", auth, adminOnly, async (req, res) => {
  const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(event);
});

router.delete("/events/:id", auth, adminOnly, async (req, res) => {
  await Event.findByIdAndDelete(req.params.id);
  res.json({ msg: "Deleted" });
});

// Admin Archive
router.get("/archive/announcements", auth, adminOnly, async (req, res) => {
  const anns = await Announcement.find({ archived_by_users: req.user.id });
  res.json(anns);
});

router.get("/archive/events", auth, adminOnly, async (req, res) => {
  const events = await Event.find({ archived_by_users: req.user.id });
  res.json(events);
});

export default router;