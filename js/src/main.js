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




		ds.on("send", function(data){
			console.log(data.value);
		});




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
        fusenBuilder.getFusen(setted.id).setPos(setted.value.x, setted.value.y);
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
        ds.push({
            x : e.pageX,
            y : e.pageY,
            text : fusen_util.htmlEscape(text),
            color : _curClr
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
        }
    }
});
