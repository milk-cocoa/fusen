$(function(){

    $(window).on("hashchange", function(){
      location.reload();
    });

    var ua = navigator.userAgent;
    var ds = milkcocoa.dataStore('fusen');

    var room = "";
    if(location.hash) room = location.hash.slice(1);
    if(room != "") ds = ds.child(room);
    $("#title").val(room);

    function pad (num) { return ("0" + num).substr(-2,2) };
    var today = {
      m: pad( (new Date()).getMonth()+1 ),
      d: pad( (new Date()).getDate() )
    }

    $("#title").attr("placeholder", "例) <your name>_"+today.m+today.d+"_todo")

    // titleの場所で板移動
    $("#title").keypress(function(e){
      if(e.which == 13){
        location.hash = "#"+$(this).val();
      }
    });

    /*
    * 同時接続数を取得するロジック
    */
    var ds_connection = milkcocoa.dataStore("connection_count").child(room);

    // milkcocoaインスタンス生成後、コネクションデータを送信し、その後レンダリングやリスナー設置
    ds_connection.push({}, function(){
      // コネクション数のレンダリングと、コネクション増加時のカウントアップ
      ds_connection.stream().size(999).next(function(err, data) {
        // 堆積したコネクションを削除
        var limit = 1000*45;
        data = data.filter(function(datum){
          var isFresh = (datum.timestamp > data[data.length-1].timestamp - limit);
          if(!isFresh) ds_connection.remove(datum.id);
          return isFresh;
        });

        // 部屋とコネクションを記録
        var _room;
        if(room != "") _room = room;
        else _room = "__root__";

        var ds_room = milkcocoa.dataStore("rooms");
          ds_room.get(_room, function(err, room_data){
            if(err == "not found") room_data = { value : { access: 0 }  };
            room_data.value.access++;
            ds_room.set(_room, {connection: data.length, access: room_data.value.access, updated_at: Date.now()},
              function(err, datum){
                // 成功時
              },
              function(err, datum){
                // セキュリティや制限のエラー
                toast.error("セキュリティおよび負荷の理由で接続に失敗しました");
              }
            );
          });

        // コネクションを表示
        var pushed_count = 0;
        $("title").text("Wowoo("+data.length+")");

        // 他者が接続したらリアルタイム更新
        ds_connection.on("push", function(err, datum){
          pushed_count++;
          $("title").text("Wowoo("+(data.length+pushed_count)+")");
        });

        // 他者が離脱したらリアルタイム更新
        ds_connection.on("remove", function(err, datum){
          pushed_count--;
          $("title").text("Wowoo("+(data.length+pushed_count)+")");
        });
      });

      // ユーザーのアクティブ取得
      var timeout_ids = [];
      ds_connection.stream().size(999).next(function(err, data) {
        var first = data.shift();
        var oldest_count = (first) ? first : {id:""};

        // 常に最新のtimeoutだけが有効になっている
        $(document).on("keypress mousemove click", function(e){
          e.stopPropagation();
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
        var $self = $(this);
        e.stopPropagation();

        var offset_x = e.offsetX;
        var offset_y = e.offsetY;
        var page_x = e.pageX;
        var page_y = e.pageY;

        generateBalloon(function(text){
          ds.push({
              x : page_x-53,
              y : page_y-45,
              text : text,
              color : curClr
          }, function(e){
            if(device == "pc") fusen_util.removeBalloon();
          });
        });


        function generateBalloon(cb){
          var text = "";
          if(device == "mobile"){
            text = prompt("メモを入力してください");
            if(!text) {
              toastr.error("Blank text🐶");
              return;
            }
            cb(text);
          } else {
            $(".posting-balloon").remove();
            $self.append('<div class="posting-balloon" style="left:'+(offset_x-85)+'px; top:'+(offset_y-45)+'px;"><input type="text" /></div>');

            var $input = $(".posting-balloon > input");
            $input.focus();
            $input.off("keypress").on("keypress", function(e){
              if(e.which === 13){
                text = $(this).val();
                if(!text) {
                  toastr.error("Blank text🐶");
                  return;
                }
                cb(text);
              }
            });

            // 吹き出しを消す
            fusen_util.removeBalloonOnESC()
          }
        }
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
          /*
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

          */
          $(document).trigger("copy");
        },
        userAgent : function(){
          return window.navigator.userAgent.toLowerCase();
        },
    		linknize : function (escapedText) {
    		  // とりあえず高階関数で実装
    			var http_regexp = /https?:\/\/.+(\ |$)/;
    			var linkedText = escapedText.split(" ").map(function(_t){
    				var found = _t.match(http_regexp);
    				if (found) {
    					var url = found[0];
    					var short_url = url.split(/\/\//)[1];
    					var _t = _t.replace(http_regexp, "<a href='"+url+"' target='_blank'>"+short_url+"</a>" ) ;
    				}
    				return _t;
    			}).join(" ");

    			linkedText = hashnize(linkedText);
    			return linkedText;

    			function hashnize(linkedText) {
    				// hashをリンク化
    				var hash_regexp = /^#.+/;
    				var hashedText = linkedText.split(" ").map(function(_t){
    					if ( _t.match(hash_regexp) ) {
    						var url = location.href + _t;
    						_t = _t.replace(hash_regexp, "<a href='"+url+"' target='_blank'>"+_t+"</a>");
    					}
    					return _t;
    				}).join(" ");
    				return hashedText;
    			}
    		},
        removeBalloonOnESC : function (){
          $(document).off("keyup").on("keyup", function(e) {
             if (e.keyCode == 27) fusen_util.removeBalloon();
          });
        },
        removeBalloon : function (){
          $(".posting-balloon").remove();
        },
        zoomIn : function (zoomLev) {
            if (zoomLev > 1) {
                if (typeof (document.body.style.zoom) != "undefined") {
                    $(document.body).css('zoom', zoomLev);
                }else {
                    // Mozilla doesn't support zoom, use -moz-transform to scale and compensate for lost width
                    $('#divWrap').css({
                        "-moz-transform": 'scale(" + zoomLev + ")',
                        width: $(window).width() / zoomLev
                    });
                }
            }
        }
    }


    // スマホならズーム
    if(device == "mobile") fusen_util.zoomIn(2.0);

});
