(function() {

    var fusen = {
    	device : null,
    	fusen_set : {},
    	dataStore : null,
    	selected_color : "white",
    	check_device : function() {
    		if(this.device) return this.device;
		    var ua = navigator.userAgent;
			if (ua.indexOf('iPhone') > 0 || ua.indexOf('iPad') > 0 || ua.indexOf('iPod') > 0 || ua.indexOf('Android') > 0) {
				this.device = "mobile";
			}else{
				this.device = "pc";
			}
			return this.device;
    	},
    	excape_html : function(s) {
	        s=s.replace(/&/g,'&amp;');
	        s=s.replace(/>/g,'&gt;');
	        s=s.replace(/</g,'&lt;');
	        return s;
    	},
    	init : function(host) {
    		var self = this;
		    milkcocoa = new MilkCocoa(host);
            milkcocoa.getCurrentUser(function(err, user) {
                if(err == 1) {
                    open_login_modal();
                }else{
                    self.ready(milkcocoa);
                }
            });
            function open_register_modal() {
                var self = this;
                var register_modal = jsmodal("register-modal");
                register_modal.open({modal : true});
                $("#register-btn").off("click").click(function() {
                    var email = $("#register-email").val();
                    var password = $("#register-password").val();
                    var password2 = $("#register-password2").val();
                    if(email && (password == password2)) {
                        milkcocoa.addAccount(email, password, {}, function(err, user) {
                            if(user) {
                                register_modal.close();
                                open_login_modal();
                            }else{
                                if(err == 1)
                                    $("#reg-message").html("Emailが正しくありません。");
                                else if(err == 2)
                                    $("#reg-message").html("すでに使われているEmailアドレスです。");
                            }
                        });
                    }else{
                        $("#reg-message").html("入力エラー");
                    }

                });
                $("#switch-to-login-btn").off("click").click(function() {
                    register_modal.close();
                    open_login_modal();
                });
            }
            function open_login_modal() {
                var login_modal = jsmodal("login-modal");
                login_modal.open({modal : true});
                $("#login-btn").off("click").click(function() {
                    var email = $("#login-email").val();
                    var password = $("#login-password").val();
                    if(email && password) {
                        milkcocoa.login(email, password, function(err, user) {
                            if(user) {
                                login_modal.close();
                                self.ready(milkcocoa);
                            }else{
                                if(err == 1)
                                    $("#login-message").html("Emailが正しくありません。");
                                else if(err == 2)
                                    $("#login-message").html("Emailアドレスかパスワードが違います。");
                                else if(err == 3)
                                    $("#login-message").html("確認メールを送信しています。ご確認ください。");
                            }
                        });
                    }else{
                        $("#login-message").html("入力エラー");
                    }
                });
                $("#switch-btn").off("click").click(function() {
                    login_modal.close();
                    open_register_modal();
                });
            }
    	},
        ready : function(milkcocoa) {
            var self = this;
            var room = location.hash.substr(1);
            if(room == "") room = "_empty";
            var fusenDataStore = milkcocoa.dataStore('fusen');
            this.dataStore = fusenDataStore.child(room);

            if (fusen.check_device() == "mobile") {
                $(".currentColor").on("tap", function(e){
                    self.selected_color = $(this).attr("id");
                    $(".currentColor").each(function(){
                        $(this).removeClass("active");
                    });
                    $(this).addClass("active"); 
                    e.stopPropagation();
                });
            } else {
                $(".currentColor").click(function(e){
                    self.selected_color = $(this).attr("id");
                    $(".currentColor").each(function(){
                        $(this).removeClass("active");
                    });
                    $(this).addClass("active"); 
                    e.stopPropagation();
                });
            }

            $("#back").click(function(e) {
                var text = prompt("メモを入力してください。");
                if(!text) {
                    return;
                }
                text = self.excape_html(text);
                self.dataStore.push({
                    x : e.pageX,
                    y : e.pageY,
                    text : text,
                    color : self.selected_color
                });
            });

            self.dataStore.query({}).limit(100).done(function(e) {
                for(var i=0;i < e.length;i++) {
                    self.create(e[i].id, e[i].text, e[i].color, e[i].x, e[i].y);
                }
            });
            self.dataStore.on('push', function(pushed) {
                self.create(pushed.id, pushed.value.text, pushed.value.color, pushed.value.x, pushed.value.y)
            });
            self.dataStore.on('set', function(setted) {
                self.fusen_set[setted.id].setPos(setted.value.x, setted.value.y);
            });
            self.dataStore.on('remove', function(removed) {
                self.remove(removed.id);
            });
        },
    	create : function(id, text, color, x, y) {
	        var fusen = new Fusen(this.dataStore, id, text, color);
	        fusen.setPos(x, y);
	        this.fusen_set[id] = fusen;
    	},
    	remove : function(id) {
    		this.fusen_set[id].removeSelf();
    	}
    }

    function Fusen(_ds, _id, text, color) {
        var id = _id;
        var ds = _ds;
        if (fusen.check_device() == "mobile") {
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
            ds.set(id, {
                x : pos.x,
                y : pos.y
            }, function() {});
          }
        });
        
        cross.click(function(e) {
            ds.remove(id);
            e.stopPropagation();
        });
        
        if (fusen.check_device() == "mobile") {
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

    window.fusen = fusen;
}());