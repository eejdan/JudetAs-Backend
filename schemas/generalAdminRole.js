
const mongoose = require('mongoose');

const generalAdminRoleSchema = new mongoose.Schema({
    atrDate: {
        type: Date,
        default: Date.now(),
    },
    user: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        unique: true
    }
}, {
    collection: 'generalAdminRoles'
})

module.exports = generalAdminRoleSchema