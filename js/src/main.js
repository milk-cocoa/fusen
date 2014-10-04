$(function() {
    var ua = navigator.userAgent;
    var room = location.hash.substr(1);
    if(room == "") room = "_empty";
    var fusenDataStore = milkcocoa.DataStore('fusen');
    var ds = fusenDataStore.child(room);

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

    $("#page-title").click(function(e){
        olddata = document.getElementById("page-title").innerHTML;
        $("#page-title_input").css("display","inline-block");
        $("#title-edit-finish").css("display","inline-block");
        $("#page-title").css("display","none");
        document.getElementById("page-title_input").value = olddata;
        if(!$("#page-title_input").is(":focus")){
            $("#page-title_input").select().focus();
        }
        $("#title-edit-finish").click(function(e) {
            newdata = document.getElementById("page-title_input").value;
            if(!newdata){
                return;
            }
            $("#page-title_input").css("display","none");
            $("#title-edit-finish").css("display","none");
            $("#page-title").css("display","inline-block");
            document.getElementById("page-title").innerHTML = newdata;
            ds.push({
                page_title : newdata
            });
            ds.on('push', function(pushed) {
                edit_title(pushed.value.page_title);
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
            s=s.replace(/((http|https|ftp):\/\/[\w?=&.\/-;#~%-]+(?![\w\s?&.\/;#~%"=-]*>))/g,'<a href="$1" target="_blank">$1</a>');
            return s;
        }
    }
});
