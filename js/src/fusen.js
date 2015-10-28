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
		var escapedText = fusen_util.htmlEscape(text);
		var r = /https?:\/\/.+(\ |$)/;
		var found = escapedText.match(r);
		var url = (found != null) ? found[0] : "";
		var short_url = url.split(/\/\//)[1];
		var linkText = escapedText.replace(r, "<a href='"+url+"' target='_blank'>"+short_url+"</a>" ) ;

    if (fusen_util.getDevice() == "mobile") {
      this.canvas.append('<div id="'+this.id+'" class="p-husen theme-husen--'+color+'" data-fusenNumber="'+this.fusenNumber+'"><span>'+linkText+'</span><input type="text" style="display:none;" /></div>');
    } else {
      this.canvas.append('<div id="'+this.id+'" class="p-husen theme-husen--'+color+'" data-fusenNumber="'+this.fusenNumber+'"><span>'+linkText+'</span><input type="text" style="display:none;" /><div class="p-husen__cross">×</div></div>');
    }

		// 色を深める
		var $_fusen = $("#"+this.id);
		var fusen_color = $_fusen.css("border-color");
		var brighter_color = chroma(fusen_color).saturate(2);
		var darker_color = chroma(fusen_color).darken();
		var ratio = this.fusenNumber/100;
		if(ratio > 1) ratio = 1;
		var new_color = chroma.scale([darker_color, brighter_color])(ratio).hex();
		$_fusen.css("color", new_color);
		$_fusen.css("border-color", new_color);


		// 削除ボタン
    var cross = $(".p-husen__cross", "#"+this.id);

		// ドラッグボタン
    $( "#"+this.id ).draggable({
      start: function() {
      },
      drag: function() {
				var pos = $("#"+self.id).position();
        self.pos.x = $("#"+self.id).position().left;
        self.pos.y = $("#"+self.id).position().top;
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
		$_fusen.click(function(e){
			$__fusen = $(this);
			var text = $__fusen.find("span").text();
			$__fusen.find("span").hide();
			$input = $__fusen.find("input");
			$input.val(text);
			$input.css("display", "inline");
			$input.focus();
			$input.off("keypress").on("keypress", function(e){
				if(e.which == 13){
					self.ds.set(self.id+"", {text: $(this).val()},function(err, datum){
						$input.hide();
						$__fusen.find("span").text(fusen_util.htmlEscape(datum.value.text));
						$__fusen.find("span").show();
					});
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

	global.Fusen = Fusen;
}(window));
