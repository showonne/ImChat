"use strict";

$(function () {
    $(".subName").click(function () {
        var nickname = $(".nicknameInput").val(),
            email = $(".emailInput").val(),
            $nickname_modal = $("#editName"),
            telephone = $(".telephoneInput").val(),
            position = $(".positionInput").val();
        updateInfo(nickname, email, telephone, position, $nickname_modal);
    });

    $(".subEmail").click(function () {
        var nickname = $(".nicknameInput").val(),
            email = $(".emailInput").val(),
            $email_modal = $("#editEmail"),
            telephone = $(".telephoneInput").val(),
            position = $(".positionInput").val();
        updateInfo(nickname, email, telephone, position, $email_modal);
    });

    $(".subTelephone").click(function () {
        var nickname = $(".nicknameInput").val(),
            email = $(".emailInput").val(),
            $telephone_modal = $("#editTelephone"),
            telephone = $(".telephoneInput").val(),
            position = $(".positionInput").val();
        updateInfo(nickname, email, telephone, position, $telephone_modal);
    });

    $(".subPosition").click(function () {
        var nickname = $(".nicknameInput").val(),
            email = $(".emailInput").val(),
            $position_modal = $("#editPosition"),
            telephone = $(".telephoneInput").val(),
            position = $(".positionInput").val();
        updateInfo(nickname, email, telephone, position, $position_modal);
    });

    $(".return").click(function () {
        $.ajax({
            type: 'GET',
            url: '/redirect'
        }).done(function (res) {
            if (res.success == 1) {
                window.location.href = res.redirecturl;
            } else {
                consle.log(res.msg);
            }
        });
    });

    var teamid = "";

    $(".leave").click(function () {
        teamid = $(this).data('teamid');
    });

    $(".leaveBtn").click(function () {
        console.log(teamid);
        $.ajax({
            url: '/team/leave',
            type: 'POST',
            data: {
                teamid: teamid
            }
        }).done(function (res) {
            if (res.success == 1) {
                $("#" + teamid).remove();
                $("#leave").modal('toggle');
            } else {
                console.log("unknow error...");
            }
        });
    });
});

function updateInfo(nickname, email, telephone, position, modal) {
    $.ajax({
        url: '/setting/personal',
        type: 'POST',
        data: {
            nickname: nickname,
            email: email,
            telephone: telephone,
            position: position
        }
    }).done(function (res) {
        if (res.success == 1) {
            updateData(res.account);
            modal.modal('toggle');
        }
    });
}

function updateData(data) {
    $(".nickname").text(data.nickname);
    $(".email").text(data.email);
    $(".telephone").text(data.telephone);
    $(".position").text(data.position);
}