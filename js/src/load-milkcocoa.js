var milkcocoa = new MilkCocoa('uniicwq7emj.mlkcca.com');

milkcocoa.onError(function(err){
  $(".toast-error").off().click(function(e){
    location.reload();
  });
  console.error(err);
  toastr.error('Error occured. Please reload🐶');
});

milkcocoa.onClosed(function(){
  $(".toast-error").off().click(function(e){
    location.reload();
  });
  toastr.error('Disconnected! Please reload🐶');
});

milkcocoa.onConnected(function(){
  toastr.info('Connected.');
});
