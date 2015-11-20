var milkcocoa = new MilkCocoa('uniicwq7emj.mlkcca.com');

milkcocoa.onError(function(err){
  $(".toast-error").off().click(function(e){
    location.reload();
  });
  toastr.error('Disconnected! Click here!');
});

milkcocoa.onClosed(function(){
  $(".toast-error").off().click(function(e){
    location.reload();
  });
  toastr.error('Disconnected! Click here!');
});

milkcocoa.onConnected(function(){
  toastr.info('connected 🐶');
});
