
const mongoose = require("mongoose");

const userRoleSchema = new mongoose.Schema({
    user: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    },
    localInstance: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    }
}, {
    collection: 'userRoles'
})

module.exports = userRoleSchema