

const mongoose = require("mongoose");

const adminRoleSchema = new mongoose.Schema({
    general: {
        type: Boolean,
        default: false
    },
    user: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'users',
        required: true
    }
})