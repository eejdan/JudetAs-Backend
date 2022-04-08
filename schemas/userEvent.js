
const mongoose = require("mongoose");

const userEventSchema = new mongoose.Schema({
    user: { 
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    },
    eventType: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    meta: {
        endDate: { 
            type: Date, 
            default: null,
            required: false
        }
    }
}, {
    collection: "userEvents",
    strict: "throw"
})

module.exports = mongoose.model("UserEvent", userEventSchema)

//UserEvents 