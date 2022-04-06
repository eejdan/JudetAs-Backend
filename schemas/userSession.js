
const mongoose = require("mongoose");

const userSessionSchema = new mongoose.Schema({
    attachedUser: {
        type: mongoose.SchemaTypes.ObjectId, 
        required: false
    }, 
    activity: {
        start: { 
            type: mongoose.SchemaTypes.Date,
            default: Date.now(),
            required: true,
        }, end: {
            type: mongoose.SchemaTypes.Date,
            default: null,
            required: false,
        }
    },
    sessionString: { 
        type: String,
        required: true 
    },
    restricts: [{ 
        type: mongoose.SchemaTypes.ObjectId, 
        required: true 
    }]
}, { 
    collection: "userSessions", 
    strict: "throw"
})

module.exports = mongoose.model('userSession', userSessionSchema);