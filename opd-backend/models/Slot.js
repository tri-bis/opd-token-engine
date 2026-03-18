const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
    doctorId : {
        type:mongoose.Schema.Types.ObjectId,
        ref:'Doctor',
        required:true
    },
    startTime:{
        type:String,
        required:true
    },
    endTime:{
        type:String,
        required:true
    },
    maxCapacity:{
        type:Number,
        required:true,
        default:10
    },
    currentBookings:{
        type:Number,
        required:true,
        default:0
    },
    tokens:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Token'
    }]
});

module.exports = mongoose.model('Slot', slotSchema);