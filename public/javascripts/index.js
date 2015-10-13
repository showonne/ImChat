/**
 * Created by showonne on 15/9/25.
 */
$(function(){
    var $account = $(".account"),
        $password = $(".password");


    $(".logOn").click(function(){
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

    $(".register").click(function(){
        window.location.href="/register";
    });
})