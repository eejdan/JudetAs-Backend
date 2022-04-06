
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    firstName:{ type: String, required: true }, //nume de mijloc inclus
    lastName: { type: String, required: true },
    password: { type: String, required: true },
    registeredOn: { 
        type: Date, 
        required: true,
        default: Date.now() 
    },
    
    meta: {
        CNP: { type: String, required: true },
    }
})

module.exports = mongoose.model('User', userSchema);