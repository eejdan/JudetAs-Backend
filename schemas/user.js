
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: { type: String, 
        required: true, unique: true },
    firstName:{ type: String, required: true }, //+nume de mijloc inclus
    lastName: { type: String, required: true },
    password: { type: String, required: true },
    pin: { type: String, default: null }, // to be changed 
    registrationDate: { 
        type: Date, 
        default: Date.now() 
    },
    homeTown: { 
        type: mongoose.SchemaTypes.ObjectId, 
        required: false 
    },
    meta: {
        CNP: { type: String, 
            required: false, unique: true, default: '' },
    }
})

module.exports = mongoose.model('User', userSchema);