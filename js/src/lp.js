$(function(){

  function sync() {
    document.body.style.height = window.innerHeight + 'px';
  };

  sync();

  $(".p-lp__form__button").click(function() {
    createRoom();
  });

  var createRoom = function() {
    var roomId = $(".p-lp__form__input").val();

    if (roomId.match(/^(room|js|css|assets|img|images|inquiry|demos)$/)) {
      roomId = rand_url;
    }
    if (roomId == '') {
      roomId = rand_url;
    }
    if (!roomId.match(/^[a-zA-Z1-9]+$/)) {
      roomId = rand_url;
    }

    location.href = location.protocol + '//' + window.location.host + '/fusen.html#' + roomId;
  }

  window.addEventListener("resize", sync, false);
});