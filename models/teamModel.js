var mongoose = require('mongoose');

var teamSchema = require('../schemas/teamSchema');

var Team = mongoose.model('team', teamSchema);

Team.Clear = function(){
    Team.remove({members: []}, function(err, res){
        if(err){
            console.log(err);
        }else{
            if(res.result.ok == 1){
                console.log("cleared the empty teams...");
            }else{
                console.log("no empty teams :)");
            }
        }
    })
}

module.exports = Team;