import express from 'express';
import Event from '../models/Event.js';
import { auth, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// ---------------- User Routes ----------------

// GET all events
router.get('/', auth, async (req, res) => {
    try {
        const events = await Event.find().sort({ date: -1 });
        res.json({ success: true, events });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error fetching events' });
    }
});

// GET archived events for current user
router.get("/archived", auth, async (req, res) => {
  try {
    const events = await Event.find({
      archived_by_users: req.user._id   // filter per user
    }).sort({ date: -1 });              // sort latest → oldest
    res.json(events);
  } catch (err) {
    console.error("Error fetching archived events:", err);
    res.status(500).json({ error: "Failed to fetch archived events" });
  }
});

// Archive an event for current user
router.post('/archive/:id', auth, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

        if (!event.archived_by_users.includes(req.user._id)) {
            event.archived_by_users.push(req.user._id);
            await event.save();
        }

        res.json({ success: true, message: 'Event archived for you', event });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error archiving event' });
    }
});

// ---------------- User Archived Events ----------------
// GET /api/events/archived/user
router.get('/archived/user', auth, async (req, res) => {
    try {
        const userId = req.user.id; // set in authMiddleware
        const archivedEvents = await Event.find({ archived: true, user: userId }).sort({ date: -1 });
        res.json(archivedEvents);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch user archived events' });
    }
});

// GET particular event by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
        res.json({ success: true, event });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error fetching event' });
    }
});

// ---------------- Admin CRUD ----------------

// CREATE event
router.post('/', auth, adminOnly, async (req, res) => {
    try {
        const event = new Event({ ...req.body, created_by: req.user._id });
        await event.save();
        res.status(201).json({ success: true, event });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error creating event' });
    }
});

// UPDATE event
router.put('/:id', auth, adminOnly, async (req, res) => {
    try {
        const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
        res.json({ success: true, event });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error updating event' });
    }
});

// DELETE event
router.delete('/:id', auth, adminOnly, async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
        res.json({ success: true, message: 'Event deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error deleting event' });
    }
});

export default router;