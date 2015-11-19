var mongoose = require('mongoose');
var accountSchema = require('../schemas/accountSchema');

var Account = mongoose.model('account', accountSchema);

module.exports = Account;