const express = require('express');
const router = express.Router();
const Slot = require('../models/Slot');
const Doctor = require('../models/Doctor');
const Token = require('../models/Token');
const { allocateToken } = require('../logic/priority'); 

// Setup Doctor & Slot
router.post('/setup', async (req, res) => {
    try {
        const doc = await new Doctor({ name: req.body.doctorName }).save();
        const slot = await new Slot({
            doctorId: doc._id,
            startTime: req.body.startTime,
            endTime: req.body.endTime,
            maxCapacity: req.body.maxCapacity
        }).save();
        
        res.json({ doctorId: doc._id });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Book Token
router.post('/book', async (req, res) => {
    if (!req.body.doctorId) return res.status(400).send("Missing ID");
    try {
        const result = await allocateToken(req.body.doctorId, req.body.patientName, req.body.type);
        res.status(result.success ? 200 : 409).json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Cancel Booking
router.post('/cancel', async (req, res) => {
    try {
        const slot = await Slot.findOne({ doctorId: req.body.doctorId }).populate('tokens');
        if (!slot) return res.status(404).send("Slot not found");

        const target = slot.tokens.find(t => t.patientName.includes(req.body.patientName) && t.status !== 'Cancelled');
        if (!target) return res.status(404).send("Booking not found");

        await Token.findByIdAndUpdate(target._id, { status: 'Cancelled' });
        
        // Decrement count
        slot.currentBookings = Math.max(0, slot.currentBookings - 1);
        await slot.save();

        res.json({ message: "Cancelled" });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Delay Notification
router.post('/delay', async (req, res) => {
    
    console.log(`[Notification] Doctor ${req.body.doctorId} delayed by ${req.body.minutes} mins`);
    res.json({ message: "Delay logged" });
});

// Get Status
router.get('/status/:id', async (req, res) => {
    try {
        const slots = await Slot.find({ doctorId: req.params.id }).populate('tokens');
        res.json(slots);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;