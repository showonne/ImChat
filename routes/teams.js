var express = require('express');
var EventProxy = require('eventproxy');
var router = express.Router();
var Account = require('../models/accountModel');
var Team = require('../models/teamModel');
var chatRecord = require('../models/chatRecordModel');

router.get('/create', checkLogin);
router.get('/create', function(req, res){
    console.log(req.session.account);
    res.render('teamscreate',{});
});

router.post('/create', checkLogin);
router.post('/create', function(req, res){
    var id = makeId();
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
router.get('/:teamid', checkLogin);
router.get('/:teamid', function(req, res){
    var eq = new EventProxy();
    eq.all('getAccount', 'getCurrentTeam', function(account, team){

        eq2 = new EventProxy();
        console.log(team);
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

router.get('/:teamid/invate', function(req, res){
    if(req.session.account){
        console.log(req.session.account);
    }else{
        res.render('invate');
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