var express = require('express');
var router = express.Router();
var Team = require('../models/teamModel');
var Account = require('../models/accountModel');

router.get('/getTeamsByAccount', function(req, res){
    var account = req.session.account;
    Account.findOne({id: account.id}, function(err, account){
        if(err){
            console.log(err);
        }else{
            Team.find({id: {$in: account.teams}}, function(err, teamlist){
                if(err){
                    console.log(err);
                }else{
                    res.status(200).json({teamlist: teamlist});
                }
            })
        }
    })
});

router.get('/getMembersByTeam/:teamid', function(req, res){
    Team.findOne({id: req.params.teamid}, function(err, team){
        if(err){
            console.log(err);
        }else{
            var members =[];
            team.members.forEach(function(item){
                Account.find({id: item}, function(err, accountinfo){
                    if(err){
                        console.log(err);
                    }else{
                        members.push(accountinfo[0]);
                        if(members.length == team.members.length){
                            res.status(200).json({members: members});
                        }
                    }
                })
            });

        }
    })
});

router.get('/getTeamInfo/:teamid', function(req, res){
    Team.findOne({id: req.params.teamid}, function(err, team){
       if(err){
           console.log(err);
       }else{
           res.json({success: 1, team: team});
       }
    });
});

module.exports = router;