
const mongoose = require('mongoose');

var userImageSchema = new mongoose.Schema({
    img:{
        data: Buffer,
        contentType: String
    }
}, {
    collection: 'userImages'
});

module.exports = userImageSchema