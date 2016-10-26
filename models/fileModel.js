var mongoose = require('mongoose');
var fileSchema = require('../schemas/fileSchema.js');

var File = mongoose.model('file', fileSchema);

module.exports = File;