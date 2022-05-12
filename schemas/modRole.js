
const mongoose = require("mongoose");

const modRoleSchema = new mongoose.Schema({
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
    collection: 'modRoles'
})

module.exports = modRoleSchema;