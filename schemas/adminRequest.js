
const mongoose = require('mongoose');

const adminRequestSchema = new mongoose.Schema({
    creationDate: {
        type: Date,
        default: Date.now()
    },
    reviewStatus: { // -1 -> rejected; 0 -> under review; 1 -> accepted
        type: Number,
        default: 0
    },
    user: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        unique: true
    }
}, {
    collection: 'adminRequests'
})

module.exports = adminRequestSchema