const express = require('express');
const Incident = require('../models/Incident');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();

// POST /api/incidents — Guest creates SOS alert
router.post('/', protect, async (req, res) => {
  try {
    const { type, description, roomNumber, priority } = req.body;

    if (!type || !description || !roomNumber) {
      return res.status(400).json({ message: 'Type, description, and room number are required.' });
    }

    const incident = await Incident.create({
      type,
      description,
      roomNumber,
      priority: priority || 'high',
      reportedBy: req.user._id,
    });

    const populated = await incident.populate('reportedBy', 'name email roomNumber');

    // Emit to all connected clients
    req.io.emit('new_incident', populated);

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/incidents — Staff/Admin gets all incidents
router.get('/', protect, requireRole('staff', 'admin'), async (req, res) => {
  try {
    const incidents = await Incident.find()
      .populate('reportedBy', 'name email roomNumber')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.json(incidents);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/incidents/mine — Guest gets their own incidents
router.get('/mine', protect, async (req, res) => {
  try {
    const incidents = await Incident.find({ reportedBy: req.user._id })
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.json(incidents);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PATCH /api/incidents/:id/accept — Staff accepts an incident
router.patch('/:id/accept', protect, requireRole('staff', 'admin'), async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);
    if (!incident) return res.status(404).json({ message: 'Incident not found.' });

    if (incident.status !== 'reported') {
      return res.status(400).json({ message: 'Incident already accepted or resolved.' });
    }

    incident.assignedTo = req.user._id;
    incident.status = 'in_progress';
    await incident.save();

    const populated = await incident.populate([
      { path: 'reportedBy', select: 'name email roomNumber' },
      { path: 'assignedTo', select: 'name email' },
    ]);

    req.io.emit('incident_updated', populated);

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PATCH /api/incidents/:id/status — Staff/Admin updates status
router.patch('/:id/status', protect, requireRole('staff', 'admin'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['reported', 'in_progress', 'resolved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }

    const incident = await Incident.findById(req.params.id);
    if (!incident) return res.status(404).json({ message: 'Incident not found.' });

    incident.status = status;
    if (status === 'resolved') incident.resolvedAt = new Date();
    await incident.save();

    const populated = await incident.populate([
      { path: 'reportedBy', select: 'name email roomNumber' },
      { path: 'assignedTo', select: 'name email' },
    ]);

    req.io.emit('incident_updated', populated);

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/incidents/stats — Admin dashboard stats
router.get('/stats', protect, requireRole('admin'), async (req, res) => {
  try {
    const total = await Incident.countDocuments();
    const active = await Incident.countDocuments({ status: { $in: ['reported', 'in_progress'] } });
    const resolved = await Incident.countDocuments({ status: 'resolved' });
    const byType = await Incident.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]);

    res.json({ total, active, resolved, byType });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
