$(function() {
    var ua = navigator.userAgent;
    var ds = milkcocoa.dataStore('fusen');
    var curClr = "blue";
    var canvas = $("#canvas");


    // select color
    if (ua.indexOf('iPhone') > 0 || ua.indexOf('iPad') > 0 || ua.indexOf('iPod') > 0 || ua.indexOf('Android') > 0) {
        $(".p-colorlist__item").on("tap", function(e){
            curClr = $(this).attr("id");
            $(".p-colorlist__item").each(function(){
                $(this).removeClass("is-active");
            });
            $(this).addClass("is-active");
            e.stopPropagation();
        });
    } else {
        $(".p-colorlist__item").click(function(e){
            curClr = $(this).attr("id");
            $(".p-colorlist__item").each(function(){
                $(this).removeClass("is-active");
            });
            $(this).addClass("is-active");
            e.stopPropagation();
        });
    }


    function Fusen(_id, text, color) {

        var id = _id;

        if (ua.indexOf('iPhone') > 0 || ua.indexOf('iPad') > 0 || ua.indexOf('iPod') > 0 || ua.indexOf('Android') > 0) {
            $("#canvas").append('<div id="'+id+'" class="p-husen p-husen--'+color+'">'+text+'<div class="p-husen__note">付箋を長押しで削除</div></div>');
        } else {
            $("#canvas").append('<div id="'+id+'" class="p-husen p-husen--'+color+'">'+text+'<div class="p-husen__cross">×</div></div>');
        }

        var pos = {x : 0, y : 0};
        var cross = $(".p-husen__cross", "#"+id);

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

            if( (pos.y + $(this).height()) > canvas.height()){
                canvas.css( "height", (pos.y + $(this).outerHeight())+"px" );
            }
            if( (pos.x + $(this).width()) > canvas.width()){
                canvas.css( "width", (pos.x + $(this).outerWidth())+"px" );
            }

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

    canvas.click(function(e) {
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
