$(function(){
    var isLegal = false;
    $(".account").keyup(function(){
        var account = $(this).val();
        var regexp = /\W|\_/;
        if(regexp.test(account)){
            $(".notice").text("不允许使用空格,下划线等特殊字符为帐号.");
            isLegal = false;
        }else{
            $(".notice").text("");
            isLegal = true;
        }
        if(account.length > 12 || account.length < 6){
            $(".notice").text("帐号长度应为6-12字符.");
            isLegal = false;
        }else{
            isLegal = true;
        }
    });

    $(".password_repeat").change(function(){
        if($(".password").val() != $(this).val()){
            $(".notice").text("两次密码输入不一致.");
            isLegal = false;
        }else{
            $(".notice").text("");
            isLegal = true;
        }
    });

    $(".register").click(function(){
        var account = $(".account").val(),
            password = $(".password").val();

        if(account && password && isLegal) {
            $.ajax({
                url: '/register',
                method: 'POST',
                data: {
                    account: account,
                    password: password
                }
            }).done(function (res) {
                if (res.success == 0) {
                    console.log(res.msg);
                    $(".notice").text(res.msg);
                } else {
                    $(".notice").empty();
                    window.location.href = res.redirecturl;
                }
            });
        }else{
            $(".notice").text("用户名或密码不许为空");
        }
    });

    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
    })
});