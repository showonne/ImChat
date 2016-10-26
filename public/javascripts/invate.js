$(function(){
   $(".button").click(function(){
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

   particlesJS.load('particles-js', '/javascripts/particles.json', function() {
      console.log('callback - particles.js config loaded');
   });

});