var express = require('express');
var router = express.Router();
var Account = require('../models/accountModel');
var chatRecord = require('../models/chatRecordModel');
var privateChat = require('../models/privateChatModel');

router.post('/public', function(req, res){
    chatRecord.update({id: req.body.teamid, to: req.body.to}, {$push: {recordList: {id: req.session.account.id, nickname: req.body.nickname, msg: req.body.msg, photo: req.body.photo}}}, function(err, result){
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

router.post('/private', function(req, res){
    privateChat.update({members: {$all: [req.body.to, req.session.account.id]}},
        {$push: {recordList: {nickname: req.body.nickname, msg: req.body.msg, photo: req.body.photo}}},
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

module.exports = router;