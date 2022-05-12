
const mongoose = require('mongoose');

const userReactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    }, 
    parent: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    },
      // -1 -> downvote ; 1 -> upvote
    rating: {
        type: Number,
        default: 0, //unset
        required: false
    }, // -1 -> irelevant; 1 -> important
    importance: {
        type: Number,
        default: 0, //unset
        required: false
    },
    tracked: {
        type: Boolean,
        default: false,
        required: false
    }
})

module.exports = userReactionSchema