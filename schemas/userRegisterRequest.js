
const mongoose = require('mongoose');
// to make model file
const userRegisterRequestSchema = new mongoose.Schema({
    reviewStatus: { // -1 -> rejected       | 0 -> not reviewable
                    // 1 -> under review    | 2-> accepted 
        type: Number,
        default: 0,
    },
    creationDate: {
        type: Date, default: Date.now()
    },
    username: { 
        type: String, 
        required: true, 
    },
    email: {
        type: String, required: true,
    },
    emailConfirmation: {
        lastSent: {
            type: Date, default: Date.now()
        },
        isConfirmed: {
            type: Boolean, default: false
        },
        emailConfirm: {
            type: String 
        },
        emailReject: {
            type: String
        }
    },
    password: { type: String, required: true },
    claimedMeta: {
        firstName: String,
        lastName: String,
        localInstance: mongoose.SchemaTypes.ObjectId,
    },
    proofOfResidence: { // link / handle
        type: mongoose.SchemaTypes.ObjectId
    },
    changesNecesary: {
        text: [String],
        object: [String]
    }
}, {
    collection: 'userRegisterRequests'
})

module.exports = userRegisterRequestSchema