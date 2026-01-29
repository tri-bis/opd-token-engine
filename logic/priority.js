const Slot = require('../models/Slot');
const Token = require('../models/Token');

const PRIORITY_SCORES = {
    'Emergency': 100,
    'Paid': 50,
    'Follow-up': 30,
    'Online': 20,
    'Walk-in': 10
};

async function allocateToken(doctorId, patientName, type) {
    const score = PRIORITY_SCORES[type];

    // Find the slot for this doctor
    // (Simplification: We just grab the first slot we find for this doctor)
    const slot = await Slot.findOne({ doctorId: doctorId }).populate('tokens');

    if (!slot) return { success: false, message: "No slot found" };

    // SCENARIO A: Slot has space
    if (slot.currentBookings < slot.maxCapacity) {
        return await createToken(slot, patientName, type, score);
    }

    // SCENARIO B: Slot is FULL - Check for "Bumping"
    // Sort tokens by priority (lowest first)
    // We filter out cancelled/bumped tokens just in case, though usually they are removed
    const activeTokens = slot.tokens.filter(t => t.status === 'Booked');
    const sortedTokens = activeTokens.sort((a, b) => a.priorityScore - b.priorityScore);
    
    if (sortedTokens.length === 0) return { success: false, message: "Slot full (Unknown error)" };

    const lowestPriorityToken = sortedTokens[0]; // The patient to kick out

    // If new patient is more important
    if (score > lowestPriorityToken.priorityScore) {
        console.log(`[ALGO] Bumping ${lowestPriorityToken.patientName} (Score ${lowestPriorityToken.priorityScore}) for ${patientName} (Score ${score})`);
        
        // 1. Mark old token as Bumped
        lowestPriorityToken.status = "Bumped";
        await lowestPriorityToken.save();
        
        // 2. Remove old token ID from slot array
        slot.tokens = slot.tokens.filter(t => t._id.toString() !== lowestPriorityToken._id.toString());
        slot.currentBookings -= 1; // Temporarily reduce count to make space

        // 3. Add new token
        return await createToken(slot, patientName, type, score);
    }

    return { success: false, message: "Slot full and priority too low" };
}

async function createToken(slot, name, type, score) {
    const newToken = new Token({
        patientName: name,
        type: type,
        priorityScore: score,
        assignedSlotId: slot._id,
        status: 'Booked'
    });
    await newToken.save();

    slot.tokens.push(newToken._id);
    slot.currentBookings += 1;
    await slot.save();

    return { success: true, message: "Booked", token: newToken };
}

// CRITICAL FIX: Ensure brackets {} are used here
module.exports = { allocateToken };