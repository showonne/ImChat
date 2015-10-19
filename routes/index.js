var express = require('express');
var EventProxy = require('eventproxy');
var router = express.Router();
var Account = require('../models/accountModel');
var Team = require('../models/teamModel');
var chatRecord = require('../models/chatRecordModel');
var privateChat = require('../models/privateChatModel');
var fs = require('fs');



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
            res.json({success: 1, redirecturl: '/setting/teams/create'});
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
            res.json({redirecturl: '/setting/teams/create'});
          }
        });
      }
    }
  });
});

router.get('/setting/teams/create', checkLogin);
router.get('/setting/teams/create', function(req, res){
  console.log(req.session.account);
  res.render('teamscreate',{});
});

router.post('/setting/teams/create', checkLogin);
router.post('/setting/teams/create', function(req, res){
  var id = makeId();
  var n_team = new Team({id: id, teamname: req.body.teamname, members: [req.session.account.id]});
  n_team.save(function(err){
    if(err){
      console.log(err);
    }else{
      //console.log(req.session.account);
      Account.update({account: req.session.account.account}, {$push: {teams: id}}, function(err, response){
        if(err){
          console.log(err);
        }else{
          if(response.nModified == 1){
            req.session.account.teams = [id];
            var n_chatrecord = new chatRecord({id: id, to: 'all'});
            n_chatrecord.save();
            var redirectUrl = '/team/' + id;
            res.json({success: 1, redirecturl: redirectUrl});
          }else{
            console.log('更新失败');
          }
        }
      })
    }
  });
});

//聊天界面,最主要的界面
router.get('/team/:teamid', checkLogin);
router.get('/team/:teamid', function(req, res){
  var eq = new EventProxy();
  eq.all('getAccount', 'getCurrentTeam', function(account, team){

    eq2 = new EventProxy();

    eq2.all('getTeamsByAccount', 'getMembersByTeam', function(teamlist, members){
      console.log(members);
      res.render('chat', {
        account: account, //当前用户信息
        currentteam: team, //当前团队信息
        teamlist: teamlist, //当前用户所有的团队信息
        members: members //当前团队所有人员
      });
    });
    getTeamsByAccount(account);
    getMembersByTeam(team);
  });

  Account.find({id: req.session.account.id}, function(err, account){
    if(err){
      console.log(err);
    }
    eq.emit('getAccount', account[0]);
  });
  Team.find({id: req.params.teamid}, function(err, team){
    if(err){
      console.log(err);
    }
    eq.emit('getCurrentTeam', team[0]);
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

// ---------------------
router.get('/team/:teamid/invate', function(req, res){
  if(req.session.account){
    console.log(req.session.account);
  }else{
    res.render('invate');
  }
});
//----------------------
router.post('/team/:teamid/invate', function(req, res){
  Team.find({id: req.params.teamid}, function(err, team){
    if(err){
      console.log(err);
    }else{
      Account.find({account: req.body.account}, function(err, account){
        if(err){
          console.log(err);
        }else{
          if(account.length <= 0){
            res.json({success: 0, msg: '用户不存在'});
          }else{
            if(account[0].password != req.body.password){
              res.json({success: 0, msg: '用户名或密码错误'});
            }else{
              var ep = new EventProxy();
              ep.all('updateAccount', 'updateTeam', function(){
                req.session.account = account[0];
                res.json({success: 1, redirecturl: '/team/' + team[0].id});
              });

              Account.update({account: req.body.account}, {$push: {teams: team[0].id}}, function(err){
                if(err){
                  console.log(err);
                }else{
                  ep.emit('updateAccount');
                }
              });
              Team.update({id: team[0].id}, {$push: {members: account[0].id}}, function(err){
                if(err){
                  console.log(err);
                }else{
                  ep.emit('updateTeam');
                }
              });
            }
          }
        }
      });
    }
  });
});

//
router.post('/leave', function(req, res){
  var ep = new EventProxy();
  ep.all('updateAccount', 'updateTeam', function(){
    console.log("succeed");
    Team.Clear();
    res.json({success: 1});
  });

  Account.update({account: req.session.account.account}, {$pull: {teams: req.body.teamid}}, function(err){
    if(err){
      console.log(err);
    }else{
      req.session.account.teams = req.session.account.teams.filter(function(item){
        return item != req.body.teamid;
      });
      ep.emit('updateAccount');
    }
  });
  Team.update({id: req.body.teamid}, {$pull: {members: req.session.account.id}}, function(err){
    if(err){
      console.log(err);
    }else{
      ep.emit('updateTeam');
    }
  });

});

//获取聊天记录
router.post('/getrecord', function(req, res){
  chatRecord.find({id: req.body.teamid, to: req.body.to}, function(err, records){
    if(err){
      console.log(err);
    }else{
      if(records.length > 0){
        res.json({success: 1, chatrecord: records[0]});
      }else{
        var n_chatrecord = new chatRecord({id: req.body.teamid, to: req.body.to});
        n_chatrecord.save(function(err){
          if(err){
            console.log(err);
          }else{
            res.json({success: 1, chatrecord: {id: req.body.teamid, to: req.body.to, recordList: []}});
          }
        })
      }
    }
  });
});

router.post('/getrecord/private', function(req, res){
  privateChat.find({members: {$all: [req.body.to, req.session.account.id]}}, function(err, records){
    if(err){
      console.log(err);
    }else{
      if(records.length > 0){
        res.json({success: 1, chatrecord: records[0]});
      }else{
        var n_privatechatrecord = new privateChat({members: [req.body.to, req.session.account.id]});
        n_privatechatrecord.save(function(err){
          if(err){
            console.log(err);
          }else{
            res.json({success: 1, chatrecord: {members: [], recordList: []}});
          }
        });
      }
    }
  });
});

router.post('/chating', function(req, res){
  chatRecord.update({id: req.body.teamid, to: req.body.to}, {$push: {recordList: {id: req.session.account.id, nickname: req.body.nickname, msg: req.body.msg}}}, function(err, result){
    if(err){
      console.log(err);
    }else{
      if(result.ok == 1 && result.n == 1){
        res.json({success:1});
      }else{
        res.json({success: 0});
      }
    }
  });
});

router.post('/chating/private', function(req, res){
  privateChat.update({members: {$all: [req.body.to, req.session.account.id]}},
      {$push: {recordList: {nickname: req.body.nickname, msg: req.body.msg}}},
      function(err, result){
        if(err){
          console.log(err);
        }else{
          if(result.ok == 1 && result.n == 1){
            res.json({success:1});
          }else{
            res.json({success: 0});
          }
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
      if(accounts[0].teams.length == 0){
        res.json({success: 1, redirecturl: '/setting/teams/create'});
      }else{
        res.json({success: 1, redirecturl: '/team/' + accounts[0].teams[0]});
      }
    }
  });
});

function getTeamsByAccount(account){
  var teams = account.teams;
  var teamlist1 = [];
  Team.find({id: {$in: teams}}, function(err, teamlist){
    if(err){
      console.log(err);
    }else{
      teamlist1 = teamlist;
      eq2.emit('getTeamsByAccount', teamlist1);
    }
  });
}

function getMembersByTeam(team){
  var members =[];
  team.members.forEach(function(item){
    Account.find({id: item}, function(err, accountinfo){
      if(err){
        console.log(err);
      }else{
        members.push(accountinfo[0]);
        if(members.length == team.members.length){
          eq2.emit('getMembersByTeam', members);
        }
      }
    })
  });
}
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
