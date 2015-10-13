var mongoose = require('mongoose');

var teamSchema = new mongoose.Schema({
    id: String,
    teamname: String,
    members: {
        type: Array,
        default: []
    }
});

module.exports = teamSchema;