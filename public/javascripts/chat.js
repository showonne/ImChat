$(function(){
    currentPrivateChatId = "all"; //判断当前私聊or群聊标识符
    currentteam = $(".teamBtn").data('teamid');
    var socket = io.connect();
    var currentaccount = $(".nickname").data('accountid'),
        currentphoto = $(".nickname").data('photo'),
        currentaccountNickname = $(".nickname").text();

    $(".memberTitle .title").click(function() {
        $(".memberList").slideToggle('fast');
    });

    socket.emit('join', {
        teamid: currentteam,
        accountid: currentaccount
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
                        photo: currentphoto,
                        msg: inputval
                    }
                }).done(function(res){
                    if(res.success == 1){
                        socket.emit('sendMsg', {
                            from: currentaccount,
                            teamid: currentteam,
                            nickname: currentaccountNickname,
                            to: currentPrivateChatId,
                            msg: inputval,
                            photo: currentphoto
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
                        msg: inputval,
                        photo: currentphoto
                    }
                }).done(function(res){
                    if(res.success == 1){
                        socket.emit('sendMsg', {
                            from: currentaccount,
                            teamid: currentteam,
                            nickname: currentaccountNickname,
                            to: currentPrivateChatId,
                            msg: inputval,
                            photo: currentphoto
                        });
                        addToMessageBox(currentaccount, currentaccountNickname, currentphoto, inputval);
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
        if(currentPrivateChatId == 'all'){
            addToMessageBox(data.from, data.nickname, data.photo, data.msg);
            var increasement = $(".messageBox>:last").height(),
                initialScroll = $("#iscroll").scrollTop();
            $("#iscroll").scrollTop(initialScroll + increasement + 15);
        }else{
            var $returnBadge = $(".badge.return"),
                number = $returnBadge.text() == '' ? 1 : parseInt($returnBadge.text(), 10) + 1;
            $returnBadge.text(number);
        }
    });
    //接收消息(私聊)
    socket.on('replyPriMsg', function(data){
        if(isContain(data.from)){
            //如果是在自言自语 - -！
            if(currentPrivateChatId ==  data.from){
                addToMessageBox(data.from, data.nickname, data.photo, data.msg);
                var increasement = $(".messageBox>:last").height(),
                    initialScroll = $("#iscroll").scrollTop();
                $("#iscroll").scrollTop(initialScroll + increasement + 15);
            }else{
                var $target = $(".private[data-id=" + data.from + "]");
                var number = $target.text() == '' ? 1 : parseInt($target.text(), 10) + 1;
                $target.text(number);
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
        upload('image');
    });
    $(".file").click(function(){
        upload('file');
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
            $(".private[data-id=" + $(this).data('privateid') + "]").text('');
        }else{
            return ;
        }
    });
    //返回群聊
    $(".returnGroupChat").click(function(){
        $(".badge.return").text('');
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

    var isTodoShow = false,
        isFileShow = false;
    $(".todoToggle").click(function(){
        if(isTodoShow){
            $(".todoBox").css("transform", "translate(400px, 0)");
            isTodoShow = false;
        }else{
            $(".todoBox").css("transform", "translate(0, 0)");
            isTodoShow = true;
        }
    })

    $(".fileToggle").click(function(){
        $ul = $(".fileBox ul");
        var icon = {
            'zip': '&#xe630;',
            'pdf': '&#xe63f;',
            'txt': '&#xe6d7;'
        };

        if(isFileShow){
            $(".fileBox").css("transform", "translate(400px, 0)");
            isFileShow = false;
        }else{
            $.ajax({
                url: '/getfiles',
                type: 'post',
                data: {teamId: location.pathname.split('/')[2]}
            }).done(function(res){
                if(res.success == 1){
                    var files= res.files;
                    $ul.empty();
                    files.map(function(item, index){
                        var type = item.src.split('.')[1];
                        var $newItem = "<li><i class='iconfont'>" +  icon[type] + "</i><div class='download " + type + "' data-source='"+ item.src + "'>" + item.originalname + "</div></li>";
                        $ul.append($newItem);
                    });

                    $(".fileBox").css("transform", "translate(0, 0)");
                    isFileShow = true;
                }
            });
        }
    });

    $(document.body).delegate('.download', 'click', function(e){
        e.preventDefault();
        var dataSrc = $(this).data('source'),
            fileName = $(this).text();
        var downloadURL = '/download?src=' + dataSrc + "&fileName=" + fileName;
        window.open(downloadURL);
    });

    function upload(type){
        var mimeType = ['image/jpeg', 'image/png', 'image/gif', 'application/zip', 'text/plain', 'application/pdf', 'application/msword'];
        $("." + type + "_file").click();

        $("." + type + "_file").change(function(){
            var file = $("." + type + "_file")[0].files[0],
                mimeIndex = _.indexOf(mimeType, file.type);

            if(mimeIndex == -1 || (type == 'image' && mimeIndex > 2)){
                console.log('暂时不支持该类型文件!');
                return;
            }else{
                var fr = new FileReader();
                if(file){
                    fr.onload = function(evt){
                        var fd = new FormData();
                        fd.append('file', file);
                        fd.append('uploadType', type);
                        fd.append('teamId', location.pathname.split('/')[2]);
                        $.ajax({
                            url: '/upload',
                            type: 'POST',
                            data: fd,
                            processData: false,
                            contentType: false
                        }).done(function(res){
                            if(res.success == 1){
                                if(type == 'image'){
                                    var imgContent = "[-" + res.imgsrc + "-]";
                                    $input.insertContent(imgContent);
                                }else{
                                    alert(res.originalname + '已经上传到' + res.src );
                                }
                            }else{
                                console.log('unknow error');
                            }
                        });
                    }
                    fr.readAsDataURL(file);
                    console.log('- -!');
                }else{
                    ;
                }
            }



        });
    }
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
        addToMessageBox(record.recordList[i].id, record.recordList[i].nickname, record.recordList[i].photo, record.recordList[i].msg);
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
    $(".private[data-id=" + id + "]").text('');
    $(".topicName").text("私聊");
    $(".returnGroupChat").css('visibility', 'visible');
    getPrivateChatRecord(id);
    currentPrivateChatId = id;
    console.log('当前私聊对象id为' + id);
}

//判断私聊列表中是否有指定项
function isContain(id){
    var aimItemStr = ".chatList>li[data-privateid = " + id +"]";
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
        "<span class='badge private' data-id=" + id + ">1</span>" +
        "<a href='javascript:void(0);' class='privateChatItem' data-privateid='" + id + "' onclick='privateChatTo(" + id + ")'>" + text + "</a>" +
        "<span class='cancle' data-privateid='" + id + "' onClick='removeFromList(" + id + ")'>×</span>" +
        "</li>");
    $(".chatList").append(item);
}

//
function addToMessageBox(id, nickname, photo, msg){
    var $messageBox = $(".messageBox");
    //var photo = nickname.slice(0, 1);
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
                                "<img src='" + photo + "'/>" +
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

