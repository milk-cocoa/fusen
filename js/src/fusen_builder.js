(function(global){

	function FusenBuilder(canvas, ds) {
		this.canvas = canvas;
		this.ds = ds;
		this.fusens = {};
		this.fusensByOrder = [];
	}

	FusenBuilder.prototype.render = function(id, x, y, _text, color){
		var text = _text || "";
		var fusen = this.createFusen(id, text, color);
		fusen.setPos(x, y);
		return fusen;
	}

	FusenBuilder.prototype.renderWithListener = function(id, x, y, _text, color){
		var text = _text || "";
		var fusen = this.createFusen(id, text, color);
		fusen.setPos(x, y);
		fusen.setAllListeners();
		return fusen;
	}

	FusenBuilder.prototype.getFusen = function(id) {
		return this.fusens[id];
	}

	FusenBuilder.prototype.createFusen = function(id, text, color) {
		var fusen = new Fusen(this.canvas, this.ds, id, text, color, this.fusensByOrder.length+1);
		this.fusens[id] = fusen;
		this.fusensByOrder.push(fusen);
		return fusen;
	}

	FusenBuilder.prototype.replay = function(cb){
		this.canvas.empty();
		cb(this.fusensByOrder);
	}

	global.FusenBuilder = FusenBuilder;
}(window));
