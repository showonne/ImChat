var express = require('express');
var router = express.Router();
var Account = require('../models/accountModel');
var Team = require('../models/teamModel');

router.get('/', checkNotLogin);
router.get('/', function(req, res) {
  res.render('index', { title: '主页' });
});

router.post('/logon', checkNotLogin);
router.post('/logon', function(req, res){
  Account.find({account: req.body.account}, function(err, account){
    if(err){
      console.log(err);
    }else{
      if(account.length == 0){
        res.json({success: 0, msg: '用户名不存在.'});
      }else{
        if(req.body.password != account[0].password){
          res.json({success: 0, msg: '密码错误.'});
        }else{
          if(account[0].teams.length > 0){
            Team.find({id: {$in: account[0].teams}}, function(err, team){
              if(err){
                consoloe.log(err);
              }else{
                req.session.account = account[0];
                var redirecturl = '/team/' + team[0].id;
                res.json({
                  success: 1,
                  redirecturl: redirecturl
                });
              }
            });
          }else{
            req.session.account = account[0];
            res.json({success: 1, redirecturl: '/team/create'});
          }
        }
      }
    }
  });
});

router.get('/regsiter', checkNotLogin);
router.get('/register',function(req, res){
  res.render('register', {title: '注册'});
});

router.post('/regsiter', checkNotLogin);
router.post('/register',function(req, res){
  Account.find({account: req.body.account}, function(err, account){
    if(err){
      console.log(err);
    }else{
      if(account.length > 0){
        res.json({success: 0, msg: '用户名已存在'});
      }else{
        var id = makeId();
        var n_account = new Account({id: id, account: req.body.account, password: req.body.password});
        n_account.save(function(err, account){
          if(err){
            console.log(err);
          }else{
            req.session.account = account;
            res.json({redirecturl: '/team/create'});
          }
        });
      }
    }
  });
});




router.get('/setting/personal', checkLogin);
router.get('/setting/personal', function(req, res){
  console.log(req.session.account);
  Account.find({account: req.session.account.account}, function(err, account){
    if(err){
      console.log(err);
    }else{
      Team.find({id: {$in: account[0].teams}}, function(err, teams){
        if(err){
          console.log(err);
        }else{
          res.render('personal', {
            account: account[0],
            teams: teams
          });
        }
      });
    }
  });
});

router.post('/setting/personal', checkLogin);
router.post('/setting/personal', function(req, res){
  Account.update({account: req.session.account.account},{nickname: req.body.nickname, email: req.body.email},
      function(err){
        if(err){
          console.log(err);
        }else{
          req.session.account.nickname = req.body.nickname;
          req.session.account.email = req.body.email;
          res.json({
            success: 1,
            account: req.session.account
          });
        }
  });
});


router.post('/upload', function(req, res){
  console.log(req.body);
  console.log(req.files.file.name);
  res.json({success: 1, imgsrc: req.files.file.name});
});

router.get('/logout', checkLogin);
router.get('/logout', function(req, res){
  req.session.account = null;
  res.redirect('/');
});

router.get('/redirect', checkLogin);
router.get('/redirect', function(req, res){
  Account.find({id: req.session.account.id}, function(err, accounts){
    if(err){
      console.log(err);
    }else if(accounts.length <= 0){
      res.json({success: 0, msg: 'no user info exists'});
    }else{
      console.log(accounts[0].teams.length);
      if(accounts[0].teams.length == 0){
        res.json({success: 1, redirecturl: '/team/create'});
      }else{
        res.json({success: 1, redirecturl: '/team/' + accounts[0].teams[0]});
      }
    }
  });
});
//

//产生唯一id
function makeId(){
  var str1 = new Date().getTime().toString();
  var str2 = Math.floor(Math.random()* 100).toString().toString();
  return str1 + str2;
}


function checkLogin(req, res, next) {
  if (!req.session.account) {
    res.redirect('/');
  }
  next();
}

function checkNotLogin(req, res, next) {
  if (req.session.account) {
    res.redirect('back');
  }
  next();
}

module.exports = router;
