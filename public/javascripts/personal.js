$(function(){
    $(".subName").click(function(){
        var nickname = $(".nicknameInput").val(),
            email = $(".emailInput").val(),
            $nickname_modal = $("#editName");
        updateInfo(nickname, email, $nickname_modal);
    });

    $(".subEmail").click(function(){
        var nickname = $(".nicknameInput").val(),
            email = $(".emailInput").val(),
            $email_modal = $("#editEmail");
        updateInfo(nickname, email, $email_modal);
    });

    $(".return").click(function(){
        $.ajax({
            type: 'GET',
            url: '/redirect'
        }).done(function(res){
           if(res.success == 1){
               window.location.href = res.redirecturl;
           } else{
               consle.log(res.msg);
           }
        });
    });

    var teamid = "";

    $(".leave").click(function(){
        teamid = $(this).data('teamid');
    });

    $(".leaveBtn").click(function(){
        console.log(teamid);
        $.ajax({
            url: '/team/leave',
            type: 'POST',
            data:{
                teamid: teamid
            }
        }).done(function(res){
            if(res.success == 1){
                $("#" + teamid).remove();
                $("#leave").modal('toggle');
            }else{
                console.log("unknow error...");
            }
        });
    });
});

function updateInfo(nickname, email, modal){
    $.ajax({
        url: '/setting/personal',
        type: 'POST',
        data: {
            nickname: nickname,
            email: email
        }
    }).done(function(res){
        if(res.success == 1){
            updateData(res.account);
            modal.modal('toggle');
        }
    });
}

function updateData(data){
    $(".nickname").text(data.nickname);
    $(".email").text(data.email);
}