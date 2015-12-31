var crypto = require('crypto');
var express = require('express');
var path = require('path');
var router = express.Router();
var utils = require('../utils/utils.js');
var Account = require('../models/accountModel');
var Team = require('../models/teamModel');
var File = require('../models/fileModel');

router.get('/', function(req, res) {
  res.render('index', { title: '主页' });
});

router.post('/logon', utils.checkNotLogin);
router.post('/logon', function(req, res){
  Account.logOnValidate(req.body.account, req.body.password, function(err, result){
    if(err){
      console.log(err);
    }else{
      if(result.success == 0 ){
        res.json(result);
      }else{
        if(result.account.teams.length > 0){
          Team.find({id: {$in: result.account.teams}}, function(err, team){
            if(err){
              console.log(err);
            }else{
              req.session.account = result.account;
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
  });
});

router.get('/regsiter', utils.checkNotLogin);
router.get('/register',function(req, res){
  res.render('register', {title: '注册'});
});

router.post('/regsiter', utils.checkNotLogin);
router.post('/register',function(req, res){
  Account.find({account: req.body.account}, function(err, account){
    if(err){
      console.log(err);
    }else{
      if(account.length > 0){
        res.json({success: 0, msg: '用户名已存在'});
      }else{
        var id = utils.makeId();
        var password = utils.getHashPassword(req.body.password);
        var md5 = crypto.createHash('md5');
        var photo = md5.update(req.body.email.toLowerCase()).digest('hex'),
            photoStr = "http://gravatar.com/avatar/" + photo + "?s=48";
        var n_account = new Account({id: id, account: req.body.account, password: password, email: req.body.email, photo: photoStr});
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




router.get('/setting/personal', utils.checkLogin);
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

router.post('/setting/personal', utils.checkLogin);
router.post('/setting/personal', function(req, res){
  Account.update({account: req.session.account.account},{nickname: req.body.nickname, email: req.body.email, telephone: req.body.telephone, position: req.body.position},
      function(err){
        if(err){
          console.log(err);
        }else{
          req.session.account.nickname = req.body.nickname;
          req.session.account.email = req.body.email;
          req.session.account.telephone = req.body.telephone;
          req.session.account.position = req.body.position;
          res.json({
            success: 1,
            account: req.session.account
          });
        }
  });
});


router.post('/upload', function(req, res){
  if(req.body.uploadType == 'image'){
    res.json({success: 1, imgsrc: req.files.file.name});
  }else{
    var n_file = new File({teamId: req.body.teamId, originalName: req.files.file.originalname, src: req.files.file.name});
    n_file.save(function(err, file){
      if(err){
        console.log(err);
        res.json({success: 0});
      }else{
        if(file._id != ''){
          res.json({success: 1, src: file.src, originalName: file.originalName});
        }
      }
    })
  }
});

router.get('/download', function(req, res){
  var fileName = req.query.fileName;
  var src = path.resolve(__dirname, '../', 'public/upload/', req.query.src);
  res.download(src, fileName);
});

router.get('/getfiles/:teamId', function(req, res){
  File.find({teamId: req.params.teamId}, function(err, files){
    if(err){
      console.log(err);
    }else{
      res.json({success: 1, files: files});
    }
  });
});


router.get('/logout', utils.checkLogin);
router.get('/logout', function(req, res){
  req.session.account = null;
  res.redirect('/');
});

router.get('/redirect', utils.checkLogin);
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




module.exports = router;
