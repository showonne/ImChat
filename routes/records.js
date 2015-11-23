var express = require('express');
var router = express.Router();
var Account = require('../models/accountModel');
var chatRecord = require('../models/chatRecordModel');
var privateChat = require('../models/privateChatModel');

router.post('/public', function(req, res){
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

router.post('/private', function(req, res){
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


module.exports = router;