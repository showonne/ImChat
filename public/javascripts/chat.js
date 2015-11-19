$(function(){
    currentPrivateChatId = "all"; //判断当前私聊or群聊标识符
    currentteam = $(".teamBtn").data('teamid');
    var socket = io.connect();
    var currentaccount = $(".nickname").data('accountid'),
        currentaccountNickname = $(".nickname").text();

    $(".memberTitle .title").click(function() {
        $(".memberList").slideToggle('fast');
    });

    socket.emit('join', {
        teamid: currentteam,
        accountid: currentaccount
    });

    socket.on('joined', function(data){
        console.log(data.accountid + "joined room" + data.teamid + "succeed.");
    });

    var $input = $("#inputContent");
    //发送消息功能
    $input.keydown(function(e){
        if(e.shiftKey && e.keyCode == 13){
            var inputval = $input.val();
            if(currentPrivateChatId == 'all'){
                $.ajax({
                    url: '/chating/public',
                    type: 'POST',
                    data: {
                        teamid: currentteam,
                        to: currentPrivateChatId,
                        nickname: currentaccountNickname,
                        msg: inputval
                    }
                }).done(function(res){
                    if(res.success == 1){
                        socket.emit('sendMsg', {
                            from: currentaccount,
                            teamid: currentteam,
                            nickname: currentaccountNickname,
                            to: currentPrivateChatId,
                            msg: inputval
                        });
                    }else{
                        console.log("unknow server error...");
                    }
                });
            }else{
                $.ajax({
                    url: '/chating/private',
                    type: 'POST',
                    data: {
                        to: currentPrivateChatId,
                        nickname: currentaccountNickname,
                        msg: inputval
                    }
                }).done(function(res){
                    if(res.success == 1){
                        socket.emit('sendMsg', {
                            from: currentaccount,
                            teamid: currentteam,
                            nickname: currentaccountNickname,
                            to: currentPrivateChatId,
                            msg: inputval
                        });
                        addToMessageBox(currentaccount, currentaccountNickname, inputval);
                        var increasement = $(".messageBox>:last").height(),
                            initialScroll = $("#iscroll").scrollTop();
                        $("#iscroll").scrollTop(initialScroll + increasement + 15);
                    }else{
                        console.log("unknow server error...");
                    }
                });
            }
            $input.val("");
        }else{
            return ;
        }
    });
    //接收消息功能(群聊)
    socket.on('replyMsg', function(data){
        addToMessageBox(data.from, data.nickname, data.msg);
        var increasement = $(".messageBox>:last").height(),
            initialScroll = $("#iscroll").scrollTop();
        $("#iscroll").scrollTop(initialScroll + increasement + 15);
    });
    //接收消息(私聊)
    socket.on('replyPriMsg', function(data){
        if(isContain(data.from)){
            if(currentPrivateChatId ==  data.from){
                addToMessageBox(data.from, data.nickname, data.msg);
                var increasement = $(".messageBox>:last").height(),
                    initialScroll = $("#iscroll").scrollTop();
                $("#iscroll").scrollTop(initialScroll + increasement + 15);
            }else{
                ;
            }
        }else{
            createPrivateChatItem(data.nickname, data.from);
        }
    });

    //邀请其他成员
    $(".more").click(function(){
        var link = window.location.href + "/invate";
        $(".invate_link").text(link);
    });
    //添加
    $("#addTeamBtn").click(function(){
        $.ajax({
            url: '/team/create',
            type: 'POST',
            data: {
                teamname: $("#n_teamname").val()
            }
        }).done(function(res){
            if(res.success == 1){
                window.location.href = res.redirecturl;
            }else{
                alert("unknow error...");
            }
        });
    });

    //发送表情功能
    $(".emoji").click(function(){
       $(".emojiBox").toggle();
    });
    $(".image").click(function(){
        $(".image_file").click();
    });
    $(".image_file").change(function(){
        var file = $(".image_file")[0].files[0];
        var fr = new FileReader();
        if(file){
            fr.onload = function(evt){
                var fd = new FormData();
                fd.append('file', file);
                $.ajax({
                    url: '/upload',
                    type: 'POST',
                    data: fd,
                    processData: false,
                    contentType: false
                }).done(function(res){
                    if(res.success == 1){
                        console.log(res.imgsrc);
                        var imgContent = "[-" + res.imgsrc + "-]";
                        console.log(imgContent);
                        $input.insertContent(imgContent);
                    }else{
                        console.log('unknow error');
                    }
                });
            }
            fr.readAsDataURL(file);
        }else{
            ;
        }
        console.log(file);

    });

    $(".emojiItem").click(function(){
        var mean = "<{" + $(this).data("mean") + "}>";
        $input.insertContent(mean);
        $(".emojiBox").toggle();
    });
    //进行私聊的相关操作
    var $privateChat = $(".privateChat");
    //将团队中的人添加到私聊列表中
    $privateChat.click(function(){
        if(!isContain($(this).data('privateid'))){
            createPrivateChatItem($(this).text(), $(this).data('privateid'));
        }else{
            return ;
        }
    });
    //返回群聊
    $(".returnGroupChat").click(function(){
        returnGroupChat();
        getChatRecord(currentteam, 'all');
    });

    //初始化群聊信息记录
    getChatRecord(currentteam, 'all');

    var vm = new Vue({
        el: ".todoBox",
        data: {
            todos: [{id: '11223',task: '学习Js', done: false}, {id: '22334', task: '接着学Js', done: false}]
        },
        computed: {
            lefts: function(){
                return this.todos.filter(function(e){
                    return !e.done
                }).length;
            }
        },
        methods: {
            addTodo: function(e){
                var id = Math.floor(Math.random() * 100000).toString() + new Date().getTime().toString();
                console.log(e.target.value);
                this.todos.push({id: id,task: e.target.value, done: false});
                e.target.value = "";
            },
            delTodo: function(todo){
                this.todos.$remove(todo);
            },
            delCompleted: function(){
                this.todos = this.todos.filter(function(todo){
                    return !todo.done;
                })
            }
        }
    });

    var isTodoShow = false;
    $(".todoToggle").click(function(){
        if(isTodoShow){
            $(".todoBox").css("transform", "translate(400px, 0)");
            isTodoShow = false;
        }else{
            $(".todoBox").css("transform", "translate(0, 0)");
            isTodoShow = true;
        }
    })
});

