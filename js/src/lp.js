$(function(){

  function sync() {
    document.body.style.height = window.innerHeight + 'px';
  };

  sync();

  window.addEventListener("resize", sync, false);
});