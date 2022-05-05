
const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
    stringField: String
}, {
    collection: "tests",
    strict: "throw"
});

module.exports = testSchema;