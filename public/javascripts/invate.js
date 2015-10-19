$(function(){
   $(".btn").click(function(){
      var account = $(".account").val(),
          password = $(".password").val();

      $.ajax({
         url: window.location.href,
         type: 'POST',
         data: {
            account: account,
            password: password
         }
      }).done(function(res){
         if(res.success == 0){
            $(".notice").text(res.msg);
         }else{
            window.location.href = res.redirecturl;
         }
      });
   });
});