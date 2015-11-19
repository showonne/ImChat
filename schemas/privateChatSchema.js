var mongoose = require('mongoose');

var privateChatSchema = new mongoose.Schema({
    members: {
        type: Array,
        default: []
    },
    recordList:{
        type: Array,
        default: []
    }
});

module.exports = privateChatSchema;