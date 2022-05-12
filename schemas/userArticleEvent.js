
const mongoose = require("mongoose");

const userArticleEventSchema = new mongoose.Schema({
    article: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true  
    },
    eventType: {
        type: String,
        required: true,
    }, 
    eventContext: {
        type: Object, //structura specifica pentru fiecare tip de eveniment
        required: false
    }
})

module.exports = userArticleEventSchema