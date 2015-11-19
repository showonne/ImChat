$(function(){
    $(".submit").click(function(){
        $.ajax({
            url: '/team/create',
            type: 'POST',
            data: {
                teamname: $("#teamname").val()
            }
        }).done(function(res){
           if(res.success == 1){
               window.location.href = res.redirecturl;
           }
        });
    });
});