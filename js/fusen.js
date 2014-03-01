(function() {
	function FusenEditor(group_id, groupDS) {
		var ds = groupDS.child('memos');
	var snap = Snap('svg');
	
	var background = snap.rect(0, 0, window.screen.width, window.screen.height);
	background.attr({
	    fill: "#ffffff",
	    "fill-opacity" : 0,
	});
	var g = snap.filter(Snap.filter.shadow(0, 2, 3));
	function Fusen(_id, text) {
		var id = _id;
		var group = snap.g();
		var width = 50 + StrLen(text)*8;
    	var rect = snap.rect(0, 0, width, 50);
    	var text = snap.text(5, 25, text);
    	var cross = snap.rect(width-22, 0, 22, 22);
    	var p1 = snap.line(width-20,0,width,20);
    	var p2 = snap.line(width,0,width-20,20);
    	group.append(rect);
    	group.append(text);
    	group.append(cross);
    	group.append(p1);
    	group.append(p2);
    	rect.attr({
    		filter : g,
    		fill : '#f0f0f0'
    	});
    	text.attr({
    		stroke : '#000000'
    	})
    	cross.attr({
    		fill : '#e0e0e0'
    	})
    	p1.attr({
    		stroke : '#ffffff',
    		strokeWidth : 2
    	})
    	p2.attr({
    		stroke : '#ffffff',
    		strokeWidth : 2
    	})
    	var pos = {x : 0, y : 0};
    	var prev_pos = {x : 0, y : 0};
    	group.drag(function(dx, dy, x, y, e){
    		setPos(pos.x + dx - prev_pos.x, pos.y + dy - prev_pos.y);
    		prev_pos.x = dx;
    		prev_pos.y = dy;
    	}, function(x, y, e) {
    		prev_pos.x = 0;
    		prev_pos.y = 0;
    	}, function() {
    		if(prev_pos.x == 0 && prev_pos.y == 0) return;
    		ds.child(id).set({
    			x : pos.x,
    			y : pos.y
    		}, function() {});
    	});
    	cross.click(function() {
    		ds.child(id).remove(function() {});
    	});
    	function setPos(x, y) {
    		pos.x = x;
    		pos.y = y;
			group.transform('translate('+x+','+y+')');
    	}
    	function removeSelf() {
    		group.remove();
    	}
    	return {
    		setPos : setPos,
    		removeSelf : removeSelf
    	}
	}
	groupDS.get(function(group) {
		var text = snap.text(10, 50, "トピック名　"+group.name);
		text.attr({
			'font-size' : 24
		});
	})
	ds.query({}).limit(30).done(function(e) {
		for(var i=0;i < e.length;i++) {
			if(e[i].text) {
	    		create_memo(e[i].id, e[i].x, e[i].y, e[i].text);
			}
		}
	})
	ds.on('push', function(_pushed) {
		var pushed = _pushed.pushed;
		console.log(pushed);
		create_memo(pushed.id, pushed.params.x, pushed.params.y, pushed.params.text);
	});
	ds.on('set', function(_setted) {
		var setted = _setted.updates[0];
		fusen_set[setted.id].setPos(setted.params.x, setted.params.y);
	});
	ds.on('remove', function(_removed) {
		var removed = _removed.value;
		fusen_set[removed.id].removeSelf();
		delete fusen_set[removed.id];
	});
	var fusen_set = {};
	function create_memo(id, x, y, text) {
		var fusen = new Fusen(id, text);
		fusen.setPos(x, y);
		fusen_set[id] = fusen;
	}
	background.mousedown(function(e) {
		var text = myalert.prompt("新しいメモ", "メモを入力してください。", function(text) {
			if(!text) {
				return;
			}
			ds.push({
				x : e.x,
				y : e.y,
				text : htmlEscape(text)
			}, function() {
				
			});
		});
	})
	function htmlEscape(s){
		s=s.replace(/&/g,'&amp;');
		s=s.replace(/>/g,'&gt;');
		s=s.replace(/</g,'&lt;');
		return s;
	}
	}
	function StrLen(str) {
	    var ct;
	    var size = 0;

	    for(ct = 0; ct < str.length; ct++) {
	        var c = str.charCodeAt(ct);
	        if(c >= 128){
	            size++;
	        }
	        size++;
	    }
	    return size;
	}
	window.FusenEditor = FusenEditor;
}())