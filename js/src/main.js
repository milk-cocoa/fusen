$(function() {
    $(window).on("hashchange", function(){
      location.reload();
    });


    var ua = navigator.userAgent;
    var ds = milkcocoa.dataStore('fusen');

    var room = "";
    if(location.hash) room = location.hash.slice(1);
    if(room != "") ds = ds.child(room);
    $("#title").text(room);

    /*
    * 同時接続数を取得するロジック
    */
    var ds_connection = milkcocoa.dataStore("connection_count").child(room);
    milkcocoa.onError(function(err){
      console.log(err);
    });

    milkcocoa.onClosed(function(){
      console.log('closed');
    });

    milkcocoa.onConnected(function(){
      console.log('connected');
    });

    // milkcocoaインスタンス生成後、コネクションデータを送信し、その後レンダリングやリスナー設置
    ds_connection.push({}, function(){
      // コネクション数のレンダリングと、コネクション増加時のカウントアップ
      ds_connection.stream().size(999).next(function(err, data) {
        var pushed_count = 0;
        console.log(data.length);
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
        var first = data.shift();
        var oldest_count = (first) ? first : {id:""};

        // 常に最新のtimeoutだけが有効になっている
        $(document).on("keypress mousemove click", function(e){
          var past_id = timeout_ids.shift();
          clearTimeout(past_id);
          var current_id = setTimeout(function(){
            disconnect_current_connection();
          }, 30000);
          timeout_ids.push(current_id);
        });

        // 画面から離れる際にカウントダウン
        $(window).on("beforeunload", function(e){
          disconnect_current_connection();
        });

        function disconnect_current_connection(){ ds_connection.remove(oldest_count.id); }
      });

    });
    // ここまで



    var curClr = "one";
    var canvas = $("#canvas");
    var fusenBuilder = new FusenBuilder(canvas, ds);

    var device = "pc";
    if(ua.indexOf('iPhone') > 0 || ua.indexOf('iPad') > 0 || ua.indexOf('iPod') > 0 || ua.indexOf('Android') > 0) {
        device = "mobile";
    }else{
        device = "pc";
    }

    // select color
    $(".p-colorlist__item").click(function(e){
        curClr = $(this).attr("id");
        $(".p-colorlist__item").each(function(){
            $(this).removeClass("is-active");
        });
        $(this).addClass("is-active");
        e.stopPropagation();
    });

    ds.stream().size(999).sort('desc').next(function(err, datas) {
        for(var i=0;i < datas.length;i++) {
            create_memo(datas[i].id, datas[i].value.x, datas[i].value.y, datas[i].value.text, datas[i].value.color);
        }
    });
    ds.on('push', function(pushed) {
        create_memo(pushed.id, pushed.value.x, pushed.value.y, pushed.value.text, pushed.value.color);
    });
    ds.on('set', function(setted) {
        var fusen = fusenBuilder.getFusen(setted.id);
        fusen.setPos(setted.value.x, setted.value.y);
        fusen.setText(setted.value.text);
    });
    ds.on('remove', function(_removed) {
        var removed = _removed;
        fusenBuilder.getFusen(removed.id).removeSelf();
    });

    function create_memo(id, x, y, _text, color) {
        var text = _text || "";
        var fusen = fusenBuilder.createFusen(id, text, color);
        fusen.setPos(x, y);
    }

    canvas.click(function(e) {
        var text = prompt("メモを入力してください。");
        var _curClr = curClr;
        if(!text) {
            return;
        }
        // fusen_util.copy(text);
        ds.push({
            x : e.pageX,
            y : e.pageY,
            text : fusen_util.htmlEscape(text),
            color : _curClr
        }, function(e){
          console.log(e);
        });
    });

    $("#replay").click(function(e){
      fusenBuilder.replay(function(fusensByOrder){
        setInterval(function(){
          var fusen = fusensByOrder.shift();
          create_memo(fusen.id, fusen.pos.x, fusen.pos.y, fusen.text, fusen.color);
        }, 750);
      });
    });

    window.fusen_util = {
        getDevice : function() {
            return device;
        },
        htmlEscape : function(s) {
            s=s.replace(/&/g,'&amp;');
            s=s.replace(/>/g,'&gt;');
            s=s.replace(/</g,'&lt;');
            return s;
        },
        copy : function (text){
          // clipboard.jsを使う
          // promptを使わない
          document.addEventListener('copy', function(e) {
            e.preventDefault();
            if (e.clipboardData) {
              e.preventDefault();
              e.clipboardData.setData('text/plain', "Hello");
            }
            if (window.clipboardData) {
              e.returnValue = false;
              window.clipboardData.setData('text/plain', "World");
            }
          }, false);

          $(document).trigger("copy");
        },
        userAgent : function(){
          return window.navigator.userAgent.toLowerCase();
        }
    }
});
