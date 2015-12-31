var mongoose = require('mongoose');

var fileSchema = new mongoose.Schema({
    teamId: String,
    originalName: String,
    src: String
});

module.exports = fileSchema;