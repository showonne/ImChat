(function(win){
    function setUnit(){
        document.documentElement.style.fontSize = document.documentElement.clientWidth / 10 + "px";
    }
    var h = null;
    window.addEventListener("resize",function(){
        clearTimeout(h);
        h = setTimeout(setUnit, 300);
    }, false);
    setUnit();
})(window);