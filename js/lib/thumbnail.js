(function(global){
  global.$.fn.setThumbnailListener = function(baseURL){
    var serverURL = "http://capture.heartrails.com/240x180/border/shadow?";
    return this.each(function(){
      $(this).off("hover").hover(function(e){
        var url = $(this).attr("href");
        $("#jqThumbnail").attr("src",serverURL+url);
        $("#jqThumbnail").css("left",e.pageX+10);
        $("#jqThumbnail").css("top",e.pageY+10);
        $("#jqThumbnail").show();
      },
      function(){
        $("#jqThumbnail").hide();
      });
    });
  }

  return global;
}(window));

$(function(){
  $("body").append("<img src='' id='jqThumbnail' width='240' height='180' style='position:absolute;display:none'>");
});
