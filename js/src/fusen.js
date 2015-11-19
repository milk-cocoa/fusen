(function(global){

	function Fusen(canvas, ds, _id, text, color, fusenNumber) {
		var self = this;
		this.id = _id;
		this.ds = ds;
    this.pos = {x : 0, y : 0};
		this.text = text;
		this.color = color;
		this.canvas = canvas;
		this.fusenNumber = fusenNumber;
		this.$el_fusen = $("#"+self.id);

		var escapedText = fusen_util.htmlEscape(text);

		// URLをリンク化
		this.linkedText = fusen_util.linknize(escapedText);

		// 削除ボタンのレイアウト等
    if (fusen_util.getDevice() == "mobile") {
      this.canvas.append('<div id="'+this.id+'" class="p-husen theme-husen--'+color+'" data-fusenNumber="'+self.fusenNumber+'"><span>'+self.linkedText+'</span><input type="text" style="display:none;" /></div>');
    } else {
      this.canvas.append('<div id="'+this.id+'" class="p-husen theme-husen--'+color+'" data-fusenNumber="'+self.fusenNumber+'"><span>'+self.linkedText+'</span><input type="text" style="display:none;" /><div class="p-husen__cross">×</div></div>');
    }

		// 色を深める
		// self.colorAdjust();

		// 削除ボタン
    var cross = $(".p-husen__cross", "#"+this.id);

		// ドラッグボタン
    $("#"+self.id).draggable({
      start: function() {
      },
      drag: function() {
				var pos = $("#"+self.id).position();
        self.pos.x = $("#"+self.id).offset().left;
        self.pos.y = $("#"+self.id).offset().top;
      },
      stop: function() {
        self.ds.set(self.id, {
          x : self.pos.x,
          y : self.pos.y
        });
        self.setPos(self.pos.x, self.pos.y);
      }
    });


		// ばってんクリック時の削除処理
    cross.click(function(e) {
      self.ds.remove(self.id);
      e.stopPropagation();
    });

		// 付箋クリック時の編集処理(タッチ端末未実装)
		// 「再生」後の付箋は不可っぽい
		$("#"+self.id).click(function(e){
			$__fusen = $(this);
			var text = $__fusen.find("span").text();
			$__fusen.find("span").hide();
			$input = $__fusen.find("input");
			$input.val(text);
			$input.css("display", "inline");
			$input.focus();
			$input.off("keyup").on("keyup", function(e){

				// ENTER
				if(e.which == 13){
					self.ds.set(self.id+"", {text: text},function(err, datum){
						hideInput(text);
					});
				}

				// ESC
       	if (e.which == 27) {
					hideInput(text);
				}

				function hideInput(text) {
					$input.hide();
					$__fusen.find("span").text(text);
					$__fusen.find("span").show();
				}
			});

			e.stopPropagation();
		});

    if (fusen_util.getDevice() == "mobile") {

      var interval = 720;

      $("#"+self.id).bind( "touchstart", function(e){
        timer = setTimeout( function(){
          if ( confirm("このメッセージを削除しますか？") === true ){
            self.ds.remove(self.id);
          }
        }, interval );

        function clearFunction(){
          clearTimeout( timer );
        }

        $("#"+self.id).bind( "touchend touchmove touchcancel", clearFunction );
        e.stopPropagation();
      });

    }
	}

	Fusen.prototype.setPos = function(x, y) {
		var self = this;
		self.pos.x = x;
		self.pos.y = y;
		$("#" + this.id).offset({top : self.pos.y, left : self.pos.x});

		if( (self.pos.y + $("#"+self.id).height()) > self.canvas.height()){
			self.canvas.css( "height", (self.pos.y + $("#"+self.id).outerHeight())+"px" );
		}
		if( (self.pos.x + $("#"+self.id).width()) > self.canvas.width()){
			self.canvas.css( "width", (self.pos.x + $("#"+self.id).outerWidth())+"px" );
      $("#header").css( "width", (self.pos.x + $("#"+self.id).outerWidth())+"px" );
		}
	}

	Fusen.prototype.setText = function(text) {
		var self = this;
		self.text = text;
		$("#" + this.id).find("span").text(self.text);
	}

	Fusen.prototype.removeSelf = function() {
		var self = this;
		$("#" + self.id).remove();
	}

	Fusen.prototype.colorAdjust = function(){
		var self = this;
		var fusen_color = self.$el_fusen.css("border-color");
		var brighter_color = chroma(fusen_color).saturate(2);
		var darker_color = chroma(fusen_color).darken();
		var ratio = self.fusenNumber/100;
		if(ratio > 1) ratio = 1;
		var new_color = chroma.scale([darker_color, brighter_color])(ratio).hex();
		self.$el_fusen.css("color", new_color);
		self.$el_fusen.css("border-color", new_color);
	}

	global.Fusen = Fusen;
}(window));
