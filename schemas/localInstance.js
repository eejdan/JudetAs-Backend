
const mongoose = require("mongoose");

const localInstanceSchema = new mongoose.Schema({
    admin: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'adminRoles',
        default: null,
    },
    displayName: { 
        type: String, 
        required: true,
        unique: true
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
            unique: true,
            required: false,
            default: null
        }
    }
}, {
    collection: 'localInstances'
})

module.exports = localInstanceSchema;