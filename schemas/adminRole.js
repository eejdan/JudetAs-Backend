
// redundant? calculable?
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
})

module.exports = adminRoleSchema