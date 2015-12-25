/**
 * Created by showonne on 15/9/25.
 */
$(function(){
    var $account = $(".login_account"),
        $password = $(".login_password");

    $(".logIn").click(function(){
        var account = $account.val(),
        password = $password.val();
        if(account && password) {
            $.ajax({
                url: '/logon',
                method: 'POST',
                data: {
                    account: account,
                    password: password
                }
            }).done(function (res) {
                if (res.success == 0) {
                    $(".notice").text(res.msg);
                } else {
                    window.location.href = res.redirecturl;
                }
            });
        }else{
            $(".notice").text('用户名或密码不许为空.');
        }
    });

    $(".to-login").click(function(){
        $(".login").show();
        $(".register").hide();
        $(".underline").css('left', '80px');
        $(".notice").text('');
    });
    $(".to-register").click(function(){
        $(".register").show();
        $(".login").hide();
        $(".underline").css('left', '160px');
        $(".notice").text('');
    });

    particlesJS.load('particles-js', '/javascripts/particles.json', function() {
        console.log('callback - particles.js config loaded');
    });
});

$(function(){
    var isLegal = false;
    $(".register_account").keyup(function(){
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

    $(".register_password_repeat").change(function(){
        if($(".register_password").val() != $(this).val()){
            $(".notice").text("两次密码输入不一致.");
            isLegal = false;
        }else{
            $(".notice").text("");
            isLegal = true;
        }
    });

    $(".subRegister").click(function(){
        var account = $(".register_account").val(),
            password = $(".register_password").val(),
            email = $(".register_email").val();

        if(account && password && isLegal) {
            $.ajax({
                url: '/register',
                method: 'POST',
                data: {
                    account: account,
                    password: password,
                    email: email
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