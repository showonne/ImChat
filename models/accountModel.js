var mongoose = require('mongoose');
var accountSchema = require('../schemas/accountSchema');
var utils = require('../utils/utils.js');

var Account = mongoose.model('account', accountSchema);

Account.logOnValidate = function(account, password, callback){
    Account.findOne({account: account}, function(err, account){
        if(err){
            callback(err);
        }else{
            if(account.length == 0){
                callback(null, {success: 0, msg: '用户名不存在.'});
            }else{
                var hash_password = utils.getHashPassword(password);
                if(hash_password != account.password){
                    callback(null, {success: 0, msg: '密码错误.'});
                }else{
                    callback(null, {success:1, account: account});
                }
            }
        }
    });
}


module.exports = Account;