(function(){
	var myalert = {
			prompt : function(title, content, cb, text) {
				$('#myprompt').modal('show');
				$('.modal-title').html(title);
				$('#myprompt input').attr('placeholder', content);
				$('#myprompt-ok').click(function() {
					cb($('#myprompt input').val());
					$('#myprompt').modal('hide');
					$('#myprompt input').val('');
				});
			}
	}
	window.myalert = myalert;
}())