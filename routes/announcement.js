import express from 'express';
import mongoose from 'mongoose';
import Announcement from '../models/Announcement.js';
import { auth, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// ---------------- User Routes ----------------

// GET all announcements (public)
router.get('/', auth, async (req, res) => {
    try {
        const announcements = await Announcement.find({ status: 'active' }).sort({ schedule: -1 });
        res.json({ success: true, announcements });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error fetching announcements' });
    }
});

// GET archived announcements for current user
router.get("/archived", auth, async (req, res) => {
  try {
    const announcements = await Announcement.find({
      archived_by_users: req.user._id   // filter per user
    }).sort({ createdAt: -1 });         // latest first
    res.json(announcements);
  } catch (err) {
    console.error("Error fetching archived announcements:", err);
    res.status(500).json({ error: "Failed to fetch archived announcements" });
  }
});

// ---------------- User Archived Announcements ----------------
// GET /api/announcements/archived/user
router.get('/archived/user', auth, async (req, res) => {
    try {
        const userId = req.user.id; // set in authMiddleware
        const archivedAnnouncements = await Announcement.find({ archived: true, user: userId }).sort({ schedule: -1 });
        res.json(archivedAnnouncements);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch user archived announcements' });
    }
});

// Archive an announcement for current user
router.post('/archive/:id', auth, async (req, res) => {
    try {
        const id = req.params.id;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid announcement ID' });
        }

        const announcement = await Announcement.findById(id);
        if (!announcement) return res.status(404).json({ success: false, message: 'Announcement not found' });

        if (!announcement.archived_by_users.includes(req.user._id)) {
            announcement.archived_by_users.push(req.user._id);
            await announcement.save();
        }

        res.json({ success: true, message: 'Announcement archived for you', announcement });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error archiving announcement' });
    }
});

// GET particular announcement by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const id = req.params.id;

        // Handle 'public' separately if you allow it
        if (id === 'public') {
            const publicAnnouncements = await Announcement.find({ visibility: 'public' });
            return res.json({ success: true, announcements: publicAnnouncements });
        }

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid announcement ID' });
        }

        const announcement = await Announcement.findById(id);
        if (!announcement) return res.status(404).json({ success: false, message: 'Announcement not found' });

        res.json({ success: true, announcement });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error fetching announcement' });
    }
});

// ---------------- Admin CRUD ----------------

// CREATE announcement
router.post('/', auth, adminOnly, async (req, res) => {
    try {
        const announcement = new Announcement({ ...req.body, created_by: req.user._id });
        await announcement.save();
        res.status(201).json({ success: true, announcement });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error creating announcement' });
    }
});

// UPDATE announcement
router.put('/:id', auth, adminOnly, async (req, res) => {
    try {
        const id = req.params.id;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid announcement ID' });
        }

        const announcement = await Announcement.findByIdAndUpdate(id, req.body, { new: true });
        if (!announcement) return res.status(404).json({ success: false, message: 'Announcement not found' });
        res.json({ success: true, announcement });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error updating announcement' });
    }
});

// DELETE announcement
router.delete('/:id', auth, adminOnly, async (req, res) => {
    try {
        const id = req.params.id;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid announcement ID' });
        }

        const announcement = await Announcement.findByIdAndDelete(id);
        if (!announcement) return res.status(404).json({ success: false, message: 'Announcement not found' });
        res.json({ success: true, message: 'Announcement deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error deleting announcement' });
    }
});

export default router;