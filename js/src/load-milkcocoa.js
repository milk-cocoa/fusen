var milkcocoa = new MilkCocoa('uniicwq7emj.mlkcca.com');

milkcocoa.onError(function(err){
  console.log(err);
});

milkcocoa.onClosed(function(){
  console.log('closed');
  setTimeout(function(){
    milkcocoa.connect(function(){
      console.log('reconnected');
    });
  }, 1000);
});

milkcocoa.onConnected(function(){
  console.log('connected');
});
