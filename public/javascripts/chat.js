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
                        var addChild = Promise.resolve(vChatList.$data.recordlist.push({photo: currentphoto, msg: inputval, nickname: currentaccountNickname}));
                        addChild.then(function(){
                            var increasement = $(".messageBox>:last").height(),
                                initialScroll = $("#iscroll").scrollTop();
                            $("#iscroll").scrollTop(initialScroll + increasement + 15);
                        });
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
            var addChild = Promise.resolve(vChatList.$data.recordlist.push({photo: data.photo, msg: data.msg, nickname: data.nickname}));
            addChild.then(function(){
                var increasement = $(".messageBox>:last").height(),
                    initialScroll = $("#iscroll").scrollTop();
                $("#iscroll").scrollTop(initialScroll + increasement + 15);
            });
        }else{
            var $returnBadge = $(".badge.return"),
                number = $returnBadge.text() == '' ? 1 : parseInt($returnBadge.text(), 10) + 1;
            $returnBadge.text(number);
        }
    });
    //接收消息(私聊)
    socket.on('replyPriMsg', function(data){
        console.log(vPrivateChatList.isContain(data.from));
        if(vPrivateChatList.isContain(data.from)){
            //如果是在自言自语 - -！
            if(currentPrivateChatId ==  data.from){
                var addChild = Promise.resolve(vChatList.$data.recordlist.push({photo: data.photo, msg: data.msg, nickname: data.nickname}));
                addChild.then(function(){
                    var increasement = $(".messageBox>:last").height(),
                        initialScroll = $("#iscroll").scrollTop();
                    $("#iscroll").scrollTop(initialScroll + increasement + 15);
                });
            }else{
                vPrivateChatList.addNum(data.from);
            }
        }else{
            vPrivateChatList.addItem({id: data.from, nickname: data.nickname, number: 1});
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
        if(vPrivateChatList.isContain($(this).data('privateid'))){
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

    //团队列表
    var vTeamList = new Vue({
        el: "#vTeamList",
        data: {
            teamlist: []
        },
        created: function(){
            $.ajax({
                type: 'get',
                url: '/api/getTeamsByAccount'
            }).done(function(res){
                vTeamList.$data.teamlist = res.teamlist;
            }).error(function(err){
                console.log(err);
            })
        }
    });

    //成员列表
    var vMemberList = new Vue({
        el: "#vMemberList",
        data: {
            members: []
        },
        methods: {
            createPrivateChat: function(e){
                var id = $(e.target).data('privateid');
                var nickname = $(e.target).text();
                vPrivateChatList.addItem({id: id, nickname: nickname, number: 0});
            }
        },
        created: function(){
            $.ajax({
                type: 'get',
                url: '/api/getMembersByTeam/' + location.pathname.split('/')[2],
            }).done(function(res){
                vMemberList.$data.members = res.members;
            });
        }
    });

    //私聊列表
    var vPrivateChatList = new Vue({
        el: "#vChatList",
        data: {
            lists: []
        },
        methods: {
            addItem: function(n_item){
                var isContain = false;
                this.lists.map(function(item, index){
                   if(item.id == n_item.id){
                       isContain = true;
                   }
                });
                !isContain && this.lists.push(n_item);
                console.log(this.lists);
            },
            dismiss: function(e){
                var id = $(e.target).data('id');
                var _index = -1;
                this.lists.map(function(item, index, arrs){
                    if(item.id == id){
                        _index = index;
                    }
                });
                if(_index != -1){
                    this.lists.splice(_index, 1);
                }
                console.log(this.lists);
                if(this.lists.length == 0){
                    returnGroupChat();
                }
            },
            chatTo: function(e){
                var id = $(e.target).data('chatid');
                $(".topicName").text("私聊");
                $(".returnGroupChat").css('visibility', 'visible');
                getPrivateChatRecord(id);
                currentPrivateChatId = id;
                this.lists.map(function(item, index){
                    if(item.id == id) item.number = 0;
                });
            },
            isContain: function(id){
                var isContain = false;
                this.lists.map(function(item, index){
                   if(item.id == id) isContain = true;
                });
                return isContain;
            },
            addNum: function(id){
                this.lists.map(function(item, index){
                    if(item.id == id){
                        item.number = parseInt(item.number, 10) + 1;
                    }
                })
            }
        }
    });

    var vTodo = new Vue({
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

    //Vue.config.debug = true;
    Vue.filter('parseImg', function(msg){
        var realMsg = msg.replace(/<{([a-z]+)}>/g, function(match){
            return "<img src='/emoji/" + match.slice(2, -2) + ".gif' class='emojied'>";
        });
        realMsg = realMsg.replace(/\[-(\w+\.\w+)-\]/g, function(match){
            return "<img src='/upload/" + match.slice(2, -2) + "' class='imageMsg'>";
        });
        realMsg = marked(realMsg);

        return realMsg;
    });

    var vChatList = new Vue({
        el: "#vRecord",
        data: {
            recordlist: []
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
                var getRecord = Promise.resolve(vChatList.$data.recordlist = res.chatrecord.recordList);
                getRecord.then(function(){
                    var t = setTimeout(function(){$("#iscroll").scrollTop(99999);}, 100);
                });
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
                var getRecord = Promise.resolve(vChatList.$data.recordlist = res.chatrecord.recordList);
                getRecord.then(function(){
                    var t = setTimeout(function(){$("#iscroll").scrollTop(99999);}, 100);
                });
            }else{
                alert('unknow error...');
            }
        });
    }

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
                                    alert(res.originalname + '上传完成!' );
                                }
                            }else{
                                console.log('unknow error');
                            }
                        });
                    }
                    fr.readAsDataURL(file);
                }else{
                    ;
                }
            }
        });
    }
});

function returnGroupChat(){
    $(".topicName").text("群聊");
    $(".returnGroupChat").css('visibility', 'hidden');
    currentPrivateChatId = "all";
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

