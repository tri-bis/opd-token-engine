const mongoose = require('mongoose');
const doctorSchema = new mongoose.Schema({
    name:{
        type:String,
        specialization:{type:String, default:'General'}
    }
});
module.exports = mongoose.model('Doctor', doctorSchema);