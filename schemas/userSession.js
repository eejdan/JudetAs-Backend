
const mongoose = require("mongoose");

const userSessionSchema = new mongoose.Schema({
    user: {
        type: mongoose.SchemaTypes.ObjectId, 
        required: false
    }, 
    sessionString: { 
        type: String,
        required: true,
        unique: true
    }
}, { 
    collection: "userSessions", 
})
module.exports = userSessionSchema;