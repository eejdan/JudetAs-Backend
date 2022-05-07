
const mongoose = require('mongoose');

const adminRequestSchema = new mongoose.Schema({
    creationDate: {
        type: Date,
        default: Date.now()
    },
    user: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        unique: true
    },
    idNumber: {
        type: String,
        required: false,
        unique: true
    }
}, {
    collection: 'adminRequests'
})

module.exports = adminRequestScehma