(function() {
	window.jsmodal = function(id) {
		var elem = document.getElementById(id);
		var overlap = window.document.createElement("div");
		overlap.setAttribute("style","z-index:120; filter:alpha(opacity=70);");
		overlap.style.display = "block";
		overlap.style.opacity = "0.7";
		overlap.style.position = "absolute";
		overlap.style.width = "100%";
		overlap.style.height = "100%";
		overlap.style.top = "0px";
		overlap.style.left = "0px";
		overlap.style.backgroundColor="#222";
		return {
			open : function(_option) {
				var option = _option || {};
				var self = this;
				elem.style.display = 'block';
				window.document.body.appendChild(overlap);

				for(var i=0;i < elem.childNodes.length;i++) {
					if(elem.childNodes[i].className == "jsmodal-window-close") {
						console.log(elem.childNodes[i].className);
						elem.childNodes[i].onclick = function() {
							self.close();
							return false;
						}
					}
				}
				if(option.modal == false) {
					overlap.onmousedown = function(e) {
						if(!check(e.target)) {
							self.close();
							return false;
						}
						function check(t, index) {
							if(!t) return false;
							if(index > 5) return false;
							if(t.className == "jsmodal-window") {
								return true;
							}else{
								return check(t.parentNode, index++);
							}
						}
						return true;
					}
				}
			},
			close : function() {
				elem.style.display = 'none';
				if(overlap.remove) overlap.remove();
				else window.document.body.removeChild(overlap);
			}
		}
	}
}())
