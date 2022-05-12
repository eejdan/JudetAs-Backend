
const mongoose = require("mongoose")

const userCommentSchema = new mongoose.Schema({
    user: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    },
    parent: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    },
    ancestor: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    },
    comment: {
        type: String,
        required: true,
        default: ''
    }
})

module.exports = userCommentSchema