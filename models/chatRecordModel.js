var mongoose = require('mongoose');
var chatRecordSchema = require('../schemas/chatRecordSchema');

var chatRecord = mongoose.model('chatrecord', chatRecordSchema);

module.exports = chatRecord;