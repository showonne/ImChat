var mongoose = require('mongoose');

var accountSchema = new mongoose.Schema({
    id: {
        type: String,
        default: new Date().getTime().toString()
    },
    account: String,
    nickname: {
        type: String,
        default: '新用户'
    },
    password: String,
    teams: {
        type: Array,
        default: []
    },
    email:{
        type: String,
        default: ''
    }
});

module.exports = accountSchema;