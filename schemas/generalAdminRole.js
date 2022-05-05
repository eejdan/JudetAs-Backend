
const mongoose = require('mongoose');

const generalAdminRoleSchema = new mongoose.Schema({
    atrDate: {
        type: Date,
        default: Date.now(),
        required: true
    },
    user: {
        type: mongoose.SchemaTypes.ObjectId,
        required: false
    }
}, {
    collection: 'generalAdminRoles'
})

module.exports = generalAdminRoleSchema