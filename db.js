var setting = require('./setting');

var mongoose = require('mongoose');

module.exports = mongoose.connect("mongodb://" + setting.host + ":" + setting.port+ "/" + setting.db);