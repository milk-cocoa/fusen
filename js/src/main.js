$(function() {
    var ua = navigator.userAgent;
    var ds = milkcocoa.dataStore('fusen');
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

    $("#page-title").dblclick(function(e){
        olddata = document.getElementById("page-title").innerHTML;
         document.getElementById("page-title").innerHTML = "<input id='page-title_input' type='text'>";
         document.getElementById("page-title_input").value = olddata;
        $('#page-title').skOuterClick(function() {
            newdata = document.getElementById("page-title_input").value;
            ds.push({
                page_title : newdata
            });
        });
        e.stopPropagation();
    });

    ds.query({}).done(function(e) {
        for(var i=0;i < e.length;i++) {
            create_memo(e[i].id, e[i].x, e[i].y, e[i].text, e[i].color);
            edit_title(e[i].page_title);
        }
    });
    ds.on('push', function(pushed) {
        create_memo(pushed.id, pushed.value.x, pushed.value.y, pushed.value.text, pushed.value.color);
        edit_title(pushed.value.page_title);
        fusen_edit(pushed.value.fusen_edit);
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

    function edit_title(edit_text){
        document.getElementById("page-title").innerHTML = edit_text;
    }

    function fusen_edit(fusen_edit){
        $(this).text(fusen_edit);
        fusenBuilder.editFusen();
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
