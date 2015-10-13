$(function(){
    $(".submit").click(function(e){
        $.ajax({
            url: '/setting/teams/create',
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