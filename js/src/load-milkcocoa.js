var milkcocoa = new MilkCocoa('uniicwq7emj.mlkcca.com');
var ds_connection = milkcocoa.dataStore("connection_count");
milkcocoa.onError(function(err){
  console.log(err);
});

milkcocoa.onClosed(function(){
  console.log('closed');
});

milkcocoa.onConnected(function(){
  ds_connection.push({});
  console.log('connected');
});

// コネクション数のレンダリングと、コネクション増加時のカウントアップ
ds_connection.stream().size(999).next(function(err, data) {
  var pushed_count = 0;
  $("title").text("Wowoo - "+data.length+" guys active");

  // 他者が接続したらリアルタイム更新
  ds_connection.on("push", function(err, datum){
    pushed_count++;
    $("title").text("Wowoo - "+(data.length+pushed_count)+" guys active");
  });

  // 他者が離脱したらリアルタイム更新
  ds_connection.on("remove", function(err, datum){
    pushed_count--;
    $("title").text("Wowoo - "+(data.length+pushed_count)+" guys active");
  });

});

// ユーザーのアクティブ取得
var timeout_ids = [];
ds_connection.stream().size(999).next(function(err, data) {
  var oldest_count = data.shift();

  // 常に最新のtimeoutだけが有効になっている
  $(document).on("keypress mousemove click", function(e){
    var past_id = timeout_ids.shift();
    clearTimeout(past_id);
    var current_id = setTimeout(function(){
      decrease_count();
    }, 30000);
    timeout_ids.push(current_id);
  });

  // 画面から離れる際にカウントダウン
  $(window).on("beforeunload", function(e){
    decrease_count();
  });

  function decrease_count(){ ds_connection.remove(oldest_count.id); }
});
