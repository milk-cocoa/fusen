$(function() {
    var ua = navigator.userAgent;
    var milkcocoa = new MilkCocoa("https://io-jhxdw225l.mlkcca.com/");
    var ds = milkcocoa.DataStore('fusen');
    var curClr = "white";

    if (ua.indexOf('iPhone') > 0 || ua.indexOf('iPad') > 0 || ua.indexOf('iPod') > 0 || ua.indexOf('Android') > 0) {
        $(".currentColor").on("tap", function(e){
            curClr = $(this).attr("id");
            $(".currentColor").each(function(){
                $(this).removeClass("active");
            });
            $(this).addClass("active");
            e.stopPropagation();
        });
    } else {
        $(".currentColor").click(function(e){
            curClr = $(this).attr("id");
            $(".currentColor").each(function(){
                $(this).removeClass("active");
            });
            $(this).addClass("active");
            e.stopPropagation();
        });
    }

    function Fusen(_id, text, color) {
        var id = _id;
        if (ua.indexOf('iPhone') > 0 || ua.indexOf('iPad') > 0 || ua.indexOf('iPod') > 0 || ua.indexOf('Android') > 0) {
            $("#canvas").append('<div id="'+id+'" class="husen '+color+'">'+text+'<div class="graytext">付箋を長押しで削除</div></div>');
        } else {
            $("#canvas").append('<div id="'+id+'" class="husen '+color+'">'+text+'<div class="cross">×</div></div>');
        }

        var pos = {x : 0, y : 0};
        var cross = $(".cross", "#"+id);

        $( "#"+id ).draggable({
          start: function() {
          },
          drag: function() {
            pos.x = $("#"+id).position().left;
            pos.y = $("#"+id).position().top;
          },
          stop: function() {
            ds.child(id).set({
                x : pos.x,
                y : pos.y
            }, function() {});
          }
        });

        cross.click(function(e) {
            ds.remove(id);
            e.stopPropagation();
        });

        if (ua.indexOf('iPhone') > 0 || ua.indexOf('iPad') > 0 || ua.indexOf('iPod') > 0 || ua.indexOf('Android') > 0) {
            $("#"+id).on("taphold", tapholdHandler);
        }

        function tapholdHandler(e){
            ret = confirm("このメッセージを削除しますか？");
            if (ret == true){
              ds.remove(id);
            }
        }

        function setPos(x, y) {
            pos.x = x;
            pos.y = y;
            $("#"+id).offset({top : pos.y, left : pos.x});
        }
        function removeSelf() {
            $("#"+id).remove();
        }
        return {
            setPos : setPos,
            removeSelf : removeSelf
        }
    }
    ds.query({}).done(function(e) {
        for(var i=0;i < e.length;i++) {
            create_memo(e[i].id, e[i].x, e[i].y, e[i].text, e[i].color);
        }
    });
    ds.on('push', function(pushed) {
        create_memo(pushed.id, pushed.value.x, pushed.value.y, pushed.value.text, pushed.value.color);
    });
    ds.on('set', function(setted) {
        fusen_set[setted.id].setPos(setted.value.x, setted.value.y);
    });
    ds.on('remove', function(_removed) {
        var removed = _removed;
        fusen_set[removed.id].removeSelf();
    });
    var fusen_set = {};
    function create_memo(id, x, y, text, color) {
        var fusen = new Fusen(id, text, color);
        fusen.setPos(x, y);
        fusen_set[id] = fusen;
    }

    $("#back").click(function(e) {
        console.log(e);
        var text = prompt("メモを入力してください。");
        var _curClr = curClr;
        if(!text) {
            return;
        }
        ds.push({
            x : e.pageX,
            y : e.pageY,
            text : htmlEscape(text),
            color : _curClr
        }, function() {

        });
    });

    function htmlEscape(s){
        s=s.replace(/&/g,'&amp;');
        s=s.replace(/>/g,'&gt;');
        s=s.replace(/</g,'&lt;');
        return s;
    }
});
