(function() {
	var rview = {
			views : {},
			view : function(id, _html, init) {
				var html = _html;
				if(typeof html == "object") {
					html = html.join('');
				}
				this.views[id] = {
						html : html,
						init : init
				}
			},
			transition : function(id, args) {
				var content = document.getElementById("content")
				content.innerHTML = this.views[id].html;
				this.views[id].init(args);
			}
	}
	
	window.rview = rview;
}())