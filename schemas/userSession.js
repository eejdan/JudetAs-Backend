
const mongoose = require("mongoose");

const userSessionSchema = new mongoose.Schema({
    user: {
        type: mongoose.SchemaTypes.ObjectId, 
        required: false
    }, 
    sessionString: { 
        type: String,
        required: true 
    },
    last: {
        type: Date,
        default: new Date("1 Jan 2000")
    }
}, { 
    collection: "userSessions", 
})

module.exports = mongoose.model('userSession', userSessionSchema);