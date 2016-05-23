$(function() {
    var ua = navigator.userAgent;
    var ds = milkcocoa.dataStore('fusen');
    var curClr = "one";
    var canvas = $("#canvas");
    var fusenBuilder = new FusenBuilder(canvas, ds);
    var LIMIT = 100;
    var dsOnSetListener = function () {}, dsOnRemoveListener = function () {};

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

    getData(function (datas) {
        var showing = (datas.length > LIMIT) ? LIMIT : datas.length;
        for(var i=0;i < showing;i++) {
            create_memo(datas[i].id, datas[i].value.x, datas[i].value.y, datas[i].value.text, datas[i].value.color);
        }
    });

    function getData (cb) {
      var now = new Date();
      var aMonthB4 = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000);
      var history = ds.history();
      var all = [];

      history.sort('desc').size(100).span(aMonthB4.getTime(), now.getTime());
      history.on('data', function(data) {
        all = all.concat(data).filter(function (d) {
            return !d.value.deleted;
        });
      });
      history.on('end', function () {
        cb(all);
      });
      history.on('error', function(err){
        console.log(err);
      });
      history.run();
    }

    dsOnRemoveListener = function (removed) {
        fusenBuilder.getFusen(removed.id).removeSelf();
    }
    dsOnSetListener = function (setted) {
        fusenBuilder.getFusen(setted.id).setPos(setted.value.x, setted.value.y);
    }

    ds.on('push', function(pushed) {
        create_memo(pushed.id, pushed.value.x, pushed.value.y, pushed.value.text, pushed.value.color);
    });
    ds.on('set', function (setted) {
        if(!!setted.value.deleted) dsOnRemoveListener(setted);
        else dsOnSetListener(setted);
    })

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