function getChatRecord(teamid, to){
    $.ajax({
        url: '/record/public',
        type: 'POST',
        data: {
            teamid: teamid,
            to: to
        }
    }).done(function(res){
        if(res.success == 1){
            initialMessageBox(res.chatrecord);
        }else{
            alert('unknow error...');
        }
    });
}

function getPrivateChatRecord(to){
    $.ajax({
        url: '/record/private',
        type: 'POST',
        data: {
            to: to
        }
    }).done(function(res){
        if(res.success == 1){
            initialMessageBox(res.chatrecord);
        }else{
            alert('unknow error...');
        }
    });
    console.log(currentPrivateChatId);
}


//
function initialMessageBox(record){
    $(".messageBox").empty();
    for(var i = 0; i < record.recordList.length; i++){
        addToMessageBox(record.recordList[i].id, record.recordList[i].nickname, record.recordList[i].msg);
    }
    $("#iscroll").scrollTop(99999);
}

function removeFromList(id){
    var aimItemStr = ".chatList>li[data-privateid = " + id +"]";
    $(aimItemStr).remove();
    if(currentPrivateChatId == id){
        returnGroupChat();
    }
}

//切换到私聊页面
function privateChatTo(id){
    $(".topicName").text("私聊");
    $(".returnGroupChat").css('visibility', 'visible');
    getPrivateChatRecord(id);
    currentPrivateChatId = id;
    console.log('当前私聊对象id为' + id);
}

//判断私聊列表中是否有指定项
function isContain(id){
    var aimItemStr = ".chatList>li[data-privateid = " + id +"]";
    console.log(aimItemStr);
    var aimItem = $(aimItemStr);
    if(aimItem.length > 0){
        return true;
    }else{
        return false;
    }
}

function returnGroupChat(){
    $(".topicName").text("群聊");
    $(".returnGroupChat").css('visibility', 'hidden');
    currentPrivateChatId = "all";
}

function createPrivateChatItem(text, id) {
    var item = $("<li class='listitem' data-privateid='" + id + "'>" +
        "<a href='javascript:void(0);' class='privateChatItem' data-privateid='" + id + "' onclick='privateChatTo(" + id + ")'>" + text + "</a>" +
        "<span class='cancle' data-privateid='" + id + "' onClick='removeFromList(" + id + ")'>×</span>" +
        "</li>");
    $(".chatList").append(item);
}

function addToMessageBox(id, nickname, msg){
    var $messageBox = $(".messageBox");
    var photo = nickname.slice(0, 1);
    var realMsg = msg.replace(/<{([a-z]+)}>/g, function(match){
        return "<img src='/emoji/" + match.slice(2, -2) + ".gif' class='emojied'>";
    });
    realMsg = realMsg.replace(/\[-(\w+\.\w+)-\]/g, function(match){
        console.log(match);
        return "<img src='/upload/" + match.slice(2, -2) + "' class='imageMsg'>";
    });
    realMsg = marked(realMsg);
    var $mediaItem = $("<div class='media'>" +
                            "<div class='media-left media-top'>" +
                                "<span class='otherphoto' data-userid='" + id + "'>" + photo + "</span>" +
                            "</div>" +
                            "<div class='media-body'>" +
                                "<h4 class='media-heading'>" + nickname + "</h4>" +
                                realMsg +
                            "</div>" +
                      "</div>");
    $messageBox.append($mediaItem);
}


(function($) {
    $.fn.extend({
        insertContent: function(myValue, t) {
            var $t = $(this)[0];
            if ($t.selectionStart || $t.selectionStart == '0') {
                var startPos = $t.selectionStart;
                var endPos = $t.selectionEnd;
                var scrollTop = $t.scrollTop;
                $t.value = $t.value.substring(0, startPos) + myValue + $t.value.substring(endPos, $t.value.length);
                this.focus();
                $t.selectionStart = startPos + myValue.length;
                $t.selectionEnd = startPos + myValue.length;
                $t.scrollTop = scrollTop;
                if (arguments.length == 2) {
                    $t.setSelectionRange(startPos - t, $t.selectionEnd + t);
                    this.focus();
                }
            }
            else {
                this.value += myValue;
                this.focus();
            }
        }
    });
})(jQuery);

