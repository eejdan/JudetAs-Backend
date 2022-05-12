
const mongoose = require("mongoose");

const adminRoleSchema = new mongoose.Schema({
    localInstance: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    },
    user: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'users',
        required: true
    }
}, {
    collection: 'adminRoles'
})

module.exports = adminRoleSchema