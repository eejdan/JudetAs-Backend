
const mongoose = require("mongoose");

const userArticleSchema = new mongoose.Schema({
    user: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    },
    localInstance: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    },
    //-1 -> sters de user 0 -> sters de admin;
    // 1 - trimis; 2 - vizionat; 3 - in lucru; 
    // 4 - efectuat
    progress: {
        type: Number,
        default: 1
    },
    problemText: {
        type: String,
        required: true
    },
    articleMedia: {
        type: [{
            desc: String,
            img: {
                type: mongoose.SchemaTypes.ObjectId,
            }
        }], //ordered
        required: false
    },
    solutionText: {
        type: String,
        required: false,
        default: ''
    }
}, {
    collection: 'userArticles'
})

module.exports = userArticleSchema