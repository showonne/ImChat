var crypto = require('crypto');

module.exports = {
    checkLogin: function(req, res, next){
        if (!req.session.account) {
            res.redirect('/');
        }
        next();
    },
    checkNotLogin: function(req, res, next){
        if (req.session.account) {
            res.redirect('back');
        }
        next();
    },
    makeId: function(){
        var str1 = new Date().getTime().toString();
        var str2 = Math.floor(Math.random()* 100).toString().toString();
        return str1 + str2;
    },
    getHashPassword: function(password){
        var md5 = crypto.createHash('md5');
        md5.update(password);
        return md5.digest('hex');
    }
}