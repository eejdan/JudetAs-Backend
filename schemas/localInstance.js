
const mongoose = require("mongoose");

var localInstanceSchema = new mongoose.Schema({
    displayName: { // max 64 char
        type: String, 
        required: true,
    },
    parentInstance: {
        type: mongoose.SchemaTypes.ObjectId,
        required: false,
        default: null
    },
    rank: {
        type: Number,
        required: true,
    },
    meta: {
        Mnemonic: {
            type: String,
            required: false,
            unique: true,
            default: null
        },
        localNumber: {
            type: Number,
            unique: false,
            required: false,
            default: null
        }
    }
}, {
    collection: 'localInstances'
})

localInstanceSchema.index({ displayName: "text"})

module.exports = localInstanceSchema;