(function(global){

	function Fusen(canvas, ds, _id, text, color, fusenNumber) {
		var self = this;
		this.id = _id;
		this.ds = ds;
    this.pos = {x : 0, y : 0};
		this.text = text;
		this.linkedText = fusen_util.linknize( fusen_util.htmlEscape(text) );
		this.color = color;
		this.canvas = canvas;
		this.fusenNumber = fusenNumber;
		this.$el_fusen = $("#"+self.id);

		// 削除ボタンのレイアウト等
    if (fusen_util.getDevice() == "mobile") {
      this.canvas.append( self.mobilehtml() );
    } else {
      this.canvas.append( self.pchtml() );
    }

		// 色を深める
		// self.colorAdjust();

		// 削除ボタン
    var cross = $(".p-husen__cross", "#"+this.id);

		self.favoriteListener();

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
			e.stopPropagation();
			$self = $(this);
			var when_clicked_text = $self.find("span").text();
			$self.find("span").hide();
			$input = $self.find("input");
			$input.val(when_clicked_text);
			$input.css("display", "inline");
			$input.focus();
			$input.off("keyup").on("keyup", function(e){
				$_input = $(this);
				var when_entered_text = $_input.val();

				// ENTER
				if(e.which == 13){
					self.ds.set(self.id+"", {text: when_entered_text},function(err, datum){
						hideInput(when_entered_text);
					});
				}

				// ESC
       	if (e.which == 27) {
					hideInput(when_clicked_text);
				}

				function hideInput(text) {
					$input.hide();
					$self.find("span").text(text);
					$self.find("span").show();
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
		this.text = text;
		this.linkedText = fusen_util.linknize( fusen_util.htmlEscape(text) );
		var self = this;

		$("#" + this.id).find("span").html(self.linkedText);
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

	Fusen.prototype.pchtml = function(){
		var self = this;
		return ''+
			'<div id="'+self.id+'"'+
				'class="p-husen theme-husen--'+self.color+'"'+
				'data-fusenNumber="'+self.fusenNumber+'">'+
				'<span>'+self.linkedText+'</span>'+
				'<input type="text" style="display:none;" />'+
				'<div class="p-husen__cross">×</div>'+
				'<div class="p-husen__star-ever">★</div>'+
			'</div>';
	}

	Fusen.prototype.favoriteListener = function () {
		var self = this;
		var ds_star = milkcocoa.dataStore("fusen-stars__"+self.id);
		ds_star.stream().size(999).next(function(err, data) {
			$("#"+self.id).find(".p-husen__star-ever").text("★"+data.length);
		});


		ds_star.on("push", function(data){
			var $star = $("#"+self.id).find(".p-husen__star-pushed");
			var num = parseInt( $star.text().substr(1) );
			$star.text("★"+(num+1));
		});

		ds_star.on("remove", function(data){
			var $star = $("#"+self.id).find(".p-husen__star-ever");
			var num = parseInt( $star.text().substr(1) );
			$star.text("★"+(num-1));
		});

		$("#"+self.id).find(".p-husen__star-ever").off().click(function(e){
			e.stopPropagation();
			$(this).removeClass("p-husen__star-ever");
			$(this).addClass("p-husen__star-pushed");
			ds_star.push({});
		});

		$("#"+self.id).find(".p-husen__star-pushed").off().click(function(e){
			e.stopPropagation();
			$(this).removeClass("p-husen__star-pushed");
			$(this).addClass("p-husen__star-ever");
			ds_star.stream().size(1).next(function(err, data){
				ds_star.remove(data[0].id);
			});
		});

	}

	Fusen.prototype.mobilehtml = function(){
		var self = this;
		return ''+
			'<div id="'+self.id+'"'+
				'class="p-husen theme-husen--'+self.color+'"'+
				'data-fusenNumber="'+self.fusenNumber+'">'+
				'<span>'+self.linkedText+'</span>'+
				'<input type="text" style="display:none;" />'+
			'</div>';
	}

	global.Fusen = Fusen;
}(window));
