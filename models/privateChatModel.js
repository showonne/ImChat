var mongoose = require('mongoose');

var privateChatSchema = require('../schemas/privateChatSchema');

var privateChat = mongoose.model('privatechat', privateChatSchema);

module.exports = privateChat;