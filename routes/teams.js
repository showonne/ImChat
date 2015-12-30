var express = require('express');
var EventProxy = require('eventproxy');
var utils = require('../utils/utils.js');
var router = express.Router();
var Account = require('../models/accountModel');
var Team = require('../models/teamModel');
var chatRecord = require('../models/chatRecordModel');

router.get('/create', utils.checkLogin);
router.get('/create', function(req, res){
    console.log(req.session.account);
    res.render('teamscreate',{});
});

router.post('/create', function(req, res){
    var id = utils.makeId();
    var n_team = new Team({id: id, teamname: req.body.teamname, members: [req.session.account.id]});
    n_team.save(function(err){
        if(err){
            console.log(err);
        }else{
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
router.get('/:teamid', utils.checkLogin);
router.get('/:teamid', function(req, res){
    var ep = new EventProxy();
    ep.all('getAccount', 'getCurrentTeam', function(account, team){
        res.render('chat', {
            account: account, //当前用户信息
            currentteam: team, //当前团队信息
        });
    });

    Account.findOne({id: req.session.account.id}, function(err, account){
        if(err){
            console.log(err);
        }
        ep.emit('getAccount', account);
    });
    Team.findOne({id: req.params.teamid}, function(err, team){
        if(err){
            console.log(err);
        }
        ep.emit('getCurrentTeam', team);
    });

});

router.get('/:teamid/invate', function(req, res){
    if(req.session.account){
        console.log(req.session.account);
        if(req.session.account.teams.indexOf(req.params.teamid) != -1){
            res.render('invate', {notice: '您已经在该组织中，请不要重复加入!'});
        }
    }else{
        res.render('invate', {notice: ''});
    }
});

router.post('/:teamid/invate', function(req, res){
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
                        var password = utils.getHashPassword(req.body.password)
                        if(account[0].password != password){
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



module.exports = router;