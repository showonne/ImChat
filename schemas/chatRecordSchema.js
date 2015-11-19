var mongoose = require('mongoose');

var chatRecordSchema = new mongoose.Schema({
    id: String,
    to: String,
    recordList: {
        type: Array,
        default: []
    }
});

module.exports = chatRecordSchema;