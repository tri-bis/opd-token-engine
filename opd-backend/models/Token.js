const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  // 1. Patient Name (Simple String)
  patientName: { type: String, required: true },

  // 2. Type (Walk-in, Emergency, etc.)
  type: { type: String, required: true }, 

  // 3. Score (For sorting)
  priorityScore: { type: Number, default: 0 },

  // 4. Status (Booked, Bumped)
  status: { type: String, default: 'Booked' },

  // 5. Links
  assignedSlotId: { type: mongoose.Schema.Types.ObjectId, ref: 'Slot' },
  requestTime: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Token', tokenSchema);