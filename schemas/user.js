
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: { type: String, 
        required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    pin: { type: Object, required: false },
    registrationDate: { 
        type: Date, 
        default: Date.now() 
    },
    meta: {
        firstName:{ type: String, required: true }, //+nume de mijloc inclus
        lastName: { type: String, required: true },
        CNP: { type: String, 
            required: false },
    }
})

module.exports = userSchema;